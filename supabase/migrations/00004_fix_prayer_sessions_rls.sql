-- Fix RLS: Users should always see their own prayer sessions (for history/stats)
-- The existing policy only allows reading active/recent sessions publicly.
-- We add an additional policy so authenticated users can see all their own sessions.

CREATE POLICY "Users can view their own sessions"
  ON prayer_sessions FOR SELECT
  USING (auth.uid() = user_id);
