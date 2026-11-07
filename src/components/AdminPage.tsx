import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminPasswordForm from '@/components/admin/AdminPasswordForm';
import AdminPromptEditor from '@/components/admin/AdminPromptEditor';
import AdminDocumentsPanel from '@/components/admin/AdminDocumentsPanel';
import AdminAuditTester from '@/components/admin/AdminAuditTester';
import { ADMIN_TOKEN_STORAGE_KEY, adminApi, type AdminSession } from '@/lib/adminApi';
import { describeError } from '@/lib/edgeFunctions';

type AdminState =
  | { status: 'checking' }
  | { status: 'anonymous' }
  | { status: 'ready'; token: string; session: AdminSession };

const SECTIONS = [
  { id: 'prompt', label: 'Prompt de revisión' },
  { id: 'documents', label: 'Documentos' },
  { id: 'tester', label: 'Área de pruebas' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function readStoredToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

function storeToken(token: string | null) {
  if (token) sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  else sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export default function AdminPage() {
  const [state, setState] = useState<AdminState>({ status: 'checking' });
  const [section, setSection] = useState<SectionId>('prompt');
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    const stored = readStoredToken();
    if (!stored) {
      setState({ status: 'anonymous' });
      return;
    }
    let cancelled = false;
    adminApi
      .session(stored)
      .then((session) => {
        if (!cancelled) setState({ status: 'ready', token: stored, session });
      })
      .catch(() => {
        if (cancelled) return;
        storeToken(null);
        setState({ status: 'anonymous' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (token: string, username: string, mustChangePassword: boolean) => {
    storeToken(token);
    setSessionError('');
    setState({ status: 'ready', token, session: { username, mustChangePassword } });
  };

  const handleLogout = async () => {
    if (state.status !== 'ready') return;
    try {
      await adminApi.logout(state.token);
    } catch (err) {
      setSessionError(describeError(err));
    }
    storeToken(null);
    setState({ status: 'anonymous' });
  };

  const handlePasswordChanged = (token: string) => {
    storeToken(token);
    setState((prev) =>
      prev.status === 'ready'
        ? { ...prev, token, session: { ...prev.session, mustChangePassword: false } }
        : prev,
    );
  };

  if (state.status === 'checking') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-base text-ink-600">Comprobando sesión...</p>
      </div>
    );
  }

  if (state.status === 'anonymous') {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="mb-8 flex items-center gap-3 text-ink-900">
          <ShieldCheck size={28} className="text-earth-700" />
          <h1 className="font-serif text-3xl">Panel de administración</h1>
        </div>
        <AdminLoginForm onLogin={handleLogin} />
      </section>
    );
  }

  if (state.session.mustChangePassword) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="mb-6 space-y-2">
          <h1 className="font-serif text-3xl text-ink-900">Cambia tu contraseña</h1>
          <p className="text-sm leading-relaxed text-ink-600">
            Estás usando una contraseña provisional. Debes cambiarla antes de continuar.
          </p>
        </div>
        <AdminPasswordForm token={state.token} provisional onChanged={handlePasswordChanged} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-900/10 pb-6">
        <div>
          <p className="text-sm text-ink-600">Sesión iniciada como {state.session.username}</p>
          <h1 className="font-serif text-3xl text-ink-900">Panel de administración</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </header>

      {sessionError && <p role="alert" className="mt-4 text-sm text-accent-err">{sessionError}</p>}

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Secciones de administración">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            aria-current={section === item.id ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              section === item.id
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-900 hover:bg-ink-900/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {section === 'prompt' && <AdminPromptEditor token={state.token} />}
        {section === 'documents' && <AdminDocumentsPanel token={state.token} />}
        {section === 'tester' && <AdminAuditTester />}
      </div>

      <details className="mt-12 rounded-2xl bg-white p-6 shadow-sm">
        <summary className="cursor-pointer font-medium text-ink-900">Cambiar contraseña</summary>
        <div className="mt-6">
          <AdminPasswordForm token={state.token} provisional={false} onChanged={handlePasswordChanged} />
        </div>
      </details>
    </section>
  );
}
