import { useState } from 'react';
import { BookOpen, ChevronDown, LogOut, BadgeCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/lib/modalContext';
import { navigateTo, sectionHref, type SectionPath } from '@/lib/router';
import BrandLogo from '@/components/BrandLogo';
import ModalShell from '@/components/ModalShell';

interface MenuItem {
  label: string;
  path: SectionPath;
}

const formatItems: MenuItem[] = [
  { label: 'Artículos', path: '/escaner' },
  { label: 'Ensayos', path: '/escaner' },
  { label: 'Entrevistas', path: '/escaner' },
  { label: 'Podcast', path: '/escaner' },
  { label: 'Reportajes', path: '/escaner' },
];

const styleItems: MenuItem[] = [
  { label: 'Normas de escritura', path: '/apoyo' },
  { label: 'Código deontológico', path: '/apoyo' },
];

const subscriptionItems = ['Socio Mensual', 'Básica', 'Media', 'Premium', 'Premium + Socio'];

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showProject, setShowProject] = useState(false);
  const { user, email: userEmail, isCollaborator, loading: authLoading } = useAuth();
  const { open } = useModal();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpenMenu(null);
  };

  const goTo = (path: SectionPath) => {
    setOpenMenu(null);
    navigateTo(path);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setOpenMenu(null);
    open({ kind: 'auth', mode });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-graphite bg-brand-earth text-brand-paper shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex justify-center pt-3">
          <a href={sectionHref('/')} className="transition-opacity hover:opacity-80" aria-label="Volver al inicio">
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
                <Dropdown items={formatItems} onSelect={goTo} />
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
                <Dropdown items={styleItems} onSelect={goTo} />
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
                      onClick={() => goTo('/apoyo')}
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
            onClick={() => setShowProject(true)}
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

      {showProject && (
        <ModalShell title="Sobre el proyecto" onClose={() => setShowProject(false)}>
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
    </header>
  );
}

function Dropdown({ items, onSelect }: { items: MenuItem[]; onSelect: (path: SectionPath) => void }) {
  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-brand-sand/20 bg-brand-graphite p-2 shadow-2xl">
      {items.map((item) => (
        <button key={item.label} onClick={() => onSelect(item.path)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-brand-paper/90 transition-colors hover:bg-brand-earth hover:text-brand-white">
          <BookOpen size={15} className="text-brand-sand" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
