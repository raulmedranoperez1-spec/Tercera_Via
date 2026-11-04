import { useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen, ChevronDown, LogIn, Mail, UserPlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  label: string;
  href?: string;
}

type Modal = 'project' | 'contact' | 'auth' | null;
type AuthMode = 'login' | 'signup';

const formatItems: MenuItem[] = [
  { label: 'Artículos', href: '#formatos' },
  { label: 'Ensayos', href: '#formatos' },
  { label: 'Entrevistas', href: '#formatos' },
  { label: 'Podcast', href: '#formatos' },
  { label: 'Reportajes', href: '#formatos' },
];

const styleItems: MenuItem[] = [
  { label: 'Normas de escritura', href: '#sobre-nosotros' },
  { label: 'Código deontológico', href: '#sobre-nosotros' },
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
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactText, setContactText] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');

  const closeModal = () => {
    setModal(null);
    setAuthMessage('');
    setAuthError('');
    setEmail('');
    setPassword('');
    setContactName('');
    setContactEmail('');
    setContactText('');
    setContactMessage('');
    setContactError('');
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

  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactError('');
    setContactMessage('');

    const { error } = await supabase.from('contact_messages').insert({
      name: contactName.trim(),
      email: contactEmail.trim(),
      message: contactText.trim(),
    });

    if (error) {
      setContactError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
      return;
    }

    setContactMessage('Gracias. Hemos recibido tu mensaje y te responderemos pronto.');
    setContactName('');
    setContactEmail('');
    setContactText('');
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
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-black text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'formatos' ? null : 'formatos')}
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[#a87945] transition-colors hover:bg-white/10 hover:text-[#d6ae79] sm:px-3 sm:text-sm"
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
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[#a87945] transition-colors hover:bg-white/10 hover:text-[#d6ae79] sm:px-3 sm:text-sm"
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

          <a
            href="#"
            onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="order-first flex items-center gap-2 transition-opacity hover:opacity-80 sm:order-none"
            aria-label="Volver al inicio"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a87945] font-serif text-xl font-semibold text-black shadow-sm">3</span>
          </a>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => openAuth('login')}
              className="hidden rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:block sm:px-3 sm:text-sm"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="hidden rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:block sm:px-3 sm:text-sm"
            >
              Crear cuenta
            </button>
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'suscripcion' ? null : 'suscripcion')}
                className="flex items-center gap-1 rounded-md bg-[#a87945] px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-black transition-colors hover:bg-[#d6ae79] sm:px-4 sm:text-sm"
                aria-expanded={openMenu === 'suscripcion'}
              >
                Suscríbete
                <ChevronDown size={15} className={`transition-transform ${openMenu === 'suscripcion' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'suscripcion' && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#161616] p-2 shadow-2xl">
                  {subscriptionItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollTo('#apoyo')}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 py-2 sm:justify-between">
          <button
            onClick={() => setModal('project')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#a87945] transition-colors hover:bg-white/10 hover:text-[#d6ae79]"
          >
            Sobre el proyecto
          </button>
          <button
            onClick={() => setModal('contact')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#a87945] transition-colors hover:bg-white/10 hover:text-[#d6ae79]"
          >
            Contacto
          </button>
          <div className="flex gap-2 sm:hidden">
            <button onClick={() => openAuth('login')} className="rounded-md px-2 py-1.5 text-xs text-white/75 hover:bg-white/10">Iniciar sesión</button>
            <button onClick={() => openAuth('signup')} className="rounded-md px-2 py-1.5 text-xs text-white/75 hover:bg-white/10">Crear cuenta</button>
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

      {modal === 'contact' && (
        <ModalShell title="Contacto" onClose={closeModal}>
          <form onSubmit={handleContact} className="space-y-4">
            <p className="text-sm leading-relaxed text-black/70">¿Tienes una propuesta, una duda o quieres colaborar con nosotros?</p>
            <input type="text" required maxLength={120} value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Tu nombre" className="w-full rounded-lg border border-black/15 px-4 py-3 text-black outline-none focus:border-[#a87945]" />
            <input type="email" required maxLength={320} value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="tu@correo.com" className="w-full rounded-lg border border-black/15 px-4 py-3 text-black outline-none focus:border-[#a87945]" />
            <textarea required maxLength={5000} value={contactText} onChange={(event) => setContactText(event.target.value)} placeholder="Escribe tu mensaje" rows={5} className="w-full resize-none rounded-lg border border-black/15 px-4 py-3 text-black outline-none focus:border-[#a87945]" />
            {contactError && <p className="text-sm text-red-700">{contactError}</p>}
            {contactMessage && <p className="text-sm text-green-700">{contactMessage}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black">
              <Mail size={17} />
              Enviar mensaje
            </button>
          </form>
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
    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#161616] p-2 shadow-2xl">
      {items.map((item) => (
        <button key={item.label} onClick={() => item.href && onSelect(item.href)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
          <BookOpen size={15} className="text-[#a87945]" />
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
