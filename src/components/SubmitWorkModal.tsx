import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send, Link2, Upload, Images, FileText, X } from 'lucide-react';
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

type TabKind = 'enlaces' | 'archivos' | 'galeria';

const TABS: { kind: TabKind; label: string; icon: typeof Link2 }[] = [
  { kind: 'enlaces', label: 'Enlaces', icon: Link2 },
  { kind: 'archivos', label: 'Archivos', icon: Upload },
  { kind: 'galeria', label: 'Galería', icon: Images },
];

const fieldClass = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

interface GalleryItem {
  name: string;
  size: number;
  previewUrl: string;
  caption: string;
}

interface FileItem {
  name: string;
  size: number;
  type: string;
}

const STORAGE_KEY = 'tercera_via_projects';

interface StoredProject {
  id: string;
  title: string;
  synopsis: string;
  format: FormatSlug;
  track: Track;
  section: 'creativa' | 'informativa';
  link: string;
  files: { name: string; type: string; size: number }[];
  gallery: { name: string; caption: string; size: number }[];
  author: string;
  authorId: string;
  createdAt: string;
  status: 'pendiente';
}

function loadProjects(): StoredProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProject[]) : [];
  } catch {
    return [];
  }
}

function saveProject(project: StoredProject): void {
  const existing = loadProjects();
  existing.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  window.dispatchEvent(new Event('tercera-via-projects-updated'));
}

export function getPublishedProjects(): StoredProject[] {
  return loadProjects();
}

async function ensureProfileInBackground(userId: string, email: string, displayName: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, email, display_name: displayName }, { onConflict: 'id' });
    if (error) console.error('[ensureProfileInBackground] upsert error:', error);
  } catch (err) {
    console.error('[ensureProfileInBackground] network error:', err);
  }
}

