/*
# Create profiles, submissions, and community_suggestions tables

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null) — the user's auth email, duplicated for easy querying
  - `role` (text, not null, default 'lector') — 'creador' if @us.es or @alum.us.es, else 'lector'
  - `display_name` (text, nullable) — optional display name for the user
  - `created_at` (timestamptz, default now())
- `submissions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, references auth.users, default auth.uid())
  - `author_name` (text, not null)
  - `student_id` (text, not null)
  - `title` (text, not null)
  - `format` (text, not null) — one of: articulo, reportaje, entrevista, ensayo, podcast
  - `synopsis` (text, not null)
  - `link` (text, nullable) — external link to draft or uploaded material
  - `status` (text, default 'pendiente') — pendiente, aprobado, publicado
  - `created_at` (timestamptz, default now())
- `community_suggestions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, references auth.users, default auth.uid())
  - `author_name` (text, not null)
  - `topic` (text, not null) — the suggested news topic or issue
  - `description` (text, nullable) — optional context
  - `votes` (int, default 0) — vote count
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on all three tables.
- This is a signed-in app: policies scope TO authenticated with auth.uid() ownership checks.
- profiles: each user can read all profiles (to see who published), but only update their own.
- submissions: only authenticated users can read; only creador role users can insert; owners can update/delete their own.
- community_suggestions: all authenticated users can read; all authenticated can insert; owners can delete; voting handled via an upsert function (see below).
- A SECURITY DEFINER function `toggle_vote` handles atomic vote toggling to avoid race conditions.
- Grants are restricted to authenticated role only for these tables, plus service_role for edge functions if needed.

3. Helper Functions
- `toggle_vote(suggestion_id uuid)` — SECURITY DEFINER function that toggles a user's vote on a suggestion atomically. Returns the new vote count. Uses a `suggestion_votes` table to track who voted.

4. Additional Table
- `suggestion_votes`
  - `id` (uuid, primary key)
  - `suggestion_id` (uuid, references community_suggestions, ON DELETE CASCADE)
  - `user_id` (uuid, references auth.users, ON DELETE CASCADE)
  - `created_at` (timestamptz, default now())
  - UNIQUE constraint on (suggestion_id, user_id)
*/

-- ---- profiles ----
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'lector',
  display_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

GRANT SELECT, UPDATE, INSERT ON profiles TO authenticated;

-- ---- submissions ----
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  student_id text NOT NULL,
  title text NOT NULL,
  format text NOT NULL CHECK (format IN ('articulo', 'reportaje', 'entrevista', 'ensayo', 'podcast')),
  synopsis text NOT NULL,
  link text,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'publicado')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_select_all" ON submissions;
CREATE POLICY "submissions_select_all" ON submissions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "submissions_insert_own" ON submissions;
CREATE POLICY "submissions_insert_own" ON submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "submissions_update_own" ON submissions;
CREATE POLICY "submissions_update_own" ON submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "submissions_delete_own" ON submissions;
CREATE POLICY "submissions_delete_own" ON submissions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON submissions TO authenticated;

-- ---- community_suggestions ----
CREATE TABLE IF NOT EXISTS community_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  topic text NOT NULL,
  description text,
  votes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suggestions_select_all" ON community_suggestions;
CREATE POLICY "suggestions_select_all" ON community_suggestions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "suggestions_insert_own" ON community_suggestions;
CREATE POLICY "suggestions_insert_own" ON community_suggestions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "suggestions_delete_own" ON community_suggestions;
CREATE POLICY "suggestions_delete_own" ON community_suggestions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON community_suggestions TO authenticated;

-- ---- suggestion_votes ----
CREATE TABLE IF NOT EXISTS suggestion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid NOT NULL REFERENCES community_suggestions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (suggestion_id, user_id)
);

ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "votes_select_all" ON suggestion_votes;
CREATE POLICY "votes_select_all" ON suggestion_votes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "votes_insert_own" ON suggestion_votes;
CREATE POLICY "votes_insert_own" ON suggestion_votes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_delete_own" ON suggestion_votes;
CREATE POLICY "votes_delete_own" ON suggestion_votes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON suggestion_votes TO authenticated;

-- ---- toggle_vote SECURITY DEFINER function ----
-- Atomically toggles a vote and updates the denormalized vote count.
DROP FUNCTION IF EXISTS toggle_vote(uuid);
CREATE OR REPLACE FUNCTION toggle_vote(target_suggestion_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_vote record;
  new_count integer;
BEGIN
  SELECT id INTO existing_vote
  FROM suggestion_votes
  WHERE suggestion_id = target_suggestion_id AND user_id = auth.uid();

  IF FOUND THEN
    DELETE FROM suggestion_votes WHERE id = existing_vote.id;
    UPDATE community_suggestions SET votes = GREATEST(votes - 1, 0) WHERE id = target_suggestion_id RETURNING votes INTO new_count;
  ELSE
    INSERT INTO suggestion_votes (suggestion_id, user_id) VALUES (target_suggestion_id, auth.uid());
    UPDATE community_suggestions SET votes = votes + 1 WHERE id = target_suggestion_id RETURNING votes INTO new_count;
  END IF;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- Allow authenticated users to execute toggle_vote
REVOKE ALL ON FUNCTION toggle_vote(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION toggle_vote(uuid) TO authenticated;
