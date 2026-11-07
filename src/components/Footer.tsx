import { useState } from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import { sectionHref, codigoDeontologicoHref, type SectionPath } from '@/lib/router';
import ModalShell from '@/components/ModalShell';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  const [showProject, setShowProject] = useState(false);

  return (
    <footer className="border-t border-paper-400/60 bg-earth-950 text-paper-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <BrandLogo className="h-12 w-12" />
              <span className="font-serif text-xl font-semibold text-paper-100">
                Tercera Vía
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-400">
              Periodismo desadjetivado, contraste de marcos y verificación
              documental. Un proyecto de estudiantes de Periodismo de la FCOM,
              Universidad de Sevilla.
            </p>
            <a
              href={sectionHref('/')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper-100 px-5 py-2.5 text-sm font-medium text-earth-900 transition-all hover:bg-paper-200"
            >
              <Mail size={16} />
              Registrarme gratis
            </a>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold text-paper-100">
              Secciones
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Escáner de Marcos', path: '/escaner' },
                { label: 'Impacto Práctico', path: '/impacto' },
                { label: 'Apóyanos', path: '/apoyo' },
                { label: 'Contacto', path: '/contacto' },
                { label: 'Foro', path: '/foro' },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={sectionHref(item.path as SectionPath)}
                    className="text-paper-400 transition-colors hover:text-paper-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={codigoDeontologicoHref()}
                  className="text-paper-400 transition-colors hover:text-paper-100"
                >
                  Código Deontológico
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowProject(true)}
                  className="text-paper-400 transition-colors hover:text-paper-100"
                >
                  Sobre el proyecto
                </button>
              </li>
            </ul>
          </div>

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
    </footer>
  );
}