export default function SubmitWorkModal({ formatSlug, onSubmitted, onClose }: SubmitWorkModalProps) {
  const { session, profile } = useAuth();
  const { open } = useModal();
  const [tab, setTab] = useState<TabKind>('enlaces');
  const [format, setFormat] = useState<FormatSlug>(formatSlug ?? FORMATS[0].slug);
  const [track, setTrack] = useState<Track>('contraste');
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [link, setLink] = useState('');
  const [extraLinks, setExtraLinks] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!session) {
    return (
      <ModalShell title="Publica tu proyecto" onClose={onClose}>
        <p className="text-sm leading-relaxed text-black/70">Para publicar un proyecto necesitas iniciar sesión o crear una cuenta.</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => open({ kind: 'auth', mode: 'login' })} className="flex-1 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
            Iniciar sesión
          </button>
          <button type="button" onClick={() => open({ kind: 'auth', mode: 'signup' })} className="flex-1 rounded-lg border border-black/20 bg-white px-5 py-3 font-medium text-black transition-colors hover:border-[#a87945]">
            Crear cuenta
          </button>
        </div>
      </ModalShell>
    );
  }

  const authorName = profile?.display_name || session.user.email?.split('@')[0] || 'Usuario';
  const authorEmail = session.user.email ?? '';
  const authorId = session.user.id;

  if (done) {
    return (
      <ModalShell title="Proyecto publicado" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={44} className="text-accent-ok" />
          <p className="text-sm leading-relaxed text-black/70">
            Tu proyecto «{title}» se ha guardado correctamente. Aparecerá en la sección de {formatLabel(format)} cuando se publique.
          </p>
          <button type="button" onClick={onClose} className="mt-4 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
            Cerrar
          </button>
        </div>
      </ModalShell>
    );
  }

  const addExtraLink = () => setExtraLinks([...extraLinks, '']);
  const updateExtraLink = (i: number, val: string) => setExtraLinks(extraLinks.map((l, idx) => (idx === i ? val : l)));
  const removeExtraLink = (i: number) => setExtraLinks(extraLinks.filter((_, idx) => idx !== i));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setError('');
    for (const file of selected) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Cada archivo debe pesar menos de 50 MB.');
        return;
      }
    }
    setFiles((prev) => [...prev, ...selected.map((file) => ({ name: file.name, size: file.size, type: file.type }))]);
    e.target.value = '';
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setError('');
    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        setError('La galería solo admite imágenes.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Cada imagen debe pesar menos de 10 MB.');
        return;
      }
    }
    setGallery((prev) => [
      ...prev,
      ...selected.map((file) => ({ name: file.name, size: file.size, previewUrl: URL.createObjectURL(file), caption: '' })),
    ]);
    e.target.value = '';
  };

  const updateCaption = (i: number, caption: string) =>
    setGallery(gallery.map((g, idx) => (idx === i ? { ...g, caption } : g)));
  const removeGalleryItem = (i: number) => {
    URL.revokeObjectURL(gallery[i]?.previewUrl ?? '');
    setGallery(gallery.filter((_, idx) => idx !== i));
  };
  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (title.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (synopsis.trim().length < 10) {
      setError('Escribe un resumen de al menos 10 caracteres.');
      return;
    }
    if (tab === 'enlaces') {
      if (!isHttpUrl(link.trim())) {
        setError('Introduce un enlace válido que empiece por https://');
        return;
      }
      for (const el of extraLinks) {
        if (el.trim() && !isHttpUrl(el.trim())) {
          setError('Todos los enlaces adicionales deben empezar por https://');
          return;
        }
      }
    }

    setSaving(true);

    const allLinks = [link.trim(), ...extraLinks.map((l) => l.trim()).filter(Boolean)];
    const section: 'creativa' | 'informativa' = format === 'noticias' ? 'informativa' : 'creativa';

    const project: StoredProject = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      synopsis: synopsis.trim(),
      format,
      track,
      section,
      link: allLinks[0] ?? '',
      files: tab === 'archivos' ? files.map((f) => ({ name: f.name, type: f.type, size: f.size })) : [],
      gallery: tab === 'galeria' ? gallery.map((g) => ({ name: g.name, caption: g.caption, size: g.size })) : [],
      author: authorName,
      authorId,
      createdAt: new Date().toISOString(),
      status: 'pendiente',
    };

    ensureProfileInBackground(authorId, authorEmail, authorName);

    try {
      saveProject(project);
      setSaving(false);
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      console.error('[SubmitWorkModal] error al guardar el proyecto:', err);
      setSaving(false);
      setError('No se pudo guardar el proyecto. Inténtalo de nuevo.');
    }
  };

  const creativaFormats = FORMATS.filter((f) => f.slug !== 'noticias');
  const informativaFormats = FORMATS.filter((f) => f.slug === 'noticias');

  return (
    <ModalShell title="Publica tu proyecto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-medium text-black/70">
          Título
          <input type="text" required minLength={3} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1.5 ${fieldClass}`} placeholder="Titular de tu trabajo" />
        </label>

        <div className="space-y-3">
          <p className="text-sm font-medium text-black/70">Tipo de formato</p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-black/50">Sección creativa</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {creativaFormats.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setFormat(item.slug)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                    format === item.slug
                      ? 'border-[#704c12] bg-[#704c12]/10 text-[#704c12]'
                      : 'border-black/15 bg-white text-black/70 hover:border-[#704c12]/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-black/50">Sección informativa</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {informativaFormats.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setFormat(item.slug)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                    format === item.slug
                      ? 'border-[#704c12] bg-[#704c12]/10 text-[#704c12]'
                      : 'border-black/15 bg-white text-black/70 hover:border-[#704c12]/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-black/70">
          Línea editorial
          <select value={track} onChange={(e) => setTrack(e.target.value as Track)} className={`mt-1.5 ${fieldClass}`}>
            {TRACK_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-black/70">
          Resumen
          <textarea required minLength={10} maxLength={600} rows={4} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className={`mt-1.5 resize-none ${fieldClass}`} placeholder="De qué trata tu trabajo en pocas líneas" />
        </label>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-black/5 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.kind}
                type="button"
                onClick={() => setTab(t.kind)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  tab === t.kind ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'enlaces' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-black/70">
              Enlace principal
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className={`mt-1.5 ${fieldClass}`} placeholder="https://" />
            </label>
            {extraLinks.map((el, i) => (
              <div key={i} className="flex gap-2">
                <input type="url" value={el} onChange={(e) => updateExtraLink(i, e.target.value)} className={fieldClass} placeholder="https:// (enlace adicional)" />
                <button type="button" onClick={() => removeExtraLink(i)} className="shrink-0 rounded-lg border border-black/15 px-3 text-black/50 hover:bg-black/5">
                  <X size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addExtraLink} className="text-sm font-medium text-[#704c12] hover:underline">
              + Añadir otro enlace
            </button>
          </div>
        )}

        {tab === 'archivos' && (
          <div className="space-y-3">
            <p className="text-sm text-black/60">Sube documentos PDF, DOCX, TXT u otros archivos relacionados con tu proyecto (máx. 50 MB por archivo).</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black/15 bg-white px-4 py-6 text-sm text-black/60 transition-colors hover:border-[#704c12]">
              <Upload size={20} />
              Seleccionar archivos
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate text-black/70">
                      <FileText size={15} className="shrink-0 text-[#704c12]" />
                      {f.name}
                    </span>
                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-black/40 hover:text-accent-err">
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'galeria' && (
          <div className="space-y-3">
            <p className="text-sm text-black/60">Sube imágenes para tu galería (JPG, PNG, WEBP — máx. 10 MB por imagen).</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black/15 bg-white px-4 py-6 text-sm text-black/60 transition-colors hover:border-[#704c12]">
              <Images size={20} />
              Seleccionar imágenes
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
            </label>
            {gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((g, i) => (
                  <div key={i} className="space-y-1">
                    <div className="relative overflow-hidden rounded-lg border border-black/10">
                      <img src={g.previewUrl} alt={g.name} className="aspect-square w-full object-cover" />
                      <button type="button" onClick={() => removeGalleryItem(i)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-black/50 shadow hover:text-accent-err">
                        <X size={12} />
                      </button>
                    </div>
                    <input type="text" value={g.caption} onChange={(e) => updateCaption(i, e.target.value)} placeholder="Pie de foto" className="w-full rounded border border-black/10 px-2 py-1 text-xs text-black outline-none focus:border-[#704c12]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60">
          <Send size={17} />
          {saving ? 'Publicando...' : 'Publicar proyecto'}
        </button>
      </form>
    </ModalShell>
  );
}

function formatLabel(slug: FormatSlug): string {
  return FORMATS.find((f) => f.slug === slug)?.label ?? 'Contenido';
}
