-- Global statistics counter table (singleton row)
CREATE TABLE public.global_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_rosaries BIGINT NOT NULL DEFAULT 0,
  total_users BIGINT NOT NULL DEFAULT 0,
  total_minutes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the singleton row
INSERT INTO global_stats (id, total_rosaries, total_users, total_minutes)
VALUES (1, 0, 0, 0);

-- RLS: everyone can read, nobody can write directly
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global stats"
  ON public.global_stats
  FOR SELECT
  USING (true);

-- Function to update stats on prayer_session completion
CREATE OR REPLACE FUNCTION update_global_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD IS NULL OR OLD.completed = false) THEN
    UPDATE global_stats SET
      total_rosaries = total_rosaries + 1,
      total_minutes = total_minutes + COALESCE(
        EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60, 0
      )::BIGINT,
      total_users = (SELECT COUNT(DISTINCT user_id) FROM prayer_sessions WHERE completed = true),
      updated_at = now()
    WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on prayer_sessions
CREATE TRIGGER on_prayer_session_complete
  AFTER INSERT OR UPDATE ON prayer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_global_stats();

-- Backfill from existing data
UPDATE global_stats SET
  total_rosaries = (SELECT COUNT(*) FROM prayer_sessions WHERE completed = true),
  total_minutes = (SELECT COALESCE(SUM(
    EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
  ), 0)::BIGINT FROM prayer_sessions WHERE completed = true AND ended_at IS NOT NULL),
  total_users = (SELECT COUNT(DISTINCT user_id) FROM prayer_sessions WHERE completed = true)
WHERE id = 1;
