# Project memory

## Product intent & audience

- Platform where users publish/submit their own projects (creative works/portfolio-style).
- UI is in Spanish.

## Brand personality & voice

- Practical, user-first; avoids blocking users behind non-essential backend checks.
- Error handling favors silent degradation + developer-facing diagnostics over hard stops.

## Visual design & UX direction

- Vite + React + JSX, Tailwind CSS, lucide-react icons, `@/` path alias.
- Modals used for key flows (e.g. project submission).

## Decisions, constraints & rationale

- Auth/backend via Supabase: `profiles` table, `session.user.id` / `session.user.email` for author identity.
- SubmitWorkModal no longer requires a `profiles` row to open; if `session.user` exists, the form opens directly.
- On publish, `profiles` upsert runs in background (`try/catch`); failure does not block project save.
- All Supabase/network errors logged via `console.error` with exact detail for debugging.
- Rationale: `profiles` query failures were preventing access to the submission flow; session data is sufficient for author identity.

## Open questions & assumptions

- Assumes `session.user.email` is reliable as author email; if OAuth providers omit email, may need fallback.
- `profiles` schema/fields for upsert not yet documented; confirm required columns.