/*
# Hide the internal role-check helper

1. Purpose
- Move the policy-only role helper out of the public API schema.
- Keep admin/editor row policies working without exposing an unnecessary RPC endpoint.

2. Security
- The helper remains SECURITY DEFINER with a fixed search_path.
- Only authenticated policy evaluation may execute it.
- The public administrative role procedure remains separately protected by its own admin check.

3. Data safety
- No tables, columns, or rows are changed.
*/

CREATE SCHEMA IF NOT EXISTS private;

ALTER FUNCTION public.is_editor_or_admin() SET SCHEMA private;

REVOKE EXECUTE ON FUNCTION private.is_editor_or_admin() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_editor_or_admin() TO authenticated;

DROP POLICY IF EXISTS "subscribers_admin_select" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_update" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_delete" ON public.subscribers;

CREATE POLICY "subscribers_admin_select"
  ON public.subscribers FOR SELECT
  TO authenticated
  USING ((SELECT private.is_editor_or_admin()));

CREATE POLICY "subscribers_admin_update"
  ON public.subscribers FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_editor_or_admin()))
  WITH CHECK ((SELECT private.is_editor_or_admin()));

CREATE POLICY "subscribers_admin_delete"
  ON public.subscribers FOR DELETE
  TO authenticated
  USING ((SELECT private.is_editor_or_admin()));

DROP POLICY IF EXISTS "submissions_select_own_or_editor" ON public.submissions;
DROP POLICY IF EXISTS "submissions_delete_own_or_editor" ON public.submissions;

CREATE POLICY "submissions_select_own_or_editor"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT private.is_editor_or_admin())
  );

CREATE POLICY "submissions_delete_own_or_editor"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT private.is_editor_or_admin())
  );

DROP POLICY IF EXISTS "creative_select_public_or_editor" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_delete_own_or_editor" ON public.creative_pieces;

CREATE POLICY "creative_select_public_or_editor"
  ON public.creative_pieces FOR SELECT
  TO anon, authenticated
  USING (
    status IN ('aprobado', 'publicado')
    OR (
      (SELECT auth.uid()) IS NOT NULL
      AND (
        user_id = (SELECT auth.uid())
        OR (SELECT private.is_editor_or_admin())
      )
    )
  );

CREATE POLICY "creative_delete_own_or_editor"
  ON public.creative_pieces FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT private.is_editor_or_admin())
  );

DROP POLICY IF EXISTS "contact_admin_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_update" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_delete" ON public.contact_messages;

CREATE POLICY "contact_admin_select"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING ((SELECT private.is_editor_or_admin()));

CREATE POLICY "contact_admin_update"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_editor_or_admin()))
  WITH CHECK ((SELECT private.is_editor_or_admin()));

CREATE POLICY "contact_admin_delete"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING ((SELECT private.is_editor_or_admin()));