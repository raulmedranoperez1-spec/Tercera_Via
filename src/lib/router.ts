import { useEffect, useState } from 'react';

export const SECTION_PATHS = ['/', '/escaner', '/impacto', '/apoyo', '/contacto', '/foro'] as const;
export type SectionPath = (typeof SECTION_PATHS)[number];

export type Route =
  | { kind: 'section'; path: SectionPath }
  | { kind: 'me' }
  | { kind: 'writer'; id: string }
  | { kind: 'article'; id: string }
  | { kind: 'project'; id: string }
  | { kind: 'codigo-deontologico' }
  | { kind: 'forum' }
  | { kind: 'forum-category'; slug: string }
  | { kind: 'forum-thread'; id: string }
  | { kind: 'forum-rules' }
  | { kind: 'forum-moderation' }
  | { kind: 'forum-admin' };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toSectionPath(route: string): SectionPath {
  return (SECTION_PATHS as readonly string[]).includes(route) ? (route as SectionPath) : '/';
}

export function resolveRoute(path: string): Route {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { kind: 'section', path: '/' };
  const [first, second, third] = parts;

  if (first === 'mi-perfil') return { kind: 'me' };

  if (first === 'codigo-deontologico') return { kind: 'codigo-deontologico' };

  if (second && UUID_PATTERN.test(second)) {
    if (first === 'escritor') return { kind: 'writer', id: second };
    if (first === 'publicacion') return { kind: 'article', id: second };
    if (first === 'proyecto') return { kind: 'project', id: second };
    if (first === 'foro' && third === 'tema') return { kind: 'forum-thread', id: second };
  }

  if (first === 'foro') {
    if (!second) return { kind: 'forum' };
    if (second === 'normas') return { kind: 'forum-rules' };
    if (second === 'moderacion') return { kind: 'forum-moderation' };
    if (second === 'admin') return { kind: 'forum-admin' };
    if (parts[1] === 'categoria' && parts[2]) return { kind: 'forum-category', slug: parts[2] };
  }

  return { kind: 'section', path: toSectionPath(path) };
}

export function sectionHref(path: SectionPath): string {
  return `#${path}`;
}

export function profileHref(): string {
  return '#/mi-perfil';
}

export function writerHref(id: string): string {
  return `#/escritor/${id}`;
}

export function articleHref(id: string): string {
  return `#/publicacion/${id}`;
}

export function projectHref(id: string): string {
  return `#/proyecto/${id}`;
}

export function codigoDeontologicoHref(): string {
  return '#/codigo-deontologico';
}

export function forumHref(): string {
  return '#/foro';
}

export function forumCategoryHref(slug: string): string {
  return `#/foro/categoria/${slug}`;
}

export function forumThreadHref(id: string): string {
  return `#/foro/${id}/tema`;
}

export function forumRulesHref(): string {
  return '#/foro/normas';
}

export function forumModerationHref(): string {
  return '#/foro/moderacion';
}

export function forumAdminHref(): string {
  return '#/foro/admin';
}

export function navigateTo(path: string): void {
  window.location.hash = path;
}

function readPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function useRoute(): string {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => {
      setPath(readPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}
