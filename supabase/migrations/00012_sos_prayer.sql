-- SOS Prayer Partner: anonymous, randomized prayer companion at the moment of temptation.
-- Privacy by design: NO messaging fields exist. Users only ever see a pseudonym/display_name
-- of the partner during a live session. Past partners are never linkable.

-- === Opt-in pool ===
CREATE TABLE IF NOT EXISTS sos_prayer_pool (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  available_until TIMESTAMPTZ,          -- NULL = always available while opted in
  pseudonym TEXT,                        -- optional anonymous handle; if NULL, display_name is used
  last_matched_at TIMESTAMPTZ,
  match_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sos_pool_available
  ON sos_prayer_pool(last_matched_at NULLS FIRST, available_until NULLS FIRST);

ALTER TABLE sos_prayer_pool ENABLE ROW LEVEL SECURITY;

-- A user can only see and manage their own pool row. They must never learn who else is in the pool.
-- Matching is done via SECURITY DEFINER function (see below).
CREATE POLICY "Users see their own pool row"
  ON sos_prayer_pool FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own pool row"
  ON sos_prayer_pool FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own pool row"
  ON sos_prayer_pool FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own pool row"
  ON sos_prayer_pool FOR DELETE
  USING (auth.uid() = user_id);

-- === Sessions ===
-- NOTE: No text/message fields. Realtime sync is ephemeral (prayer step index only).
CREATE TABLE IF NOT EXISTS sos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prayer_type TEXT NOT NULL CHECK (prayer_type IN ('heart','rosary_decade','custom')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','matched','active','completed','abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matched_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  CHECK (requester_id <> partner_id)
);

CREATE INDEX IF NOT EXISTS idx_sos_sessions_requester
  ON sos_sessions(requester_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_sessions_partner
  ON sos_sessions(partner_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_sessions_active
  ON sos_sessions(status) WHERE status IN ('pending','matched','active');

ALTER TABLE sos_sessions ENABLE ROW LEVEL SECURITY;

-- Users see ONLY sessions they are part of. They cannot query sessions by partner_id of others.
CREATE POLICY "Users see their own SOS sessions"
  ON sos_sessions FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);

-- Only the requester inserts (matching fills partner_id via SECURITY DEFINER fn)
CREATE POLICY "Requester inserts SOS session"
  ON sos_sessions FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Either party can update status/ended_at during the session
CREATE POLICY "Parties update SOS session"
  ON sos_sessions FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);

-- === Match history (anti-repeat, anti-stalking) ===
-- Stores pair hashes so a given pair is never matched twice.
CREATE TABLE IF NOT EXISTS sos_match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE INDEX IF NOT EXISTS idx_sos_match_history_user_a ON sos_match_history(user_a);
CREATE INDEX IF NOT EXISTS idx_sos_match_history_user_b ON sos_match_history(user_b);

ALTER TABLE sos_match_history ENABLE ROW LEVEL SECURITY;

-- History is never readable by users. Only the matching function (SECURITY DEFINER) queries it.
-- No SELECT policy -> effectively invisible to all client users.

-- === Rate limiting ===
CREATE TABLE IF NOT EXISTS sos_rate_limit (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  day_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  count_today INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sos_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own rate limit"
  ON sos_rate_limit FOR SELECT
  USING (auth.uid() = user_id);

-- === Matching function ===
-- SECURITY DEFINER so it can read across users without exposing the pool via RLS.
-- Returns partner_id and pseudonym (or display_name) for the requester to display.
CREATE OR REPLACE FUNCTION public.match_sos_partner(
  p_session_id UUID,
  p_max_per_day INTEGER DEFAULT 5
)
RETURNS TABLE (partner_id UUID, partner_handle TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_count INTEGER;
  v_partner UUID;
  v_handle TEXT;
BEGIN
  IF v_requester IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Verify session belongs to requester and is pending
  IF NOT EXISTS (
    SELECT 1 FROM sos_sessions
    WHERE id = p_session_id
      AND requester_id = v_requester
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'session not found or not pending';
  END IF;

  -- Rate limit
  INSERT INTO sos_rate_limit (user_id, day_bucket, count_today)
    VALUES (v_requester, v_today, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET day_bucket = CASE WHEN sos_rate_limit.day_bucket <> v_today THEN v_today ELSE sos_rate_limit.day_bucket END,
        count_today = CASE WHEN sos_rate_limit.day_bucket <> v_today THEN 0 ELSE sos_rate_limit.count_today END;

  SELECT count_today INTO v_count FROM sos_rate_limit WHERE user_id = v_requester;

  IF v_count >= p_max_per_day THEN
    RAISE EXCEPTION 'rate limit exceeded';
  END IF;

  -- Pick a random partner from the pool that:
  --  * is not the requester
  --  * is currently available
  --  * has never been matched with the requester before
  SELECT p.user_id,
         COALESCE(NULLIF(p.pseudonym, ''), pr.display_name)
    INTO v_partner, v_handle
    FROM sos_prayer_pool p
    JOIN profiles pr ON pr.id = p.user_id
   WHERE p.user_id <> v_requester
     AND (p.available_until IS NULL OR p.available_until > NOW())
     AND NOT EXISTS (
       SELECT 1 FROM sos_match_history h
       WHERE (h.user_a = LEAST(v_requester, p.user_id)
          AND h.user_b = GREATEST(v_requester, p.user_id))
     )
   ORDER BY p.last_matched_at NULLS FIRST, random()
   LIMIT 1;

  IF v_partner IS NULL THEN
    RETURN;
  END IF;

  -- Record the match
  INSERT INTO sos_match_history (user_a, user_b)
    VALUES (LEAST(v_requester, v_partner), GREATEST(v_requester, v_partner))
    ON CONFLICT DO NOTHING;

  UPDATE sos_prayer_pool
     SET last_matched_at = NOW(),
         match_count = match_count + 1
   WHERE user_id = v_partner;

  UPDATE sos_sessions
     SET partner_id = v_partner,
         status = 'matched',
         matched_at = NOW()
   WHERE id = p_session_id;

  UPDATE sos_rate_limit
     SET count_today = count_today + 1,
         updated_at = NOW()
   WHERE user_id = v_requester;

  partner_id := v_partner;
  partner_handle := v_handle;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.match_sos_partner(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_sos_partner(UUID, INTEGER) TO authenticated;
