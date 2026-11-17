import ModalShell from '@/components/ModalShell';
import { roleLabel, useAuth } from '@/lib/authContext';

interface AccountModalProps {
  onClose: () => void;
}

export default function AccountModal({ onClose }: AccountModalProps) {
  const { profile, session, signOut } = useAuth();

  if (!session || !profile) {
    return (
      <ModalShell title="Mi cuenta" onClose={onClose}>
        <p className="text-sm text-black/70">Cargando tu perfil...</p>
      </ModalShell>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

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

        <button type="button" onClick={handleSignOut} className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
          Cerrar sesión
        </button>
      </div>
    </ModalShell>
  );
}
