import { useState, type FormEvent } from 'react';
import { KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { supabase } from '@/lib/supabase';

interface ResetPasswordModalProps {
  onClose: () => void;
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

export default function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber caducado. Solicita uno nuevo.');
      return;
    }

    // Notify the user by email that their password changed
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'password_changed' }),
      });
    } catch {
      // Non-blocking: the password did change; email is best-effort
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <ModalShell title="Contraseña actualizada" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={44} className="text-accent-ok" />
          <p className="text-sm leading-relaxed text-black/70">
            Tu contraseña se ha actualizado correctamente. Ya puedes iniciar sesión con ella.
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

  return (
    <ModalShell title="Nueva contraseña" onClose={onClose}>
      <p className="mb-5 text-sm leading-relaxed text-black/70">
        Introduce tu nueva contraseña. Por seguridad, usa al menos 6 caracteres.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-black/70">
          Nueva contraseña
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <label className="block text-sm font-medium text-black/70">
          Confirmar contraseña
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            className={inputClass}
            placeholder="Repite la nueva contraseña"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60"
        >
          {submitting ? <Loader2 size={17} className="animate-spin" /> : <KeyRound size={17} />}
          {submitting ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </ModalShell>
  );
}
