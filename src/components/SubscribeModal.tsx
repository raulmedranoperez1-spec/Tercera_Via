import { Crown, Check } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import { supportTiers } from '@/data/mockData';

interface SubscribeModalProps {
  onClose: () => void;
}

export default function SubscribeModal({ onClose }: SubscribeModalProps) {
  const tiers = supportTiers.filter((t) => t.name !== 'Socio Mensual').slice(0, 3);

  return (
    <ModalShell title="Suscríbete para acceder" onClose={onClose}>
      <div className="mb-5 flex items-start gap-2 rounded-lg border border-[#704c12]/30 bg-[#704c12]/5 px-3 py-2.5 text-xs leading-relaxed text-[#5d432c]">
        <Crown size={16} className="mt-0.5 shrink-0" />
        <span>
          Las entrevistas, reportajes y podcasts son contenido exclusivo para suscriptores.
          Elige el plan que mejor se adapte a ti y desbloquea todo el contenido.
        </span>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => (
          <button
            key={tier.name}
            type="button"
            onClick={onClose}
            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all hover:shadow-md ${
              tier.highlighted
                ? 'border-[#704c12] bg-[#704c12]/5'
                : 'border-black/10 bg-white hover:border-[#704c12]/40'
            }`}
          >
            <div className="flex-1">
              <p className="font-serif text-base font-semibold text-ink-800">{tier.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{tier.description}</p>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {tier.features.slice(0, 2).map((f) => (
                  <li key={f} className="flex items-center gap-1 text-[11px] text-ink-400">
                    <Check size={11} className="text-accent-ok" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ml-3 shrink-0 text-right">
              <p className="font-serif text-lg font-semibold text-[#704c12]">
                {tier.monthly.toLocaleString('es-ES', { minimumFractionDigits: tier.monthly % 1 === 0 ? 0 : 1 })}€
              </p>
              <p className="text-[10px] uppercase tracking-wide text-ink-400">/mes</p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-ink-400">
        Compromiso de no injerencia editorial: ningún apoyo condiciona el contenido.
      </p>
    </ModalShell>
  );
}
