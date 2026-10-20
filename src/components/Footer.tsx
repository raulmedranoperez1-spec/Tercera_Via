import { ShieldCheck, Mail } from 'lucide-react';

interface FooterProps {
  onSubscribeClick: () => void;
}

export default function Footer({ onSubscribeClick }: FooterProps) {
  return (
    <footer className="border-t border-paper-400/60 bg-earth-950 text-paper-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-100 font-serif text-2xl font-semibold text-earth-900">
                3
              </span>
              <span className="font-serif text-xl font-semibold text-paper-100">
                Tercera Vía
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-400">
              Periodismo desadjetivado, contraste de marcos y verificación
              documental. Un proyecto de estudiantes de Periodismo de la FCOM,
              Universidad de Sevilla.
            </p>
            <button
              onClick={onSubscribeClick}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper-100 px-5 py-2.5 text-sm font-medium text-earth-900 transition-all hover:bg-paper-200"
            >
              <Mail size={16} />
              Suscribirme gratis
            </button>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-serif text-base font-semibold text-paper-100">
              Secciones
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Escáner de Marcos', href: '#escaner' },
                { label: 'Impacto Práctico', href: '#impacto' },
                { label: 'Curva de Valor', href: '#curva' },
                { label: 'Sobre Nosotros', href: '#sobre-nosotros' },
                { label: 'Apóyanos', href: '#apoyo' },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-paper-400 transition-colors hover:text-paper-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification */}
          <div>
            <h4 className="mb-4 font-serif text-base font-semibold text-paper-100">
              Verificación
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-paper-400">
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-ok" />
                Fuentes BOE
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-ok" />
                Fuentes BOJA
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-ok" />
                Datos INE
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-paper-400/20 pt-6 text-center text-xs text-paper-500">
          <p>
            © {new Date().getFullYear()} La Tercera Vía. Proyecto independiente de
            Periodismo. FCOM — Universidad de Sevilla.
          </p>
          <p className="mt-2">
            Compromiso de no injerencia editorial. Sin afiliación partidista.
          </p>
        </div>
      </div>
    </footer>
  );
}
