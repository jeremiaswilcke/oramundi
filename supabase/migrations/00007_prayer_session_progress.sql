-- Track prayer progress so users can resume interrupted sessions
ALTER TABLE prayer_sessions ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0;
ALTER TABLE prayer_sessions ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
