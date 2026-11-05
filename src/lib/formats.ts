export const FORMATS = [
  {
    slug: 'articulos',
    label: 'Artículos',
    dbValue: 'articulo',
    description: 'Piezas de análisis y noticias contrastadas, escritas por estudiantes.',
  },
  {
    slug: 'ensayos',
    label: 'Ensayos',
    dbValue: 'ensayo',
    description: 'Reflexiones argumentadas sobre los temas que marcan la actualidad.',
  },
  {
    slug: 'entrevistas',
    label: 'Entrevistas',
    dbValue: 'entrevista',
    description: 'Conversaciones en profundidad con personas que construyen la actualidad.',
  },
  {
    slug: 'podcasts',
    label: 'Podcasts',
    dbValue: 'podcast',
    description: 'Audio de análisis, debate y crónica para escuchar en cualquier momento.',
  },
  {
    slug: 'reportajes',
    label: 'Reportajes',
    dbValue: 'reportaje',
    description: 'Investigaciones y piezas de largo recorrido sobre asuntos de interés público.',
  },
] as const;

export type FormatDef = (typeof FORMATS)[number];
export type FormatSlug = FormatDef['slug'];

export const TRACK_OPTIONS = [
  { value: 'contraste', label: 'Contraste de marcos' },
  { value: 'creativo', label: 'Creativo' },
] as const;

export type Track = (typeof TRACK_OPTIONS)[number]['value'];

export function findFormat(slug: string): FormatDef | undefined {
  return FORMATS.find((format) => format.slug === slug);
}

export function trackLabel(value: string): string {
  return TRACK_OPTIONS.find((track) => track.value === value)?.label ?? value;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mmss = `${String(minutes).padStart(hours ? 2 : 1, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours ? `${hours}:${mmss}` : mmss;
}
