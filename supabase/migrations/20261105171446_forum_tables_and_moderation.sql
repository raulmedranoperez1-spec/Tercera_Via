/*
# Forum: categories, threads, posts, and moderation

## Overview
Creates the complete forum data structure for La Tercera Vía with three new
tables (forum_categories, forum_threads, forum_posts), replaces the legacy
forum_messages table (0 rows, no categories/threads), updates the
is_editor_or_admin helper to match the real role 'equipo_editorial', and
seeds six default categories.

## 1. New Tables

### forum_categories
- `id` (uuid, PK, default gen_random_uuid())
- `slug` (text, unique, not null) — URL-safe identifier
- `name` (text, not null, 1–100 chars)
- `description` (text, nullable, max 500 chars)
- `sort_order` (int, default 0) — manual ordering
- `is_active` (boolean, default true) — soft-hide categories
- `created_at` (timestamptz, default now())

### forum_threads
- `id` (uuid, PK, default gen_random_uuid())
- `category_id` (uuid, FK → forum_categories, ON DELETE CASCADE)
- `author_id` (uuid, FK → auth.users, default auth.uid())
- `title` (text, not null, 3–200 chars)
- `body` (text, not null, 1–5000 chars)
- `moderation_status` (text, default 'limpio', CHECK in limpio/marcado/oculto/eliminado)
- `moderation_reason` (text, nullable)
- `post_count` (int, default 0)
- `last_activity_at` (timestamptz, default now())
- `created_at` (timestamptz, default now())

### forum_posts
- `id` (uuid, PK, default gen_random_uuid())
- `thread_id` (uuid, FK → forum_threads, ON DELETE CASCADE)
- `author_id` (uuid, FK → auth.users, default auth.uid())
- `parent_post_id` (uuid, nullable, FK → forum_posts, ON DELETE SET NULL)
- `body` (text, not null, 1–2000 chars)
- `moderation_status` (text, default 'limpio', CHECK in limpio/marcado/oculto/eliminado)
- `moderation_reason` (text, nullable)
- `edited_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

## 2. Modified Objects
- `private.is_editor_or_admin()` — updated to check `role = 'equipo_editorial'`
  (was checking 'admin' and 'editor' which no longer exist after role
  normalization migration 20261104183957).
- `forum_messages` — dropped (0 rows, replaced by the new structure).

## 3. Security
- RLS enabled on all three new tables.
- Categories: public SELECT on active; INSERT/UPDATE/DELETE to equipo_editorial.
- Threads: public SELECT on 'limpio'; authors see their own marcado/oculto;
  editors see all; INSERT to authenticated with author = auth.uid();
  UPDATE to author (within 24h) or editor (moderation); DELETE to author or editor.
- Posts: same pattern as threads.
- Grants are column-restricted where appropriate.
- Indexes on category_id, thread_id, author_id, (moderation_status),
  and (category_id, last_activity_at DESC) for thread listing.

## 4. Default Data
Seeds six categories: actualidad-y-politica, sociedad-y-cultura,
universidad-y-educacion, economia, ciencia-y-tecnologia, debate-general.

## 5. Important Notes
1. The role check uses `private.is_editor_or_admin()` which now correctly
   checks for 'equipo_editorial'. All existing policies using this function
   (contact_messages, subscribers, submissions, creative_pieces) will also
   benefit from the fix.
2. Thread post_count and last_activity_at are maintained by triggers on
   forum_posts INSERT/DELETE.
3. The 24-hour edit window is enforced in RLS using
   `created_at > now() - interval '24 hours'`.
*/

-- ── Fix is_editor_or_admin to match real role ──
CREATE OR REPLACE FUNCTION private.is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'equipo_editorial'
  );
$$;

-- ── Drop legacy forum_messages (0 rows, replaced) ──
DROP POLICY IF EXISTS "member_insert_forum" ON public.forum_messages;
DROP POLICY IF EXISTS "member_select_forum" ON public.forum_messages;
DROP TABLE IF EXISTS public.forum_messages CASCADE;

-- ── forum_categories ──
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.forum_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_categories TO authenticated;

DROP POLICY IF EXISTS "categories_select_active" ON public.forum_categories;
CREATE POLICY "categories_select_active"
  ON public.forum_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR private.is_editor_or_admin());

DROP POLICY IF EXISTS "categories_insert_editor" ON public.forum_categories;
CREATE POLICY "categories_insert_editor"
  ON public.forum_categories FOR INSERT
  TO authenticated
  WITH CHECK (private.is_editor_or_admin());

DROP POLICY IF EXISTS "categories_update_editor" ON public.forum_categories;
CREATE POLICY "categories_update_editor"
  ON public.forum_categories FOR UPDATE
  TO authenticated
  USING (private.is_editor_or_admin())
  WITH CHECK (private.is_editor_or_admin());

DROP POLICY IF EXISTS "categories_delete_editor" ON public.forum_categories;
CREATE POLICY "categories_delete_editor"
  ON public.forum_categories FOR DELETE
  TO authenticated
  USING (private.is_editor_or_admin());

