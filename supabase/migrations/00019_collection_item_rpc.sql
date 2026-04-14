-- Use a SECURITY DEFINER RPC for adding/removing items in prayer collections.
-- This avoids brittle client-side writes against the join table when RLS
-- policies behave differently across environments.

DROP FUNCTION IF EXISTS public.set_prayer_collection_item(UUID, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION public.set_prayer_collection_item(
  p_collection_id UUID,
  p_prayer_slug TEXT,
  p_should_exist BOOLEAN DEFAULT TRUE
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_owned BOOLEAN := FALSE;
  v_exists BOOLEAN := FALSE;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1
      FROM user_prayer_collections c
     WHERE c.id = p_collection_id
       AND c.user_id = v_user
  )
    INTO v_owned;

  IF NOT v_owned THEN
    RAISE EXCEPTION 'collection not found or not owned by user';
  END IF;

  SELECT EXISTS (
    SELECT 1
      FROM user_prayer_collection_items i
     WHERE i.collection_id = p_collection_id
       AND i.prayer_slug = p_prayer_slug
  )
    INTO v_exists;

  IF p_should_exist THEN
    IF v_exists THEN
      RETURN 'already_present';
    END IF;

    INSERT INTO user_prayer_collection_items (collection_id, prayer_slug)
    VALUES (p_collection_id, p_prayer_slug);

    RETURN 'added';
  END IF;

  IF NOT v_exists THEN
    RETURN 'already_absent';
  END IF;

  DELETE FROM user_prayer_collection_items
   WHERE collection_id = p_collection_id
     AND prayer_slug = p_prayer_slug;

  RETURN 'removed';
END;
$$;

REVOKE ALL ON FUNCTION public.set_prayer_collection_item(UUID, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_prayer_collection_item(UUID, TEXT, BOOLEAN) TO authenticated;
