import { useState } from 'react';
import { BookOpen, ChevronDown, LogOut, BadgeCheck, UserCircle, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/lib/modalContext';
import { navigateTo, sectionHref, profileHref, forumHref, codigoDeontologicoHref, type SectionPath } from '@/lib/router';
import { supportTiers, type SupportTier } from '@/data/mockData';
import BrandLogo from '@/components/BrandLogo';

interface MenuItem {
  label: string;
  path: SectionPath;
  href?: string;
}

const formatItems: MenuItem[] = [
  { label: 'Artículos', path: '/escaner' },
  { label: 'Ensayos', path: '/escaner' },
  { label: 'Entrevistas', path: '/escaner' },
  { label: 'Podcast', path: '/escaner' },
  { label: 'Reportajes', path: '/escaner' },
];

const styleItems: MenuItem[] = [
  { label: 'Código deontológico', path: '/', href: codigoDeontologicoHref() },
];

const subscriptionItems = ['Socio Mensual', 'Básica', 'Media', 'Premium', 'Premium + Socio'];

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<SupportTier | null>(null);
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

  const showSubscription = (name: string) => {
    setOpenMenu(null);
    setSelectedSubscription(supportTiers.find((tier) => tier.name === name) ?? null);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setOpenMenu(null);
    open({ kind: 'auth', mode });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-sand bg-brand-paper text-brand-graphite shadow-lg">
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
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:px-3 sm:text-sm"
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
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:px-3 sm:text-sm"
                aria-expanded={openMenu === 'estilo'}
              >
                Libro de estilo
                <ChevronDown size={15} className={`transition-transform ${openMenu === 'estilo' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'estilo' && (
                <Dropdown items={styleItems} onSelect={goTo} />
              )}
            </div>
            <a
              href={forumHref()}
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:px-3 sm:text-sm"
            >
              <MessageCircle size={15} />
              Foro
            </a>
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
                <span className="hidden max-w-[160px] truncate text-xs text-brand-graphite/70 sm:block">
                  {userEmail}
                </span>
                <a
                  href={profileHref()}
                  className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:px-3 sm:text-sm"
                >
                  <UserCircle size={14} />
                  <span className="hidden sm:inline">Mi perfil</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:px-3 sm:text-sm"
                >
                  <LogOut size={14} />
                  Salir
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="hidden rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:block sm:px-3 sm:text-sm"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="hidden rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-sand hover:text-brand-graphite sm:block sm:px-3 sm:text-sm"
                >
                  Crear cuenta
                </button>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'suscripcion' ? null : 'suscripcion')}
                className="flex items-center gap-1 rounded-md bg-brand-sand px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-white sm:px-4 sm:text-sm"
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
                      onClick={() => showSubscription(item)}
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

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-brand-sand py-2 sm:justify-end">
          <div className="flex gap-2 sm:hidden">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-brand-graphite hover:bg-brand-sand">
                <LogOut size={12} />
                Salir
              </button>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="rounded-md px-2 py-1.5 text-xs text-brand-graphite hover:bg-brand-sand">Iniciar sesión</button>
                <button onClick={() => openAuth('signup')} className="rounded-md px-2 py-1.5 text-xs text-brand-graphite hover:bg-brand-sand">Crear cuenta</button>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedSubscription && (
        <SubscriptionDetails tier={selectedSubscription} onClose={() => setSelectedSubscription(null)} />
      )}
    </header>
  );
}

function SubscriptionDetails({ tier, onClose }: { tier: SupportTier; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={tier.name}>
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-brand-paper p-6 text-brand-graphite shadow-2xl sm:p-8">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-brand-graphite/60 transition-colors hover:bg-brand-sand hover:text-brand-graphite" aria-label="Cerrar">
          ×
        </button>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-earth">Suscripción seleccionada</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-graphite">{tier.name}</h2>
        <p className="mt-3 font-serif text-3xl font-semibold text-brand-earth">{tier.monthly.toLocaleString('es-ES', { minimumFractionDigits: tier.monthly % 1 === 0 ? 0 : 2 })} €/mes</p>
        <p className="mt-3 text-sm leading-relaxed text-brand-graphite/75">{tier.description}</p>
        <ul className="mt-6 space-y-3 text-sm text-brand-graphite/85">
          {tier.features.map((feature) => <li key={feature}>• {feature}</li>)}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-brand-earth px-5 py-3 text-sm font-semibold uppercase tracking-wide text-brand-paper transition-colors hover:bg-brand-graphite"
        >
          Adquirir
        </button>
      </div>
    </div>
  );
}

function Dropdown({ items, onSelect }: { items: MenuItem[]; onSelect: (path: SectionPath) => void }) {
  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-brand-sand/20 bg-brand-graphite p-2 shadow-2xl">
      {items.map((item) =>
        item.href ? (
          <a key={item.label} href={item.href} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-brand-paper/90 transition-colors hover:bg-brand-earth hover:text-brand-white">
            <BookOpen size={15} className="text-brand-sand" />
            {item.label}
          </a>
        ) : (
          <button key={item.label} onClick={() => onSelect(item.path)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-brand-paper/90 transition-colors hover:bg-brand-earth hover:text-brand-white">
            <BookOpen size={15} className="text-brand-sand" />
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
