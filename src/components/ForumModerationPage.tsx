import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Loader2, Inbox, ShieldAlert, Check, Eye, EyeOff, Trash2,
  MessageSquare, FileText, AlertCircle,
} from 'lucide-react';
import {
  fetchFlaggedThreads, fetchFlaggedPosts, moderateThread, moderatePost,
  type ForumThreadSummary, type ForumPost,
} from '@/lib/forum';
import { useAuth } from '@/lib/authContext';
import { forumHref, forumThreadHref, writerHref } from '@/lib/router';
import { displayName, formatDate } from '@/lib/contentTypes';

type Tab = 'threads' | 'posts';

export default function ForumModerationPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('threads');
  const [threads, setThreads] = useState<ForumThreadSummary[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const isEditor = profile?.role === 'equipo_editorial';

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([fetchFlaggedThreads(), fetchFlaggedPosts()])
      .then(([t, p]) => {
        if (!active) return;
        setThreads(t);
        setPosts(p);
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudo cargar la bandeja de moderación.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(load, [load]);

  const handleAction = async (
    type: 'thread' | 'post',
    id: string,
    action: 'limpio' | 'oculto' | 'eliminado',
  ) => {
    setBusy(`${type}-${id}-${action}`);
    setActionError('');
    try {
      if (type === 'thread') {
        await moderateThread(id, action, action === 'limpio' ? null : undefined);
      } else {
        await moderatePost(id, action, action === 'limpio' ? null : undefined);
      }
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo aplicar la acción.');
    } finally {
      setBusy(null);
    }
  };

  if (!isEditor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShieldAlert size={40} className="mx-auto text-ink-300" />
        <p className="mt-4 text-lg text-ink-600">No tienes permiso para acceder a la moderación.</p>
        <a href={forumHref()} className="mt-6 inline-block rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
          Volver al foro
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white">
          Reintentar
        </button>
      </div>
    );
  }

  const flaggedCount = threads.length + posts.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <a href={forumHref()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        Foro
      </a>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-err/10">
          <ShieldAlert size={24} className="text-accent-err" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-800">Bandeja de moderación</h1>
          <p className="mt-1 text-sm text-ink-500">{flaggedCount} {flaggedCount === 1 ? 'contenido marcado' : 'contenidos marcados'} para revisión.</p>
        </div>
      </div>

      {actionError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent-err/30 bg-accent-err/10 px-4 py-3 text-sm text-accent-err">
          <AlertCircle size={16} />
          {actionError}
        </div>
      )}

      {flaggedCount === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-16 text-center">
          <Inbox size={40} className="text-ink-300" />
          <h3 className="font-serif text-xl text-ink-600">Sin contenidos marcados</h3>
          <p className="max-w-sm text-sm text-ink-400">No hay nada que revisar. La IA y el equipo editorial están al día.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex border-b border-paper-400/50">
            <TabButton active={tab === 'threads'} onClick={() => setTab('threads')} icon={FileText} label="Temas" count={threads.length} />
            <TabButton active={tab === 'posts'} onClick={() => setTab('posts')} icon={MessageSquare} label="Mensajes" count={posts.length} />
          </div>

          <div className="mt-6 space-y-4">
            {tab === 'threads' && threads.map((t) => (
              <FlaggedThreadRow
                key={t.id}
                thread={t}
                busy={busy}
                onAction={(action) => handleAction('thread', t.id, action)}
              />
            ))}
            {tab === 'posts' && posts.map((p) => (
              <FlaggedPostRow
                key={p.id}
                post={p}
                busy={busy}
                onAction={(action) => handleAction('post', p.id, action)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
        active ? 'text-[#704c12]' : 'text-ink-400 hover:text-ink-600'
      }`}
    >
      <Icon size={17} />
      {label}
      <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-[#704c12]/10 text-[#704c12]' : 'bg-paper-300 text-ink-400'}`}>
        {count}
      </span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#704c12]" />}
    </button>
  );
}

function ActionButtons({ id, status, busy, onAction }: {
  id: string;
  status: string;
  busy: string | null;
  onAction: (action: 'limpio' | 'oculto' | 'eliminado') => void;
}) {
  const isBusy = (action: string) => busy === `${id}-${action}`;
  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'limpio' && (
        <button
          onClick={() => onAction('limpio')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent-ok/40 px-3 py-1.5 text-xs font-medium text-accent-ok transition-colors hover:bg-accent-ok/10 disabled:opacity-50"
        >
          {isBusy('limpio') ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Restaurar
        </button>
      )}
      {status !== 'oculto' && (
        <button
          onClick={() => onAction('oculto')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-400/40 px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-400/10 disabled:opacity-50"
        >
          {isBusy('oculto') ? <Loader2 size={13} className="animate-spin" /> : <EyeOff size={13} />}
          Ocultar
        </button>
      )}
      {status !== 'eliminado' && (
        <button
          onClick={() => onAction('eliminado')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent-err/40 px-3 py-1.5 text-xs font-medium text-accent-err transition-colors hover:bg-accent-err/10 disabled:opacity-50"
        >
          {isBusy('eliminado') ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          Eliminar
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { marcado: 'Marcado', oculto: 'Oculto', eliminado: 'Eliminado' };
  const colors: Record<string, string> = {
    marcado: 'bg-accent-err/10 text-accent-err',
    oculto: 'bg-ink-400/10 text-ink-400',
    eliminado: 'bg-ink-400/10 text-ink-400',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[status] ?? ''}`}>{labels[status] ?? status}</span>;
}

function FlaggedThreadRow({ thread, busy, onAction }: {
  thread: ForumThreadSummary;
  busy: string | null;
  onAction: (action: 'limpio' | 'oculto' | 'eliminado') => void;
}) {
  const name = displayName(thread.author_name, thread.author_username ?? 'usuario');
  return (
    <div className="rounded-xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a href={forumThreadHref(thread.id)} className="font-serif text-lg font-semibold text-ink-800 hover:text-[#704c12]">
              {thread.title}
            </a>
            <StatusBadge status={thread.moderation_status} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink-500">{thread.body}</p>
          {thread.moderation_reason && (
            <p className="mt-2 text-xs text-accent-err/80">Motivo: {thread.moderation_reason}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-ink-400">
            <a href={writerHref(thread.author_id)} className="font-medium text-ink-500 hover:text-[#704c12]">{name}</a>
            <span>{formatDate(thread.created_at)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-paper-400/40 pt-4">
        <ActionButtons id={`thread-${thread.id}`} status={thread.moderation_status} busy={busy} onAction={onAction} />
      </div>
    </div>
  );
}

function FlaggedPostRow({ post, busy, onAction }: {
  post: ForumPost;
  busy: string | null;
  onAction: (action: 'limpio' | 'oculto' | 'eliminado') => void;
}) {
  const name = displayName(post.author_name, post.author_username ?? 'usuario');
  return (
    <div className="rounded-xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <a href={writerHref(post.author_id)} className="font-medium text-ink-700 hover:text-[#704c12]">{name}</a>
        <StatusBadge status={post.moderation_status} />
        <span className="text-xs text-ink-400">{formatDate(post.created_at)}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{post.body}</p>
      {post.moderation_reason && (
        <p className="mt-2 text-xs text-accent-err/80">Motivo: {post.moderation_reason}</p>
      )}
      <div className="mt-4 border-t border-paper-400/40 pt-4">
        <ActionButtons id={`post-${post.id}`} status={post.moderation_status} busy={busy} onAction={onAction} />
      </div>
    </div>
  );
}
