/*
# Institutional-only signup, always-lector default, domain validation

## 1. Purpose
- Restricts registration to official University of Sevilla email domains:
  @us.es and @alum.us.es. Any other domain (Gmail, Outlook, Yahoo, etc.)
  is rejected at the database level.
- All new users are assigned the role "lector" regardless of email domain.
  The editorial team promotes users to "colaborador" manually.
- Preserves display_name capture from sign-up metadata.

## 2. Modified function: handle_new_user()
- Validates that NEW.email ends with @us.es or @alum.us.es (case-insensitive).
- If the domain is NOT institutional, the function RAISES an exception,
  which aborts the auth.users INSERT and prevents account creation.
- If the domain IS institutional, inserts a profiles row with role = 'lector'
  and display_name from raw_user_meta_data.
- No existing profiles are modified.

## 3. Security
- handle_new_user() remains SECURITY DEFINER with fixed search_path.
- Execution remains revoked from PUBLIC, anon, and authenticated.
- No table, column, policy, or grant changes.

## 4. Data safety
- No tables, columns, or rows are deleted or modified.
- Existing users with non-institutional emails remain in the database;
  only FUTURE sign-ups are affected.
- The existing trigger on_auth_user_created continues to call this function.

## 5. Important notes
1. This is a server-side enforcement: even if the frontend is bypassed,
   the trigger will reject non-institutional emails.
2. Supabase Auth will still create the auth.users row before the trigger
   runs, but the trigger exception will cause the transaction to roll back.
3. The domain list (@us.es, @alum.us.es) is based on official Universidad
   de Sevilla documentation (SIC-US, OSI-US).
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.email !~* '@(us\.es|alum\.us\.es)$' THEN
    RAISE EXCEPTION 'Solo se permiten correos institucionales de la Universidad de Sevilla (@us.es o @alum.us.es).';
  END IF;

  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    'lector',
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
