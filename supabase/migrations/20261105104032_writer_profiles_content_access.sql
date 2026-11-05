/*
# Writer profiles: validation, indexes and tighter access

## Plain-English summary
Prepares the database for writer profile pages. Usernames, display names and biographies are validated, writers' content is indexed by author, and anonymous visitors lose access to private profile data and to write access on content tables.

## 1. Modified table: profiles
- `username`: must be 3 to 30 lowercase letters, digits or underscores, and must be unique.
- `display_name`: 1 to 80 characters when set.
- `bio`: up to 500 characters when set.
- Anonymous visitors can no longer read the email address or membership flag of any profile. They can still read id, username, display name, bio, avatar, role and creation date.

## 2. Modified tables: articles, projects, podcasts
- Anonymous visitors lose INSERT, UPDATE and DELETE grants. They keep reading published items through the existing policies.
- New indexes on author and publication date for fast writer pages.

## 3. Storage: avatars bucket
- Avatar uploads must go into a folder named after the uploader's user id. This prevents a signed-in user from placing files in another user's folder.

## Security notes
- RLS remains enabled on every table. No policy that grants data to other users is widened.
- The migration is idempotent and can be re-run safely.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_format') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_format
      CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,30}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_display_name_length') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_display_name_length
      CHECK (display_name IS NULL OR char_length(display_name) BETWEEN 1 AND 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_bio_length') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_bio_length
      CHECK (bio IS NULL OR char_length(bio) <= 500);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (username) WHERE username IS NOT NULL;

REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, display_name, bio, avatar_url, role, created_at) ON public.profiles TO anon;

REVOKE INSERT, UPDATE, DELETE ON public.articles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.podcasts FROM anon;

CREATE INDEX IF NOT EXISTS articles_author_published_idx ON public.articles (author_id, published_at DESC);
CREATE INDEX IF NOT EXISTS projects_author_published_idx ON public.projects (author_id, published_at DESC);
CREATE INDEX IF NOT EXISTS podcasts_author_published_idx ON public.podcasts (author_id, published_at DESC);

DROP POLICY IF EXISTS "avatars_auth_upload" ON storage.objects;
CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
