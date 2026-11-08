import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Inbox } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import {
  createProposal,
  deleteProposal,
  fetchProposals,
  setProposalLiked,
  type Proposal,
} from '@/lib/proposals';
import ProposalComposer from '@/components/forum/ProposalComposer';
import ProposalCard from '@/components/forum/ProposalCard';

export default function ProposalsSection() {
  const { session, profile } = useAuth();
  if (!session) return null;
  return <ProposalsWall userId={session.user.id} canModerate={profile?.role === 'equipo_editorial'} />;
}

interface ProposalsWallProps {
  userId: string;
  canModerate: boolean;
}

function ProposalsWall({ userId, canModerate }: ProposalsWallProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchProposals(userId)
      .then((rows) => {
        if (active) setProposals(rows);
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las propuestas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const handleCreate = async (body: string) => {
    await createProposal(body);
    setProposals(await fetchProposals(userId));
  };

  const handleToggleLike = async (proposal: Proposal) => {
    const liked = !proposal.liked_by_me;
    const delta = liked ? 1 : -1;
    const applyLike = (isLiked: boolean, change: number) =>
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id ? { ...p, liked_by_me: isLiked, like_count: Math.max(0, p.like_count + change) } : p,
        ),
      );
    applyLike(liked, delta);
    try {
      await setProposalLiked(proposal.id, userId, liked);
    } catch {
      applyLike(!liked, -delta);
      setError('No se pudo registrar tu "Me gusta". Inténtalo de nuevo.');
    }
  };

  const handleDelete = async (proposal: Proposal) => {
    if (!window.confirm('¿Eliminar esta propuesta? Se borrarán también sus comentarios.')) return;
    setError('');
    try {
      await deleteProposal(proposal.id);
      setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
    } catch {
      setError('No se pudo eliminar la propuesta.');
    }
  };

  const handleCommentCountChange = (proposalId: string, delta: number) =>
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, comment_count: Math.max(0, p.comment_count + delta) } : p,
      ),
    );

  return (
    <section className="mt-8 space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink-800">Propuestas para los creadores</h2>
        <p className="mt-1 text-sm text-ink-500">
          Comparte ideas, preguntas o temas para futuros artículos y episodios de podcast.
        </p>
      </div>

      <ProposalComposer onSubmit={handleCreate} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[#704c12]" />
        </div>
      ) : (
        <>
          {error && <p className="text-sm text-accent-err">{error}</p>}
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-12 text-center">
              <Inbox size={36} className="text-ink-300" />
              <h3 className="font-serif text-lg text-ink-600">Aún no hay propuestas</h3>
              <p className="max-w-sm text-sm text-ink-400">Sé el primero en compartir una idea con los creadores.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  currentUserId={userId}
                  canDelete={canModerate}
                  onToggleLike={handleToggleLike}
                  onDelete={handleDelete}
                  onCommentCountChange={handleCommentCountChange}
                />
              ))}
            </div>
          )}
        </>
      )}
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <MessageSquare size={13} />
        Las propuestas más recientes aparecen primero
      </p>
    </section>
  );
}
