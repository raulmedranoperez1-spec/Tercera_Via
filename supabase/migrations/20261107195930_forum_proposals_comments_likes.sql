/*
# Forum proposals wall: proposals, comments, and likes

## Overview
Adds a participative wall at the top of the forum where signed-in users publish
proposals, ideas, and suggestions aimed at content creators. Other signed-in
users can comment on them and press "Me gusta".

## 1. New Tables
### forum_proposals
- `id` (uuid, PK)
- `author_id` (uuid, defaults to the signed-in user, references profiles)
- `body` (text, 1-1000 chars after trimming)
- `like_count` (int, maintained by trigger)
- `comment_count` (int, maintained by trigger)
- `created_at` (timestamptz, default now())

### forum_proposal_comments
- `id` (uuid, PK)
- `proposal_id` (uuid, references forum_proposals, cascade delete)
- `author_id` (uuid, defaults to the signed-in user, references profiles)
- `body` (text, 1-1000 chars after trimming)
- `created_at` (timestamptz, default now())

### forum_proposal_likes
- `proposal_id` (uuid, references forum_proposals, cascade delete)
- `user_id` (uuid, defaults to the signed-in user, references profiles)
- `created_at` (timestamptz, default now())
- Primary key (proposal_id, user_id) so each user likes a proposal once

## 2. Security
- RLS enabled on all three tables.
- Access is limited to signed-in users (role `authenticated`). Anonymous visitors cannot read the wall.
- Everyone signed in can read proposals, comments, and likes.
- Users can create proposals, comments, and likes only in their own name.
- Users can delete their own proposals, comments, and likes. Editors can delete any proposal or comment for moderation.
- Like and comment counters are updated by triggers that run with elevated rights, so users cannot edit counters directly.

## 3. Important Notes
1. Proposals are ordered newest first by the app.
2. Deleting a proposal also removes its comments and likes.
3. Indexes support the newest-first listing and per-proposal comment lookups.
*/

CREATE TABLE IF NOT EXISTS public.forum_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_proposal_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.forum_proposals(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_proposal_likes (
  proposal_id uuid NOT NULL REFERENCES public.forum_proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (proposal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_proposals_created
  ON public.forum_proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_proposal_comments_proposal
  ON public.forum_proposal_comments (proposal_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_proposal_comments_author
  ON public.forum_proposal_comments (author_id);
CREATE INDEX IF NOT EXISTS idx_forum_proposal_likes_user
  ON public.forum_proposal_likes (user_id);

ALTER TABLE public.forum_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_proposal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_proposal_likes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.forum_proposals TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.forum_proposal_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.forum_proposal_likes TO authenticated;

DROP POLICY IF EXISTS "proposals_select_signed_in" ON public.forum_proposals;
CREATE POLICY "proposals_select_signed_in"
  ON public.forum_proposals FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "proposals_insert_own" ON public.forum_proposals;
CREATE POLICY "proposals_insert_own"
  ON public.forum_proposals FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "proposals_delete_own_or_editor" ON public.forum_proposals;
CREATE POLICY "proposals_delete_own_or_editor"
  ON public.forum_proposals FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR private.is_editor_or_admin());

DROP POLICY IF EXISTS "proposal_comments_select_signed_in" ON public.forum_proposal_comments;
CREATE POLICY "proposal_comments_select_signed_in"
  ON public.forum_proposal_comments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "proposal_comments_insert_own" ON public.forum_proposal_comments;
CREATE POLICY "proposal_comments_insert_own"
  ON public.forum_proposal_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "proposal_comments_delete_own_or_editor" ON public.forum_proposal_comments;
CREATE POLICY "proposal_comments_delete_own_or_editor"
  ON public.forum_proposal_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR private.is_editor_or_admin());

DROP POLICY IF EXISTS "proposal_likes_select_signed_in" ON public.forum_proposal_likes;
CREATE POLICY "proposal_likes_select_signed_in"
  ON public.forum_proposal_likes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "proposal_likes_insert_own" ON public.forum_proposal_likes;
CREATE POLICY "proposal_likes_insert_own"
  ON public.forum_proposal_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "proposal_likes_delete_own" ON public.forum_proposal_likes;
CREATE POLICY "proposal_likes_delete_own"
  ON public.forum_proposal_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.forum_proposal_counts_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME = 'forum_proposal_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.forum_proposals SET like_count = like_count + 1 WHERE id = NEW.proposal_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.forum_proposals SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.proposal_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'forum_proposal_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.forum_proposals SET comment_count = comment_count + 1 WHERE id = NEW.proposal_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.forum_proposals SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.proposal_id;
      RETURN OLD;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.forum_proposal_counts_sync() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_forum_proposal_likes_count ON public.forum_proposal_likes;
CREATE TRIGGER trg_forum_proposal_likes_count
  AFTER INSERT OR DELETE ON public.forum_proposal_likes
  FOR EACH ROW EXECUTE FUNCTION public.forum_proposal_counts_sync();

DROP TRIGGER IF EXISTS trg_forum_proposal_comments_count ON public.forum_proposal_comments;
CREATE TRIGGER trg_forum_proposal_comments_count
  AFTER INSERT OR DELETE ON public.forum_proposal_comments
  FOR EACH ROW EXECUTE FUNCTION public.forum_proposal_counts_sync();
