import { useState } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { authorName, formatDateTime, type Proposal } from '@/lib/proposals';
import { initials } from '@/lib/contentTypes';
import { writerHref } from '@/lib/router';
import ProposalComments from '@/components/forum/ProposalComments';

interface ProposalCardProps {
  proposal: Proposal;
  currentUserId: string;
  canDelete: boolean;
  onToggleLike: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
  onCommentCountChange: (proposalId: string, delta: number) => void;
}

export default function ProposalCard({
  proposal,
  currentUserId,
  canDelete,
  onToggleLike,
  onDelete,
  onCommentCountChange,
}: ProposalCardProps) {
  const [showComments, setShowComments] = useState(false);
  const name = authorName(proposal.author);
  const isOwn = proposal.author_id === currentUserId;

  return (
    <article className="rounded-2xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <header className="flex items-start gap-3">
        <a
          href={writerHref(proposal.author_id)}
          className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#704c12]/15 bg-[#ebdbc6]"
          aria-label={`Perfil de ${name}`}
        >
          {proposal.author.avatar_url ? (
            <img src={proposal.author.avatar_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#5d432c]">
              {initials(proposal.author.display_name, proposal.author.username ?? '?')}
            </span>
          )}
        </a>
        <div className="min-w-0 flex-1">
          <a href={writerHref(proposal.author_id)} className="font-medium text-ink-800 hover:text-[#704c12]">
            {name}
          </a>
          <p className="text-xs text-ink-400">{formatDateTime(proposal.created_at)}</p>
        </div>
        {(isOwn || canDelete) && (
          <button
            onClick={() => onDelete(proposal)}
            aria-label="Eliminar propuesta"
            className="rounded-lg p-2 text-ink-300 transition-colors hover:bg-accent-err/10 hover:text-accent-err"
          >
            <Trash2 size={16} />
          </button>
        )}
      </header>

      <p className="mt-4 whitespace-pre-line break-words text-base leading-relaxed text-ink-700">{proposal.body}</p>

      <footer className="mt-5 flex items-center gap-2 border-t border-paper-400/40 pt-4">
        <button
          onClick={() => onToggleLike(proposal)}
          aria-pressed={proposal.liked_by_me}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
            proposal.liked_by_me
              ? 'bg-[#704c12]/10 text-[#704c12]'
              : 'text-ink-500 hover:bg-paper-200 hover:text-[#704c12]'
          }`}
        >
          <Heart size={16} className={proposal.liked_by_me ? 'fill-current' : ''} />
          Me gusta
          <span className="tabular-nums">{proposal.like_count}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            showComments ? 'bg-paper-200 text-ink-700' : 'text-ink-500 hover:bg-paper-200 hover:text-ink-700'
          }`}
        >
          <MessageCircle size={16} />
          Comentarios
          <span className="tabular-nums">{proposal.comment_count}</span>
        </button>
      </footer>

      {showComments && (
        <ProposalComments
          proposalId={proposal.id}
          currentUserId={currentUserId}
          canModerate={canDelete}
          onCountChange={(delta) => onCommentCountChange(proposal.id, delta)}
        />
      )}
    </article>
  );
}
