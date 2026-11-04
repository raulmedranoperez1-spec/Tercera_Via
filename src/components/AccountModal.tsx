import { useState } from 'react';
import ModalShell from '@/components/ModalShell';
import { roleLabel, useAuth } from '@/lib/authContext';

interface AccountModalProps {
  onClose: () => void;
}

export default function AccountModal({ onClose }: AccountModalProps) {
  const { profile, session, setDemoProfile, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!session || !profile) {
    return (
      <ModalShell title="Mi cuenta" onClose={onClose}>
        <p className="text-sm text-black/70">Cargando tu perfil...</p>
      </ModalShell>
    );
  }

  const isCreator = profile.role === 'creador';

  const applyDemo = async (role: 'lector' | 'creador', socio: boolean) => {
    setBusy(true);
    setError('');
    const message = await setDemoProfile(role, socio);
    setBusy(false);
    if (message) setError(message);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const modeButton = (role: 'lector' | 'creador', label: string) => (
    <button
      type="button"
      disabled={busy}
      onClick={() => applyDemo(role, profile.is_socio)}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 ${
        (role === 'creador') === isCreator
          ? 'bg-earth-800 text-paper-100'
          : 'border border-black/20 bg-white text-black/80 hover:bg-black/5'
      }`}
    >
      {label}
    </button>
  );

  return (
    <ModalShell title="Mi cuenta" onClose={onClose}>
      <div className="space-y-6 text-sm text-black/75">
        <div>
          <p className="text-black/60">Correo</p>
          <p className="font-medium text-black">{profile.email}</p>
          <p className="mt-2 inline-block rounded-full bg-[#704c12]/10 px-3 py-1 text-xs font-semibold text-[#5d432c]">
            {roleLabel(profile.role)}
          </p>
          <p className="mt-2 text-black/60">
            Membresía de socio: {profile.is_socio ? 'activa' : 'no activa'}
          </p>
        </div>

        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <p className="font-semibold text-black">Modo de prueba</p>
          <p className="mt-1 text-xs leading-relaxed text-black/60">
            Herramienta de demostración para cambiar entre lector y creador, y activar la membresía de socio.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {modeButton('lector', 'Modo lector')}
            {modeButton('creador', 'Modo alumno / creador')}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => applyDemo(isCreator ? 'creador' : 'lector', !profile.is_socio)}
            className="mt-3 w-full rounded-full border border-[#704c12] px-4 py-2 text-sm font-medium text-[#704c12] transition-colors hover:bg-[#704c12] hover:text-paper-100 disabled:opacity-60"
          >
            {profile.is_socio ? 'Desactivar membresía de socio' : 'Activar membresía de socio'}
          </button>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </div>

        <button type="button" onClick={handleSignOut} className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
          Cerrar sesión
        </button>
      </div>
    </ModalShell>
  );
}
