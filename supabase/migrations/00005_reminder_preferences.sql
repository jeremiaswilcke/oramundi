-- Add reminder preference columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_frequency TEXT DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'weekdays', 'weekly', 'custom'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_time TEXT DEFAULT '18:00';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_subscription JSONB;
