import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onSubscribeClick: () => void;
}

const navItems = [
  { label: 'Escáner de Marcos', href: '#escaner' },
  { label: 'Impacto Práctico', href: '#impacto' },
  { label: 'Curva de Valor', href: '#curva' },
  { label: 'Sobre Nosotros', href: '#sobre-nosotros' },
  { label: 'Apóyanos', href: '#apoyo' },
];

export default function Header({ onSubscribeClick }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-paper-400/60 bg-paper-100/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-earth-800 text-2xl font-semibold text-paper-100 shadow-sm">
              <span className="font-serif">3</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-semibold text-earth-900">Tercera Vía</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-ink-400">
                La Tercera Vía
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-sm font-medium text-ink-600 transition-colors hover:text-earth-800"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onSubscribeClick}
              className="hidden rounded-full bg-earth-800 px-5 py-2 text-sm font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900 hover:shadow-md sm:inline-block"
            >
              Suscribirme gratis
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-earth-900 transition-colors hover:bg-paper-300 lg:hidden"
              aria-label="Menú"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <nav className="border-t border-paper-400/60 bg-paper-100 px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="rounded-lg px-4 py-3 text-base font-medium text-ink-700 transition-colors hover:bg-paper-300"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onSubscribeClick();
                }}
                className="mt-2 rounded-full bg-earth-800 px-5 py-3 text-base font-medium text-paper-100"
              >
                Suscribirme gratis
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
