/*
# Fix auth role assignment, add profile fields, fix profile UPDATE grant, update submissions policy

1. Purpose
- Change the automatic role for institutional emails from 'colaborador' to 'redactor' (Redactor / Alumno FCOM).
- Add academic_year and social_links columns to profiles for redactores.
- Grant UPDATE on profiles to authenticated (currently missing — EditProfileModal can't save).
- Update the submissions INSERT policy to accept both 'redactor' and 'colaborador' roles.
- Backfill existing 'colaborador' profiles to 'redactor' so they keep publishing access.

2. Modified function: handle_new_user()
- Institutional emails (@us.es, @alum.us.es) → 'redactor' (was 'colaborador').
- All other emails → 'lector' (unchanged).

3. New columns on profiles
- academic_year (text, nullable) — curso académico / grado.
- social_links (jsonb, default '[]') — array of {platform, url}.

4. Security changes
- GRANT UPDATE ON profiles TO authenticated (fixes the profile save bug).
- Drop and recreate the submissions INSERT policy to accept 'redactor' OR 'colaborador'.
- handle_new_user stays SECURITY DEFINER, search_path fixed, execution revoked from PUBLIC/anon/authenticated.

5. Data safety
- No rows deleted. No columns dropped or renamed.
- Existing 'colaborador' profiles are updated to 'redactor' (a role rename, not data loss).
- academic_year and social_links are nullable, so existing profiles are unaffected.
*/

-- 1. Update handle_new_user to assign 'redactor' instead of 'colaborador'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email ~* '@(us\.es|alum\.us\.es)$' THEN 'redactor'
      ELSE 'lector'
    END,
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Backfill existing colaborador profiles to redactor
UPDATE public.profiles SET role = 'redactor' WHERE role = 'colaborador';

-- 3. Add academic_year and social_links columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS academic_year text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN social_links jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 4. Grant UPDATE on profiles to authenticated (was missing — EditProfileModal couldn't save)
GRANT UPDATE (display_name, bio, avatar_url, username, academic_year, social_links) ON public.profiles TO authenticated;

-- 5. Update submissions INSERT policy to accept redactor OR colaborador
DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
CREATE POLICY "submissions_insert_own"
ON public.submissions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pendiente'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('redactor', 'colaborador')
  )
);
