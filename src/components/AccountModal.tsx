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
      import React, { useState } from 'react';

export default function FormularioSubida() {
  const [titulo, setTitulo] = useState('');
  const [enlace, setEnlace] = useState('');
  const [archivo, setArchivo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ titulo, enlace, archivo });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4">
      <h3 className="text-xl font-bold">Subir Proyecto FCOM</h3>
      
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input 
          type="text" 
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
          className="w-full border p-2 rounded" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Subir archivo / Galería</label>
        <input 
          type="file" 
          onChange={(e) => setArchivo(e.target.files[0])} 
          className="w-full text-sm text-gray-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium">O añade un enlace</label>
        <input 
          type="url" 
          value={enlace} 
          onChange={(e) => setEnlace(e.target.value)} 
          placeholder="https://..." 
          className="w-full border p-2 rounded" 
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Publicar
      </button>
    </form>
  );
      }
    </ModalShell>
  );
}
