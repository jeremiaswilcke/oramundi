CREATE TABLE IF NOT EXISTS user_bible_day_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_on DATE NOT NULL,
  plan_day INTEGER NOT NULL CHECK (plan_day BETWEEN 1 AND 365),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, read_on)
);

CREATE INDEX IF NOT EXISTS idx_user_bible_day_reads_user_date
  ON user_bible_day_reads(user_id, read_on DESC);

ALTER TABLE user_bible_day_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads bible progress"
  ON user_bible_day_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner writes bible progress"
  ON user_bible_day_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates bible progress"
  ON user_bible_day_reads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner deletes bible progress"
  ON user_bible_day_reads FOR DELETE
  USING (auth.uid() = user_id);
