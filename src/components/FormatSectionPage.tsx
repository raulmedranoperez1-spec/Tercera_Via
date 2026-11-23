import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Headphones, Loader2, Newspaper } from 'lucide-react';
import Papa from 'papaparse';
import { findFormat, type FormatSlug } from '@/lib/formats';
import { sectionHref } from '@/lib/router';
import { loadEscanerNews, type EscanerNews } from '@/lib/escanerNews';
import EscanerNewsDetail from '@/components/EscanerNewsDetail';

interface SheetProject {
  titulo: string;
  descripcion: string;
  archivoUrl: string;
  formato: string;
}

const FORMAT_FILTERS = [
  'Todos',
  'Artículos',
  'Ensayos',
  'Entrevistas',
  'Podcasts',
  'Reportajes',
  'Crónicas',
  'Noticias',
] as const;

type FormatFilter = (typeof FORMAT_FILTERS)[number];

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSa6mOIF9UmJwpabYHpwnEoxH_ILuOiIjmyE6BFGKGQW2rc7P3IlUA1uxwkRuH_XhIAYtu5y59lzQ0/pub?output=csv';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toUpperCase();
}

function isPublished(value: string): boolean {
  return normalize(value) === 'SI';
}

const KNOWN_FORMATS = ['Artículos', 'Ensayos', 'Entrevistas', 'Podcasts', 'Reportajes', 'Crónicas', 'Noticias'];

function detectFormato(row: Record<string, string>): string {
  for (const key of Object.keys(row)) {
    const normKey = normalize(key);
    if (normKey.includes('CREATIVA') || normKey.includes('INFORMATIVA')) {
      const val = (row[key] ?? '').trim();
      const normVal = normalize(val);
      const match = KNOWN_FORMATS.find((f) => normalize(f) === normVal);
      if (match) return match;
    }
  }
  for (const key of Object.keys(row)) {
    const val = (row[key] ?? '').trim();
    const normVal = normalize(val);
    const match = KNOWN_FORMATS.find((f) => normalize(f) === normVal);
    if (match) return match;
  }
  return '';
}

