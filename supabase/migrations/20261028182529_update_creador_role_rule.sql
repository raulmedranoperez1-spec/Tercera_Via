/*
# Update handle_new_user trigger: only @alum.us.es gets creador role

1. Changes
- Update the handle_new_user() function so that only emails ending in @alum.us.es
  are assigned the 'creador' role. Emails ending in @us.es (staff) or any other
  domain now get 'lector'.
- The trigger is dropped and recreated to pick up the new function body.

2. Security
- Function remains SECURITY DEFINER with pinned search_path.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email ~* '@alum\.us\.es$' THEN 'creador'
      ELSE 'lector'
    END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
