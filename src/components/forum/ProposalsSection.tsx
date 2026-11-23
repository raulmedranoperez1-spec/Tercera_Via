import { useEffect, useState } from 'react';
import { Loader2, Inbox, Lightbulb, TrendingUp, MessageSquare, Heart } from 'lucide-react';
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

  const load = () => {
    let active = true;
    setLoading(true);
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
  };

  useEffect(load, [userId]);

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

  const totalLikes = proposals.reduce((sum, p) => sum + p.like_count, 0);
  const totalComments = proposals.reduce((sum, p) => sum + p.comment_count, 0);

  return (
    <section className="mt-10 space-y-6">
      {/* Featured header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#704c12]/20 bg-gradient-to-br from-[#704c12] via-[#5d432c] to-[#3e2a18] p-7 text-white shadow-lg sm:p-9">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
            <Lightbulb size={14} />
            Espacio participativo
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Propuestas para los creadores
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Comparte tus ideas, preguntas o temas para futuros artículos y episodios de podcast.
            Otros usuarios pueden comentar y dar "Me gusta" a tus propuestas.
          </p>
          {proposals.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-5 text-sm">
              <span className="flex items-center gap-1.5 text-white/85">
                <TrendingUp size={16} className="text-white/60" />
                {proposals.length} {proposals.length === 1 ? 'propuesta' : 'propuestas'}
              </span>
              <span className="flex items-center gap-1.5 text-white/85">
                <Heart size={16} className="text-white/60" />
                {totalLikes} {totalLikes === 1 ? 'me gusta' : 'me gusta'}
              </span>
              <span className="flex items-center gap-1.5 text-white/85">
                <MessageSquare size={16} className="text-white/60" />
                {totalComments} {totalComments === 1 ? 'comentario' : 'comentarios'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <ProposalComposer onSubmit={handleCreate} />

      {/* Wall */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[#704c12]" />
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-xl border border-accent-err/30 bg-accent-err/5 px-4 py-3 text-sm text-accent-err">
              {error}
            </div>
          )}
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-paper-400/60 bg-paper-50/50 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#704c12]/10">
                <Inbox size={32} className="text-[#704c12]/60" />
              </div>
              <h3 className="font-serif text-xl text-ink-600">Aún no hay propuestas</h3>
              <p className="max-w-sm text-sm leading-relaxed text-ink-400">
                Sé el primero en compartir una idea con los creadores de contenido de La Tercera Vía.
              </p>
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