async function loadSheetProjects(): Promise<SheetProject[]> {
  const url = `${SHEET_CSV_URL}&t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();

  return new Promise<SheetProject[]>((resolve, reject) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const projects: SheetProject[] = [];
        for (const row of result.data) {
          const publicadoCol = Object.keys(row).find((k) => normalize(k) === 'PUBLICADO');
          if (!publicadoCol || !isPublished(row[publicadoCol] ?? '')) continue;

          const tituloCol = Object.keys(row).find((k) => normalize(k) === 'TITULO DEL PROYECTO');
          const descCol = Object.keys(row).find(
            (k) => normalize(k) === 'DESCRIPCION O RESUMEN' || normalize(k) === 'DESCRIPCION',
          );
          const archivoCol = Object.keys(row).find((k) => normalize(k) === 'SUBIR ARCHIVOS' || normalize(k) === 'ARCHIVOS');

          const titulo = tituloCol ? (row[tituloCol] ?? '').trim() : '';
          if (!titulo) continue;

          projects.push({
            titulo,
            descripcion: descCol ? (row[descCol] ?? '').trim() : '',
            archivoUrl: archivoCol ? (row[archivoCol] ?? '').trim() : '',
            formato: detectFormato(row),
          });
        }
        resolve(projects);
      },
      error: (err) => reject(err),
    });
  });
}

interface FormatSectionPageProps {
  slug: FormatSlug;
}

export default function FormatSectionPage({ slug }: FormatSectionPageProps) {
  const format = findFormat(slug);
  const [sheetProjects, setSheetProjects] = useState<SheetProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sheetFilter, setSheetFilter] = useState<FormatFilter>('Todos');
  const [localNews, setLocalNews] = useState<EscanerNews[]>([]);
  const [openEscaner, setOpenEscaner] = useState<EscanerNews | null>(null);

  useEffect(() => {
    setLocalNews(loadEscanerNews());
    const onStorage = () => setLocalNews(loadEscanerNews());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const initialFilter = (FORMAT_FILTERS.includes(format?.label as FormatFilter) ? format?.label : 'Todos') as FormatFilter;

  useEffect(() => {
    setSheetFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (!format) return;
    let active = true;
    setLoading(true);
    setError('');

    loadSheetProjects()
      .then((projects) => {
        if (!active) return;
        setSheetProjects(projects);
      })
      .catch(() => {
        if (active) setError('No se pudo cargar el contenido. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [format]);

  const filteredSheetProjects = useMemo(() => {
    if (sheetFilter === 'Todos') return sheetProjects;
    return sheetProjects.filter((p) => normalize(p.formato) === normalize(sheetFilter));
  }, [sheetProjects, sheetFilter]);

  const showLocalNews =
    sheetFilter === 'Noticias' || (sheetFilter === 'Todos' && format?.slug === 'noticias');

  if (openEscaner) {
    return <EscanerNewsDetail news={openEscaner} />;
  }

  if (!format) return null;

  const total = filteredSheetProjects.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Section header */}
      <header className="border-b border-paper-400/50 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a87945]">La Tercera Vía</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-earth-900 sm:text-5xl">{format.label}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500">{format.description}</p>
      </header>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {FORMAT_FILTERS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSheetFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              sheetFilter === tab
                ? 'bg-[#704c12] text-white'
                : 'border border-paper-400 bg-paper-50 text-ink-600 hover:border-[#704c12]/40 hover:text-[#704c12]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#704c12]" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-ink-500">{error}</p>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-paper-400/50 bg-paper-50 px-6 py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#704c12]/10">
            <Newspaper size={28} className="text-[#704c12]" />
          </div>
          <p className="font-serif text-xl text-ink-700">Próximamente habrá nuevos contenidos</p>
          <p className="max-w-md text-sm leading-relaxed text-ink-500">
            Todavía no hay {format.label.toLowerCase()} publicados en esta sección. Vuelve pronto para descubrir las nuevas publicaciones.
          </p>
          <a href={sectionHref('/')} className="mt-2 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
            Volver al inicio
          </a>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showLocalNews &&
            localNews.map((news) => (
              <button
                key={news.id}
                onClick={() => setOpenEscaner(news)}
                className="group flex flex-col overflow-hidden rounded-xl border border-paper-400/50 bg-paper-50 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-earth-800 to-earth-900">
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-serif text-3xl text-paper-100/60">{news.titulo.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-2 inline-flex w-fit items-center rounded-full bg-earth-800/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-earth-800">
                    Noticias · Escáner de Marcos
                  </span>
                  <h3 className="font-serif text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-[#704c12]">
                    {news.titulo}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-500">
                    Marco 1: {news.marco1.titular || '—'} · Marco 2: {news.marco2.titular || '—'}
                  </p>
                </div>
              </button>
            ))}
          {filteredSheetProjects.map((project, idx) => {
            const isPodcastCard = normalize(project.formato) === 'PODCASTS' || normalize(project.formato) === 'PODCAST';
            return (
              <article key={idx} className="group flex flex-col overflow-hidden rounded-xl border border-paper-400/50 bg-paper-50 shadow-sm transition-all hover:shadow-md">
                <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-paper-300 to-paper-400">
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-serif text-3xl text-[#704c12]/30">{project.titulo?.charAt(0)?.toUpperCase() ?? 'A'}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {project.formato && (
                    <span className="mb-2 inline-flex w-fit items-center rounded-full bg-[#704c12]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#704c12]">
                      {project.formato}
                    </span>
                  )}
                  <h3 className="font-serif text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-[#704c12]">
                    {project.titulo}
                  </h3>
                  {project.descripcion && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
                      {project.descripcion}
                    </p>
                  )}
                  {project.archivoUrl ? (
                    <a
                      href={project.archivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#704c12] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
                    >
                      {isPodcastCard ? <Headphones size={15} /> : <ExternalLink size={15} />}
                      {isPodcastCard ? 'Escuchar podcast' : 'Ver documento'}
                    </a>
                  ) : (
                    <span className="mt-auto text-xs text-ink-400">Sin documento</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
