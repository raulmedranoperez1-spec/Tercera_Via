import { useState, type FormEvent } from 'react';
import { LogIn, Mail, UserPlus } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

interface AuthModalProps {
  initialMode: Mode;
  onClose: () => void;
}

function describeError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (/already registered/i.test(message)) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  if (/rate limit/i.test(message)) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (/password.*weak|at least 6/i.test(message)) return 'La contraseña debe tener al menos 6 caracteres.';
  return 'No se pudo completar la operación. Revisa tus datos e inténtalo de nuevo.';
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleSignUp = async (trimmedEmail: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { display_name: trimmedName } },
    });
    if (signUpError) return describeError(signUpError.message);
    if (!data.session) return 'Tu cuenta se ha creado, pero no se pudo iniciar sesión. Inténtalo desde "Iniciar sesión".';
    return null;
  };

  const handleSignIn = async (trimmedEmail: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    if (signInError) return describeError(signInError.message);
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const trimmedEmail = email.trim().toLowerCase();

    const failure = mode === 'signup' ? await handleSignUp(trimmedEmail) : await handleSignIn(trimmedEmail);
    setSubmitting(false);
    if (failure) {
      setError(failure);
      return;
    }
    onClose();
  };

  const title = mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta';

  return (
    <ModalShell title={title} onClose={onClose}>
      {mode === 'signup' && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-[#704c12]/30 bg-[#704c12]/5 px-3 py-2.5 text-xs leading-relaxed text-[#5d432c]">
          <Mail size={16} className="mt-0.5 shrink-0" />
          <span>
            Con un correo @us.es o @alum.us.es tendrás el rol de colaborador para publicar trabajos.
            Con cualquier otro correo serás lector.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <label className="block text-sm font-medium text-black/70">
            Nombre
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className={inputClass}
              placeholder="Tu nombre visible"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-black/70">
          Correo electrónico
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className={inputClass}
            placeholder="nombre@alum.us.es"
          />
        </label>

        <label className="block text-sm font-medium text-black/70">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {mode === 'signup' && (
          <label className="block text-sm font-medium text-black/70">
            Confirmar contraseña
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className={inputClass}
              placeholder="Repite la contraseña"
            />
          </label>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60"
        >
          {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
          {submitting
            ? 'Procesando...'
            : mode === 'login'
              ? 'Iniciar sesión'
              : 'Registrarse'}
        </button>

        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-sm text-black/60 underline underline-offset-4 hover:text-black"
        >
          {mode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
        </button>
      </form>
    </ModalShell>
  );
}
