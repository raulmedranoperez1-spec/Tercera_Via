/*
# Harden Supabase access controls

1. Purpose
- Remove public read access to newsletter subscribers.
- Protect profile roles from direct browser updates.
- Scope submissions to their author, administrators, and editors.
- Publish creative pieces publicly only when their status is approved or published.
- Restrict remote execution of SECURITY DEFINER functions.
- Keep the existing newsletter and contact insert flows working.

2. Access model
- Anonymous visitors may only insert newsletter subscribers and contact messages.
- Authenticated readers may read their own protected records.
- Users with profile role `admin` or `editor` may review protected editorial records.
- Roles and moderation fields are changed only through server-side procedures or trusted server access.

3. Security changes
- Remove broad subscriber and profile permissions from API roles.
- Replace permissive subscriber, profile, submission, and creative-piece policies.
- Revoke direct execution of `handle_new_user()` from API roles.
- Keep `toggle_vote(uuid)` available only to authenticated users and reject anonymous execution.

4. Data safety
- No tables, columns, or existing rows are deleted.
- Existing public forms retain INSERT access.
- Creative-piece default status changes from `publicado` to `pendiente` so new browser-created content cannot become public by default.
*/

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'editor')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_editor_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_profile_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF new_role NOT IN ('lector', 'creador', 'editor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_profile_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_profile_role(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.toggle_vote(target_suggestion_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_vote record;
  new_count integer;
  actor_id uuid := (SELECT auth.uid());
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id INTO existing_vote
  FROM public.suggestion_votes
  WHERE suggestion_id = target_suggestion_id
    AND user_id = actor_id;

  IF FOUND THEN
    DELETE FROM public.suggestion_votes WHERE id = existing_vote.id;
    UPDATE public.community_suggestions
    SET votes = GREATEST(votes - 1, 0)
    WHERE id = target_suggestion_id
    RETURNING votes INTO new_count;
  ELSE
    INSERT INTO public.suggestion_votes (suggestion_id, user_id)
    VALUES (target_suggestion_id, actor_id);
    UPDATE public.community_suggestions
    SET votes = votes + 1
    WHERE id = target_suggestion_id
    RETURNING votes INTO new_count;
  END IF;

  RETURN COALESCE(new_count, 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.toggle_vote(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_vote(uuid) TO authenticated;

REVOKE ALL ON public.subscribers FROM anon, authenticated;
GRANT INSERT ON public.subscribers TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.subscribers TO authenticated;

DROP POLICY IF EXISTS "anon_insert_subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "anon_select_subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_select" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_update" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_delete" ON public.subscribers;

CREATE POLICY "subscribers_public_insert"
  ON public.subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(trim(email)) BETWEEN 3 AND 320);

CREATE POLICY "subscribers_admin_select"
  ON public.subscribers FOR SELECT
  TO authenticated
  USING ((SELECT public.is_editor_or_admin()));

CREATE POLICY "subscribers_admin_update"
  ON public.subscribers FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_editor_or_admin()))
  WITH CHECK ((SELECT public.is_editor_or_admin()));

CREATE POLICY "subscribers_admin_delete"
  ON public.subscribers FOR DELETE
  TO authenticated
  USING ((SELECT public.is_editor_or_admin()));

REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_display_name" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

REVOKE ALL ON public.submissions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;

DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
DROP POLICY IF EXISTS "submissions_select_all" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_own" ON public.submissions;
DROP POLICY IF EXISTS "submissions_delete_own" ON public.submissions;
DROP POLICY IF EXISTS "submissions_select_own_or_editor" ON public.submissions;
DROP POLICY IF EXISTS "submissions_delete_own_or_editor" ON public.submissions;

CREATE POLICY "submissions_select_own_or_editor"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT public.is_editor_or_admin())
  );

CREATE POLICY "submissions_insert_own"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND status = 'pendiente');

CREATE POLICY "submissions_update_own_pending"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id AND status = 'pendiente');

CREATE POLICY "submissions_delete_own_or_editor"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT public.is_editor_or_admin())
  );

REVOKE ALL ON public.creative_pieces FROM anon, authenticated;
GRANT SELECT ON public.creative_pieces TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creative_pieces TO authenticated;

ALTER TABLE public.creative_pieces
  ALTER COLUMN status SET DEFAULT 'pendiente';

DROP POLICY IF EXISTS "creative_select_all" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_insert_own" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_update_own" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_delete_own" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_select_public_or_editor" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_select_own_or_editor" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_insert_own_pending" ON public.creative_pieces;
DROP POLICY IF EXISTS "creative_update_own_content" ON public.creative_pieces;
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
        OR (SELECT public.is_editor_or_admin())
      )
    )
  );

CREATE POLICY "creative_insert_own_pending"
  ON public.creative_pieces FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'pendiente'
  );

CREATE POLICY "creative_update_own_pending"
  ON public.creative_pieces FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'pendiente'
  );

CREATE POLICY "creative_delete_own_or_editor"
  ON public.creative_pieces FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT public.is_editor_or_admin())
  );

REVOKE ALL ON public.contact_messages FROM anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_update" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_delete" ON public.contact_messages;

CREATE POLICY "contact_public_insert"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 120
    AND length(trim(email)) BETWEEN 3 AND 320
    AND length(trim(message)) BETWEEN 1 AND 5000
  );

CREATE POLICY "contact_admin_select"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING ((SELECT public.is_editor_or_admin()));

CREATE POLICY "contact_admin_update"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_editor_or_admin()))
  WITH CHECK ((SELECT public.is_editor_or_admin()));

CREATE POLICY "contact_admin_delete"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING ((SELECT public.is_editor_or_admin()));