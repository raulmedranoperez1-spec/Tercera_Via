/*
# Editorial style-audit agent: RAG store and private admin

1. New Tables
- `agent_settings`: key/value store. Holds the editable system prompt of the style-audit agent (key `style_audit_prompt`).
- `agent_documents`: one row per uploaded Libro de estilo file (PDF or DOCX) with processing status (`procesando`, `listo`, `error`) and error message.
- `agent_document_chunks`: text fragments of each document, with a generated Spanish full-text search vector. Chunks are stored in the database, so they persist across restarts and deployments.
- `admin_accounts`: the shared administrator account (username, salted PBKDF2 hash, flag that forces a password change).
- `admin_sessions`: server-side admin sessions (hashed token, expiry). Sessions are validated in the database on every request.

2. New Function
- `search_style_chunks(query_text, match_count)`: returns the most relevant fragments of ready documents for a query. Always returns up to `match_count` fragments, ordered by relevance and then by document order, so the agent receives rules even when no keyword matches.

3. Security
- Row level security is enabled on every new table with no policies. Browsers (anon and authenticated roles) cannot read or write any of them.
- Only the `service_role` key, used inside Edge Functions, is granted access.
- `search_style_chunks` is executable only by `service_role`.

4. Important notes
- The initial administrator account is created by the admin Edge Function on first login, not in this migration, so no password is stored in SQL.
- Re-running this migration is safe: all statements are idempotent.
*/

CREATE TABLE IF NOT EXISTS public.agent_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'procesando' CHECK (status IN ('procesando', 'listo', 'error')),
  error_message text,
  chunk_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.agent_documents(id) ON DELETE CASCADE,
  position integer NOT NULL,
  content text NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('spanish'::regconfig, content)) STORED
);

CREATE INDEX IF NOT EXISTS agent_document_chunks_document_idx ON public.agent_document_chunks (document_id, position);
CREATE INDEX IF NOT EXISTS agent_document_chunks_search_idx ON public.agent_document_chunks USING GIN (search_vector);

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  username text PRIMARY KEY,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token_hash text PRIMARY KEY,
  username text NOT NULL REFERENCES public.admin_accounts(username) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON public.admin_sessions (expires_at);

ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.agent_settings, public.agent_documents, public.agent_document_chunks, public.admin_accounts, public.admin_sessions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_settings, public.agent_documents, public.agent_document_chunks, public.admin_accounts, public.admin_sessions TO service_role;

CREATE OR REPLACE FUNCTION public.search_style_chunks(query_text text, match_count integer DEFAULT 15)
RETURNS TABLE (content text, document_name text, relevance real)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT c.content, d.file_name, ts_rank(c.search_vector, q)
  FROM public.agent_document_chunks c
  JOIN public.agent_documents d ON d.id = c.document_id
  CROSS JOIN websearch_to_tsquery('spanish'::regconfig, query_text) AS q
  WHERE d.status = 'listo'
  ORDER BY (c.search_vector @@ q) DESC, ts_rank(c.search_vector, q) DESC, d.created_at, c.position
  LIMIT match_count;
$$;

REVOKE EXECUTE ON FUNCTION public.search_style_chunks(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_style_chunks(text, integer) TO service_role;

INSERT INTO public.agent_settings (key, value)
VALUES ('style_audit_prompt', $prompt$ROL: Eres el Asistente de Control de Calidad y Verificación Editorial de 'La Tercera Vía'. Tu especialidad es revisar textos periodísticos para que cumplan el Libro de Estilo de la publicación.

OBJETIVO: Revisar el borrador que recibes y detectar los fragmentos que incumplen el Libro de Estilo, indicando una corrección concreta para cada uno.

CONTEXTO: Trabajas para el equipo editorial de La Tercera Vía, un proyecto de periodismo universitario desadjetivado. Tu referencia es únicamente el Libro de Estilo que se te proporciona como fragmentos junto al borrador. Los redactores son estudiantes y tu revisión es una herramienta de verificación interna.

INSTRUCCIONES:
1. Lee con atención los fragmentos del Libro de Estilo proporcionados.
2. Lee el borrador completo.
3. Contrasta cada frase con los criterios del Libro de Estilo, con especial atención al sesgo ideológico y político: marcos polarizantes, adjetivos de carga subjetiva, falta de fuentes o de contraste, y falta de paridad en temas controvertidos.
4. Anota cada incumplimiento y propón una corrección concreta.

FORMATO: Devuelve un listado con viñetas, una viñeta por incumplimiento, con este formato: [Fragmento detectado]: explicación breve del incumplimiento y corrección propuesta. No añadas introducciones ni despedidas.
Si el texto cumple, responde solo con esta frase exacta: El texto cumple estrictamente con los criterios del Libro de Estilo. Aprobado para publicación.

RESTRICCIONES:
- No uses emojis.
- No uses tecnicismos.
- No pidas datos personales, bancarios ni contraseñas, ni los solicites al autor.
- Sé breve, preciso y claro.
- No inventes reglas, criterios ni directrices que no figuren explícitamente en el Libro de Estilo proporcionado.
- Si los fragmentos no bastan para evaluar un punto, indícalo en lugar de suponer.$prompt$)
ON CONFLICT (key) DO NOTHING;
