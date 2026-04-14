-- Allow users to join a private group by its invite code without needing
-- SELECT permission on the groups row first.
-- Previously the client-side flow did:
--   SELECT id FROM groups WHERE invite_code = ?
-- which failed for private groups the user wasn't a member of yet.

DROP FUNCTION IF EXISTS public.join_group_by_code(TEXT);

CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code TEXT)
RETURNS TABLE (joined_group_id UUID, join_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_group_id UUID;
  v_max INTEGER;
  v_current INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT g.id, g.max_members INTO v_group_id, v_max
    FROM groups g
   WHERE g.invite_code = p_code
   LIMIT 1;

  IF v_group_id IS NULL THEN
    joined_group_id := NULL;
    join_status := 'not_found';
    RETURN NEXT;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = v_group_id AND gm.user_id = v_user
  ) THEN
    joined_group_id := v_group_id;
    join_status := 'already_member';
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_current
    FROM group_members gm
   WHERE gm.group_id = v_group_id;

  IF v_current >= v_max THEN
    joined_group_id := v_group_id;
    join_status := 'full';
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO group_members (group_id, user_id, role)
    VALUES (v_group_id, v_user, 'member');

  joined_group_id := v_group_id;
  join_status := 'joined';
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;