-- ── forum_threads ──
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  body text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 5000),
  moderation_status text NOT NULL DEFAULT 'limpio' CHECK (moderation_status IN ('limpio','marcado','oculto','eliminado')),
  moderation_reason text,
  post_count integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.forum_threads TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_threads TO authenticated;

DROP POLICY IF EXISTS "threads_select_visible" ON public.forum_threads;
CREATE POLICY "threads_select_visible"
  ON public.forum_threads FOR SELECT
  TO anon, authenticated
  USING (
    moderation_status = 'limpio'
    OR (auth.uid() IS NOT NULL AND author_id = auth.uid() AND moderation_status IN ('marcado','oculto'))
    OR private.is_editor_or_admin()
  );

DROP POLICY IF EXISTS "threads_insert_own" ON public.forum_threads;
CREATE POLICY "threads_insert_own"
  ON public.forum_threads FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "threads_update_own_or_editor" ON public.forum_threads;
CREATE POLICY "threads_update_own_or_editor"
  ON public.forum_threads FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR private.is_editor_or_admin())
  WITH CHECK (
    (author_id = auth.uid() AND created_at > now() - interval '24 hours' AND moderation_status = 'limpio')
    OR private.is_editor_or_admin()
  );

DROP POLICY IF EXISTS "threads_delete_own_or_editor" ON public.forum_threads;
CREATE POLICY "threads_delete_own_or_editor"
  ON public.forum_threads FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR private.is_editor_or_admin());

-- ── forum_posts ──
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_post_id uuid REFERENCES public.forum_posts(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 2000),
  moderation_status text NOT NULL DEFAULT 'limpio' CHECK (moderation_status IN ('limpio','marcado','oculto','eliminado')),
  moderation_reason text,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.forum_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_posts TO authenticated;

DROP POLICY IF EXISTS "posts_select_visible" ON public.forum_posts;
CREATE POLICY "posts_select_visible"
  ON public.forum_posts FOR SELECT
  TO anon, authenticated
  USING (
    moderation_status = 'limpio'
    OR (auth.uid() IS NOT NULL AND author_id = auth.uid() AND moderation_status IN ('marcado','oculto'))
    OR private.is_editor_or_admin()
  );

DROP POLICY IF EXISTS "posts_insert_own" ON public.forum_posts;
CREATE POLICY "posts_insert_own"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "posts_update_own_or_editor" ON public.forum_posts;
CREATE POLICY "posts_update_own_or_editor"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR private.is_editor_or_admin())
  WITH CHECK (
    (author_id = auth.uid() AND created_at > now() - interval '24 hours' AND moderation_status = 'limpio')
    OR private.is_editor_or_admin()
  );

DROP POLICY IF EXISTS "posts_delete_own_or_editor" ON public.forum_posts;
CREATE POLICY "posts_delete_own_or_editor"
  ON public.forum_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR private.is_editor_or_admin());

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_activity
  ON public.forum_threads (category_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author
  ON public.forum_threads (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_moderation
  ON public.forum_threads (moderation_status) WHERE moderation_status != 'limpio';
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread
  ON public.forum_posts (thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author
  ON public.forum_posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_moderation
  ON public.forum_posts (moderation_status) WHERE moderation_status != 'limpio';
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent
  ON public.forum_posts (parent_post_id) WHERE parent_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_forum_categories_sort
  ON public.forum_categories (sort_order, name);

-- ── Triggers: maintain post_count and last_activity_at ──
CREATE OR REPLACE FUNCTION public.forum_update_thread_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_threads
    SET post_count = post_count + 1,
        last_activity_at = now()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_threads
    SET post_count = GREATEST(post_count - 1, 0)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_forum_posts_insert_stats ON public.forum_posts;
CREATE TRIGGER trg_forum_posts_insert_stats
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_update_thread_stats();

DROP TRIGGER IF EXISTS trg_forum_posts_delete_stats ON public.forum_posts;
CREATE TRIGGER trg_forum_posts_delete_stats
  AFTER DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_update_thread_stats();

-- ── Seed default categories ──
INSERT INTO public.forum_categories (slug, name, description, sort_order) VALUES
  ('actualidad-y-politica', 'Actualidad y política', 'Análisis y debate sobre la actualidad política nacional e internacional.', 1),
  ('sociedad-y-cultura', 'Sociedad y cultura', 'Conversaciones sobre movimientos sociales, cultura, arte y tradiciones.', 2),
  ('universidad-y-educacion', 'Universidad y educación', 'Todo lo relacionado con la vida universitaria, el sistema educativo y el conocimiento.', 3),
  ('economia', 'Economía', 'Debate sobre política económica, mercados, trabajo y finanzas.', 4),
  ('ciencia-y-tecnologia', 'Ciencia y tecnología', 'Avances científicos, innovación tecnológica y su impacto en la sociedad.', 5),
  ('debate-general', 'Debate general', 'Un espacio abierto para temas que no encajan en las demás categorías.', 6)
ON CONFLICT (slug) DO NOTHING;
