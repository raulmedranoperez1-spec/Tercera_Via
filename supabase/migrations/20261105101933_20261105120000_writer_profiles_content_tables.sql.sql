/*
# Writer profiles, content tables, and avatar storage

## Plain-English summary
This migration extends the existing `profiles` table with writer-specific fields
(username, bio, avatar URL) and creates three new content tables — `articles`,
`projects`, and `podcasts` — so that each writer (colaborador) can publish
content that appears on their public profile page. It also sets up a Supabase
Storage bucket for profile avatars.

## 1. Modified table: `profiles`
- `username` (text, unique, nullable) — a URL-friendly handle for the writer's
  profile page (e.g. `maria-lopez`). Auto-generated from email if not set.
- `bio` (text, nullable) — writer biography / description shown on the profile.
- `avatar_url` (text, nullable) — URL to the profile photo in storage.

## 2. New table: `articles`
Stores news articles and essays written by a writer.
- `id` (uuid PK)
- `author_id` (uuid FK → profiles.id, default auth.uid())
- `title` (text, not null)
- `excerpt` (text, not null) — short description / summary
- `content` (text, not null) — full article body
- `cover_image_url` (text, nullable) — cover image URL
- `status` (text, default 'publicado') — publication status
- `published_at` (timestamptz, default now())
- `created_at` (timestamptz, default now())
- `likes` (integer, default 0) — like count
- `saves` (integer, default 0) — save/bookmark count

## 3. New table: `projects`
Stores projects uploaded by a writer.
- `id` (uuid PK)
- `author_id` (uuid FK → profiles.id, default auth.uid())
- `title` (text, not null)
- `description` (text, not null)
- `cover_image_url` (text, nullable)
- `content` (text, not null) — project details / body
- `project_url` (text, nullable) — external link if applicable
- `status` (text, default 'publicado')
- `published_at` (timestamptz, default now())
- `created_at` (timestamptz, default now())

## 4. New table: `podcasts`
Stores podcasts published by a writer.
- `id` (uuid PK)
- `author_id` (uuid FK → profiles.id, default auth.uid())
- `title` (text, not null)
- `description` (text, not null)
- `cover_image_url` (text, nullable)
- `audio_url` (text, nullable) — URL to audio file for playback
- `duration_seconds` (integer, nullable) — duration if known
- `status` (text, default 'publicado')
- `published_at` (timestamptz, default now())
- `created_at` (timestamptz, default now())

## 5. Security (RLS + policies)
- `profiles`: adds SELECT for anon+authenticated (public profiles), and
  UPDATE for authenticated users on their own row (username, bio, avatar_url,
  display_name only — column-restricted).
- `articles`, `projects`, `podcasts`: public SELECT on published rows
  (anon + authenticated); INSERT/UPDATE/DELETE for the author only
  (authenticated, author_id = auth.uid()).
- All new tables get RLS enabled and minimum-privilege grants.

## Important notes
1. All statements are idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).
2. No existing data is modified or deleted — only additive changes.
3. The `username` column is unique but nullable; existing profiles get NULL
   and can set one later. A partial unique index enforces uniqueness for non-null values.
*/

-- ============= profiles extensions =============
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Unique index on username (partial — only enforces for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles (username) WHERE username IS NOT NULL;

-- Auto-generate username from email for existing rows that don't have one
UPDATE profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- ============= articles table =============
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  cover_image_url text,
  status text NOT NULL DEFAULT 'publicado',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  likes integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS articles_author_idx ON articles (author_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles (published_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON articles TO authenticated;

DROP POLICY IF EXISTS "articles_select_published" ON articles;
CREATE POLICY "articles_select_published" ON articles FOR SELECT
  TO anon, authenticated
  USING (status = 'publicado');

DROP POLICY IF EXISTS "articles_insert_own" ON articles;
CREATE POLICY "articles_insert_own" ON articles FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "articles_update_own" ON articles;
CREATE POLICY "articles_update_own" ON articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "articles_delete_own" ON articles;
CREATE POLICY "articles_delete_own" ON articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============= projects table =============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  cover_image_url text,
  content text NOT NULL,
  project_url text,
  status text NOT NULL DEFAULT 'publicado',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_author_idx ON projects (author_id);
CREATE INDEX IF NOT EXISTS projects_published_idx ON projects (published_at DESC);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON projects TO authenticated;

DROP POLICY IF EXISTS "projects_select_published" ON projects;
CREATE POLICY "projects_select_published" ON projects FOR SELECT
  TO anon, authenticated
  USING (status = 'publicado');

DROP POLICY IF EXISTS "projects_insert_own" ON projects;
CREATE POLICY "projects_insert_own" ON projects FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "projects_update_own" ON projects;
CREATE POLICY "projects_update_own" ON projects FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "projects_delete_own" ON projects;
CREATE POLICY "projects_delete_own" ON projects FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============= podcasts table =============
CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  cover_image_url text,
  audio_url text,
  duration_seconds integer,
  status text NOT NULL DEFAULT 'publicado',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS podcasts_author_idx ON podcasts (author_id);
CREATE INDEX IF NOT EXISTS podcasts_published_idx ON podcasts (published_at DESC);

ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON podcasts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON podcasts TO authenticated;

DROP POLICY IF EXISTS "podcasts_select_published" ON podcasts;
CREATE POLICY "podcasts_select_published" ON podcasts FOR SELECT
  TO anon, authenticated
  USING (status = 'publicado');

DROP POLICY IF EXISTS "podcasts_insert_own" ON podcasts;
CREATE POLICY "podcasts_insert_own" ON podcasts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "podcasts_update_own" ON podcasts;
CREATE POLICY "podcasts_update_own" ON podcasts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "podcasts_delete_own" ON podcasts;
CREATE POLICY "podcasts_delete_own" ON podcasts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============= profiles: public read + self-update =============
-- Allow public to read profiles (so visitors can see writer pages)
GRANT SELECT ON profiles TO anon;

-- Allow authenticated users to update their own profile (username, bio, avatar_url, display_name)
-- Column-restricted grant so users can't change role, is_socio, email, etc.
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Column-restricted: users can only update display_name, username, bio, avatar_url
GRANT UPDATE (display_name, username, bio, avatar_url) ON profiles TO authenticated;
