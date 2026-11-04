import { useEffect, useState } from 'react';

export const SECTION_PATHS = ['/', '/escaner', '/impacto', '/apoyo', '/contacto'] as const;
export type SectionPath = (typeof SECTION_PATHS)[number];

export function toSectionPath(route: string): SectionPath {
  return (SECTION_PATHS as readonly string[]).includes(route) ? (route as SectionPath) : '/';
}

export function sectionHref(path: SectionPath): string {
  return `#${path}`;
}

export function navigateTo(path: SectionPath): void {
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
