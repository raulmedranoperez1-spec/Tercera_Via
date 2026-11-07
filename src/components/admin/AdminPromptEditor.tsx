import { useCallback, useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { describeError } from '@/lib/edgeFunctions';

interface AdminPromptEditorProps {
  token: string;
}

const textareaClass = 'w-full resize-y rounded-lg border border-black/15 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-black outline-none focus:border-[#a87945]';

export default function AdminPromptEditor({ token }: AdminPromptEditorProps) {
  const [savedPrompt, setSavedPrompt] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const loadPrompt = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await adminApi.getPrompt(token);
      setSavedPrompt(response.prompt);
      setDraft(response.prompt);
    } catch (err) {
      setLoadError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const isDirty = draft !== savedPrompt;

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setActionError('');
    try {
      const response = await adminApi.savePrompt(token, draft);
      setSavedPrompt(response.prompt);
      setDraft(response.prompt);
      setMessage('Prompt guardado. Se aplicará a las siguientes auditorías.');
    } catch (err) {
      setActionError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-black/60">Cargando el prompt...</p>;

  if (loadError) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-accent-err">{loadError}</p>
        <button type="button" onClick={loadPrompt} className="rounded-lg border border-black/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-black/70">
        Este texto define cómo revisa el agente los borradores. Los cambios se aplican sin tocar el código.
      </p>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={22} className={textareaClass} aria-label="Prompt del agente" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-black/50">{draft.length.toLocaleString('es-ES')} caracteres</span>
        <div className="flex gap-2">
          {isDirty && (
            <button type="button" onClick={() => { setDraft(savedPrompt); setActionError(''); }} className="flex items-center gap-2 rounded-lg border border-black/20 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/5">
              <RotateCcw size={16} />
              Descartar
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={!isDirty || saving} className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-40">
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar prompt'}
          </button>
        </div>
      </div>
      {message && <p role="status" className="text-sm text-accent-ok">{message}</p>}
      {actionError && <p role="alert" className="text-sm text-accent-err">{actionError}</p>}
    </div>
  );
}
