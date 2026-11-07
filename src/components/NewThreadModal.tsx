import { useState } from 'react';
import { Loader2, Send, AlertCircle, BookOpen, ShieldCheck } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { createThread, moderateWithAI } from '@/lib/forum';
import { forumThreadHref } from '@/lib/router';

interface NewThreadModalProps {
  categoryId: string;
  categoryName: string;
  onClose: () => void;
}

export default function NewThreadModal({ categoryId, categoryName, onClose }: NewThreadModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiChecking, setAiChecking] = useState(false);
  const [aiWarning, setAiWarning] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (!body.trim() || body.trim().length < 1) {
      setError('El cuerpo del tema no puede estar vacío.');
      return;
    }
    if (title.length > 200) {
      setError('El título no puede superar 200 caracteres.');
      return;
    }
    if (body.length > 5000) {
      setError('El cuerpo no puede superar 5000 caracteres.');
      return;
    }

    setSaving(true);
    setError('');
    setAiWarning('');

    try {
      setAiChecking(true);
      let moderationResult: { recommendation: string; reasons: string[] } | null = null;
      try {
        moderationResult = await moderateWithAI(`${title}\n\n${body}`);
      } catch {
        // If AI is unavailable, proceed — the thread defaults to 'limpio'
      }
      setAiChecking(false);

      const result = await createThread({
        category_id: categoryId,
        title: title.trim(),
        body: body.trim(),
      });

      if (moderationResult && moderationResult.recommendation !== 'publicar') {
        setAiWarning(
          moderationResult.recommendation === 'sugerir_ocultacion'
            ? `La IA ha sugerido ocultar este tema: ${moderationResult.reasons.join(', ')}. Quedará marcado para revisión por el equipo editorial.`
            : `La IA ha marcado este tema para revisión: ${moderationResult.reasons.join(', ')}. Podría ser revisado por el equipo editorial.`
        );
      }

      window.location.hash = forumThreadHref(result.id);
      onClose();
    } catch (err) {
      setAiChecking(false);
      setError(err instanceof Error ? err.message : 'No se pudo crear el tema.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Nuevo tema en ${categoryName}`} onClose={onClose}>
      {aiWarning && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent-err/30 bg-accent-err/10 px-4 py-3 text-sm text-accent-err">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>{aiWarning}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent-err/30 bg-accent-err/10 px-4 py-3 text-sm text-accent-err">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-black/60">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Escribe un título claro y descriptivo"
            className="mt-1 w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-black focus:border-[#704c12] focus:outline-none"
            autoFocus
          />
          <p className="mt-1 text-xs text-black/40">{title.length}/200</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60">Mensaje</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={6}
            placeholder="Desarrolla tu tema de debate..."
            className="mt-1 w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-black focus:border-[#704c12] focus:outline-none"
          />
          <p className="mt-1 text-xs text-black/40">{body.length}/5000</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-black/5 px-3 py-2.5 text-xs text-black/50">
          <BookOpen size={14} className="mt-0.5 shrink-0" />
          <span>
            Al publicar aceptas las normas de participación. Un sistema de IA analizará
            tu mensaje antes de publicarlo. Respeta a los demás y contrasta tus afirmaciones.
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || aiChecking}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c] disabled:opacity-50"
          >
            {saving || aiChecking ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {aiChecking ? 'Analizando...' : 'Publicando...'}
              </>
            ) : (
              <>
                <Send size={15} />
                Publicar tema
              </>
            )}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-black/15 px-5 py-2.5 text-sm text-black/70 hover:bg-black/5">
            Cancelar
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
