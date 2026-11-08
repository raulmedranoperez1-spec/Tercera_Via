/*
# Forum: let visitors read public categories, threads, and posts

## Overview
Visitors who are not signed in could not open the forum: the page showed
"No se pudo cargar el foro". The cause was that the read policies on the
forum tables called a private helper function that anonymous visitors are not
allowed to use, so Postgres rejected the whole query for them.

## 1. Modified Policies
- forum_categories: the public read policy now only checks `is_active = true`
  for anonymous and signed-in users. A separate policy lets signed-in editors
  see inactive categories.
- forum_threads: the public read policy now only shows threads with status
  'limpio' to everyone. A separate signed-in policy lets authors see their own
  hidden/flagged threads and editors see all threads.
- forum_posts: same split as forum_threads.

## 2. Security
- No table is opened to more people than before. Hidden content is still only
  visible to its author (signed in) or to editors (signed in).
- Anonymous visitors never run the editor-check helper, so they no longer hit a
  permission error.
- Existing insert, update, and delete policies are unchanged.

## 3. Important Notes
1. Policies are replaced with DROP ... IF EXISTS followed by CREATE, so the
   migration can be re-run safely.
*/

DROP POLICY IF EXISTS "categories_select_active" ON public.forum_categories;
CREATE POLICY "categories_select_active"
  ON public.forum_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "categories_select_editor" ON public.forum_categories;
CREATE POLICY "categories_select_editor"
  ON public.forum_categories FOR SELECT
  TO authenticated
  USING (private.is_editor_or_admin());

DROP POLICY IF EXISTS "threads_select_visible" ON public.forum_threads;
CREATE POLICY "threads_select_visible"
  ON public.forum_threads FOR SELECT
  TO anon, authenticated
  USING (moderation_status = 'limpio');

DROP POLICY IF EXISTS "threads_select_author_or_editor" ON public.forum_threads;
CREATE POLICY "threads_select_author_or_editor"
  ON public.forum_threads FOR SELECT
  TO authenticated
  USING (
    (author_id = auth.uid() AND moderation_status IN ('marcado','oculto'))
    OR private.is_editor_or_admin()
  );

DROP POLICY IF EXISTS "posts_select_visible" ON public.forum_posts;
CREATE POLICY "posts_select_visible"
  ON public.forum_posts FOR SELECT
  TO anon, authenticated
  USING (moderation_status = 'limpio');

DROP POLICY IF EXISTS "posts_select_author_or_editor" ON public.forum_posts;
CREATE POLICY "posts_select_author_or_editor"
  ON public.forum_posts FOR SELECT
  TO authenticated
  USING (
    (author_id = auth.uid() AND moderation_status IN ('marcado','oculto'))
    OR private.is_editor_or_admin()
  );
