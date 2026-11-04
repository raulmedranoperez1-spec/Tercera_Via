import { useState } from 'react';
import { Check, User, Heart, Sparkles, Crown, Star } from 'lucide-react';
import { supportTiers } from '@/data/mockData';
import { useReveal } from '@/hooks/useReveal';

const tierIcons: Record<string, typeof User> = {
  'Socio Mensual': User,
  'Básica': Heart,
  'Media': Star,
  'Premium': Sparkles,
  'Premium + Socio': Crown,
};

type BillingCycle = 'monthly' | 'annual';

export default function Apoyo() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <section id="apoyo" className="bg-paper-100 py-20 sm:py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}
      >
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-earth-700">
            Sostenibilidad
          </span>
          <h2 className="mt-3 font-serif text-4xl text-earth-900 sm:text-5xl">
            Apóyanos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
            La información básica es y será libre: es un servicio público.
            Si crees en este proyecto, puedes apoyarnos con una suscripción.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="inline-flex rounded-full border border-paper-400 bg-paper-50 p-1 shadow-sm">
            <button
              onClick={() => setCycle('monthly')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                cycle === 'monthly'
                  ? 'bg-earth-800 text-paper-100 shadow-sm'
                  : 'text-ink-600 hover:text-earth-800'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                cycle === 'annual'
                  ? 'bg-earth-800 text-paper-100 shadow-sm'
                  : 'text-ink-600 hover:text-earth-800'
              }`}
            >
              Anual
              <span className="ml-1.5 text-xs text-accent-ok">ahorra ~17%</span>
            </button>
          </div>
        </div>

        {/* 5-tier grid: 3 on top row, 2 centered on bottom row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {supportTiers.slice(0, 3).map((tier) => (
            <TierCard key={tier.name} tier={tier} cycle={cycle} />
          ))}
        </div>
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 sm:grid-cols-2">
          {supportTiers.slice(3).map((tier) => (
            <TierCard key={tier.name} tier={tier} cycle={cycle} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-400">
          Compromiso de no injerencia editorial: ningún apoyo, individual o comercial,
          condiciona el contenido publicado.
        </p>
      </div>
    </section>
  );
}

function TierCard({
  tier,
  cycle,
}: {
  tier: (typeof supportTiers)[number];
  cycle: BillingCycle;
}) {
  const Icon = tierIcons[tier.name] ?? User;
  const price = cycle === 'monthly' ? tier.monthly : tier.annual;
  const suffix = cycle === 'monthly' ? '€/mes' : '€/año';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg sm:p-8 ${
        tier.highlighted
          ? 'border-earth-800 bg-earth-800 text-paper-100 shadow-md'
          : 'border-paper-400/70 bg-paper-50 text-ink-800'
      }`}
    >
      {tier.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-paper-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-earth-800 shadow-sm">
          Recomendado
        </span>
      )}

      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
          tier.highlighted ? 'bg-paper-100/15 text-paper-200' : 'bg-earth-800/10 text-earth-800'
        }`}
      >
        <Icon size={24} />
      </div>

      <h3 className={`font-serif text-2xl font-semibold ${tier.highlighted ? 'text-paper-100' : 'text-earth-900'}`}>
        {tier.name}
      </h3>
      <p className={`mt-1 font-serif text-3xl font-semibold ${tier.highlighted ? 'text-paper-100' : 'text-earth-800'}`}>
        {price.toLocaleString('es-ES', { minimumFractionDigits: price % 1 === 0 ? 0 : 1 })}{suffix}
      </p>
      <p className={`mt-2 text-sm leading-relaxed ${tier.highlighted ? 'text-paper-300' : 'text-ink-500'}`}>
        {tier.description}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {tier.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm">
            <Check
              size={16}
              className={`mt-0.5 shrink-0 ${tier.highlighted ? 'text-paper-300' : 'text-accent-ok'}`}
            />
            <span className={tier.highlighted ? 'text-paper-200' : 'text-ink-600'}>
              {feat}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-8 rounded-full px-5 py-3 text-sm font-medium transition-all ${
          tier.highlighted
            ? 'bg-paper-100 text-earth-900 hover:bg-paper-200'
            : 'bg-earth-800 text-paper-100 hover:bg-earth-900'
        }`}
      >
        {tier.cta}
      </button>
    </div>
  );
}
