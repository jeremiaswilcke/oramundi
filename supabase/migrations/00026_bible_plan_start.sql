CREATE TABLE IF NOT EXISTS user_bible_plan_start (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  plan_day INTEGER NOT NULL CHECK (plan_day BETWEEN 1 AND 365),
  start_iso_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_bible_plan_start_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_bible_plan_start_set_updated_at ON user_bible_plan_start;
CREATE TRIGGER user_bible_plan_start_set_updated_at
BEFORE UPDATE ON user_bible_plan_start
FOR EACH ROW EXECUTE FUNCTION public.set_bible_plan_start_updated_at();

ALTER TABLE user_bible_plan_start ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads plan start"
  ON user_bible_plan_start FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner writes plan start"
  ON user_bible_plan_start FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates plan start"
  ON user_bible_plan_start FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner deletes plan start"
  ON user_bible_plan_start FOR DELETE
  USING (auth.uid() = user_id);
