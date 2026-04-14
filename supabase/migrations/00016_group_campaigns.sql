-- Group Prayer Campaigns (Novena etc.)
-- Admins open a campaign with an intention and duration; members log daily prayers.

CREATE TABLE IF NOT EXISTS group_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  intention TEXT CHECK (char_length(intention) <= 1000),
  prayer_kind TEXT NOT NULL DEFAULT 'rosary'
    CHECK (prayer_kind IN ('rosary','mercy_chaplet','library','custom')),
  prayer_kind_ref TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
  starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','cancelled')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_campaigns_group
  ON group_campaigns(group_id, status);

ALTER TABLE group_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members see campaigns"
  ON group_campaigns FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

-- Writes go through SECURITY DEFINER RPCs below; no broad INSERT/UPDATE policies.

CREATE TABLE IF NOT EXISTS group_campaign_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES group_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  prayed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, user_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_campaign_prayers_campaign
  ON group_campaign_prayers(campaign_id, day_number);
CREATE INDEX IF NOT EXISTS idx_campaign_prayers_user
  ON group_campaign_prayers(user_id, campaign_id);

ALTER TABLE group_campaign_prayers ENABLE ROW LEVEL SECURITY;

-- All group members see all prayer logs of the campaign (solidarity view)
CREATE POLICY "Group members see campaign prayers"
  ON group_campaign_prayers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_campaigns c
      WHERE c.id = group_campaign_prayers.campaign_id
        AND public.is_group_member(c.group_id, auth.uid())
    )
  );

-- Members insert their own prayer logs (RPC also available for validation)
CREATE POLICY "Owner inserts campaign prayer"
  ON group_campaign_prayers FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_campaigns c
      WHERE c.id = group_campaign_prayers.campaign_id
        AND public.is_group_member(c.group_id, auth.uid())
        AND c.status = 'active'
    )
  );

CREATE POLICY "Owner deletes campaign prayer"
  ON group_campaign_prayers FOR DELETE
  USING (auth.uid() = user_id);

-- === RPCs ===

DROP FUNCTION IF EXISTS public.create_group_campaign(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE);

CREATE OR REPLACE FUNCTION public.create_group_campaign(
  p_group_id UUID,
  p_title TEXT,
  p_intention TEXT,
  p_prayer_kind TEXT,
  p_prayer_kind_ref TEXT,
  p_duration_days INTEGER,
  p_starts_on DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_id UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = v_user
      AND gm.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'not admin';
  END IF;

  INSERT INTO group_campaigns (
    group_id, title, intention, prayer_kind, prayer_kind_ref,
    duration_days, starts_on, created_by
  ) VALUES (
    p_group_id, p_title, NULLIF(p_intention, ''), p_prayer_kind,
    NULLIF(p_prayer_kind_ref, ''), p_duration_days, p_starts_on, v_user
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_group_campaign(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_group_campaign(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE) TO authenticated;

DROP FUNCTION IF EXISTS public.log_campaign_prayer(UUID);

CREATE OR REPLACE FUNCTION public.log_campaign_prayer(p_campaign_id UUID)
RETURNS TABLE (day_number INTEGER, already_prayed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_group UUID;
  v_starts DATE;
  v_duration INTEGER;
  v_status TEXT;
  v_day INTEGER;
  v_existed BOOLEAN := FALSE;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT c.group_id, c.starts_on, c.duration_days, c.status
    INTO v_group, v_starts, v_duration, v_status
    FROM group_campaigns c
   WHERE c.id = p_campaign_id;

  IF v_group IS NULL THEN
    RAISE EXCEPTION 'campaign not found';
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'campaign not active';
  END IF;

  IF NOT public.is_group_member(v_group, v_user) THEN
    RAISE EXCEPTION 'not a member';
  END IF;

  v_day := (CURRENT_DATE - v_starts) + 1;
  IF v_day < 1 THEN
    RAISE EXCEPTION 'campaign has not started yet';
  END IF;
  IF v_day > v_duration THEN
    RAISE EXCEPTION 'campaign is over';
  END IF;

  SELECT TRUE INTO v_existed
    FROM group_campaign_prayers gcp
   WHERE gcp.campaign_id = p_campaign_id
     AND gcp.user_id = v_user
     AND gcp.day_number = v_day;

  IF v_existed IS NOT TRUE THEN
    INSERT INTO group_campaign_prayers (campaign_id, user_id, day_number, prayed_on)
      VALUES (p_campaign_id, v_user, v_day, CURRENT_DATE)
      ON CONFLICT (campaign_id, user_id, day_number) DO NOTHING;
  END IF;

  day_number := v_day;
  already_prayed := COALESCE(v_existed, FALSE);
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.log_campaign_prayer(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_campaign_prayer(UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.cancel_group_campaign(UUID);

CREATE OR REPLACE FUNCTION public.cancel_group_campaign(p_campaign_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_group UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT c.group_id INTO v_group
    FROM group_campaigns c
   WHERE c.id = p_campaign_id;

  IF v_group IS NULL THEN
    RETURN 'not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = v_group
      AND gm.user_id = v_user
      AND gm.role = 'admin'
  ) THEN
    RETURN 'not_admin';
  END IF;

  UPDATE group_campaigns
     SET status = 'cancelled', updated_at = NOW()
   WHERE id = p_campaign_id;

  RETURN 'cancelled';
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_group_campaign(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_group_campaign(UUID) TO authenticated;
