import { Check, Star } from 'lucide-react';
import { subscriptionPlans } from '@/data/mockData';
import { useReveal } from '@/hooks/useReveal';

export default function Apoyo() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="apoyo" className="bg-paper-100 py-20 sm:py-24">
      <div ref={ref} className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}>
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-earth-700">
            Planes de Suscripción
          </span>
          <h2 className="mt-3 font-serif text-4xl text-earth-900 sm:text-5xl">
            Suscríbete mensualmente
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
            La información básica es y será accesible. Si crees en este proyecto,
            elige el plan que mejor se adapte a ti.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all hover:shadow-lg ${
                plan.highlighted
                  ? 'border-earth-800 bg-earth-800 text-paper-100 shadow-md scale-[1.02]'
                  : 'border-paper-400/70 bg-paper-50 text-ink-800'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-paper-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-earth-800 shadow-sm">
                  <Star size={12} className="fill-earth-800" />
                  Recomendado
                </span>
              )}

              <h3 className={`font-serif text-2xl font-semibold ${plan.highlighted ? 'text-paper-100' : 'text-earth-900'}`}>
                {plan.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className={`font-serif text-2xl font-semibold ${plan.highlighted ? 'text-paper-200' : 'text-earth-800'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-paper-300' : 'text-ink-400'}`}>
                  {plan.priceLabel}
                </span>
              </div>

              <p className={`mt-2 text-sm leading-relaxed ${plan.highlighted ? 'text-paper-300' : 'text-ink-500'}`}>
                {plan.description}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-paper-300' : 'text-accent-ok'}`}
                    />
                    <span className={plan.highlighted ? 'text-paper-200' : 'text-ink-600'}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 rounded-full px-5 py-3 text-sm font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-paper-100 text-earth-900 hover:bg-paper-200'
                    : 'bg-earth-800 text-paper-100 hover:bg-earth-900'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-400">
          Compromiso de no injerencia editorial: ningún apoyo condiciona el contenido publicado.
        </p>
      </div>
    </section>
  );
}
