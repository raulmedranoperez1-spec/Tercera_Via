import { useState } from 'react';
import { Loader2, Send, PenLine } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { PROPOSAL_MAX_LENGTH } from '@/lib/proposals';

interface ProposalComposerProps {
  onSubmit: (body: string) => Promise<void>;
}

export default function ProposalComposer({ onSubmit }: ProposalComposerProps) {
  const { profile } = useAuth();
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const trimmed = body.trim();
  const canPublish = trimmed.length > 0 && trimmed.length <= PROPOSAL_MAX_LENGTH && !posting;
  const displayName = profile?.display_name || profile?.username || profile?.email?.split('@')[0] || 'Usuario';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canPublish) return;
    setPosting(true);
    setError('');
    try {
      await onSubmit(trimmed);
      setBody('');
    } catch {
      setError('No se pudo publicar la propuesta. Inténtalo de nuevo.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border-2 bg-paper-50 p-5 shadow-sm transition-all sm:p-6 ${
        focused ? 'border-[#704c12]/50 shadow-md' : 'border-paper-400/60'
      }`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#704c12]/10 text-[#704c12]">
          <PenLine size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-700">Comparte tu propuesta</p>
          <p className="text-xs text-ink-400">Publicando como {displayName}</p>
        </div>
      </div>

      <label htmlFor="proposal-body" className="sr-only">
        Tu propuesta para los creadores de contenido
      </label>
      <textarea
        id="proposal-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={4}
        maxLength={PROPOSAL_MAX_LENGTH}
        placeholder="Escribe aquí tu mensaje…"
        className="w-full resize-none rounded-xl border border-paper-400/60 bg-white px-4 py-3 text-base leading-relaxed text-ink-800 placeholder:text-ink-300 transition-colors focus:border-[#704c12]/50 focus:outline-none focus:ring-4 focus:ring-[#704c12]/10"
      />

      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">
          Ideas, preguntas o temas para futuros artículos y episodios de podcast.
          <span className="ml-2 tabular-nums">
            {body.length}/{PROPOSAL_MAX_LENGTH}
          </span>
        </p>
        <button
          type="submit"
          disabled={!canPublish}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#704c12] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#5d432c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Publicar propuesta
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-accent-err">{error}</p>}
    </form>
  );
}
