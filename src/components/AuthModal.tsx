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
  return 'No se pudo completar la operación. Revisa tus datos e inténtalo de nuevo.';
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';
const INSTITUTIONAL_DOMAIN = '@alum.us.es';

function isInstitutional(email: string): boolean {
  return email.trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);
}

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const institutional = isInstitutional(email);
  const requirePassword = !institutional;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    const trimmedEmail = email.trim().toLowerCase();

    if (institutional) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: { emailRedirectTo: window.location.origin },
      });
      setSubmitting(false);
      if (otpError) {
        setError(describeError(otpError.message));
        return;
      }
      setInfo(
        mode === 'login'
          ? 'Te hemos enviado un enlace de acceso a tu correo institucional. Ábrelo para entrar.'
          : 'Te hemos enviado un enlace de verificación a tu correo institucional. Ábrelo para activar tu cuenta de colaborador.'
      );
      return;
    }

    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      setSubmitting(false);
      if (signInError) {
        setError(describeError(signInError.message));
        return;
      }
      onClose();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });
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
        Con un correo institucional (@alum.us.es) recibirás un enlace de verificación en tu correo
        y se te asignará el rol de colaborador para publicar trabajos. Con cualquier otro correo
        serás lector o suscriptor.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-black/70">
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); setInfo(''); }}
            className={inputClass}
            placeholder="nombre@alum.us.es"
          />
        </label>

        {institutional && (
          <div className="flex items-start gap-2 rounded-lg border border-[#704c12]/30 bg-[#704c12]/5 px-3 py-2.5 text-xs leading-relaxed text-[#5d432c]">
            <Mail size={16} className="mt-0.5 shrink-0" />
            <span>
              Por seguridad, con el correo institucional no usas contraseña: te enviaremos un
              enlace de acceso único a esa dirección.
            </span>
          </div>
        )}

        {requirePassword && (
          <label className="block text-sm font-medium text-black/70">
            Contraseña
            <input
              type="password"
              required={requirePassword}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
          </label>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60"
        >
          {institutional ? <Mail size={17} /> : mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
          {submitting
            ? 'Procesando...'
            : institutional
              ? 'Enviar enlace al mi correo'
              : mode === 'login' ? 'Entrar' : 'Registrarme'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }}
          className="w-full text-sm text-black/60 underline underline-offset-4 hover:text-black"
        >
          {mode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
        </button>
      </form>
    </ModalShell>
  );
}
