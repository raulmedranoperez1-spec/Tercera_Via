/*
# Auto-assign "creador" role to @alum.us.es emails on signup

1. Purpose
- When a new user registers with an email ending in @alum.us.es,
  their profile is automatically created with role "creador" instead
  of the default "lector".
- This grants collaborator privileges (submitting proposals, creative
  pieces, etc.) to verified University of Sevilla students without
  requiring manual admin intervention.

2. Changes
- Replaces the existing `handle_new_user()` trigger function with a
  version that checks the email domain before inserting the profile.
- No tables, columns, or existing rows are modified or deleted.

3. Security
- The function remains SECURITY DEFINER with a fixed search_path.
- Execution remains revoked from PUBLIC, anon, and authenticated
  (it is only called by the auth trigger, not by API clients).
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email ILIKE '%@alum.us.es' THEN 'creador'
      ELSE 'lector'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
