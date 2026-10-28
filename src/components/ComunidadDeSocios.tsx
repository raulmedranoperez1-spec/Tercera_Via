import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { MessageCircle, ThumbsUp, Send, Loader2, AlertCircle, Lock, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useReveal } from '@/hooks/useReveal';

interface Suggestion {
  id: string;
  topic: string;
  description: string | null;
  author_name: string;
  votes: number;
  created_at: string;
  user_voted: boolean;
}

export default function ComunidadDeSocios() {
  const { user, profile } = useAuth();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('community_suggestions')
      .select('id, topic, description, author_name, votes, created_at')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError || !data) {
      setLoading(false);
      return;
    }

    // Fetch the current user's votes to mark which suggestions they've voted on
    let votedIds = new Set<string>();
    if (user) {
      const { data: votesData } = await supabase
        .from('suggestion_votes')
        .select('suggestion_id')
        .eq('user_id', user.id);
      if (votesData) {
        votedIds = new Set(votesData.map((v) => v.suggestion_id));
      }
    }

    setSuggestions(
      data.map((s) => ({
        ...s,
        user_voted: votedIds.has(s.id),
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !profile) {
      setError('Debes iniciar sesión para proponer un tema.');
      return;
    }

    if (!topic.trim()) {
      setError('Escribe un tema.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from('community_suggestions').insert({
      user_id: user.id,
      topic: topic.trim(),
      description: description.trim() || null,
      author_name: profile.display_name || user.email || 'Anónimo',
    });

    setSubmitting(false);

    if (insertError) {
      setError('No se pudo enviar tu propuesta. Inténtalo de nuevo.');
      return;
    }

    setTopic('');
    setDescription('');
    fetchSuggestions();
  };

  const handleVote = async (suggestionId: string) => {
    if (!user) {
      setError('Debes iniciar sesión para votar.');
      return;
    }

    // Optimistic update
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestionId
          ? {
              ...s,
              votes: s.user_voted ? s.votes - 1 : s.votes + 1,
              user_voted: !s.user_voted,
            }
          : s
      )
    );

    const { error: rpcError } = await supabase.rpc('toggle_vote', {
      target_suggestion_id: suggestionId,
    });

    if (rpcError) {
      // Revert on error
      fetchSuggestions();
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'hace menos de 1h';
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <section id="comunidad" className="bg-paper-200 py-20 sm:py-24">
      <div ref={ref} className={`mx-auto max-w-4xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}>
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-earth-700">
            Participa
          </span>
          <h2 className="mt-3 font-serif text-4xl text-earth-900 sm:text-5xl">
            Comunidad de Socios
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
            Sugiere temas, propone asuntos a investigar y vota las ideas de la comunidad.
            Los temas más votados pasan a la redacción.
          </p>
        </div>

        {/* Suggestion form */}
        <div className="mb-8 rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm">
          {!user ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Lock size={32} className="text-ink-400" />
              <p className="text-sm text-ink-500">
                Inicia sesión para proponer temas y votar en la comunidad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-earth-800">
                <MessageCircle size={18} />
                Proponer un tema
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="¿Qué tema debería investigar La Tercera Vía?"
                maxLength={120}
                className="w-full rounded-xl border border-paper-400 bg-paper-100 px-4 py-3 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contexto o detalles (opcional)"
                rows={2}
                maxLength={300}
                className="w-full resize-none rounded-xl border border-paper-400 bg-paper-100 px-4 py-3 text-sm text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
              />
              {error && (
                <p className="flex items-center gap-2 text-sm text-accent-err">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 self-start rounded-full bg-earth-800 px-5 py-2.5 text-sm font-medium text-paper-100 transition-all hover:bg-earth-900 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Enviar propuesta
              </button>
            </form>
          )}
        </div>

        {/* Suggestions list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-earth-700" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-2xl border border-paper-400/70 bg-paper-50 py-12 text-center">
            <MessageCircle size={32} className="mx-auto mb-3 text-ink-400" />
            <p className="text-sm text-ink-500">
              Aún no hay propuestas. ¡Sé el primero en sugerir un tema!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((s, idx) => (
              <div
                key={s.id}
                className="flex items-start gap-4 rounded-xl border border-paper-400/60 bg-paper-50 p-4 transition-all hover:shadow-sm"
              >
                {/* Vote button */}
                <button
                  onClick={() => handleVote(s.id)}
                  disabled={!user}
                  className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 transition-all ${
                    s.user_voted
                      ? 'bg-earth-800 text-paper-100'
                      : 'bg-paper-200 text-ink-600 hover:bg-paper-300'
                  } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <ThumbsUp size={18} className={s.user_voted ? 'fill-paper-100' : ''} />
                  <span className="mt-0.5 text-sm font-semibold">{s.votes}</span>
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {idx < 3 && (
                      <TrendingUp size={14} className="text-earth-700" />
                    )}
                    <p className="font-medium text-earth-900">{s.topic}</p>
                  </div>
                  {s.description && (
                    <p className="mt-1 text-sm text-ink-600">{s.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-400">
                    <span>{s.author_name}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(s.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
