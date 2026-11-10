import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { isWriterRole, useAuth, type SocialLink } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { displayName, initials } from '@/lib/contentTypes';

interface EditProfileModalProps {
  onClose: () => void;
}

const fieldClass =
  'w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

const SOCIAL_PLATFORMS = ['X / Twitter', 'LinkedIn', 'Instagram', 'Facebook', 'Web personal', 'Otro'];

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { profile, session, refreshProfile } = useAuth();
  const [displayNameVal, setDisplayNameVal] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWriter = profile ? isWriterRole(profile.role) : false;

  useEffect(() => {
    if (profile) {
      setDisplayNameVal(profile.display_name ?? '');
      setBio(profile.bio ?? '');
      setAvatarUrl(profile.avatar_url);
      setAvatarPreview(profile.avatar_url);
      setAcademicYear(profile.academic_year ?? '');
      setSocialLinks(profile.social_links ?? []);
    }
  }, [profile]);

  if (!session || !profile) {
    return (
      <ModalShell title="Editar perfil" onClose={onClose}>
        <p className="text-sm text-black/70">Cargando tu perfil...</p>
      </ModalShell>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${profile.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError('No se pudo subir la imagen. Inténtalo de nuevo.');
      setAvatarPreview(avatarUrl);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(urlData.publicUrl);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: SOCIAL_PLATFORMS[0], url: '' }]);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = displayNameVal.trim();
    const trimmedBio = bio.trim();
    const trimmedAcademic = academicYear.trim();

    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (trimmedName.length > 80) {
      setError('El nombre no puede superar 80 caracteres.');
      return;
    }
    if (trimmedBio.length > 500) {
      setError('La descripción no puede superar 500 caracteres.');
      return;
    }

    const validSocialLinks = socialLinks.filter((l) => l.url.trim().length > 0);

    setSaving(true);
    setError('');

    const updateData: Record<string, unknown> = {
      display_name: trimmedName,
      avatar_url: avatarUrl,
    };

    if (isWriter) {
      updateData.bio = trimmedBio;
      updateData.academic_year = trimmedAcademic || null;
      updateData.social_links = validSocialLinks;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    setSaving(false);

    if (updateError) {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      return;
    }

    await refreshProfile();
    setSuccess(true);
  };

  if (success) {
    return (
      <ModalShell title="Perfil actualizado" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={44} className="text-accent-ok" />
          <p className="text-sm leading-relaxed text-black/70">
            Tus cambios se han guardado correctamente.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black"
          >
            Cerrar
          </button>
        </div>
      </ModalShell>
    );
  }

  const previewLabel = displayName(displayNameVal || profile.display_name, profile.email);

  return (
    <ModalShell title="Editar perfil" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#704c12]/20 bg-[#ebdbc6]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Vista previa" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-xl font-semibold text-[#5d432c]">
                  {initials(profile.display_name, profile.email)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#704c12] text-white shadow-md transition-colors hover:bg-[#5d432c] disabled:opacity-60"
              aria-label="Cambiar foto"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-black/80">{previewLabel}</p>
            <p className="text-xs text-black/50">Haz clic en la cámara para cambiar tu foto</p>
          </div>
        </div>

        <label className="block text-sm font-medium text-black/70">
          Nombre
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={displayNameVal}
            onChange={(e) => setDisplayNameVal(e.target.value)}
            className={`mt-1.5 ${fieldClass}`}
            placeholder="Tu nombre visible"
          />
        </label>

        {isWriter && (
          <>
            <div className="border-t border-black/10 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#704c12]">
                Campos de redactor
              </p>

              <label className="mb-4 block text-sm font-medium text-black/70">
                Biografía
                <textarea
                  rows={4}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`mt-1.5 resize-none ${fieldClass}`}
                  placeholder="Cuéntanos sobre ti, tus intereses, tu trayectoria..."
                />
                <span className="mt-1 block text-right text-xs text-black/40">{bio.length}/500</span>
              </label>

              <label className="block text-sm font-medium text-black/70">
                Curso académico / Grado
                <input
                  type="text"
                  maxLength={100}
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                  placeholder="Ej: 3º Periodismo, Universidad de Sevilla"
                />
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-black/70">Enlaces sociales</p>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="flex items-center gap-1 text-xs font-medium text-[#704c12] hover:text-[#5d432c]"
                >
                  <Plus size={14} />
                  Añadir
                </button>
              </div>
              {socialLinks.length === 0 ? (
                <p className="text-xs text-black/40">No tienes enlaces sociales añadidos.</p>
              ) : (
                <div className="space-y-2">
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className={`shrink-0 rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#a87945]`}
                      >
                        {SOCIAL_PLATFORMS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className={`flex-1 ${fieldClass}`}
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/10 text-black/40 transition-colors hover:border-red-300 hover:text-red-600"
                        aria-label="Eliminar enlace"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60"
        >
          {saving ? <Loader2 size={17} className="animate-spin" /> : null}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </ModalShell>
  );
}
