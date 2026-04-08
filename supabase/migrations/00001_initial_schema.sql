-- Ora Mundi — Initial Schema

-- === Profiles ===
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  country_code TEXT,
  city TEXT,
  latitude FLOAT,
  longitude FLOAT,
  locale TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- === Prayer Sessions ===
CREATE TABLE prayer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mystery_type TEXT NOT NULL CHECK (mystery_type IN ('joyful','luminous','sorrowful','glorious')),
  mode TEXT NOT NULL CHECK (mode IN ('quick','guided')) DEFAULT 'quick',
  latitude FLOAT,
  longitude FLOAT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE
);

ALTER TABLE prayer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sessions are viewable by everyone"
  ON prayer_sessions FOR SELECT
  USING (ended_at IS NULL OR ended_at > NOW() - INTERVAL '1 hour');

CREATE POLICY "Users can insert their own sessions"
  ON prayer_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON prayer_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Index for active session queries
CREATE INDEX idx_prayer_sessions_active
  ON prayer_sessions (started_at DESC)
  WHERE ended_at IS NULL;

-- === Intentions ===
CREATE TABLE intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible intentions are viewable by everyone"
  ON intentions FOR SELECT
  USING (is_hidden = FALSE AND is_flagged = FALSE);

CREATE POLICY "Users can insert their own intentions"
  ON intentions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intentions"
  ON intentions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intentions"
  ON intentions FOR DELETE USING (auth.uid() = user_id);

-- === Intention Prayers ===
CREATE TABLE intention_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id UUID REFERENCES intentions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intention_id, user_id)
);

ALTER TABLE intention_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayers are viewable by everyone"
  ON intention_prayers FOR SELECT USING (true);

CREATE POLICY "Users can insert their own prayers"
  ON intention_prayers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayers"
  ON intention_prayers FOR DELETE USING (auth.uid() = user_id);

-- === Intention Flags ===
CREATE TABLE intention_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id UUID REFERENCES intentions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intention_id, user_id)
);

ALTER TABLE intention_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own flags"
  ON intention_flags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-flag intentions with 3+ flags
CREATE OR REPLACE FUNCTION public.check_intention_flags()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM intention_flags WHERE intention_id = NEW.intention_id) >= 3 THEN
    UPDATE intentions SET is_flagged = TRUE WHERE id = NEW.intention_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_intention_flagged
  AFTER INSERT ON intention_flags
  FOR EACH ROW EXECUTE FUNCTION public.check_intention_flags();

-- === Stale session cleanup (call via pg_cron or Edge Function) ===
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS void AS $$
BEGIN
  UPDATE prayer_sessions
  SET ended_at = NOW(), completed = FALSE
  WHERE ended_at IS NULL
    AND started_at < NOW() - INTERVAL '45 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
