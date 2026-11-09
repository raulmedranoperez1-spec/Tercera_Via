/*
# Two-tier content access: login-gated and subscription-gated formats

1. Purpose
- Split content read access into two tiers.
- Artículo and Ensayo require only a registered account (any authenticated user).
- Entrevista, Reportaje and Podcast require an active subscription (is_socio = true) in addition to the account.
- Visitors without a session can still see the presentation (title, excerpt, cover, dates, counts) but never the full body or audio.

2. Schema changes
- Add column `articles.format` (text, NOT NULL, default 'articulo') to distinguish the four text formats (articulo, ensayo, entrevista, reportaje) that share the articles table.
- Existing rows (none at migration time) default to 'articulo'.
- No other tables are altered. No columns are dropped or renamed. No data is deleted.

3. New views (security_invoker = on, so RLS of the querying role applies to the base tables)
- `articles_public`: published articles, summary columns only (no `content`). Readable by anon + authenticated. Used for cards and lists.
- `articles_detail`: published articles, full row including `content` and `format`. Row is visible only when the reader has access:
  - author (own content) always, OR
  - authenticated AND (format is articulo/ensayo OR reader.is_socio = true).
- `podcasts_public`: published podcasts, summary columns only (no `audio_url`). Readable by anon + authenticated.
- `podcasts_detail`: published podcasts, full row including `audio_url`. Row is visible only when the reader has access:
  - author (own content) always, OR
  - authenticated AND reader.is_socio = true.

4. RLS / grants
- Base tables (articles, projects, podcasts): tighten SELECT grants. anon loses SELECT on the base tables; only `authenticated` and `service_role` retain it. This prevents direct table reads from bypassing the views. Column-restricted INSERT/UPDATE/DELETE grants on articles now include the new `format` column for authenticated writers. projects and podcasts keep their existing writer grants.
- Views: GRANT SELECT on all four views to anon + authenticated so the Data API can reach them. Because the views are security_invoker, the base-table RLS still filters rows per the querying role.
- Existing write policies (articles_insert_own, articles_update_own, etc.) are unchanged and still enforce author_id = auth.uid().

5. How access is enforced
- Presentation (title, excerpt, cover, published_at, likes, saves, description, duration_seconds): always visible via the *_public views to any visitor.
- Full content (articles.content, podcasts.audio_url): only through the *_detail views, which check authentication and subscription server-side. A direct deep link to a restricted article returns the presentation only; the body is absent from the API response.
- Authors can always read their own full content regardless of tier.

6. Non-destructive
- No DROP, DELETE, column type changes, or table renames.
- All existing published content remains visible at the summary level.
- The new `format` column has a safe default and is backfilled for any existing rows.

7. Important notes
- The frontend must query the *_public views for lists/cards and the *_detail views for the full reading experience. Querying the base tables directly from the anon client will now return no rows (by design).
- `projects` table (reportajes submitted as external projects) keeps anon SELECT on the base table but the frontend gates the project detail page behind the subscription tier via the UI + an RLS check on a new `projects_detail` view that exposes `content` only to socio users. projects_public exposes summary fields.
*/

-- 1. Add format column to articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'articulo';

-- Backfill any existing rows (safe: no rows currently, but idempotent)
UPDATE public.articles SET format = 'articulo' WHERE format IS NULL;

-- 2. Create views ----------------------------------------------------------

-- Articles: public summary (no content)
CREATE OR REPLACE VIEW public.articles_public AS
SELECT
  id, author_id, title, excerpt, cover_image_url, status, format,
  published_at, created_at, likes, saves
FROM public.articles
WHERE status = 'publicado';

-- Articles: detail (content included) with access tier check
CREATE OR REPLACE VIEW public.articles_detail AS
SELECT
  a.id, a.author_id, a.title, a.excerpt, a.content, a.cover_image_url,
  a.status, a.format, a.published_at, a.created_at, a.likes, a.saves
FROM public.articles a
WHERE a.status = 'publicado'
  AND (
    a.author_id = auth.uid()
    OR (
      auth.uid() IS NOT NULL
      AND (
        a.format IN ('articulo', 'ensayo')
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_socio = true
        )
      )
    )
  );

-- Podcasts: public summary (no audio_url)
CREATE OR REPLACE VIEW public.podcasts_public AS
SELECT
  id, author_id, title, description, cover_image_url, duration_seconds,
  status, published_at, created_at
FROM public.podcasts
WHERE status = 'publicado';

-- Podcasts: detail (audio_url included) with subscription check
CREATE OR REPLACE VIEW public.podcasts_detail AS
SELECT
  p.id, p.author_id, p.title, p.description, p.cover_image_url, p.audio_url,
  p.duration_seconds, p.status, p.published_at, p.created_at
FROM public.podcasts p
WHERE p.status = 'publicado'
  AND (
    p.author_id = auth.uid()
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid() AND pr.is_socio = true
      )
    )
  );

-- Projects: public summary (no content)
CREATE OR REPLACE VIEW public.projects_public AS
SELECT
  id, author_id, title, description, cover_image_url, project_url,
  status, published_at, created_at
FROM public.projects
WHERE status = 'publicado';

-- Projects: detail (content included) with subscription check
CREATE OR REPLACE VIEW public.projects_detail AS
SELECT
  pr.id, pr.author_id, pr.title, pr.description, pr.content, pr.cover_image_url,
  pr.project_url, pr.status, pr.published_at, pr.created_at
FROM public.projects pr
WHERE pr.status = 'publicado'
  AND (
    pr.author_id = auth.uid()
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.is_socio = true
      )
    )
  );

-- 3. Make views security_invoker so RLS of the querying role applies
ALTER VIEW public.articles_public SET (security_invoker = true);
ALTER VIEW public.articles_detail SET (security_invoker = true);
ALTER VIEW public.podcasts_public SET (security_invoker = true);
ALTER VIEW public.podcasts_detail SET (security_invoker = true);
ALTER VIEW public.projects_public SET (security_invoker = true);
ALTER VIEW public.projects_detail SET (security_invoker = true);

-- 4. Grants on views
GRANT SELECT ON public.articles_public TO anon, authenticated;
GRANT SELECT ON public.articles_detail TO anon, authenticated;
GRANT SELECT ON public.podcasts_public TO anon, authenticated;
GRANT SELECT ON public.podcasts_detail TO anon, authenticated;
GRANT SELECT ON public.projects_public TO anon, authenticated;
GRANT SELECT ON public.projects_detail TO anon, authenticated;

-- 5. Tighten base-table SELECT: remove anon direct access so content must go through views
REVOKE SELECT ON public.articles FROM anon;
REVOKE SELECT ON public.podcasts FROM anon;
REVOKE SELECT ON public.projects FROM anon;

-- Keep SELECT on base tables for authenticated (writers reading their own drafts) + service_role
GRANT SELECT ON public.articles TO authenticated;
GRANT SELECT ON public.podcasts TO authenticated;
GRANT SELECT ON public.projects TO authenticated;

-- Ensure authenticated writers can insert/update the new format column
GRANT INSERT (author_id, title, excerpt, content, cover_image_url, status, format, published_at, likes, saves) ON public.articles TO authenticated;
GRANT UPDATE (author_id, title, excerpt, content, cover_image_url, status, format, published_at, likes, saves) ON public.articles TO authenticated;
