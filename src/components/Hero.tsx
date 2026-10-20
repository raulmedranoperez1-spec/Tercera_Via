import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeroProps {
  subscribeRef: React.RefObject<HTMLDivElement>;
}

export default function Hero({ subscribeRef }: HeroProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMsg('Introduce un correo electrónico válido.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert({ email, source: 'hero' });

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          return;
        }
        throw error;
      }
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('No se pudo completar la suscripción. Inténtalo de nuevo.');
    }
  };

  return (
    <section className="relative overflow-hidden bg-paper-100">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #704c12 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: text */}
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-earth-300/50 bg-paper-50 px-4 py-1.5 text-xs font-medium text-earth-800">
              <Clock size={14} />
              Lectura de hoy: 4 min
            </div>

            <h1 className="font-serif text-4xl leading-tight text-earth-900 sm:text-5xl lg:text-6xl">
              Periodismo <span className="italic text-earth-700">desadjetivado</span>,
              <br className="hidden sm:block" /> contraste de marcos y
              <br className="hidden sm:block" /> verificación documental
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-ink-500 mt-2">
                en 4 minutos
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-600 sm:text-lg">
              La Tercera Vía compara cómo la prensa conservadora y progresista enmarcan
              la misma noticia, te ofrece los hechos verificados y te lleva a la fuente
              primaria — BOE, BOJA, INE — sin sensacionalismo.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-ok" />
                Sin adjetivos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-ok" />
                Contraste de marcos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-ok" />
                Fuentes primarias
              </span>
            </div>
          </div>

          {/* Right: newsletter box */}
          <div ref={subscribeRef} className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="rounded-2xl border border-paper-400/70 bg-paper-50 p-8 shadow-lg shadow-earth-900/5 sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-earth-800 text-paper-100">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-earth-900">
                    Newsletter gratis
                  </h2>
                  <p className="text-sm text-ink-500">Tu lectura de 4 minutos, cada mañana.</p>
                </div>
              </div>

              {status === 'success' ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-accent-ok/30 bg-accent-ok/5 py-8 text-center">
                  <CheckCircle2 size={40} className="text-accent-ok" />
                  <p className="font-serif text-xl text-earth-900">¡Suscripción confirmada!</p>
                  <p className="text-sm text-ink-500">
                    Recibirás tu primera lectura en el próximo envío.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="tu@correo.com"
                    disabled={status === 'loading'}
                    className="w-full rounded-xl border border-paper-400 bg-paper-100 px-5 py-3.5 text-base text-ink-800 outline-none transition-all placeholder:text-ink-300 focus:border-earth-600 focus:ring-2 focus:ring-earth-600/20"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2 rounded-xl bg-earth-800 px-5 py-3.5 text-base font-medium text-paper-100 shadow-sm transition-all hover:bg-earth-900 hover:shadow-md disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Suscribiendo...
                      </>
                    ) : (
                      'Suscribirme gratis'
                    )}
                  </button>
                  {status === 'error' && (
                    <p className="flex items-center gap-2 text-sm text-accent-err">
                      <AlertCircle size={16} />
                      {errorMsg}
                    </p>
                  )}
                  <p className="text-center text-xs text-ink-400">
                    Sin spam. Puedes darte de baja en cualquier momento.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
