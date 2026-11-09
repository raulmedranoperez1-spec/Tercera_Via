import { useEffect, useState } from 'react';
import { Loader2, Pencil, FileText, FolderOpen, Mic, ArrowLeft, Inbox } from 'lucide-react';
import {
  fetchWriterProfile,
  fetchWriterArticles,
  fetchWriterProjects,
  fetchWriterPodcasts,
  type WriterProfile,
  type ArticleSummary,
  type ProjectSummary,
  type PodcastSummary,
} from '@/lib/writers';
import { displayName, initials, type ContentTab } from '@/lib/contentTypes';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { sectionHref, writerHref } from '@/lib/router';
import ArticleCard from '@/components/ArticleCard';
import ProjectCard from '@/components/ProjectCard';
import PodcastCard from '@/components/PodcastCard';
import PodcastPlayer from '@/components/PodcastPlayer';

interface WriterProfilePageProps {
  writerId: string;
}

const TABS: { key: ContentTab; label: string; icon: typeof FileText }[] = [
  { key: 'noticias', label: 'Noticias', icon: FileText },
  { key: 'proyectos', label: 'Proyectos', icon: FolderOpen },
  { key: 'podcasts', label: 'Podcasts', icon: Mic },
];

export default function WriterProfilePage({ writerId }: WriterProfilePageProps) {
  const { profile: ownProfile, session } = useAuth();
  const { open } = useModal();
  const [writer, setWriter] = useState<WriterProfile | null | undefined>(undefined);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastSummary[]>([]);
  const [activeTab, setActiveTab] = useState<ContentTab>('noticias');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingPodcast, setPlayingPodcast] = useState<PodcastSummary | null>(null);

  const isOwnProfile = session?.user?.id === writerId;
  const canEdit =
    isOwnProfile && (ownProfile?.role === 'redactor' || ownProfile?.role === 'colaborador' || ownProfile?.role === 'equipo_editorial');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      fetchWriterProfile(writerId),
      fetchWriterArticles(writerId),
      fetchWriterProjects(writerId),
      fetchWriterPodcasts(writerId),
    ])
      .then(([w, a, p, po]) => {
        if (!active) return;
        if (!w) {
          setWriter(null);
          setError('No se encontró este perfil.');
        } else {
          setWriter(w);
          setArticles(a);
          setProjects(p);
          setPodcasts(po);
        }
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudo cargar el perfil. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [writerId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error || !writer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error || 'Perfil no encontrado.'}</p>
        <a href={sectionHref('/')} className="mt-6 inline-block rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
          Volver al inicio
        </a>
      </div>
    );
  }

  const name = displayName(writer.display_name, writer.username ?? 'escritor');
  const counts = { noticias: articles.length, proyectos: projects.length, podcasts: podcasts.length };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Back link */}
      <a href={sectionHref('/')} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        Volver
      </a>

      {/* Profile header */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-paper-400/50 bg-paper-50 p-6 shadow-sm sm:flex-row sm:items-start sm:p-8">
        <div className="relative shrink-0">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#704c12]/15 bg-[#ebdbc6] sm:h-32 sm:w-32">
            {writer.avatar_url ? (
              <img src={writer.avatar_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-semibold text-[#5d432c]">
                {initials(writer.display_name, writer.username ?? '?')}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl font-semibold text-ink-800 sm:text-4xl">{name}</h1>
            {writer.role === 'redactor' && (
              <span className="rounded-full bg-[#704c12]/10 px-3 py-1 text-xs font-semibold text-[#5d432c]">
                Redactor
              </span>
            )}
            {writer.role === 'colaborador' && (
              <span className="rounded-full bg-[#704c12]/10 px-3 py-1 text-xs font-semibold text-[#5d432c]">
                Escritor
              </span>
            )}
            {writer.role === 'equipo_editorial' && (
              <span className="rounded-full bg-[#704c12]/10 px-3 py-1 text-xs font-semibold text-[#5d432c]">
                Equipo editorial
              </span>
            )}
          </div>
          {writer.username && (
            <p className="mt-1 text-sm text-ink-400">@{writer.username}</p>
          )}
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600 sm:text-base">
            {writer.bio || 'Este escritor aún no ha añadido una descripción.'}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-ink-400">
            <span>Miembro desde {new Date(writer.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-3">
              <span className="font-medium text-ink-600">{counts.noticias}</span> noticias
              <span className="font-medium text-ink-600">{counts.proyectos}</span> proyectos
              <span className="font-medium text-ink-600">{counts.podcasts}</span> podcasts
            </span>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => open({ kind: 'edit-profile' })}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
            >
              <Pencil size={15} />
              Editar perfil
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-paper-400/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
                active ? 'text-[#704c12]' : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              <Icon size={17} />
              {tab.label}
              <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${active ? 'bg-[#704c12]/10 text-[#704c12]' : 'bg-paper-300 text-ink-400'}`}>
                {counts[tab.key]}
              </span>
              {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#704c12]" />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'noticias' && (
          <ContentGrid
            items={articles}
            emptyTitle="Sin noticias todavía"
            emptyMessage={canEdit ? 'Cuando publiques una noticia, aparecerá aquí.' : 'Este escritor aún no ha publicado noticias.'}
            renderItem={(a) => <ArticleCard article={a} />}
          />
        )}
        {activeTab === 'proyectos' && (
          <ContentGrid
            items={projects}
            emptyTitle="Sin proyectos todavía"
            emptyMessage={canEdit ? 'Cuando subas un proyecto, aparecerá aquí.' : 'Este escritor aún no ha subido proyectos.'}
            renderItem={(p) => <ProjectCard project={p} />}
          />
        )}
        {activeTab === 'podcasts' && (
          <ContentGrid
            items={podcasts}
            emptyTitle="Sin podcasts todavía"
            emptyMessage={canEdit ? 'Cuando publiques un podcast, aparecerá aquí.' : 'Este escritor aún no ha publicado podcasts.'}
            renderItem={(p) => <PodcastCard podcast={p} onPlay={setPlayingPodcast} />}
          />
        )}
      </div>

      {playingPodcast && (
        <PodcastPlayer podcast={playingPodcast} onClose={() => setPlayingPodcast(null)} />
      )}
    </div>
  );
}

function ContentGrid<T>({
  items,
  emptyTitle,
  emptyMessage,
  renderItem,
}: {
  items: T[];
  emptyTitle: string;
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-16 text-center">
        <Inbox size={40} className="text-ink-300" />
        <h3 className="font-serif text-xl text-ink-600">{emptyTitle}</h3>
        <p className="max-w-sm text-sm text-ink-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => renderItem(item))}
    </div>
  );
}
