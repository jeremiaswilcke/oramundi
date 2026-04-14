-- Leave / remove-member RPCs that bypass RLS edge cases
-- (same pattern as join_group_by_code). Also surfaces errors to the client.

DROP FUNCTION IF EXISTS public.leave_group(UUID);
DROP FUNCTION IF EXISTS public.remove_group_member(UUID);

CREATE OR REPLACE FUNCTION public.leave_group(p_group_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_removed INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM group_members gm
   WHERE gm.group_id = p_group_id
     AND gm.user_id = v_user;

  GET DIAGNOSTICS v_removed = ROW_COUNT;
  IF v_removed = 0 THEN
    RETURN 'not_member';
  END IF;
  RETURN 'left';
END;
$$;

REVOKE ALL ON FUNCTION public.leave_group(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leave_group(UUID) TO authenticated;

-- Admins can remove another member
CREATE OR REPLACE FUNCTION public.remove_group_member(p_member_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_group_id UUID;
  v_target_user UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT gm.group_id, gm.user_id INTO v_group_id, v_target_user
    FROM group_members gm
   WHERE gm.id = p_member_id;

  IF v_group_id IS NULL THEN
    RETURN 'not_found';
  END IF;

  IF v_target_user = v_user THEN
    RETURN 'use_leave_instead';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = v_group_id
      AND gm.user_id = v_user
      AND gm.role = 'admin'
  ) THEN
    RETURN 'not_admin';
  END IF;

  DELETE FROM group_members gm WHERE gm.id = p_member_id;
  RETURN 'removed';
END;
$$;

REVOKE ALL ON FUNCTION public.remove_group_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_group_member(UUID) TO authenticated;
