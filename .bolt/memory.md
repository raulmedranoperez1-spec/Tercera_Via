# Project memory

## Product intent & audience

- Project is a web application built with Vite + React (JSX), Tailwind CSS, and Lucide React icons.
- User references specific design styles/versions by name (e.g., "Xenia"), implying an iterative visual refinement workflow where the user requests named aesthetic directions.
- Audience and full product scope not yet defined; currently focused on header/visual styling iterations.

## Brand personality & voice

- User communicates in Spanish; responses should match that language.
- Design references suggest preference for sober, editorial, high-impact aesthetics.

## Visual design & UX direction

- "Xenia version" applied to header: black background, sober/editorial appearance, strong editorial presence.
- Internal header elements (menu items, structure) preserved during visual restyle — user values keeping functionality intact while changing aesthetics.
- User prefers targeted visual changes over full rewrites; only requested aspect should be modified.

## Decisions, constraints & rationale

- Per `.bolt/prompt`: beautiful, non-cookie-cutter designs suitable for production; no extra UI packages unless necessary; Lucide React for icons; `@/` path alias maps to `src/`.
- Scope of changes is controlled — modify only what user explicitly requests ("el encabezado" / header).
- Rationale: preserve existing functionality while applying visual refinement to specific components.

## Open questions & assumptions

- Full product scope, page structure, and content beyond header remain unknown.
- "Xenia" reference context (full design system vs. just header treatment) is unclear — assumed to be a visual style direction, not a complete theme.
- Whether other components/pages should eventually adopt the Xenia style is undecided.
- No defined color palette, typography, or spacing system beyond "black background, sober/editorial" for header.