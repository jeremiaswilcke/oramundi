-- Public sharing + cloning for user prayer collections

ALTER TABLE user_prayer_collections
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE user_prayer_collections
  ADD COLUMN IF NOT EXISTS copied_from UUID REFERENCES user_prayer_collections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_prayer_collections_public
  ON user_prayer_collections(is_public, created_at DESC) WHERE is_public = TRUE;

-- Public collections readable by anyone authenticated
CREATE POLICY "Public collections readable by all"
  ON user_prayer_collections FOR SELECT
  USING (is_public = TRUE);

-- Items of public collections readable by anyone authenticated
CREATE POLICY "Public collection items readable by all"
  ON user_prayer_collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_prayer_collections c
      WHERE c.id = user_prayer_collection_items.collection_id
        AND c.is_public = TRUE
    )
  );

-- Clone a public collection into the current user's collections
CREATE OR REPLACE FUNCTION public.clone_prayer_collection(p_source_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_source RECORD;
  v_new_id UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT name, description, icon, is_public, user_id
    INTO v_source
    FROM user_prayer_collections
   WHERE id = p_source_id;

  IF v_source IS NULL THEN
    RAISE EXCEPTION 'collection not found';
  END IF;

  IF v_source.is_public = FALSE AND v_source.user_id <> v_user THEN
    RAISE EXCEPTION 'collection is not public';
  END IF;

  INSERT INTO user_prayer_collections (user_id, name, description, icon, is_public, copied_from)
    VALUES (v_user, v_source.name, v_source.description, v_source.icon, FALSE, p_source_id)
    RETURNING id INTO v_new_id;

  INSERT INTO user_prayer_collection_items (collection_id, prayer_slug, sort_order)
    SELECT v_new_id, prayer_slug, sort_order
      FROM user_prayer_collection_items
     WHERE collection_id = p_source_id
     ORDER BY sort_order;

  RETURN v_new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.clone_prayer_collection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clone_prayer_collection(UUID) TO authenticated;

-- List public collections with owner display name and item count
CREATE OR REPLACE FUNCTION public.list_public_collections(p_limit INT DEFAULT 50, p_offset INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  icon TEXT,
  owner_name TEXT,
  item_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    c.id,
    c.name,
    c.description,
    c.icon,
    p.display_name AS owner_name,
    (SELECT COUNT(*) FROM user_prayer_collection_items i WHERE i.collection_id = c.id) AS item_count,
    c.created_at
  FROM user_prayer_collections c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.is_public = TRUE
  ORDER BY c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

REVOKE ALL ON FUNCTION public.list_public_collections(INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_collections(INT, INT) TO authenticated;
