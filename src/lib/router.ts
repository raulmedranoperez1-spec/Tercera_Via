import { useEffect, useState } from 'react';

export const SECTION_PATHS = ['/', '/escaner', '/impacto', '/apoyo', '/contacto'] as const;
export type SectionPath = (typeof SECTION_PATHS)[number];

export type Route =
  | { kind: 'section'; path: SectionPath }
  | { kind: 'me' }
  | { kind: 'writer'; id: string }
  | { kind: 'article'; id: string }
  | { kind: 'project'; id: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toSectionPath(route: string): SectionPath {
  return (SECTION_PATHS as readonly string[]).includes(route) ? (route as SectionPath) : '/';
}

export function resolveRoute(path: string): Route {
  const [first, second] = path.split('/').filter(Boolean);
  if (first === 'mi-perfil') return { kind: 'me' };
  if (second && UUID_PATTERN.test(second)) {
    if (first === 'escritor') return { kind: 'writer', id: second };
    if (first === 'publicacion') return { kind: 'article', id: second };
    if (first === 'proyecto') return { kind: 'project', id: second };
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
