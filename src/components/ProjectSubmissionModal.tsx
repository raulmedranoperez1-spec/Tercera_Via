import { useState, type FormEvent } from 'react';
import { X, FileText, User, Hash, Link2, Loader2, AlertCircle, CheckCircle2, GraduationCap, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ProjectSubmissionModalProps {
  open: boolean;
  onClose: () => void;
}

const formats = [
  { value: 'articulo', label: 'Artículo' },
  { value: 'reportaje', label: 'Reportaje' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'ensayo', label: 'Ensayo' },
  { value: 'podcast', label: 'Podcast' },
] as const;

export default function ProjectSubmissionModal({ open, onClose }: ProjectSubmissionModalProps) {
  const { user, isCreador } = useAuth();
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<string>('articulo');
  const [synopsis, setSynopsis] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setFormat('articulo');
    setSynopsis('');
    setAuthorName('');
    setStudentId('');
    setLink('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Access denied for non-creador users
  if (!isCreador) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-950/60 p-4 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-md rounded-2xl border border-paper-400/60 bg-paper-50 p-8 text-center shadow-2xl animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-paper-300"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-warn/15 text-accent-warn">
            <Lock size={32} />
          </div>
          <h2 className="mb-3 font-serif text-2xl font-semibold text-earth-900">
            Acceso restringido
          </h2>
          <p className="text-sm leading-relaxed text-ink-600">
            Solo los estudiantes de la Universidad de Sevilla con correo{' '}
            <strong className="text-earth-800">@alum.us.es</strong> pueden publicar proyectos.
          </p>
          <p className="mt-3 text-sm text-ink-500">
            Si eres alumno de la FCOM, cierra esta ventana e inicia sesión con tu
            correo institucional.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 rounded-full bg-earth-800 px-6 py-2.5 text-sm font-medium text-paper-100 transition-all hover:bg-earth-900"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !synopsis || !authorName || !studentId) {
      setError('Rellena todos los campos obligatorios.');
      return;
    }

    if (!user) {
      setError('Debes iniciar sesión primero.');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from('submissions').insert({
      user_id: user.id,
      title,
      format,
      synopsis,
      author_name: authorName,
      student_id: studentId,
      link: link || null,
      status: 'pendiente',
    });

    setLoading(false);

    if (insertError) {
      setError('No se pudo enviar el proyecto. Inténtalo de nuevo.');
      return;
    }

    setSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-paper-400/60 bg-paper-50 p-8 shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-paper-300"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={48} className="text-accent-ok" />
            <h2 className="font-serif text-2xl font-semibold text-earth-900">¡Proyecto enviado!</h2>
            <p className="text-sm text-ink-500">
              Tu propuesta está en revisión. El equipo editorial de La Tercera Vía
              se pondrá en contacto contigo pronto.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-full bg-earth-800 px-6 py-2.5 text-sm font-medium text-paper-100 transition-all hover:bg-earth-900"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-earth-800 text-paper-100">
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-earth-900">
                  Sube tu proyecto
                </h2>
                <p className="text-sm text-ink-500">
                  Creador FCOM — Universidad de Sevilla
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-accent-err/10 px-3 py-2 text-sm text-accent-err">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-600">
                  Título <span className="text-accent-err">*</span>
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3 top-3 text-ink-400" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título de tu pieza"
                    className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                  />
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-600">
                  Formato <span className="text-accent-err">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {formats.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormat(f.value)}
                      className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                        format === f.value
                          ? 'bg-earth-800 text-paper-100 shadow-sm'
                          : 'bg-paper-200 text-ink-600 hover:bg-paper-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-600">
                  Sinopsis <span className="text-accent-err">*</span>
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Resumen breve de tu pieza: tema, enfoque y conclusiones principales."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-paper-400 bg-paper-100 px-4 py-3 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                />
              </div>

              {/* Author + Student ID */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-600">
                    Nombre del autor <span className="text-accent-err">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-ink-400" />
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Nombre y apellidos"
                      className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-600">
                    Nº de expediente <span className="text-accent-err">*</span>
                  </label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 top-3 text-ink-400" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Ej. 7421938"
                      className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-600">
                  Enlace al borrador (opcional)
                </label>
                <div className="relative">
                  <Link2 size={18} className="absolute left-3 top-3 text-ink-400" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://docs.google.com/... o enlace a tu podcast"
                    className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-earth-800 px-5 py-3.5 text-base font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900 hover:shadow-md disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Enviar proyecto
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
