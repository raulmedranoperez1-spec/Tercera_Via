import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { describeError } from '@/lib/edgeFunctions';

interface AdminLoginFormProps {
  onLogin: (token: string, username: string, mustChangePassword: boolean) => void;
}

const fieldClass = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#a87945]';

export default function AdminLoginForm({ onLogin }: AdminLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.login(cleanUsername, password);
      onLogin(response.token, cleanUsername, response.mustChangePassword);
    } catch (err) {
      setError(describeError(err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <label className="block text-sm font-medium text-black/70">
        Usuario
        <input type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={`mt-1.5 ${fieldClass}`} />
      </label>
      <label className="block text-sm font-medium text-black/70">
        Contraseña
        <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`mt-1.5 ${fieldClass}`} />
      </label>
      {error && <p role="alert" className="text-sm text-accent-err">{error}</p>}
      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-60">
        <LogIn size={17} />
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
