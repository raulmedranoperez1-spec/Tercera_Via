import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Send, Trash2 } from 'lucide-react';
import {
  PROPOSAL_MAX_LENGTH,
  authorName,
  createProposalComment,
  deleteProposalComment,
  fetchProposalComments,
  formatDateTime,
  type ProposalComment,
} from '@/lib/proposals';
import { initials } from '@/lib/contentTypes';

interface ProposalCommentsProps {
  proposalId: string;
  currentUserId: string;
  canModerate: boolean;
  onCountChange: (delta: number) => void;
}

export default function ProposalComments({ proposalId, currentUserId, canModerate, onCountChange }: ProposalCommentsProps) {
  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const trimmed = draft.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= PROPOSAL_MAX_LENGTH && !posting;

  useEffect(() => {
    let active = true;
    fetchProposalComments(proposalId)
      .then((rows) => {
        if (active) setComments(rows);
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los comentarios.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [proposalId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSend) return;
    setPosting(true);
    setError('');
    try {
      await createProposalComment(proposalId, trimmed);
      const rows = await fetchProposalComments(proposalId);
      setComments(rows);
      setDraft('');
      onCountChange(1);
    } catch {
      setError('No se pudo publicar el comentario. Inténtalo de nuevo.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (comment: ProposalComment) => {
    setError('');
    try {
      await deleteProposalComment(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      onCountChange(-1);
    } catch {
      setError('No se pudo eliminar el comentario.');
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl bg-paper-100/70 p-4">
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 size={20} className="animate-spin text-[#704c12]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-400">Todavía no hay comentarios. Sé el primero en responder.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const name = authorName(comment.author);
            const canDelete = comment.author_id === currentUserId || canModerate;
            return (
              <li key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ebdbc6] text-[11px] font-semibold text-[#5d432c]">
                  {initials(comment.author.display_name, comment.author.username ?? '?')}
                </div>
                <div className="min-w-0 flex-1 rounded-lg bg-white px-3.5 py-2.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm">
                      <span className="font-medium text-ink-800">{name}</span>
                      <span className="ml-2 text-xs text-ink-400">{formatDateTime(comment.created_at)}</span>
                    </p>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment)}
                        aria-label="Eliminar comentario"
                        className="rounded p-1 text-ink-300 transition-colors hover:text-accent-err"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-ink-600">{comment.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label htmlFor={`comment-${proposalId}`} className="sr-only">
          Escribe un comentario
        </label>
        <textarea
          id={`comment-${proposalId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          maxLength={PROPOSAL_MAX_LENGTH}
          placeholder="Escribe un comentario…"
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-paper-400/60 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 focus:border-[#704c12]/50 focus:outline-none focus:ring-4 focus:ring-[#704c12]/10"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar comentario"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#704c12] text-white transition-all hover:bg-[#5d432c] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
      {error && <p className="text-sm text-accent-err">{error}</p>}
    </div>
  );
}
