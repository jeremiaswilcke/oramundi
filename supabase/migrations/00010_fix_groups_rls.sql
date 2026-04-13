-- Fix recursive RLS on group_members
-- The original policy checked group_members within group_members,
-- which causes the policy to silently return no rows.

DROP POLICY IF EXISTS "Members visible to other members" ON group_members;

-- Helper function with SECURITY DEFINER to avoid the recursion
CREATE OR REPLACE FUNCTION public.is_group_member(g_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = g_id AND user_id = u_id
  );
$$;

-- Two non-recursive policies:
-- 1) You can always see your own membership rows
CREATE POLICY "Users see their own memberships"
  ON group_members FOR SELECT
  USING (auth.uid() = user_id);

-- 2) You can see other members of groups you're a member of (via SECURITY DEFINER fn)
CREATE POLICY "Members see co-members"
  ON group_members FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

-- 3) Public group memberships are visible to everyone
CREATE POLICY "Public group members visible"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.is_public = TRUE
    )
  );

-- Also fix the groups SELECT policy which has the same recursion problem
DROP POLICY IF EXISTS "Public and member groups visible" ON groups;

CREATE POLICY "Public groups visible to all"
  ON groups FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Member groups visible"
  ON groups FOR SELECT
  USING (public.is_group_member(id, auth.uid()));
