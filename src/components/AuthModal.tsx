import { useState, type FormEvent } from 'react';
import { LogIn, Mail, UserPlus, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { supabase } from '@/lib/supabase';

async function sendEmailNotification(type: 'welcome' | 'password_changed' | 'verification_reminder'): Promise<boolean> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return false;
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type Mode = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  initialMode: Mode;
  onClose: () => void;
}

function describeError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (/already registered/i.test(message)) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  if (/rate limit/i.test(message)) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (/password.*weak|at least 6/i.test(message)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/confirm your email/i.test(message)) return 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja.';
  return 'No se pudo completar la operación. Revisa tus datos e inténtalo de nuevo.';
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';
const INSTITUTIONAL_DOMAIN = '@alum.us.es';

function isInstitutional(email: string): boolean {
  return email.trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');

  const institutional = isInstitutional(email);
  const requirePassword = mode === 'forgot' ? false : !institutional;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const handleForgot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setError('Introduce un correo válido.');
      setSubmitting(false);
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/#/recuperar`,
    });
    setSubmitting(false);
    if (resetError) {
      setError(describeError(resetError.message));
      return;
    }
    setInfo('Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña. Revisa tu bandeja y la carpeta de spam.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    const trimmedEmail = email.trim().toLowerCase();

    if (mode === 'forgot') {
      await handleForgot(event);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Introduce un correo válido.');
      setSubmitting(false);
      return;
    }

    if (institutional) {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email: trimmedEmail });
      setSubmitting(false);
      if (otpError) {
        setError(describeError(otpError.message));
        return;
      }
      setPendingEmail(trimmedEmail);
      setCode('');
      setOtpStep(true);
      return;
    }

    if (mode === 'signup') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        setError('El nombre debe tener al menos 2 caracteres.');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setSubmitting(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { display_name: trimmedName },
          emailRedirectTo: window.location.origin,
        },
      });
      setSubmitting(false);
      if (signUpError) {
        setError(describeError(signUpError.message));
        return;
      }
      if (data.user && !data.session) {
        setInfo('Cuenta creada. Te hemos enviado un correo de confirmación. Ábrelo para verificar tu cuenta y empezar a usarla.');
        return;
      }
      // Session created immediately (email confirmation off) — send welcome email
      if (data.session) {
        await sendEmailNotification('welcome');
      }
      onClose();
      return;
    }

    // login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(describeError(signInError.message));
      return;
    }
    // Send welcome email on first login if email was just confirmed
    if (signInData.user) {
      const confirmedRecently = signInData.user.email_confirmed_at
        && Date.now() - new Date(signInData.user.email_confirmed_at).getTime() < 5 * 60 * 1000;
      if (confirmedRecently) {
        void sendEmailNotification('welcome');
      }
    }
    onClose();
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setError('');
    setInfo('');
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setError('Introduce un correo válido.');
      setResendingVerification(false);
      return;
    }
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: trimmedEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    setResendingVerification(false);
    if (resendError) {
      setError(describeError(resendError.message));
      return;
    }
    setInfo('Te hemos reenviado el correo de confirmación. Revisa tu bandeja y la carpeta de spam.');
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    if (!/^\d{6}$/.test(code)) {
      setError('El código tiene 6 dígitos.');
      return;
    }
    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: code,
      type: 'email',
    });
    setSubmitting(false);
    if (verifyError) {
      setError('El código no es correcto o ha caducado. Revisa tu correo o pide uno nuevo.');
      return;
    }
    onClose();
  };

  const handleResendCode = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: pendingEmail });
    setSubmitting(false);
    if (otpError) {
      setError(describeError(otpError.message));
      return;
    }
    setInfo('Te hemos reenviado el código. Revisa tu bandeja y la carpeta de spam.');
  };

  const title = mode === 'login' ? 'Iniciar sesión' : mode === 'signup' ? 'Crear cuenta' : 'Recuperar contraseña';

  if (otpStep) {
    return (
      <ModalShell title="Introduce tu código" onClose={onClose}>
        <p className="mb-5 text-sm leading-relaxed text-black/70">
          Hemos enviado un código de 6 dígitos a <span className="font-medium text-black">{pendingEmail}</span>.
          Introdúcelo aquí para entrar en tu cuenta.
        </p>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <label className="block text-sm font-medium text-black/70">
            Código de verificación
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); setInfo(''); }}
              className={`${inputClass} text-center font-serif text-2xl tracking-[0.5em]`}
              placeholder="000000"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60"
          >
            <KeyRound size={17} />
            {submitting ? 'Verificando...' : 'Verificar y entrar'}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={submitting}
            className="w-full text-sm text-black/60 underline underline-offset-4 hover:text-black disabled:opacity-60"
          >
            Reenviar código
          </button>
          <button
            type="button"
            onClick={() => { setOtpStep(false); setCode(''); setError(''); setInfo(''); }}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-black/60 underline underline-offset-4 hover:text-black"
          >
            <ArrowLeft size={14} /> Cambiar correo
          </button>
        </form>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={title} onClose={onClose}>
      {mode === 'forgot' ? (
        <p className="mb-5 text-sm leading-relaxed text-black/70">
          Introduce tu correo y te enviaremos un enlace para establecer una nueva contraseña.
          Por seguridad, no indicamos si el correo está registrado.
        </p>
      ) : (
        <p className="mb-5 text-sm leading-relaxed text-black/70">
          Con un correo institucional (@alum.us.es) recibirás un código de 6 dígitos en tu correo
          y se te asignará el rol de colaborador para publicar trabajos. Con cualquier otro correo
          serás lector o suscriptor.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && !institutional && (
          <label className="block text-sm font-medium text-black/70">
            Nombre
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); setInfo(''); }}
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
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); setInfo(''); }}
            className={inputClass}
            placeholder="nombre@alum.us.es"
          />
        </label>

        {institutional && mode !== 'forgot' && (
          <div className="flex items-start gap-2 rounded-lg border border-[#704c12]/30 bg-[#704c12]/5 px-3 py-2.5 text-xs leading-relaxed text-[#5d432c]">
            <Mail size={16} className="mt-0.5 shrink-0" />
            <span>
              Por seguridad, con el correo institucional no usas contraseña: te enviaremos un
              código de 6 dígitos a esa dirección.
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
              onChange={(e) => { setPassword(e.target.value); setError(''); setInfo(''); }}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
          </label>
        )}

        {mode === 'signup' && requirePassword && (
          <label className="block text-sm font-medium text-black/70">
            Confirmar contraseña
            <input
              type="password"
              required={mode === 'signup'}
              minLength={6}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); setInfo(''); }}
              className={inputClass}
              placeholder="Repite la contraseña"
            />
          </label>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}

        {mode === 'login' && /confirm your email/i.test(info) && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-[#704c12] underline underline-offset-4 hover:text-[#5d432c] disabled:opacity-60"
          >
            {resendingVerification ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            Reenviar correo de confirmación
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60"
        >
          {mode === 'forgot' ? (
            <><KeyRound size={17} />{submitting ? 'Enviando...' : 'Enviar enlace de recuperación'}</>
          ) : institutional ? (
            <><Mail size={17} />{submitting ? 'Procesando...' : 'Enviarme un código'}</>
          ) : mode === 'login' ? (
            <><LogIn size={17} />{submitting ? 'Procesando...' : 'Entrar'}</>
          ) : (
            <><UserPlus size={17} />{submitting ? 'Procesando...' : 'Registrarme'}</>
          )}
        </button>

        {mode === 'forgot' ? (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-black/60 underline underline-offset-4 hover:text-black"
          >
            <ArrowLeft size={14} /> Volver a iniciar sesión
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="w-full text-sm text-black/60 underline underline-offset-4 hover:text-black"
            >
              {mode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="w-full text-sm text-black/50 underline underline-offset-4 hover:text-black"
              >
                He olvidado mi contraseña
              </button>
            )}
          </>
        )}
      </form>
    </ModalShell>
  );
}
