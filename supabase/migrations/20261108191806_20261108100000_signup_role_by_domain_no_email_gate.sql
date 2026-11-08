/*
# Assign role by email domain at sign-up (no domain rejection)

1. Purpose
- Any person can now create an account with any email address.
- Institutional addresses (@us.es and @alum.us.es) receive the role "colaborador",
  which allows publishing work.
- Every other address receives the role "lector".

2. Modified function: handle_new_user()
- Removes the previous rule that rejected non-institutional emails.
- Chooses the role from the email domain (case-insensitive).
- Keeps display_name capture from sign-up metadata.

3. Security
- Function remains SECURITY DEFINER with a fixed search_path.
- Execution remains revoked from PUBLIC, anon and authenticated.
- No table, column, policy or grant changes.

4. Data safety
- No rows are modified or deleted. Only sign-ups created after this migration are affected.

5. Important notes
- The role is derived from the email text at sign-up and is not verified by an email link.
*/

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
      WHEN NEW.email ~* '@(us\.es|alum\.us\.es)$' THEN 'colaborador'
      ELSE 'lector'
    END,
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
