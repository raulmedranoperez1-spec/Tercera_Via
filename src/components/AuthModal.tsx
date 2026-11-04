import { useState, type FormEvent } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
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
  return 'No se pudo completar la operación. Revisa tus datos e inténtalo de nuevo.';
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    const credentials = { email: email.trim(), password };

    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
      setSubmitting(false);
      if (signInError) {
        setError(describeError(signInError.message));
        return;
      }
      onClose();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp(credentials);
    setSubmitting(false);
    if (signUpError) {
      setError(describeError(signUpError.message));
      return;
    }
    if (!data.session) {
      setInfo('Revisa tu correo para confirmar la cuenta.');
      return;
    }
    onClose();
  };

  return (
    <ModalShell title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} onClose={onClose}>
      <p className="mb-5 text-sm leading-relaxed text-black/70">
        Con un correo institucional (@alum.us.es o @us.es) tendrás el rol Alumno / Creador y podrás
        publicar tus trabajos. Con cualquier otro correo serás Lector / Suscriptor.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-black/70">
          Correo electrónico
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu@correo.com" />
        </label>
        <label className="block text-sm font-medium text-black/70">
          Contraseña
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Mínimo 6 caracteres" />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}
        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60">
          {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
          {submitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
        </button>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="w-full text-sm text-black/60 underline underline-offset-4 hover:text-black">
          {mode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
        </button>
      </form>
    </ModalShell>
  );
}
