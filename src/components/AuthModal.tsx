import { useState, type FormEvent } from 'react';
import { X, Mail, Lock, User as UserIcon, GraduationCap, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, determineRole } from '@/context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const reset = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Rellena todos los campos.');
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setError(error);
        return;
      }
      handleClose();
    } else {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName || undefined);
      setLoading(false);
      if (error) {
        setError(error);
        return;
      }
      setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
      setMode('login');
      setPassword('');
    }
  };

  const fillDemo = (role: 'creador' | 'lector') => {
    if (role === 'creador') {
      setEmail('demo.creador@alum.us.es');
      setPassword('demo1234');
    } else {
      setEmail('demo.lector@gmail.com');
      setPassword('demo1234');
    }
    setMode('login');
    setError('');
    setSuccess('');
  };

  const currentRole = email ? determineRole(email) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-paper-400/60 bg-paper-50 p-8 shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-paper-300 hover:text-ink-700"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Toggle */}
        <div className="mb-6 flex rounded-xl bg-paper-200 p-1">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === 'login' ? 'bg-paper-50 text-earth-900 shadow-sm' : 'text-ink-500'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === 'signup' ? 'bg-paper-50 text-earth-900 shadow-sm' : 'text-ink-500'
            }`}
          >
            Registrarte
          </button>
        </div>

        <h2 className="mb-1 font-serif text-2xl font-semibold text-earth-900">
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </h2>
        <p className="mb-6 text-sm text-ink-500">
          {mode === 'login'
            ? 'Accede para participar en la comunidad y publicar.'
            : 'Regístrate para leer, comentar y (si eres de la US) publicar.'}
        </p>

        {/* Role indicator */}
        {currentRole && email && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
            currentRole === 'creador'
              ? 'bg-accent-ok/10 text-accent-ok'
              : 'bg-earth-800/10 text-earth-800'
          }`}>
            {currentRole === 'creador' ? <GraduationCap size={16} /> : <BookOpen size={16} />}
            Rol detectado: {currentRole === 'creador' ? 'Creador / Alumno FCOM' : 'Lector'}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-accent-ok/10 px-3 py-2 text-sm text-accent-ok">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-accent-err/10 px-3 py-2 text-sm text-accent-err">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600">Nombre</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600">Correo electrónico</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
              />
            </div>
            <p className="mt-1 text-xs text-ink-400">
              Usa <code className="rounded bg-paper-200 px-1">@alum.us.es</code> para rol Creador.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-paper-400 bg-paper-100 py-3 pl-11 pr-4 text-base text-ink-800 outline-none transition-all focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-earth-800 px-5 py-3.5 text-base font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900 hover:shadow-md disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        {/* Demo logins */}
        <div className="mt-6 border-t border-paper-400/50 pt-4">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-ink-400">
            Acceso rápido demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemo('creador')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-paper-400 bg-paper-100 px-3 py-2 text-xs font-medium text-earth-800 transition-all hover:bg-paper-300"
            >
              <GraduationCap size={14} />
              Creador US
            </button>
            <button
              onClick={() => fillDemo('lector')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-paper-400 bg-paper-100 px-3 py-2 text-xs font-medium text-ink-600 transition-all hover:bg-paper-300"
            >
              <BookOpen size={14} />
              Lector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
