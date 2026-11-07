/*
# Sign-up name capture and email notification log

## Plain-English summary
This migration does two things:
1. Updates the `handle_new_user()` trigger so that when a new reader
   registers, their name (entered in the sign-up form) is saved into the
   existing `profiles` table as `display_name`. The reader profile is still
   created automatically exactly as before — only the name is now filled in
   from the sign-up metadata.
2. Creates a new `email_notifications` table that records every real email
   the platform sends (welcome email, password-changed email, future
   notifications), including whether the email provider confirmed delivery
   or returned an error. This is what lets the backend prove an email was
   actually sent rather than pretending.

## 1. Modified function: `handle_new_user()`
- Still inserts a `profiles` row automatically when a new auth user is created.
- Still assigns role `colaborador` for @alum.us.es emails, `lector` otherwise.
- NEW: reads `display_name` from the sign-up metadata
  (`raw_user_meta_data->>'display_name'`) and stores it in `profiles.display_name`.
  When no name is provided the column stays NULL, exactly as before.
- No other column, policy or grant on `profiles` changes.

## 2. New table: `email_notifications`
- `id` (uuid, primary key)
- `user_id` (uuid, nullable, references auth.users) — the recipient's account.
- `type` (text, not null) — kind of notification: `welcome`,
  `password_changed`, etc.
- `recipient_email` (text, not null) — the address the email was sent to.
- `status` (text, not null, default 'pending') — `pending`, `sent` or `error`.
- `provider_message_id` (text, nullable) — id returned by the email provider
  on success, for tracing.
- `error_message` (text, nullable) — provider error text when sending fails.
- `created_at` (timestamptz, default now()).

## 3. Security
- RLS enabled on `email_notifications`.
- `authenticated` users can SELECT only their own rows (user_id = auth.uid()).
- `service_role` has full CRUD (used by the send-email edge function, which
  runs server-side and bypasses RLS but still needs the grant).
- `anon` has no access.

## 4. Important notes
1. The change to `handle_new_user()` is additive: existing profiles are
   untouched. Only future sign-ups are affected, and only when a name is
   supplied during registration.
2. The `email_notifications` table is write-only from the edge function's
   perspective (service_role) and read-only for the user's own rows.
3. All statements are idempotent and safe to re-run.
*/

-- ============= Update handle_new_user to capture display_name =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email ILIKE '%@alum.us.es' THEN 'colaborador'
      ELSE 'lector'
    END,
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- ============= email_notifications table =============
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','error')),
  provider_message_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.email_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_notifications TO service_role;

DROP POLICY IF EXISTS "select_own_email_notifications" ON public.email_notifications;
CREATE POLICY "select_own_email_notifications"
  ON public.email_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS email_notifications_user_idx
  ON public.email_notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS email_notifications_type_status_idx
  ON public.email_notifications (type, status)
  WHERE status = 'sent';
