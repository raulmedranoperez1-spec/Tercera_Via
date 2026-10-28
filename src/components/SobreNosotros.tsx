import { Users, PenLine, Mic, Mail, Sparkles, ArrowRight, GraduationCap, FolderOpen, ShieldCheck } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

interface SobreNosotrosProps {
  onSubmissionClick: () => void;
}

export default function SobreNosotros({ onSubmissionClick }: SobreNosotrosProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="sobre-nosotros" className="bg-earth-900 py-20 text-paper-200 sm:py-24">
      <div ref={ref} className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Narrative */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-paper-400">
              Sobre Nosotros
            </span>
            <h2 className="mt-3 font-serif text-4xl text-paper-100 sm:text-5xl">
              Somos 6 estudiantes de Periodismo
            </h2>
            <p className="mt-2 font-serif text-xl italic text-paper-300">
              FCOM — Universidad de Sevilla
            </p>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-paper-300">
              <p>
                Somos un grupo de <strong className="font-medium text-paper-100">6 estudiantes de Periodismo</strong>{' '}
                de la <strong className="font-medium text-paper-100">Facultad de Comunicación (FCOM)</strong> de la
                Universidad de Sevilla. La Tercera Vía nace como un medio de comunicación
                independiente y riguroso frente a la crispación mediática.
              </p>
              <p>
                Pero no somos solo un medio: somos un{' '}
                <strong className="font-medium text-paper-100">espacio abierto</strong> para que
                todos los estudiantes de la FCOM puedan crear, investigar y publicar.
                Esta plataforma funciona también como portfolio colectivo donde las voces
                jóvenes tienen cabida.
              </p>
              <p>
                Luchamos contra la <em className="text-paper-100">infoxicación</em> y la polarización
                con periodismo desadjetivado, contraste de marcos y verificación documental.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-2xl border border-paper-400/20 bg-earth-950/50 p-6">
              <div className="flex items-start gap-3">
                <Sparkles size={22} className="mt-0.5 shrink-0 text-paper-400" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-paper-100">
                    ¿Eres estudiante de la FCOM y quieres publicar?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-paper-300">
                    Espacio abierto para artículos de investigación, ensayos de análisis,
                    entrevistas en profundidad, reportajes y formatos multimedia o podcast.
                    Envíanos tu propuesta y colabora con la redacción.
                  </p>
                  <button
                    onClick={onSubmissionClick}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper-100 px-5 py-2.5 text-sm font-medium text-earth-900 transition-all hover:bg-paper-200"
                  >
                    Envíanos tu propuesta
                    <ArrowRight size={16} />
                  </button>
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
                Equipo editorial
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                6 estudiantes de Periodismo de la FCOM con voluntad de medio
                independiente y riguroso, sin afiliación partidista.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <FolderOpen size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Portfolio abierto
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Cualquier alumno de la FCOM puede subir su trabajo y construir
                su portfolio en un medio real, con verificación editorial.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <GraduationCap size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Cantera universitaria
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Fomentamos las ganas de crear de los estudiantes. Investigación,
                ensayos, reportajes y podcast producidos por y para jóvenes.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-400/15 bg-earth-950/40 p-6 transition-transform hover:scale-[1.02]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100/10 text-paper-300">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-paper-100">
                Independencia
              </h3>
              <p className="text-sm leading-relaxed text-paper-300">
                Sin injerencia editorial de apoyos comerciales o institucionales.
                El contenido se decide solo por criterios periodísticos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
