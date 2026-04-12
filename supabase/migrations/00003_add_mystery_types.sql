-- Add mercy and joseph mystery types to prayer_sessions check constraint
ALTER TABLE prayer_sessions DROP CONSTRAINT IF EXISTS prayer_sessions_mystery_type_check;
ALTER TABLE prayer_sessions ADD CONSTRAINT prayer_sessions_mystery_type_check
  CHECK (mystery_type IN ('joyful', 'luminous', 'sorrowful', 'glorious', 'mercy', 'joseph'));
