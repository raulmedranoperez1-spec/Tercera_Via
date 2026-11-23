import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Loader2, MicOff, Newspaper } from 'lucide-react';
import { findFormat, type FormatSlug } from '@/lib/formats';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import PodcastCard from '@/components/PodcastCard';
import ContentGate from '@/components/ContentGate';
import type { ArticleSummary, PodcastSummary } from '@/lib/writers';
import { sectionHref } from '@/lib/router';

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
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOrder>('recent');
  const [playingPodcast, setPlayingPodcast] = useState<PodcastSummary | null>(null);

  useEffect(() => {
    if (!format) return;
    let active = true;
    setLoading(true);
    setError('');

    const load = async () => {
      try {
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

  const total = isPodcast ? sortedPodcasts.length : sortedArticles.length;

  const gateTier = isPodcast ? 'subscribe' : 'login';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Section header */}
      <header className="border-b border-paper-400/50 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a87945]">La Tercera Vía</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-earth-900 sm:text-5xl">{format.label}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500">{format.description}</p>
        {!isPodcast && (
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
