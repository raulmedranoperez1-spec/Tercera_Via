/*
# Normalize user roles to lector / colaborador / equipo_editorial

1. What changes
- Institutional accounts (emails ending in @alum.us.es) get the role "colaborador", which is what allows them to submit work.
- Everyone else keeps the role "lector".
- The old internal names are renamed: "creador" becomes "colaborador", and "editor" and "admin" become "equipo_editorial".

2. Modified objects
- profiles: existing rows with the old role names are renamed.
- handle_new_user(): new sign-ups get the role from their email domain.
- set_profile_role(): accepts only the three current roles and is gated on equipo_editorial.

3. Security
- No table, policy or grant changes. Only role values and two functions are replaced.
- set_profile_role keeps its check that the caller is already on the editorial team.
*/

UPDATE public.profiles SET role = 'colaborador' WHERE role = 'creador';
UPDATE public.profiles SET role = 'equipo_editorial' WHERE role IN ('editor', 'admin');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email ILIKE '%@alum.us.es' THEN 'colaborador'
      ELSE 'lector'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_profile_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'equipo_editorial'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF new_role NOT IN ('lector', 'colaborador', 'equipo_editorial') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;
END;
$function$;
