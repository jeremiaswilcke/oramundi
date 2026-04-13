-- Security hardening (Audit 2026-04-13):
--  1. Split reminder/push private fields out of publicly-readable `profiles` table.
--  2. Tighten `prayer_sessions` public SELECT: no user_id or raw coords in public map data.
--  3. Add revocable `calendar_token` for ICS feed (removes IDOR via UUID-as-secret).

-- ================================================================
-- 1. user_private_settings
-- ================================================================
CREATE TABLE IF NOT EXISTS user_private_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (reminder_frequency IN ('daily','weekdays','weekly','custom')),
  reminder_days TEXT[] NOT NULL DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'],
  reminder_time TEXT NOT NULL DEFAULT '18:00',
  push_subscription JSONB,
  calendar_token TEXT UNIQUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_private_settings_calendar_token
  ON user_private_settings(calendar_token) WHERE calendar_token IS NOT NULL;

ALTER TABLE user_private_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner select"
  ON user_private_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner insert"
  ON user_private_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner update"
  ON user_private_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner delete"
  ON user_private_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Backfill from profiles (best effort; columns may or may not still exist depending on deploy order)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'reminder_enabled'
  ) THEN
    EXECUTE $mig$
      INSERT INTO user_private_settings (
        user_id, reminder_enabled, reminder_frequency, reminder_days, reminder_time, push_subscription
      )
      SELECT
        id,
        COALESCE(reminder_enabled, FALSE),
        COALESCE(reminder_frequency, 'daily'),
        COALESCE(reminder_days, ARRAY['mon','tue','wed','thu','fri','sat','sun']),
        COALESCE(reminder_time, '18:00'),
        push_subscription
      FROM profiles
      ON CONFLICT (user_id) DO NOTHING
    $mig$;
  END IF;
END$$;

-- Auto-create settings row for new users
CREATE OR REPLACE FUNCTION public.handle_new_private_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_private_settings (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_private_settings ON profiles;
CREATE TRIGGER on_profile_created_private_settings
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_private_settings();

-- Drop private columns from publicly-readable profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS reminder_enabled;
ALTER TABLE profiles DROP COLUMN IF EXISTS reminder_frequency;
ALTER TABLE profiles DROP COLUMN IF EXISTS reminder_days;
ALTER TABLE profiles DROP COLUMN IF EXISTS reminder_time;
ALTER TABLE profiles DROP COLUMN IF EXISTS push_subscription;

-- ================================================================
-- 2. prayer_sessions: remove public global SELECT, expose via SECURITY DEFINER fn
-- ================================================================
DROP POLICY IF EXISTS "Active sessions are viewable by everyone" ON prayer_sessions;

-- Public-safe map feed: rounded coords to ~10km, no user_id, no session id.
CREATE OR REPLACE FUNCTION public.get_public_active_prayers()
RETURNS TABLE (
  latitude FLOAT,
  longitude FLOAT,
  mystery_type TEXT,
  mode TEXT,
  started_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    (round(latitude::numeric, 1))::float,
    (round(longitude::numeric, 1))::float,
    mystery_type,
    mode,
    started_at
  FROM prayer_sessions
  WHERE (ended_at IS NULL OR ended_at > NOW() - INTERVAL '30 minutes')
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_public_active_prayers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_active_prayers() TO anon, authenticated;

-- ================================================================
-- 3. Calendar token rotation helper
-- ================================================================
CREATE OR REPLACE FUNCTION public.rotate_calendar_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_token TEXT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  v_token := encode(gen_random_bytes(24), 'base64');
  v_token := replace(replace(replace(v_token, '+', '-'), '/', '_'), '=', '');

  INSERT INTO user_private_settings (user_id, calendar_token)
    VALUES (v_user, v_token)
    ON CONFLICT (user_id) DO UPDATE SET calendar_token = EXCLUDED.calendar_token, updated_at = NOW();

  RETURN v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_calendar_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rotate_calendar_token() TO authenticated;

-- Allow the ICS feed route (anon) to read reminder data by token only
CREATE OR REPLACE FUNCTION public.get_reminder_by_calendar_token(p_token TEXT)
RETURNS TABLE (
  display_name TEXT,
  reminder_enabled BOOLEAN,
  reminder_days TEXT[],
  reminder_time TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.display_name, s.reminder_enabled, s.reminder_days, s.reminder_time
  FROM user_private_settings s
  JOIN profiles p ON p.id = s.user_id
  WHERE s.calendar_token = p_token
    AND s.calendar_token IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_reminder_by_calendar_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reminder_by_calendar_token(TEXT) TO anon, authenticated;
