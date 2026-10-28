import { Clock, ShieldCheck, ScanLine, Zap, ArrowDown } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

interface HeroProps {
  onSubmissionClick: () => void;
  onExploreClick: () => void;
}

export default function Hero({ onSubmissionClick, onExploreClick }: HeroProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden bg-paper-100">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #704c12 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div ref={ref} className={`relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28 reveal ${visible ? 'visible' : ''}`}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-earth-300/50 bg-paper-50 px-4 py-1.5 text-xs font-medium text-earth-800">
            <Clock size={14} />
            Lectura de hoy: 4 min
          </div>

          <h1 className="font-serif text-4xl leading-tight text-earth-900 sm:text-5xl lg:text-6xl">
            Periodismo <span className="italic text-earth-700">desadjetivado</span>,
            <br className="hidden sm:block" /> contraste de marcos y
            <br className="hidden sm:block" /> verificación documental
            <span className="block mt-2 text-2xl text-ink-500 sm:text-3xl lg:text-4xl">
              en 4 minutos
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            La Tercera Vía compara cómo la prensa conservadora y progresista enmarcan
            la misma noticia, te ofrece los hechos verificados y te lleva a la fuente
            primaria — BOE, BOJA, INE — sin sensacionalismo.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onSubmissionClick}
              className="flex items-center gap-2 rounded-full bg-earth-800 px-6 py-3 text-base font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900 hover:shadow-md"
            >
              <Zap size={18} />
              Sube aquí tu proyecto
            </button>
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 rounded-full border border-earth-700 bg-paper-50 px-6 py-3 text-base font-medium text-earth-800 transition-all hover:bg-earth-800 hover:text-paper-100"
            >
              <ArrowDown size={18} />
              Explorar el Escáner
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-accent-ok" />
              Sin adjetivos
            </span>
            <span className="flex items-center gap-1.5">
              <ScanLine size={16} className="text-accent-ok" />
              Contraste de marcos
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-accent-ok" />
              Fuentes primarias
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
