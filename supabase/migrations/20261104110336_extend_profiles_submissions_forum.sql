/*
# Institutional roles, member flag, public showcase and members forum

## Plain-English summary
Extends the existing accounts and submissions tables so that:
- Institutional emails (@alum.us.es and @us.es) become student creators automatically.
- Members ("socios") can be marked on their profile and can use a members-only forum chat.
- Only creators can submit work, and the public can see works that were approved or published.
- A demo switch lets evaluators toggle between reader and creator modes and membership.

## 1. Modified tables
- `profiles`: new column `is_socio` (boolean, default false). Users cannot write it directly.
- `submissions`: existing table kept as-is. Adds a public read policy for approved and published works, and tightens the insert policy so only creators can submit.

## 2. New table
- `forum_messages`: chat messages written by members. Columns: id, user_id, author_name (set automatically from the profile), body (1 to 1000 characters), created_at.

## 3. Functions
- `handle_new_user` (existing trigger function): also recognises @us.es as institutional.
- `demo_set_profile(p_role, p_socio)`: demo-only switch between 'lector' and 'creador' and the member flag. Accounts with admin or editor roles keep their role.
- `set_forum_author`: trigger that stamps every forum message with the caller's id and display name.

## 4. Security
- RLS stays enabled on every table.
- submissions insert: only authenticated users whose profile role is 'creador' can insert, and only for themselves, in 'pendiente' status.
- submissions public select: anon and authenticated can read rows with status 'aprobado' or 'publicado'.
- forum_messages: only members (is_socio = true) can read or post, and posts are always attributed to the caller.
- Trigger and helper functions are not callable by anon.

## Notes
1. Statements are idempotent so the migration can be re-run safely.
2. Existing data is not modified or removed.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_socio boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
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
      WHEN NEW.email ~* '@(alum\.us|us)\.es$' THEN 'creador'
      ELSE 'lector'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.demo_set_profile(p_role text, p_socio boolean)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticación requerida';
  END IF;
  IF p_role NOT IN ('lector', 'creador') THEN
    RAISE EXCEPTION 'Rol no válido';
  END IF;
  UPDATE public.profiles
  SET
    role = CASE WHEN role IN ('lector', 'creador') THEN p_role ELSE role END,
    is_socio = p_socio
  WHERE id = auth.uid()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.demo_set_profile(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.demo_set_profile(text, boolean) TO authenticated;

DROP POLICY IF EXISTS "submissions_insert_own" ON submissions;
CREATE POLICY "submissions_insert_own" ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND status = 'pendiente'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'creador'
    )
  );

GRANT SELECT ON submissions TO anon;

DROP POLICY IF EXISTS "public_select_published_submissions" ON submissions;
CREATE POLICY "public_select_published_submissions" ON submissions FOR SELECT
  TO anon, authenticated
  USING (status IN ('aprobado', 'publicado'));

CREATE TABLE IF NOT EXISTS forum_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Socio',
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS forum_messages_created_idx ON forum_messages (created_at);

CREATE OR REPLACE FUNCTION public.set_forum_author()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.user_id := auth.uid();
  SELECT COALESCE(NULLIF(p.display_name, ''), split_part(p.email, '@', 1))
  INTO NEW.author_name
  FROM profiles p
  WHERE p.id = auth.uid();
  NEW.author_name := COALESCE(NEW.author_name, 'Socio');
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_forum_author() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS forum_messages_set_author ON forum_messages;
CREATE TRIGGER forum_messages_set_author
  BEFORE INSERT ON forum_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_forum_author();

ALTER TABLE forum_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON forum_messages TO authenticated;

DROP POLICY IF EXISTS "member_select_forum" ON forum_messages;
CREATE POLICY "member_select_forum" ON forum_messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.is_socio));

DROP POLICY IF EXISTS "member_insert_forum" ON forum_messages;
CREATE POLICY "member_insert_forum" ON forum_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.is_socio)
  );
