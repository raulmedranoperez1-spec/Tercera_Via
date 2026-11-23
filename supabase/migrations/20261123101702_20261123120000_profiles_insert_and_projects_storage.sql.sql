/*
# Fix: allow authenticated users to create their own profile + projects storage bucket

## 1. Problem
- The `profiles` table had SELECT and UPDATE policies but NO INSERT policy
  and NO INSERT grant. The only way to create a profile row was the
  `handle_new_user()` trigger, which (a) only runs at signup time and
  (b) rejects non-institutional emails. Any authenticated session without
  a matching `profiles` row (e.g. legacy users, users created before the
  trigger, or edge cases) was permanently stuck: the app hung on
  "Cargando tu perfil..." because `fetchProfile()` returned null and the
  user could not insert their own row.

## 2. Changes — profiles table
- Add `profiles_insert_self` INSERT policy: an authenticated user can
  insert a row whose `id` matches their own `auth.uid()`.
- Add column-restricted INSERT grant on profiles to `authenticated`
  (id, email, role, display_name, username, bio, avatar_url,
  academic_year, social_links, is_socio). The `role` column is included
  so the client can set a sensible default ('lector'); the
  `set_profile_role()` SECURITY DEFINER function still governs
  privilege escalation to redactor/colaborador/equipo_editorial.

## 3. Changes — Storage
- Create `projects` bucket (public read, owner-scoped write/delete).
- Add storage policies so any authenticated user can upload files to
  a path starting with their own user id, and everyone (anon +
  authenticated) can read them.

## 4. Security
- profiles INSERT is ownership-scoped (auth.uid() = id).
- Storage uploads are ownership-scoped via storage.foldername(name)[1]
  = auth.uid().
- No existing policies are modified or dropped; this is purely additive.
*/

-- ============= profiles INSERT policy + grant =============

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

CREATE POLICY "profiles_insert_self"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

GRANT INSERT (id, email, role, display_name, username, bio, avatar_url, academic_year, social_links, is_socio)
ON public.profiles TO authenticated;

-- ============= projects storage bucket =============

INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "projects_public_read" ON storage.objects;
CREATE POLICY "projects_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "projects_auth_upload" ON storage.objects;
CREATE POLICY "projects_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'projects'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "projects_auth_update" ON storage.objects;
CREATE POLICY "projects_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'projects' AND owner = auth.uid())
WITH CHECK (bucket_id = 'projects');

DROP POLICY IF EXISTS "projects_auth_delete" ON storage.objects;
CREATE POLICY "projects_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'projects' AND owner = auth.uid());
