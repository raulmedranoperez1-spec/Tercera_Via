import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Inbox, Plus, MessageSquare, Clock, ShieldAlert } from 'lucide-react';
import { fetchCategoryBySlug, fetchThreadsByCategory, type ForumCategory, type ForumThreadSummary } from '@/lib/forum';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { forumHref, forumThreadHref, sectionHref, writerHref } from '@/lib/router';
import { displayName, initials, formatDate } from '@/lib/contentTypes';

interface ForumCategoryPageProps {
  slug: string;
}

export default function ForumCategoryPage({ slug }: ForumCategoryPageProps) {
  const { session } = useAuth();
  const { open } = useModal();
  const [category, setCategory] = useState<ForumCategory | null | undefined>(undefined);
  const [threads, setThreads] = useState<ForumThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([fetchCategoryBySlug(slug), fetchThreadsByCategory(slug)])
      .then(async ([cat]) => {
        if (!active) return;
        if (!cat) {
          setCategory(null);
          setError('Esta categoría no existe.');
          return;
        }
        setCategory(cat);
        const thr = await fetchThreadsByCategory(cat.id);
        if (!active) return;
        setThreads(thr);
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudo cargar la categoría. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error || 'Categoría no encontrada.'}</p>
        <a href={forumHref()} className="mt-6 inline-block rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
          Volver al foro
        </a>
      </div>
    );
  }

  const requireAuth = () => {
    if (!session) {
      open({ kind: 'auth', mode: 'signup' });
      return true;
    }
    return false;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <a href={forumHref()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        Foro
      </a>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-800 sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">{category.description}</p>
          )}
        </div>
        {session && (
          <NewThreadButton categoryId={category.id} categoryName={category.name} />
        )}
      </div>

      {!session && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-paper-400/50 bg-paper-50 p-4">
          <p className="text-sm text-ink-500">Inicia sesión para crear temas y participar.</p>
          <button
            onClick={() => requireAuth()}
            className="rounded-lg bg-[#704c12] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
          >
            Entrar
          </button>
        </div>
      )}

      <div className="mt-6">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-16 text-center">
            <Inbox size={40} className="text-ink-300" />
            <h3 className="font-serif text-xl text-ink-600">Sin temas todavía</h3>
            <p className="max-w-sm text-sm text-ink-400">
              {session ? 'Sé el primero en abrir un debate en esta categoría.' : 'Cuando se creen temas, aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadRow({ thread }: { thread: ForumThreadSummary }) {
  const name = displayName(thread.author_name, thread.author_username ?? 'usuario');
  const flagged = thread.moderation_status !== 'limpio';

  return (
    <a
      href={forumThreadHref(thread.id)}
      className="group flex items-start gap-4 rounded-xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm transition-all hover:border-[#704c12]/30 hover:shadow-md"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#704c12]/15 bg-[#ebdbc6]">
        {thread.author_avatar ? (
          <img src={thread.author_avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#5d432c]">
            {initials(thread.author_name, thread.author_username ?? '?')}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-[#704c12]">
            {thread.title}
          </h3>
          {flagged && (
            <ShieldAlert size={16} className="shrink-0 text-accent-err/70" />
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-ink-500">{thread.body}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-ink-400">
          <a
            href={writerHref(thread.author_id)}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-ink-500 hover:text-[#704c12]"
          >
            {name}
          </a>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(thread.last_activity_at)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {thread.post_count} {thread.post_count === 1 ? 'respuesta' : 'respuestas'}
          </span>
        </div>
      </div>
      <ArrowRight size={18} className="mt-2 shrink-0 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-[#704c12]" />
    </a>
  );
}

function NewThreadButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  const { open } = useModal();
  return (
    <button
      onClick={() => open({ kind: 'forum-new-thread', categoryId, categoryName })}
      className="inline-flex items-center gap-2 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
    >
      <Plus size={16} />
      Nuevo tema
    </button>
  );
}
