-- Schedule the send-reminders edge function to run every 15 minutes
-- Requires: pg_cron and pg_net extensions (enable in Supabase Dashboard > Database > Extensions)

-- Note: Replace the URL and ANON/SERVICE key below with your actual values
-- Also make sure pg_cron and pg_net are enabled

-- First: ensure extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule every 15 minutes
-- IMPORTANT: Replace {PROJECT_REF} and {SERVICE_ROLE_KEY} below before running!
-- You can find these in Supabase Dashboard > Settings > API

SELECT cron.schedule(
  'send-reminders-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gbczpovjxftfixzzelfy.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- To set the service_role_key as a database setting (run once):
-- ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY_HERE';
