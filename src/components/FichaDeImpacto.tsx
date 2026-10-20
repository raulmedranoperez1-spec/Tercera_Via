import { useState } from 'react';
import { GraduationCap, Home, Briefcase, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { impactCards, type ImpactCard } from '@/data/mockData';
import { useReveal } from '@/hooks/useReveal';

const categories = [
  'Todas',
  'Becas y Universidad',
  'Vivienda y Alquiler',
  'Empleo y Contratos',
  'Impuestos',
] as const;

const categoryIcons: Record<string, typeof GraduationCap> = {
  'Becas y Universidad': GraduationCap,
  'Vivienda y Alquiler': Home,
  'Empleo y Contratos': Briefcase,
  'Impuestos': Receipt,
};

function ImpactCardItem({ card }: { card: ImpactCard }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = categoryIcons[card.category] ?? GraduationCap;

  return (
    <div className="group flex flex-col rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-800/10 text-earth-800">
          <Icon size={20} />
        </div>
        <span className="rounded-full bg-paper-200 px-3 py-1 text-xs font-medium text-earth-800">
          {card.category}
        </span>
      </div>

      <h3 className="mb-1 font-serif text-xl font-semibold leading-snug text-earth-900">
        {card.title}
      </h3>
      <p className="mb-4 text-xs text-ink-400">
        {new Date(card.date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="mb-1 font-semibold text-earth-800">¿Qué cambia?</p>
          <p className="leading-relaxed text-ink-600">{card.queCambia}</p>
        </div>

        {expanded && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div>
              <p className="mb-1 font-semibold text-earth-800">¿A quién beneficia?</p>
              <p className="leading-relaxed text-ink-600">{card.aQuienBeneficia}</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-earth-800">¿Cómo solicitarlo?</p>
              <p className="leading-relaxed text-ink-600">{card.comoSolicitarlo}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-earth-700 transition-colors hover:text-earth-900"
      >
        {expanded ? (
          <>
            Ver menos
            <ChevronUp size={16} />
          </>
        ) : (
          <>
            Ver más
            <ChevronDown size={16} />
          </>
        )}
      </button>
    </div>
  );
}

export default function FichaDeImpacto() {
  const [filter, setFilter] = useState<(typeof categories)[number]>('Todas');
  const { ref, visible } = useReveal<HTMLDivElement>();

  const filtered =
    filter === 'Todas'
      ? impactCards
      : impactCards.filter((c) => c.category === filter);

  return (
    <section id="impacto" className="bg-paper-100 py-20 sm:py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}
      >
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-earth-700">
            Para tu día a día
          </span>
          <h2 className="mt-3 font-serif text-4xl text-earth-900 sm:text-5xl">
            Ficha de Impacto Práctico
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
            Cómo las nuevas leyes y regulaciones afectan a tu vida real:
            becas, vivienda, empleo e impuestos. Sin tecnicismos, sin partidos.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-earth-800 text-paper-100 shadow-sm'
                  : 'bg-paper-200 text-ink-600 hover:bg-paper-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <ImpactCardItem key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
