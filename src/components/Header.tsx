import { useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen, ChevronDown, LogIn, LogOut, UserPlus, X, BadgeCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import BrandLogo from '@/components/BrandLogo';

interface MenuItem {
  label: string;
  href?: string;
}

type Modal = 'project' | 'auth' | null;
type AuthMode = 'login' | 'signup';

const formatItems: MenuItem[] = [
  { label: 'Artículos', href: '#formatos' },
  { label: 'Ensayos', href: '#formatos' },
  { label: 'Entrevistas', href: '#formatos' },
  { label: 'Podcast', href: '#formatos' },
  { label: 'Reportajes', href: '#formatos' },
];

const styleItems: MenuItem[] = [
  { label: 'Normas de escritura', href: '#apoyo' },
  { label: 'Código deontológico', href: '#apoyo' },
];

const subscriptionItems = ['Socio Mensual', 'Básica', 'Media', 'Premium', 'Premium + Socio'];

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const { user, email: userEmail, isCollaborator, loading: authLoading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpenMenu(null);
  };

  const closeModal = () => {
    setModal(null);
    setAuthMessage('');
    setAuthError('');
    setEmail('');
    setPassword('');
  };

  const scrollTo = (href: string) => {
    setOpenMenu(null);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setOpenMenu(null);
    setModal('auth');
    setAuthMessage('');
    setAuthError('');
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setAuthError('No se pudo completar la operación. Revisa tus datos e inténtalo de nuevo.');
      return;
    }

    setAuthMessage(authMode === 'login'
      ? 'Has iniciado sesión correctamente.'
      : 'Tu cuenta se ha creado correctamente.');
    setPassword('');

    setTimeout(() => closeModal(), 1200);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-graphite bg-brand-earth text-brand-paper shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex justify-center pt-3">
          <a
            href="#"
            onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="transition-opacity hover:opacity-80"
            aria-label="Volver al inicio"
          >
            <BrandLogo />
          </a>
        </div>

        <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'formatos' ? null : 'formatos')}
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-sand transition-colors hover:bg-brand-graphite hover:text-brand-white sm:px-3 sm:text-sm"
                aria-expanded={openMenu === 'formatos'}
              >
                Formatos
                <ChevronDown size={15} className={`transition-transform ${openMenu === 'formatos' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'formatos' && (
                <Dropdown items={formatItems} onSelect={scrollTo} />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'estilo' ? null : 'estilo')}
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-sand transition-colors hover:bg-brand-graphite hover:text-brand-white sm:px-3 sm:text-sm"
                aria-expanded={openMenu === 'estilo'}
              >
                Libro de estilo
                <ChevronDown size={15} className={`transition-transform ${openMenu === 'estilo' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'estilo' && (
                <Dropdown items={styleItems} onSelect={scrollTo} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {!authLoading && user ? (
              <div className="flex items-center gap-2">
                {isCollaborator && (
                  <span className="hidden items-center gap-1 rounded-full bg-brand-sand/20 px-2.5 py-1 text-xs font-semibold text-brand-sand sm:flex">
                    <BadgeCheck size={13} />
                    Colaborador
                  </span>
                )}
                <span className="hidden max-w-[160px] truncate text-xs text-brand-paper/70 sm:block">
                  {userEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-paper/90 transition-colors hover:bg-brand-graphite hover:text-brand-white sm:px-3 sm:text-sm"
                >
                  <LogOut size={14} />
                  Salir
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="hidden rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-paper/90 transition-colors hover:bg-brand-graphite hover:text-brand-white sm:block sm:px-3 sm:text-sm"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="hidden rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-paper/90 transition-colors hover:bg-brand-graphite hover:text-brand-white sm:block sm:px-3 sm:text-sm"
                >
                  Crear cuenta
                </button>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'suscripcion' ? null : 'suscripcion')}
                className="flex items-center gap-1 rounded-md bg-brand-sand px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-paper sm:px-4 sm:text-sm"
                aria-expanded={openMenu === 'suscripcion'}
              >
                Suscríbete
                <ChevronDown size={15} className={`transition-transform ${openMenu === 'suscripcion' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'suscripcion' && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-brand-sand/20 bg-brand-graphite p-2 shadow-2xl">
                  {subscriptionItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollTo('#apoyo')}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-brand-paper/90 transition-colors hover:bg-brand-earth hover:text-brand-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-brand-graphite py-2 sm:justify-between">
          <button
            onClick={() => setModal('project')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-sand transition-colors hover:bg-brand-graphite hover:text-brand-white"
          >
            Sobre el proyecto
          </button>
          <div className="flex gap-2 sm:hidden">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-brand-paper/90 hover:bg-brand-graphite">
                <LogOut size={12} />
                Salir
              </button>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="rounded-md px-2 py-1.5 text-xs text-brand-paper/90 hover:bg-brand-graphite">Iniciar sesión</button>
                <button onClick={() => openAuth('signup')} className="rounded-md px-2 py-1.5 text-xs text-brand-paper/90 hover:bg-brand-graphite">Crear cuenta</button>
              </>
            )}
          </div>
        </div>
      </div>

      {modal === 'project' && (
        <ModalShell title="Sobre el proyecto" onClose={closeModal}>
          <div className="space-y-5 text-sm leading-relaxed text-black/70">
            <section>
              <h3 className="font-serif text-xl font-semibold text-black">Nuestro objetivo</h3>
              <p className="mt-2">Queremos ofrecer un periodismo independiente, riguroso y útil que ayude a comprender la actualidad sin ruido ni polarización.</p>
            </section>
            <section>
              <h3 className="font-serif text-xl font-semibold text-black">Qué proponemos</h3>
              <p className="mt-2">Contrastamos marcos informativos, verificamos los hechos y acercamos las fuentes primarias para que cada persona pueda formarse su propia opinión.</p>
            </section>
            <section>
              <h3 className="font-serif text-xl font-semibold text-black">Quiénes somos</h3>
              <p className="mt-2">Somos estudiantes de Periodismo de la Facultad de Comunicación de la Universidad de Sevilla, unidos por la voluntad de construir un medio joven y responsable.</p>
            </section>
          </div>
        </ModalShell>
      )}

      {modal === 'auth' && (
        <ModalShell title={authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} onClose={closeModal}>
          <form onSubmit={handleAuth} className="space-y-4">
            <label className="block text-sm font-medium text-black/70">
              Correo electrónico
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-black/15 px-4 py-3 text-black outline-none focus:border-[#a87945]" placeholder="tu@correo.com" />
            </label>
            <label className="block text-sm font-medium text-black/70">
              Contraseña
              <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-black/15 px-4 py-3 text-black outline-none focus:border-[#a87945]" placeholder="Mínimo 6 caracteres" />
            </label>
            {authError && <p className="text-sm text-red-700">{authError}</p>}
            {authMessage && <p className="text-sm text-green-700">{authMessage}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
              {authMode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
              {authMode === 'login' ? 'Entrar' : 'Registrarme'}
            </button>
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-sm text-black/60 underline underline-offset-4 hover:text-black">
              {authMode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          </form>
        </ModalShell>
      )}
    </header>
  );
}

function Dropdown({ items, onSelect }: { items: MenuItem[]; onSelect: (href: string) => void }) {
  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-brand-sand/20 bg-brand-graphite p-2 shadow-2xl">
      {items.map((item) => (
        <button key={item.label} onClick={() => item.href && onSelect(item.href)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-brand-paper/90 transition-colors hover:bg-brand-earth hover:text-brand-white">
          <BookOpen size={15} className="text-brand-sand" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#f7f1e7] p-6 shadow-2xl sm:p-8">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-black/50 transition-colors hover:bg-black/10 hover:text-black" aria-label="Cerrar">
          <X size={20} />
        </button>
        <h2 className="mb-6 pr-8 font-serif text-3xl font-semibold text-black">{title}</h2>
        {children}
      </div>
    </div>
  );
}
