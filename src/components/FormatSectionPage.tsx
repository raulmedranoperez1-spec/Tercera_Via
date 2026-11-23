import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, ExternalLink, Headphones, Loader2, MicOff, Newspaper } from 'lucide-react';
import Papa from 'papaparse';
import { findFormat, type FormatSlug } from '@/lib/formats';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import PodcastCard from '@/components/PodcastCard';
import ContentGate from '@/components/ContentGate';
import type { ArticleSummary, PodcastSummary } from '@/lib/writers';
import { sectionHref } from '@/lib/router';

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
  const norm = normalize(value);
  return norm === 'SI';
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
          const formatoCol = Object.keys(row).find((k) => normalize(k) === 'FORMATO');

          const titulo = tituloCol ? (row[tituloCol] ?? '').trim() : '';
          if (!titulo) continue;

          projects.push({
            titulo,
            descripcion: descCol ? (row[descCol] ?? '').trim() : '',
            archivoUrl: archivoCol ? (row[archivoCol] ?? '').trim() : '',
            formato: formatoCol ? (row[formatoCol] ?? '').trim() : '',
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

type SortOrder = 'recent' | 'oldest' | 'title';

const SORT_LABELS: Record<SortOrder, string> = {
  recent: 'Más recientes',
  oldest: 'Más antiguos',
  title: 'Título (A-Z)',
};

export default function FormatSectionPage({ slug }: FormatSectionPageProps) {
  const format = findFormat(slug);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastSummary[]>([]);
  const [sheetProjects, setSheetProjects] = useState<SheetProject[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOrder>('recent');
  const [playingPodcast, setPlayingPodcast] = useState<PodcastSummary | null>(null);
  const [sheetFilter, setSheetFilter] = useState<FormatFilter>('Todos');

  const isSheetDriven = format?.slug === 'articulos';

  useEffect(() => {
    if (!format) return;
    let active = true;
    setLoading(true);
    setError('');

    const load = async () => {
      try {
        if (isSheetDriven) {
          const projects = await loadSheetProjects();
          if (!active) return;
          setSheetProjects(projects);
          setLoading(false);
          return;
        }

        if (format.dbValue === 'podcast') {
          const { data, error: err } = await supabase
            .from('podcasts_public')
            .select('id, author_id, title, description, cover_image_url, audio_url, duration_seconds, published_at')
            .order('published_at', { ascending: false });
          if (err) throw err;
          if (!active) return;
          setPodcasts((data ?? []) as PodcastSummary[]);
        } else {
          const { data, error: err } = await supabase
            .from('articles_public')
            .select('id, author_id, title, excerpt, cover_image_url, format, published_at, likes, saves')
            .eq('format', format.dbValue)
            .order('published_at', { ascending: false });
          if (err) throw err;
          if (!active) return;
          setArticles((data ?? []) as ArticleSummary[]);
        }
      } catch {
        if (active) setError('No se pudo cargar el contenido. Inténtalo de nuevo.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [format]);

  const authorIds = useMemo(
    () => [...new Set([...articles, ...podcasts].map((item) => item.author_id))],
    [articles, podcasts],
  );

  useEffect(() => {
    if (authorIds.length === 0) return;
    let active = true;
    supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', authorIds)
      .then(({ data }) => {
        if (!active || !data) return;
        const map: Record<string, string> = {};
        for (const row of data as { id: string; display_name: string | null; username: string | null }[]) {
          map[row.id] = row.display_name || row.username || 'Autor';
        }
        setAuthors(map);
      });
    return () => {
      active = false;
    };
  }, [authorIds]);

  const sortedArticles = useMemo(() => sortItems(articles, sort), [articles, sort]);
  const sortedPodcasts = useMemo(() => sortItems(podcasts, sort), [podcasts, sort]);

  if (!format) return null;

  const isPodcast = format.dbValue === 'podcast';
  const items: { id: string; title: string; author: string; date: string }[] = isPodcast
    ? sortedPodcasts.map((p) => ({ id: p.id, title: p.title, author: authors[p.author_id] ?? 'Autor', date: p.published_at }))
    : sortedArticles.map((a) => ({ id: a.id, title: a.title, author: authors[a.author_id] ?? 'Autor', date: a.published_at }));

  const filteredSheetProjects = useMemo(() => {
    if (sheetFilter === 'Todos') return sheetProjects;
    return sheetProjects.filter((p) => normalize(p.formato) === normalize(sheetFilter));
  }, [sheetProjects, sheetFilter]);

  const total = isSheetDriven ? filteredSheetProjects.length : isPodcast ? sortedPodcasts.length : sortedArticles.length;

  const gateTier = isPodcast ? 'subscribe' : 'login';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Section header */}
      <header className="border-b border-paper-400/50 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a87945]">La Tercera Vía</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-earth-900 sm:text-5xl">{format.label}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500">{format.description}</p>
        {!isPodcast && !isSheetDriven && (
          <p className="mt-3 text-xs uppercase tracking-wider text-ink-400">
            Acceso con registro gratuito · {format.label}
          </p>
        )}
      </header>

      {/* Toolbar */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-end gap-2">
          <label htmlFor="sort" className="flex items-center gap-1.5 text-xs text-ink-400">
            <ArrowUpDown size={14} />
            Ordenar
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="rounded-lg border border-paper-400 bg-paper-50 px-3 py-1.5 text-sm text-ink-700 outline-none focus:border-[#704c12]"
          >
            {(Object.keys(SORT_LABELS) as SortOrder[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </div>
      )}

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
            {isPodcast ? <MicOff size={28} className="text-[#704c12]" /> : <Newspaper size={28} className="text-[#704c12]" />}
          </div>
          <p className="font-serif text-xl text-ink-700">Próximamente habrá nuevos contenidos</p>
          <p className="max-w-md text-sm leading-relaxed text-ink-500">
            Todavía no hay {format.label.toLowerCase()} publicados en esta sección. Vuelve pronto para descubrir las nuevas publicaciones.
          </p>
          <a href={sectionHref('/')} className="mt-2 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
            Volver al inicio
          </a>
        </div>
      ) : isSheetDriven ? (
        <>
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
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </>
      ) : isPodcast ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPodcasts.map((podcast) => (
            <div key={podcast.id} className="flex flex-col gap-1">
              <PodcastCard podcast={podcast} onPlay={setPlayingPodcast} />
              <span className="px-1 text-xs text-ink-400">Por {authors[podcast.author_id] ?? 'Autor'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {playingPodcast && <PodcastGate podcast={playingPodcast} onClose={() => setPlayingPodcast(null)} />}
    </div>
  );
}

function PodcastGate({ podcast, onClose }: { podcast: PodcastSummary; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <ContentGate tier="subscribe" formatLabel="Podcast" blurb={`Para escuchar «${podcast.title}» necesitas una suscripción activa.`} />
        <button onClick={onClose} className="mx-auto mt-4 block rounded-lg border border-white/30 px-5 py-2 text-sm text-white/90 transition-colors hover:bg-white/10">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function sortItems<T extends { title: string; published_at: string }>(items: T[], sort: SortOrder): T[] {
  const copy = [...items];
  if (sort === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  const asc = sort === 'oldest';
  return copy.sort((a, b) => (asc ? 1 : -1) * (new Date(a.published_at).getTime() - new Date(b.published_at).getTime()));
}
