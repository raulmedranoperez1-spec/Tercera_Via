import { Lock, LogIn, UserPlus, Crown, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';

export type AccessTier = 'login' | 'subscribe';

interface ContentGateProps {
  tier: AccessTier;
  formatLabel: string;
  blurb?: string;
}

const LOGIN_COPY: Record<string, string> = {
  Artículo:
    'Este artículo está disponible para lectores registrados. Crea tu cuenta gratuita o inicia sesión para leerlo completo.',
  Ensayo:
    'Este ensayo está disponible para lectores registrados. Crea tu cuenta gratuita o inicia sesión para leerlo completo.',
};

const SUBSCRIBE_COPY: Record<string, string> = {
  Entrevista:
    'Las entrevistas son contenido exclusivo para suscriptores. Regístrate, inicia sesión y suscríbete para leer la conversación completa.',
  Reportaje:
    'Los reportajes son contenido exclusivo para suscriptores. Regístrate, inicia sesión y suscríbete para acceder a la investigación completa.',
  Podcast:
    'Los podcasts son contenido exclusivo para suscriptores. Regístrate, inicia sesión y suscríbete para escuchar el audio completo.',
};

export default function ContentGate({ tier, formatLabel, blurb }: ContentGateProps) {
  const { session, profile } = useAuth();
  const { open } = useModal();

  const isAuthenticated = Boolean(session);
  const isSocio = profile?.is_socio ?? false;
  const requiresSubscription = tier === 'subscribe';

  const headline =
    tier === 'login'
      ? (LOGIN_COPY[formatLabel] ?? 'Crea tu cuenta gratuita o inicia sesión para acceder al contenido completo.')
      : (SUBSCRIBE_COPY[formatLabel] ?? 'Este contenido es exclusivo para suscriptores.');

  let actions: { label: string; icon: typeof LogIn; onClick: () => void; primary?: boolean }[] = [];

  if (!isAuthenticated) {
    actions = [
      { label: 'Registrarse', icon: UserPlus, onClick: () => open({ kind: 'auth', mode: 'signup' }), primary: true },
      { label: 'Iniciar sesión', icon: LogIn, onClick: () => open({ kind: 'auth', mode: 'login' }) },
    ];
  } else if (requiresSubscription && !isSocio) {
    actions = [
      { label: 'Suscribirse', icon: Crown, onClick: () => open({ kind: 'subscribe' }), primary: true },
    ];
  }

  const Icon = requiresSubscription ? Crown : BookOpen;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-paper-400/50 bg-paper-50 px-6 py-12 text-center shadow-sm sm:px-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#704c12]/10">
          <Icon size={30} className="text-[#704c12]" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#704c12]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#5d432c]">
            <Lock size={12} />
            {formatLabel}
          </span>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
            {blurb ?? headline}
          </p>
        </div>

        {actions.length > 0 && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium shadow-sm transition-all active:scale-[0.98] sm:w-auto ${
                    action.primary
                      ? 'bg-[#704c12] text-white hover:bg-[#5d432c] hover:shadow-md'
                      : 'border border-[#704c12]/30 bg-paper-100 text-[#704c12] hover:bg-paper-200'
                  }`}
                >
                  <ActionIcon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {tier === 'login' && (
          <p className="text-xs text-ink-400">Entrar es gratis y solo necesitas un minuto.</p>
        )}
        {requiresSubscription && isAuthenticated && !isSocio && (
          <p className="text-xs text-ink-400">Tu suscripción activa desbloquea entrevistas, reportajes y podcasts.</p>
        )}
      </div>
    </div>
  );
}
