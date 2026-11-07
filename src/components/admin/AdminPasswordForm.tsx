import { useState, type FormEvent } from 'react';
import { ShieldCheck } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { describeError } from '@/lib/edgeFunctions';

const MIN_PASSWORD_LENGTH = 10;

interface AdminPasswordFormProps {
  token: string;
  provisional: boolean;
  onChanged: (token: string) => void;
}

const fieldClass = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

export default function AdminPasswordForm({ token, provisional, onChanged }: AdminPasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await adminApi.changePassword(token, currentPassword, newPassword);
      onChanged(response.token);
    } catch (err) {
      setError(describeError(err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-black/70">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-earth-700" />
        {provisional
          ? 'Por seguridad, cambia la contraseña provisional antes de continuar.'
          : `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres. Al cambiarla, se cerrarán las sesiones abiertas en otros dispositivos.`}
      </p>
      <label className="block text-sm font-medium text-black/70">
        Contraseña actual
        <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`mt-1.5 ${fieldClass}`} />
      </label>
      <label className="block text-sm font-medium text-black/70">
        Nueva contraseña
        <input type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`mt-1.5 ${fieldClass}`} />
      </label>
      <label className="block text-sm font-medium text-black/70">
        Repite la nueva contraseña
        <input type="password" autoComplete="new-password" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} className={`mt-1.5 ${fieldClass}`} />
      </label>
      {error && <p role="alert" className="text-sm text-accent-err">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60">
        {loading ? 'Guardando...' : 'Guardar contraseña'}
      </button>
    </form>
  );
}
