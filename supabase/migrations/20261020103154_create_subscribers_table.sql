/*
# Create newsletter subscribers table

1. New Tables
- `subscribers`
  - `id` (uuid, primary key, auto-generated)
  - `email` (text, unique, not null) — subscriber email address
  - `source` (text, default 'hero') — where the subscription originated
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `subscribers`.
- This is a no-auth newsletter app: the frontend uses the anon key.
- Allow anon + authenticated to INSERT new subscribers (anyone can subscribe).
- Allow anon + authenticated to SELECT only to check if an email already exists.
- No UPDATE or DELETE from the frontend.

3. Notes
- Email validation is handled in the frontend before insertion.
- The unique constraint on email prevents duplicate subscriptions.
*/

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'hero',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_subscribers" ON subscribers;
CREATE POLICY "anon_insert_subscribers" ON subscribers FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_subscribers" ON subscribers;
CREATE POLICY "anon_select_subscribers" ON subscribers FOR SELECT
TO anon, authenticated USING (true);
