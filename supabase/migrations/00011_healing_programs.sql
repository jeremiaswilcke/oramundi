-- Healing & Befreiung: structured multi-day programs
-- Content (scripture, prayers, reflections) is authored separately together with priests.
-- This migration only defines the schema and RLS.

-- === Programs ===
CREATE TABLE IF NOT EXISTS healing_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
  title_de TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_de TEXT,
  subtitle_en TEXT,
  intro_de TEXT,
  intro_en TEXT,
  icon TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_healing_programs_published
  ON healing_programs(is_published) WHERE is_published = TRUE;

ALTER TABLE healing_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published programs are viewable"
  ON healing_programs FOR SELECT
  USING (is_published = TRUE);

-- === Days ===
CREATE TABLE IF NOT EXISTS healing_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES healing_programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  scripture_ref TEXT,
  scripture_de TEXT,
  scripture_en TEXT,
  -- prayer_refs: [{ kind: "rosary" | "library" | "heart", slug?: string, mystery?: string, minutes?: number }]
  prayer_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  reflection_de TEXT,
  reflection_en TEXT,
  intention_de TEXT,
  intention_en TEXT,
  UNIQUE (program_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_healing_program_days_program
  ON healing_program_days(program_id, day_number);

ALTER TABLE healing_program_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Days of published programs are viewable"
  ON healing_program_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM healing_programs p
      WHERE p.id = healing_program_days.program_id
      AND p.is_published = TRUE
    )
  );

-- === User progress ===
CREATE TABLE IF NOT EXISTS user_healing_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES healing_programs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_day INTEGER NOT NULL DEFAULT 1,
  last_completed_day INTEGER,
  last_completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','completed','abandoned')),
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  shared_with_user_ids UUID[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_user_healing_progress_user
  ON user_healing_progress(user_id);

ALTER TABLE user_healing_progress ENABLE ROW LEVEL SECURITY;

-- Owner sees own progress; shared companions see progress if listed in shared_with_user_ids
CREATE POLICY "Users see their own healing progress"
  ON user_healing_progress FOR SELECT
  USING (
    auth.uid() = user_id
    OR (is_shared = TRUE AND auth.uid() = ANY (shared_with_user_ids))
  );

CREATE POLICY "Users insert their own healing progress"
  ON user_healing_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own healing progress"
  ON user_healing_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own healing progress"
  ON user_healing_progress FOR DELETE
  USING (auth.uid() = user_id);

-- === Journal entries ===
CREATE TABLE IF NOT EXISTS user_healing_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES healing_programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  text TEXT NOT NULL CHECK (char_length(text) <= 4000),
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_healing_journal_user_program
  ON user_healing_journal(user_id, program_id, day_number);

ALTER TABLE user_healing_journal ENABLE ROW LEVEL SECURITY;

-- Owner always sees; shared entries visible to companions listed in the user's progress record
CREATE POLICY "Users see their own journal"
  ON user_healing_journal FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      is_shared = TRUE
      AND EXISTS (
        SELECT 1 FROM user_healing_progress p
        WHERE p.user_id = user_healing_journal.user_id
          AND p.program_id = user_healing_journal.program_id
          AND p.is_shared = TRUE
          AND auth.uid() = ANY (p.shared_with_user_ids)
      )
    )
  );

CREATE POLICY "Users write their own journal"
  ON user_healing_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own journal"
  ON user_healing_journal FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own journal"
  ON user_healing_journal FOR DELETE
  USING (auth.uid() = user_id);
