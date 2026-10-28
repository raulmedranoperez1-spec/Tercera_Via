import { ShieldCheck, Mail, MapPin, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface FooterProps {
  onSubscribeClick: () => void;
}

export default function Footer({ onSubscribeClick }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    await supabase.from('subscribers').insert({ email, source: 'footer' });
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-paper-400/60 bg-earth-950 text-paper-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact */}
          <div className="lg:col-span-1">
            <h3 className="mb-4 font-serif text-2xl font-semibold text-paper-100">
              Contáctanos
            </h3>
            <div className="space-y-3 text-sm text-paper-400">
              <div className="flex items-start gap-2">
                <Mail size={18} className="mt-0.5 shrink-0 text-paper-500" />
                <div>
                  <p className="font-medium text-paper-300">Email</p>
                  <p className="text-paper-400">[Correo editable]</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 shrink-0 text-paper-500" />
                <div>
                  <p className="font-medium text-paper-300">Ubicación</p>
                  <p className="text-paper-400">FCOM — Universidad de Sevilla</p>
                </div>
              </div>
            </div>
            {/* Newsletter mini-form */}
            {subscribed ? (
              <p className="mt-4 rounded-lg bg-accent-ok/15 px-3 py-2 text-sm text-accent-ok">
                ¡Suscripción confirmada!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="flex-1 rounded-lg border border-paper-400/30 bg-earth-900 px-3 py-2 text-sm text-paper-100 outline-none transition-all placeholder:text-paper-500 focus:border-paper-400"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-lg bg-paper-100 px-3 py-2 text-earth-900 transition-colors hover:bg-paper-200"
                  aria-label="Suscribirme"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Brand + links */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-100 font-serif text-2xl font-semibold text-earth-900">
                3
              </span>
              <span className="font-serif text-xl font-semibold text-paper-100">
                La Tercera Vía
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-400">
              Periodismo desadjetivado, contraste de marcos y verificación
              documental. Un proyecto de estudiantes de Periodismo de la FCOM,
              Universidad de Sevilla.
            </p>
            <button
              onClick={onSubscribeClick}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper-100 px-5 py-2.5 text-sm font-medium text-earth-900 transition-all hover:bg-paper-200"
            >
              <Mail size={16} />
              Ver planes de suscripción
            </button>
          </div>

          {/* Verification */}
          <div className="lg:col-span-1">
            <h4 className="mb-4 font-serif text-lg font-semibold text-paper-100">
              Verificación
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-paper-400">
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-ok" />
                Fuentes BOE
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-ok" />
                Fuentes BOJA
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-ok" />
                Datos INE
              </li>
            </ul>
            <h4 className="mb-3 mt-6 font-serif text-lg font-semibold text-paper-100">
              Secciones
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Escáner de Marcos', href: '#escaner' },
                { label: 'Impacto Práctico', href: '#impacto' },
                { label: 'Curva de Valor', href: '#curva' },
                { label: 'Comunidad', href: '#comunidad' },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-paper-400 transition-colors hover:text-paper-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-paper-400/20 pt-6 text-center text-xs text-paper-500">
          <p>Plataforma editorial independiente - FCOM, Universidad de Sevilla</p>
          <p className="mt-2">
            Compromiso de no injerencia editorial. Sin afiliación partidista.
          </p>
        </div>
      </div>
    </footer>
  );
}
