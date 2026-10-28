/*
# Create handle_new_user trigger to auto-create profiles on signup

1. Changes
- Create a SECURITY DEFINER function `handle_new_user()` that inserts a row into `profiles` when a new user signs up.
- The role is determined by the email domain: @us.es or @alum.us.es → 'creador', otherwise 'lector'.
- Attach the function as an AFTER INSERT trigger on `auth.users`.

2. Security
- The function runs with SECURITY DEFINER (as the postgres/superuser) so it can insert into `profiles` regardless of the caller's RLS context during the signup flow.
- search_path is pinned to `public` to prevent injection.
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
      WHEN NEW.email ~* '@(alum\.)?us\.es$' THEN 'creador'
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
