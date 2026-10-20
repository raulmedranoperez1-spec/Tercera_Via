import { Check, Heart, Building2, User } from 'lucide-react';
import { supportTiers } from '@/data/mockData';
import { useReveal } from '@/hooks/useReveal';

const tierIcons: Record<string, typeof User> = {
  'Suscriptor Libre': User,
  'Miembro Colaborador': Heart,
  'Patrocinio Local': Building2,
};

export default function Apoyo() {
  const { ref, visible } = useReveal<HTMLDivElement>();

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
            Si crees en este proyecto, puedes apoyarnos de tres maneras.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {supportTiers.map((tier) => {
            const Icon = tierIcons[tier.name] ?? User;
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all hover:shadow-lg ${
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
                  {tier.price}
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
          })}
        </div>

        <p className="mt-8 text-center text-sm text-ink-400">
          Compromiso de no injerencia editorial: ningún apoyo, individual o comercial,
          condiciona el contenido publicado.
        </p>
      </div>
    </section>
  );
}
