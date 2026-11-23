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
- Modal "Publica tu proyecto" has a cream background (`bg-amber-50` or similar warm tone).
- Embedded Tally iframe: 100% width, fixed 622px height, no borders, no scrollbars; `transparentBackground=1`, `alignLeft=1`, `hideTitle=1`, `dynamicHeight=1`.

## Decisions, constraints & rationale

- Auth/backend via Supabase: `profiles` table, `session.user.id` / `session.user.email` for author identity.
- Project submission migrated from custom form + Supabase calls to an embedded Tally iframe (`https://tally.so/embed/aO2K2B?...`); all Supabase calls/validation removed from SubmitWorkModal.
- Rationale: external form provider simplifies submission flow and removes front-end backend dependencies.

## Open questions & assumptions

- `profiles` schema/fields for upsert not yet documented; confirm required columns if other features need it.
- Whether Tally form responses need to sync back to Supabase or a separate data store for project display.