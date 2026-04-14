-- Allow users to join a private group by its invite code without needing
-- SELECT permission on the groups row first.
-- Previously the client-side flow did:
--   SELECT id FROM groups WHERE invite_code = ?
-- which failed for private groups the user wasn't a member of yet.

CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code TEXT)
RETURNS TABLE (group_id UUID, status TEXT)
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

  SELECT id, max_members INTO v_group_id, v_max
    FROM groups
   WHERE invite_code = p_code
   LIMIT 1;

  IF v_group_id IS NULL THEN
    group_id := NULL;
    status := 'not_found';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Already a member?
  IF EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = v_group_id AND user_id = v_user
  ) THEN
    group_id := v_group_id;
    status := 'already_member';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Capacity check
  SELECT COUNT(*) INTO v_current FROM group_members WHERE group_id = v_group_id;
  IF v_current >= v_max THEN
    group_id := v_group_id;
    status := 'full';
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO group_members (group_id, user_id, role)
    VALUES (v_group_id, v_user, 'member');

  group_id := v_group_id;
  status := 'joined';
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;
