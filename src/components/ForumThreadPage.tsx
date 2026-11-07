import { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft, Loader2, Inbox, Send, Edit2, Trash2, ShieldAlert,
  Check, X, Clock, MessageSquare, AlertCircle,
} from 'lucide-react';
import {
  fetchThreadById, fetchPostsByThread, createPost, updatePost, deletePost,
  updateThread, deleteThread, moderateWithAI,
  type ForumThreadDetail, type ForumPost,
} from '@/lib/forum';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { forumCategoryHref, forumHref, writerHref, sectionHref } from '@/lib/router';
import { displayName, initials, formatDate } from '@/lib/contentTypes';

interface ForumThreadPageProps {
  threadId: string;
}

const MODERATION_LABELS: Record<string, { label: string; className: string }> = {
  marcado: { label: 'Marcado para revisión', className: 'bg-accent-err/10 text-accent-err' },
  oculto: { label: 'Oculto por moderación', className: 'bg-ink-400/10 text-ink-400' },
  eliminado: { label: 'Eliminado', className: 'bg-ink-400/10 text-ink-400' },
};

export default function ForumThreadPage({ threadId }: ForumThreadPageProps) {
  const { profile, session } = useAuth();
  const { open } = useModal();
  const [thread, setThread] = useState<ForumThreadDetail | null | undefined>(undefined);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editingThread, setEditingThread] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editThreadBody, setEditThreadBody] = useState('');
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditor = profile?.role === 'equipo_editorial';

  const loadData = () => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([fetchThreadById(threadId), fetchPostsByThread(threadId)])
      .then(([t, p]) => {
        if (!active) return;
        if (!t) {
          setThread(null);
          setError('Este tema no existe o ha sido eliminado.');
        } else {
          setThread(t);
          setPosts(p);
        }
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudo cargar el debate. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  };

  useEffect(loadData, [threadId]);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setSubmitError('');
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReply = async (parentId: string | null) => {
    if (!session) {
      open({ kind: 'auth', mode: 'signup' });
      return;
    }
    if (!replyBody.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await createPost({ thread_id: threadId, parent_post_id: parentId, body: replyBody.trim() });
      setReplyBody('');
      setReplyingTo(null);
      showSuccess('Mensaje publicado.');
      loadData();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo publicar el mensaje.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = async (postId: string) => {
    if (!editBody.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await updatePost(postId, editBody.trim());
      setEditingPostId(null);
      showSuccess('Mensaje editado.');
      loadData();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo editar el mensaje.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer.')) return;
    try {
      await deletePost(postId);
      showSuccess('Mensaje eliminado.');
      loadData();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo eliminar el mensaje.');
    }
  };

  const handleEditThread = async () => {
    if (!thread || !editTitle.trim() || !editThreadBody.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await updateThread(thread.id, editTitle.trim(), editThreadBody.trim());
      setEditingThread(false);
      showSuccess('Tema editado.');
      loadData();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo editar el tema.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!thread) return;
    if (!confirm('¿Seguro que quieres eliminar este tema y todos sus mensajes? Esta acción no se puede deshacer.')) return;
    try {
      await deleteThread(thread.id);
      window.location.hash = forumCategoryHref(thread.category_slug);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo eliminar el tema.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error || 'Tema no encontrado.'}</p>
        <a href={forumHref()} className="mt-6 inline-block rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
          Volver al foro
        </a>
      </div>
    );
  }

  const canEditThread = (thread.author_id === profile?.id && thread.moderation_status === 'limpio') || isEditor;
  const canDeleteThread = thread.author_id === profile?.id || isEditor;
  const modInfo = MODERATION_LABELS[thread.moderation_status];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <a href={forumCategoryHref(thread.category_slug)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        {thread.category_name}
      </a>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent-ok/30 bg-accent-ok/10 px-4 py-3 text-sm text-accent-ok animate-fade-in">
          <Check size={16} />
          {successMsg}
        </div>
      )}
      {submitError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent-err/30 bg-accent-err/10 px-4 py-3 text-sm text-accent-err animate-fade-in">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      {/* Thread header */}
      <div className="rounded-2xl border border-paper-400/50 bg-paper-50 p-6 shadow-sm">
        {modInfo && (
          <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${modInfo.className}`}>
            <ShieldAlert size={13} />
            {modInfo.label}
            {thread.moderation_reason && <span className="opacity-70">— {thread.moderation_reason}</span>}
          </div>
        )}

        {editingThread ? (
          <div className="space-y-4">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-paper-400/60 bg-white px-4 py-2.5 font-serif text-xl font-semibold text-ink-800 focus:border-[#704c12] focus:outline-none"
              placeholder="Título del tema"
            />
            <textarea
              value={editThreadBody}
              onChange={(e) => setEditThreadBody(e.target.value)}
              maxLength={5000}
              rows={5}
              className="w-full rounded-lg border border-paper-400/60 bg-white px-4 py-2.5 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
              placeholder="Cuerpo del tema"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditThread}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#704c12] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5d432c] disabled:opacity-50"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Guardar
              </button>
              <button
                onClick={() => setEditingThread(false)}
                className="rounded-lg border border-paper-400/60 px-4 py-2 text-sm text-ink-600 transition-colors hover:bg-paper-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-semibold leading-snug text-ink-800 sm:text-3xl">{thread.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-xs text-ink-400">
              <a href={writerHref(thread.author_id)} className="flex items-center gap-2 hover:text-[#704c12]">
                <div className="h-7 w-7 overflow-hidden rounded-full border border-[#704c12]/15 bg-[#ebdbc6]">
                  {thread.author_avatar ? (
                    <img src={thread.author_avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#5d432c]">
                      {initials(thread.author_name, thread.author_username ?? '?')}
                    </div>
                  )}
                </div>
                <span className="font-medium text-ink-600">{displayName(thread.author_name, thread.author_username ?? 'usuario')}</span>
              </a>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDate(thread.created_at)}
              </span>
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-700 sm:text-base">{thread.body}</div>
            {(canEditThread || canDeleteThread) && (
              <div className="mt-4 flex gap-2 border-t border-paper-400/40 pt-4">
                {canEditThread && (
                  <button
                    onClick={() => {
                      setEditTitle(thread.title);
                      setEditThreadBody(thread.body);
                      setEditingThread(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-paper-200"
                  >
                    <Edit2 size={13} />
                    Editar
                  </button>
                )}
                {canDeleteThread && (
                  <button
                    onClick={handleDeleteThread}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-err/70 transition-colors hover:bg-accent-err/10"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Posts */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-ink-700">
          <MessageSquare size={18} className="text-[#704c12]" />
          {thread.post_count} {thread.post_count === 1 ? 'respuesta' : 'respuestas'}
        </h2>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-12 text-center">
            <Inbox size={32} className="text-ink-300" />
            <p className="text-sm text-ink-400">Nadie ha respondido todavía. ¡Sé el primero!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={profile?.id}
                isEditor={isEditor}
                editing={editingPostId === post.id}
                editBody={editBody}
                onEditStart={() => {
                  setEditingPostId(post.id);
                  setEditBody(post.body);
                }}
                onEditCancel={() => setEditingPostId(null)}
                onEditBody={setEditBody}
                onEditSave={() => handleEditPost(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                onReply={() => {
                  setReplyingTo(post.id);
                  setReplyBody('');
                }}
                submitting={submitting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      {session ? (
        <div className="mt-8 rounded-2xl border border-paper-400/50 bg-paper-50 p-6 shadow-sm">
          <h3 className="mb-3 font-serif text-lg font-semibold text-ink-700">
            {replyingTo ? 'Responder a un mensaje' : 'Tu respuesta'}
          </h3>
          {replyingTo && (
            <button
              onClick={() => setReplyingTo(null)}
              className="mb-2 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-[#704c12]"
            >
              <X size={12} />
              Cancelar respuesta
            </button>
          )}
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Escribe tu mensaje..."
            className="w-full rounded-lg border border-paper-400/60 bg-white px-4 py-2.5 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-400">{replyBody.length}/2000</span>
            <button
              onClick={() => handleReply(replyingTo)}
              disabled={submitting || !replyBody.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c] disabled:opacity-50"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Publicar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-10 text-center">
          <p className="text-sm text-ink-500">Inicia sesión para participar en el debate.</p>
          <button
            onClick={() => open({ kind: 'auth', mode: 'login' })}
            className="rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
          >
            Iniciar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post, currentUserId, isEditor, editing, editBody,
  onEditStart, onEditCancel, onEditBody, onEditSave, onDelete, onReply, submitting,
}: {
  post: ForumPost;
  currentUserId?: string;
  isEditor: boolean;
  editing: boolean;
  editBody: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditBody: (v: string) => void;
  onEditSave: () => void;
  onDelete: () => void;
  onReply: () => void;
  submitting: boolean;
}) {
  const name = displayName(post.author_name, post.author_username ?? 'usuario');
  const canEdit = (post.author_id === currentUserId && post.moderation_status === 'limpio') || isEditor;
  const canDelete = post.author_id === currentUserId || isEditor;
  const modInfo = MODERATION_LABELS[post.moderation_status];
  const edited = post.edited_at !== null;
  const within24h = post.author_id === currentUserId && new Date(post.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div className={`rounded-xl border bg-paper-50 p-5 shadow-sm transition-all ${post.parent_post_id ? 'ml-6 sm:ml-10' : ''} ${post.moderation_status === 'oculto' ? 'border-ink-400/20 opacity-60' : 'border-paper-400/50'}`}>
      <div className="flex items-start gap-3">
        <a href={writerHref(post.author_id)} className="shrink-0">
          <div className="h-9 w-9 overflow-hidden rounded-full border border-[#704c12]/15 bg-[#ebdbc6]">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#5d432c]">
                {initials(post.author_name, post.author_username ?? '?')}
              </div>
            )}
          </div>
        </a>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a href={writerHref(post.author_id)} className="font-medium text-ink-700 hover:text-[#704c12]">{name}</a>
            {post.author_role === 'equipo_editorial' && (
              <span className="rounded-full bg-[#704c12]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5d432c]">Editorial</span>
            )}
            <span className="text-xs text-ink-400">{formatDate(post.created_at)}</span>
            {edited && <span className="text-xs text-ink-400">(editado)</span>}
            {modInfo && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${modInfo.className}`}>
                <ShieldAlert size={10} />
                {modInfo.label}
              </span>
            )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => onEditBody(e.target.value)}
                maxLength={2000}
                rows={3}
                className="w-full rounded-lg border border-paper-400/60 bg-white px-3 py-2 text-sm text-ink-700 focus:border-[#704c12] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={onEditSave}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#704c12] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#5d432c] disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  Guardar
                </button>
                <button
                  onClick={onEditCancel}
                  className="rounded-lg border border-paper-400/60 px-3 py-1.5 text-xs text-ink-600 hover:bg-paper-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{post.body}</div>
          )}

          {!editing && post.moderation_reason && post.moderation_status !== 'limpio' && (
            <p className="mt-2 rounded-md bg-accent-err/5 px-3 py-1.5 text-xs text-accent-err/80">
              Motivo: {post.moderation_reason}
            </p>
          )}

          {!editing && (canEdit || canDelete) && (
            <div className="mt-3 flex gap-2">
              {within24h && canEdit && (
                <button onClick={onEditStart} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-500 hover:bg-paper-200">
                  <Edit2 size={12} /> Editar
                </button>
              )}
              {isEditor && !within24h && canEdit && (
                <button onClick={onEditStart} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-500 hover:bg-paper-200">
                  <Edit2 size={12} /> Editar (editorial)
                </button>
              )}
              {canDelete && (
                <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-accent-err/70 hover:bg-accent-err/10">
                  <Trash2 size={12} /> Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
