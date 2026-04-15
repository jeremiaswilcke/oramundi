-- Unified public prayer map snapshot for the homepage counters and map.
-- Semantics:
--  - live_count: distinct users with prayer activity in the last 5 minutes
--    (guided sessions in progress and freshly completed quick/guided prayers)
--  - recent_count: total rosary sessions in the last 30 minutes
--  - items: public-safe map points for sessions in the last 30 minutes

DROP FUNCTION IF EXISTS public.get_public_prayer_map_snapshot();

CREATE OR REPLACE FUNCTION public.get_public_prayer_map_snapshot()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH visible_sessions AS (
    SELECT
      id,
      user_id,
      latitude,
      longitude,
      mystery_type,
      mode,
      started_at,
      ended_at,
      completed,
      COALESCE(last_active_at, ended_at, started_at) AS activity_at
    FROM prayer_sessions
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND (
        (ended_at IS NOT NULL AND ended_at > NOW() - INTERVAL '30 minutes')
        OR (
          ended_at IS NULL
          AND COALESCE(last_active_at, started_at) > NOW() - INTERVAL '30 minutes'
        )
      )
  ),
  counts AS (
    SELECT
      COUNT(*)::INT AS recent_count,
      COUNT(DISTINCT user_id) FILTER (
        WHERE activity_at > NOW() - INTERVAL '5 minutes'
      )::INT AS live_count
    FROM visible_sessions
  ),
  points AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'latitude', round(latitude::numeric, 1)::float,
          'longitude', round(longitude::numeric, 1)::float,
          'mystery_type', mystery_type,
          'mode', mode,
          'started_at', started_at,
          'is_live', activity_at > NOW() - INTERVAL '5 minutes'
        )
        ORDER BY started_at DESC
      ),
      '[]'::jsonb
    ) AS items
    FROM visible_sessions
  )
  SELECT jsonb_build_object(
    'live_count', COALESCE((SELECT live_count FROM counts), 0),
    'recent_count', COALESCE((SELECT recent_count FROM counts), 0),
    'items', COALESCE((SELECT items FROM points), '[]'::jsonb)
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_prayer_map_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_prayer_map_snapshot() TO anon, authenticated;
