import React, { useState } from 'react';
import { X, CheckCircle2, GraduationCap, BookOpen, MailCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { name: string; email: string; role: 'Alumno FCOM' | 'Lector' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [verificationSent, setVerificationSent] = useState(false);
  
  if (!isOpen) return null;

  const isUniversityEmail = (addr: string) => {
    const clean = addr.trim().toLowerCase();
    return clean.endsWith('@alum.us.es') || clean.endsWith('@us.es');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password.trim() || (isRegister && !name.trim())) {
    setError('Por favor, completa todos los campos.');
    return;
  }
setLoading(true);

  try {
    const wantsStudentRole = isUniversityEmail(cleanEmail);
    const displayName = name.trim() || cleanEmail.split('@')[0];

    if (isRegister) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: displayName,
            requested_role: wantsStudentRole ? 'Alumno FCOM' : 'Lector',
          },
        },
      });

      if (signUpError) throw signUpError;

      const isConfirmed = Boolean(data.user?.email_confirmed_at);

      if (!isConfirmed) {
        setVerificationSent(true);
        setLoading(false);
        return;
      }

      onAuthSuccess({
        name: displayName,
        email: cleanEmail,
        role: wantsStudentRole ? 'Alumno FCOM' : 'Lector',
      });
      onClose();
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const isConfirmed = Boolean(data.user.email_confirmed_at);
        const assignedRole: 'Alumno FCOM' | 'Lector' =
          wantsStudentRole && isConfirmed ? 'Alumno FCOM' : 'Lector';

        onAuthSuccess({
          name: data.user.user_metadata?.full_name || displayName,
          email: cleanEmail,
          role: assignedRole,
        });
        onClose();
      }
    }
  } catch (err: any) {
    setError(err?.message || 'No se pudo completar la operación.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl bg-[#f8f3e9] border border-[#704c12]/30 p-6 shadow-2xl text-[#5d432c]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-[#ebdbc6] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {verificationSent ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#704c12]/10 text-[#704c12]">
              <MailCheck className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold">Revisa tu correo institucional</h3>
            <p className="text-sm opacity-90">
              Hemos enviado un enlace de verificación a <strong>{email}</strong>.
              Ábrelo desde Outlook (revisa también <em>Correo no deseado</em>) para activar tu cuenta de <strong>Alumno FCOM</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setVerificationSent(false);
                onClose();
              }}
              className="w-full rounded-lg bg-[#5d432c] px-4 py-2.5 text-sm font-medium text-[#f8f3e9] hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            
        <h2 className="font-serif text-2xl font-bold text-[#704c12] mb-1">
          {isRegister ? 'Crear cuenta en La Tercera Vía' : 'Iniciar Sesión'}
        </h2>
        <p className="text-sm text-[#5d432c]/80 mb-5">
          Usa tu correo <span className="font-semibold">@alum.us.es</span> para perfil de Redactor FCOM o cualquier correo como Lector.
        </p>

        {email && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#ebdbc6]/70 px-3 py-2 text-xs font-medium">
            {isUniversityEmail(email) ? (
              <>
                <GraduationCap className="h-4 w-4 text-[#704c12]" />
                <span>Perfil detectado: <strong>Alumno FCOM / Redactor</strong></span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 text-[#5d432c]" />
                <span>Perfil detectado: <strong>Lector</strong></span>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Nombre y apellidos
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Laura Gómez"
                className="w-full rounded-lg border border-[#704c12]/30 bg-white px-3 py-2 text-sm focus:border-[#704c12] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@alum.us.es"
              className="w-full rounded-lg border border-[#704c12]/30 bg-white px-3 py-2 text-sm focus:border-[#704c12] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#704c12]/30 bg-white px-3 py-2 text-sm focus:border-[#704c12] focus:outline-none"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#704c12] py-2.5 text-sm font-semibold text-white hover:bg-[#5d432c] transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isRegister ? 'Completar registro' : 'Entrar ahora'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="underline hover:text-[#704c12]"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>           
          </>
        )}
        
      </div>
    </div>
  );
};
