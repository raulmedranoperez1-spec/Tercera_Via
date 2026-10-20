import { Users, PenLine, Mic, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function SobreNosotros() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="sobre-nosotros" className="bg-earth-900 py-20 text-paper-200 sm:py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Narrative */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-paper-400">
              Sobre nosotros
            </span>
            <h2 className="mt-3 font-serif text-4xl text-paper-100 sm:text-5xl">
              Cantera universitaria de la FCOM
            </h2>
            <p className="mt-2 font-serif text-xl italic text-paper-300">
              Universidad de Sevilla
            </p>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-paper-300">
              <p>
                Somos un grupo de estudiantes de Periodismo de la{' '}
                <strong className="font-medium text-paper-100">
                  Facultad de Comunicación (FCOM)
                </strong>{' '}
                de la Universidad de Sevilla. Nacemos con una misión clara:
                posicionarnos como un medio de comunicación independiente y
                riguroso frente a la crispación mediática.
              </p>
              <p>
                Creemos en el periodismo como un servicio público. Por eso
                luchamos contra la <em className="text-paper-100">infoxicación</em> —
                la sobredosis de información ruidosa que impide distinguir los
                hechos de los adjetivos — y contra la polarización que reduce
                el debate a dos bandos.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-2xl border border-paper-400/20 bg-earth-950/50 p-6">
              <div className="flex items-start gap-3">
                <Sparkles size={22} className="mt-0.5 shrink-0 text-paper-400" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-paper-100">
                    ¿Eres estudiante y quieres publicar?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-paper-300">
                    Espacio abierto para artículos de investigación, ensayos de
                    análisis, entrevistas en profundidad, reportajes y formatos
                    multimedia o podcast. Envíanos tu propuesta y colabora con
                    la redacción.
                  </p>
                  <a
                    href="#apoyo"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#apoyo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper-100 px-5 py-2.5 text-sm font-medium text-earth-900 transition-all hover:bg-paper-200"
                  >
                    Envíanos tu propuesta
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Values cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <Users size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Identidad
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Estudiantes de Periodismo de la FCOM (Universidad de Sevilla)
                con voluntad de medio independiente y riguroso.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <PenLine size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Hub de talento joven
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Fomentamos las ganas de crear de los estudiantes. Un espacio
                abierto para investigar, ensayar y reportear.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <Mic size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Multimedia y podcast
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Formatos en profundidad: entrevistas, reportajes y podcast
                producidos por y para jóvenes de 16 a 30 años.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <Mail size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Colabora con la redacción
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Envía tu propuesta de artículo, entrevista o podcast.
                Revisamos cada idea y te acompañamos en el proceso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
