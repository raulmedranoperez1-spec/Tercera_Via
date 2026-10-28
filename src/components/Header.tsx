import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Upload, LogIn, Newspaper, FileText, Mic, BookOpen, Users, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onSubscribeClick: () => void;
  onAuthClick: () => void;
  onSubmissionClick: () => void;
  onSobreNosotrosClick: () => void;
}

const formatos = [
  { label: 'Artículos', icon: FileText, href: '#formatos' },
  { label: 'Reportajes', icon: Newspaper, href: '#formatos' },
  { label: 'Entrevistas', icon: Users, href: '#formatos' },
  { label: 'Ensayos', icon: BookOpen, href: '#formatos' },
  { label: 'Podcasts', icon: Mic, href: '#formatos' },
];

export default function Header({ onSubscribeClick, onAuthClick, onSubmissionClick, onSobreNosotrosClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formatosOpen, setFormatosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const formatosRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (formatosRef.current && !formatosRef.current.contains(e.target as Node)) {
        setFormatosOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-paper-400/60 bg-paper-100/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top row: desktop layout with 3 columns */}
        <div className="flex items-center justify-between py-3">
          {/* LEFT: Formatos + Sobre Nosotros */}
          <div className="hidden flex-1 items-center gap-4 lg:flex">
            <div ref={formatosRef} className="relative">
              <button
                onClick={() => setFormatosOpen(!formatosOpen)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-paper-300 hover:text-earth-800"
              >
                Formatos
                <ChevronDown size={16} className={`transition-transform ${formatosOpen ? 'rotate-180' : ''}`} />
              </button>
              {formatosOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-paper-400/60 bg-paper-50 p-2 shadow-lg animate-fade-in">
                  {formatos.map((f) => {
                    const Icon = f.icon;
                    return (
                      <a
                        key={f.label}
                        href={f.href}
                        onClick={(e) => { e.preventDefault(); setFormatosOpen(false); scrollToSection(f.href); }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-paper-200 hover:text-earth-800"
                      >
                        <Icon size={18} className="text-earth-700" />
                        {f.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={onSobreNosotrosClick}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-paper-300 hover:text-earth-800"
            >
              Sobre Nosotros
            </button>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex flex-1 items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-earth-900 transition-colors hover:bg-paper-300"
              aria-label="Menú"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* CENTER: Brand */}
          <div className="flex flex-1 flex-col items-center">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-earth-800 font-serif text-xl font-semibold text-paper-100 shadow-sm">
                3
              </span>
              <span className="font-serif text-2xl font-semibold text-earth-900 sm:text-3xl">
                La Tercera Vía
              </span>
            </a>
            <button
              onClick={onSubmissionClick}
              className="mt-1.5 flex items-center gap-1.5 rounded-full bg-earth-800 px-4 py-1.5 text-xs font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900 hover:shadow-md sm:text-sm"
            >
              <Upload size={14} />
              Sube aquí tu proyecto
            </button>
          </div>

          {/* RIGHT: Suscribirme + Auth */}
          <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
            <button
              onClick={onSubscribeClick}
              className="rounded-full border border-earth-700 px-5 py-2 text-sm font-medium text-earth-800 transition-all hover:bg-earth-800 hover:text-paper-100"
            >
              Suscribirme
            </button>
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full bg-earth-800 px-4 py-2 text-sm font-medium text-paper-100 transition-all hover:bg-earth-900"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-100 text-xs font-semibold text-earth-800">
                    {(profile?.display_name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-paper-400/60 bg-paper-50 p-3 shadow-lg animate-fade-in">
                    <div className="mb-3 border-b border-paper-400/50 pb-3">
                      <p className="text-sm font-medium text-earth-900">
                        {profile?.display_name || 'Usuario'}
                      </p>
                      <p className="text-xs text-ink-400">{user.email}</p>
                      <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        profile?.role === 'creador'
                          ? 'bg-accent-ok/15 text-accent-ok'
                          : 'bg-earth-800/10 text-earth-800'
                      }`}>
                        {profile?.role === 'creador' ? <GraduationCap size={12} /> : <BookOpen size={12} />}
                        {profile?.role === 'creador' ? 'Creador FCOM' : 'Lector'}
                      </span>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-paper-200"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-1.5 rounded-full bg-earth-800 px-5 py-2 text-sm font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900"
              >
                <LogIn size={16} />
                Iniciar sesión / Registrarte
              </button>
            )}
          </div>

          {/* Mobile: auth icon */}
          <div className="flex flex-1 items-center justify-end lg:hidden">
            {user ? (
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-earth-900 transition-colors hover:bg-paper-300"
                aria-label="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button
                onClick={onAuthClick}
                className="rounded-lg p-2 text-earth-900 transition-colors hover:bg-paper-300"
                aria-label="Iniciar sesión"
              >
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-t border-paper-400/60 bg-paper-100 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {/* Formatos label */}
            <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Formatos</p>
            {formatos.map((f) => {
              const Icon = f.icon;
              return (
                <a
                  key={f.label}
                  href={f.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(f.href); }}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium text-ink-700 transition-colors hover:bg-paper-300"
                >
                  <Icon size={18} className="text-earth-700" />
                  {f.label}
                </a>
              );
            })}
            <button
              onClick={() => { setMobileOpen(false); onSobreNosotrosClick(); }}
              className="rounded-lg px-4 py-2.5 text-left text-base font-medium text-ink-700 transition-colors hover:bg-paper-300"
            >
              Sobre Nosotros
            </button>
            <button
              onClick={() => { setMobileOpen(false); onSubscribeClick(); }}
              className="mt-2 rounded-full border border-earth-700 px-5 py-2.5 text-base font-medium text-earth-800"
            >
              Suscribirme
            </button>
            <button
              onClick={() => { setMobileOpen(false); onSubmissionClick(); }}
              className="rounded-full bg-earth-800 px-5 py-2.5 text-base font-medium text-paper-100"
            >
              Sube aquí tu proyecto
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
