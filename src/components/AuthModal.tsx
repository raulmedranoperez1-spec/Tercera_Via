import { useState, type FormEvent } from 'react';
import { GraduationCap, BookOpen, Loader2, X } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';

interface AuthModalProps {
  initialMode: 'login' | 'signup';
  onClose: () => void;
}

function describeAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : '';
  if (/already registered/i.test(msg)) return 'Ya existe una cuenta con este correo. Inicia sesión.';
  if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
  if (/rate limit/i.test(msg)) return 'Demasiados intentos. Espera unos minutos.';
  if (/password/i.test(msg) && /short|weak|at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.';
  return msg || 'No se pudo completar la operación. Inténtalo de nuevo.';
}

function isUniversityEmail(addr: string): boolean {
  const clean = addr.trim().toLowerCase();
  return clean.endsWith('@alum.us.es') || clean.endsWith('@us.es');
}

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }
    if (mode === 'signup') {
      if (name.trim().length < 2) {
        setError('Escribe tu nombre y apellidos.');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirm) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) throw signInError;
      }
      await refreshProfile();
      onClose();
    } catch (err) {
      setError(describeAuthError(err));
      setLoading(false);
    }
  };

  return (
    <ModalShell title={mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-black/70">
          Usa tu correo <strong>@alum.us.es</strong> o <strong>@us.es</strong> para obtener el rol de redactor.
          Con cualquier otro correo tendrás el rol de lector.
        </p>

        {email && (
          <div className="flex items-center gap-2 rounded-lg bg-[#ebdbc6]/70 px-3 py-2 text-xs font-medium text-[#5d432c]">
            {isUniversityEmail(email) ? (
              <>
                <GraduationCap size={16} className="text-[#704c12]" />
                <span>Perfil detectado: <strong>Redactor / Alumno FCOM</strong></span>
              </>
            ) : (
              <>
                <BookOpen size={16} />
                <span>Perfil detectado: <strong>Lector</strong></span>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nombre y apellidos
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Laura Gómez"
                className="mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[#704c12]"
              />
            </label>
          )}

          <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@alum.us.es"
              className="mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[#704c12]"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
            Contraseña
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[#704c12]"
            />
          </label>

          {mode === 'signup' && (
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
              Confirmar contraseña
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[#704c12]"
              />
            </label>
          )}

          {error && <p role="alert" className="text-sm text-accent-err">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#704c12] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5d432c] disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signup' ? 'Completar registro' : 'Entrar'}
          </button>
        </form>

        <div className="text-center text-xs text-black/60">
          <button
            type="button"
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
            className="underline hover:text-[#704c12]"
          >
            {mode === 'signup' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
