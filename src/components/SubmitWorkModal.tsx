import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { FORMATS, TRACK_OPTIONS, type FormatSlug, type Track } from '@/lib/formats';
import { isHttpUrl } from '@/lib/url';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { supabase } from '@/lib/supabase';

interface SubmitWorkModalProps {
  formatSlug?: FormatSlug;
  onSubmitted?: () => void;
  onClose: () => void;
}

const fieldClass = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

export default function SubmitWorkModal({ formatSlug, onSubmitted, onClose }: SubmitWorkModalProps) {
  const { session, profile } = useAuth();
  const { open } = useModal();
  const [format, setFormat] = useState<FormatSlug>(formatSlug ?? FORMATS[0].slug);
  const [track, setTrack] = useState<Track>('contraste');
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!session) {
    return (
      <ModalShell title="Comparte tu trabajo" onClose={onClose}>
        <p className="text-sm leading-relaxed text-black/70">Para enviar un trabajo necesitas iniciar sesión.</p>
        <button type="button" onClick={() => open({ kind: 'auth', mode: 'login' })} className="mt-6 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
          Iniciar sesión / Crear cuenta
        </button>
      </ModalShell>
    );
  }

  if (!profile) {
    return (
      <ModalShell title="Comparte tu trabajo" onClose={onClose}>
        <p className="text-sm text-black/70">Cargando tu perfil...</p>
      </ModalShell>
    );
  }

  if (profile.role !== 'colaborador') {
    return (
      <ModalShell title="Comparte tu trabajo" onClose={onClose}>
        <p className="text-sm leading-relaxed text-black/70">
          Solo las cuentas con correo institucional (terminado en @alum.us.es) pueden publicar. Con tu correo actual tienes acceso de lector.
        </p>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
          Entendido
        </button>
      </ModalShell>
    );
  }

  if (done) {
    return (
      <ModalShell title="Trabajo recibido" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={44} className="text-accent-ok" />
          <p className="text-sm leading-relaxed text-black/70">
            Tu trabajo está pendiente de revisión por la redacción. Aparecerá en la sección cuando se publique.
          </p>
          <button type="button" onClick={onClose} className="mt-4 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
            Cerrar
          </button>
        </div>
      </ModalShell>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanLink = link.trim();
    if (!isHttpUrl(cleanLink)) {
      setError('Introduce un enlace válido que empiece por https://');
      return;
    }

    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('submissions').insert({
      user_id: session.user.id,
      author_name: profile.display_name || profile.email.split('@')[0],
      student_id: '',
      format,
      track,
      title: title.trim(),
      synopsis: synopsis.trim(),
      link: cleanLink,
      status: 'pendiente',
    });
    setSaving(false);

    if (insertError) {
      setError('No se pudo enviar el trabajo. Inténtalo de nuevo.');
      return;
    }
    setDone(true);
    onSubmitted?.();
  };

  return (
    <ModalShell title="Comparte tu trabajo" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-black/70">
          Título
          <input type="text" required minLength={3} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1.5 ${fieldClass}`} placeholder="Titular de tu trabajo" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-black/70">
            Formato
            <select value={format} onChange={(e) => setFormat(e.target.value as FormatSlug)} className={`mt-1.5 ${fieldClass}`}>
              {FORMATS.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-black/70">
            Línea editorial
            <select value={track} onChange={(e) => setTrack(e.target.value as Track)} className={`mt-1.5 ${fieldClass}`}>
              {TRACK_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-black/70">
          Resumen
          <textarea required minLength={10} maxLength={600} rows={4} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className={`mt-1.5 resize-none ${fieldClass}`} placeholder="De qué trata tu trabajo en pocas líneas" />
        </label>
        <label className="block text-sm font-medium text-black/70">
          Enlace a tu trabajo
          <input type="url" required value={link} onChange={(e) => setLink(e.target.value)} className={`mt-1.5 ${fieldClass}`} placeholder="https://" />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60">
          <Send size={17} />
          {saving ? 'Enviando...' : 'Enviar trabajo'}
        </button>
      </form>
    </ModalShell>
  );
}
