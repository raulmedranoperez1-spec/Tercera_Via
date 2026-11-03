/*
# Create contact messages table

1. New Tables
- `contact_messages`
- `id` (uuid): unique message identifier.
- `name` (text): visitor's name.
- `email` (text): visitor's reply address.
- `message` (text): visitor's contact message.
- `created_at` (timestamptz): submission timestamp.

2. Security
- Enable Row Level Security on `contact_messages`.
- Allow anonymous and signed-in visitors to submit messages.
- Do not grant read access to visitors, keeping submitted messages private.

3. Important Notes
- The table is intentionally write-only from the public website.
- Administrative message review can be added later through a protected server-side workflow.
*/

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.contact_messages TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 120
    AND length(trim(email)) BETWEEN 3 AND 320
    AND length(trim(message)) BETWEEN 1 AND 5000
  );