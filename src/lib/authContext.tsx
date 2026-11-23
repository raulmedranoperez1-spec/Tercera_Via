import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AppRole = 'lector' | 'redactor' | 'colaborador' | 'equipo_editorial';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
  display_name: string | null;
  is_socio: boolean;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  academic_year: string | null;
  social_links: SocialLink[];
}

export interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileError: string;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export function isWriterRole(role: AppRole): boolean {
  return role === 'redactor' || role === 'colaborador' || role === 'equipo_editorial';
}

export function canSubmitWork(role: AppRole): boolean {
  return role === 'redactor' || role === 'colaborador';
}

export function roleLabel(role: AppRole): string {
  switch (role) {
    case 'redactor':
      return 'Redactor / Alumno FCOM';
    case 'colaborador':
      return 'Colaborador';
    case 'equipo_editorial':
      return 'Equipo editorial';
    default:
      return 'Lector / Suscriptor';
  }
}
import React, { useState } from 'react';

type Subscription = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  noAds: boolean;
  highlighted?: boolean;
  contents: string[];
  canCombineWithSocio?: boolean;
};

const subscriptions: Subscription[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    description:
      'Acceso gratuito a una selección de nuestros contenidos.',
    monthlyPrice: '0 €',
    yearlyPrice: '0 €',
    noAds: false,
    contents: [
      'Noticias',
      'Contenido creativo no etiquetado de pago',
    ],
  },
  {
    id: 'socio',
    name: 'Socio',
    description:
      'Apoya directamente a Tercera Vía y disfruta de ventajas exclusivas.',
    monthlyPrice: '1,50 €',
    yearlyPrice: '15 €',
    noAds: true,
    highlighted: true,
    contents: [
      'Noticias',
      'Artículos',
      'Sugerencias y contacto directo con el equipo directivo',
    ],
  },
  {
    id: 'basica',
    name: 'Básica',
    description:
      'Accede a nuestros contenidos esenciales sin anuncios.',
    monthlyPrice: '1,50 €',
    yearlyPrice: '15 €',
    noAds: true,
    canCombineWithSocio: true,
    contents: [
      'Noticias',
      'Artículos',
      'Podcasts',
    ],
  },
  {
    id: 'media',
    name: 'Media',
    description:
      'Más formatos y contenido para disfrutar de Tercera Vía.',
    monthlyPrice: '2,50 €',
    yearlyPrice: '25 €',
    noAds: true,
    canCombineWithSocio: true,
    contents: [
      'Noticias',
      'Artículos',
      'Podcasts',
      'Entrevistas',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description:
      'La experiencia más completa de contenido de Tercera Vía.',
    monthlyPrice: '3,50 €',
    yearlyPrice: '35 €',
    noAds: true,
    highlighted: true,
    canCombineWithSocio: true,
    contents: [
      'Noticias',
      'Artículos',
      'Podcasts',
      'Entrevistas',
      'Reportajes',
      'Documentales',
    ],
  },
  {
    id: 'premium-socio',
    name: 'Premium + Socio',
    description:
      'La combinación más completa: todo Premium y todas las ventajas de ser socio.',
    monthlyPrice: '5 €',
    yearlyPrice: '50 €',
    noAds: true,
    highlighted: true,
    contents: [
      'Noticias',
      'Artículos',
      'Podcasts',
      'Entrevistas',
      'Reportajes',
      'Documentales',
      'Sugerencias y contacto directo con el equipo directivo',
    ],
  },
];

const INSTAGRAM_USERNAME = 'terceraa.via';
const INSTAGRAM_URL = 'https://www.instagram.com/terceraa.via/';
const CONTACT_EMAIL = 'terceravia65@gmail.com';

function getEmailUrl(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export default function Subscriptions() {
  const [billingPeriod, setBillingPeriod] = useState<
    'monthly' | 'yearly'
  >('monthly');

  const [donationAmount, setDonationAmount] = useState('');

  const handleSubscriptionContact = (
    subscription: Subscription
  ) => {
    const period =
      billingPeriod === 'monthly' ? 'mensual' : 'anual';

    const price =
      billingPeriod === 'monthly'
        ? subscription.monthlyPrice
        : subscription.yearlyPrice;

    const subject = `Solicitud de suscripción - ${subscription.name}`;

    const body =
      `Hola, estoy interesado/a en contratar la suscripción "${subscription.name}".\n\n` +
      `Modalidad: ${period}\n` +
      `Precio: ${price}\n\n` +
      `Me gustaría recibir información sobre cómo realizar la contratación.`;

    window.location.href = getEmailUrl(subject, body);
  };

  const handleSocioCombination = (
    subscription: Subscription
  ) => {
    const period =
      billingPeriod === 'monthly' ? 'mensual' : 'anual';

    const subject = `Solicitud de ${subscription.name} + Socio`;

    const body =
      `Hola, estoy interesado/a en contratar "${subscription.name}" junto con la suscripción de Socio.\n\n` +
      `Modalidad: ${period}\n\n` +
      `Me gustaría recibir información sobre el precio final y cómo realizar la contratación.`;

    window.location.href = getEmailUrl(subject, body);
  };

  const handleDonation = () => {
    const amount = donationAmount.trim();

    const subject = 'Donación a Tercera Vía';

    const body = amount
      ? `Hola, me gustaría realizar una donación de ${amount} € para apoyar el proyecto de Tercera Vía.\n\nMe gustaría recibir información sobre cómo realizarla.`
      : `Hola, me gustaría realizar una donación para apoyar el proyecto de Tercera Vía.\n\nMe gustaría recibir información sobre cómo realizarla.`;

    window.location.href = getEmailUrl(subject, body);
  };

  return (
    <section className="w-full bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* CABECERA */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="mb-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            SUSCRIPCIONES
          </span>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Elige cómo quieres formar parte de Tercera Vía
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Accede a más contenido, disfruta de una experiencia sin
            anuncios y, si quieres, conviértete también en socio.
          </p>
        </div>

        {/* PROMOCIÓN */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-center text-white shadow-xl sm:px-10">

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">

            <div className="mb-3 text-4xl">
              🎁
            </div>

            <h3 className="text-2xl font-bold sm:text-3xl">
              ¡Paga solo 10 meses y disfruta de 12!
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              En cualquiera de nuestras suscripciones pagas únicamente
              <strong className="text-white">
                {' '}
                10 meses
              </strong>{' '}
              y disfrutas de
              <strong className="text-white">
                {' '}
                2 meses completamente gratis
              </strong>
              .
            </p>

            <div className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-bold text-slate-900 shadow-lg">
              10 meses pagados + 2 meses GRATIS
            </div>

          </div>
        </div>

        {/* MENSUAL / ANUAL */}
        <div className="mb-10 flex justify-center">

          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">

            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`rounded-full px-7 py-3 text-sm font-semibold transition ${
                billingPeriod === 'monthly'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensual
            </button>

            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`rounded-full px-7 py-3 text-sm font-semibold transition ${
                billingPeriod === 'yearly'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anual
            </button>

          </div>
        </div>

        {/* TARJETAS */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {subscriptions.map((subscription) => {

            const price =
              billingPeriod === 'monthly'
                ? subscription.monthlyPrice
                : subscription.yearlyPrice;

            return (
              <article
                key={subscription.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  subscription.highlighted
                    ? 'ring-slate-900'
                    : 'ring-slate-200'
                }`}
              >

                {/* ETIQUETA */}
                {subscription.highlighted && (
                  <div className="bg-slate-900 px-4 py-2 text-center text-sm font-bold text-white">
                    RECOMENDADA
                  </div>
                )}

                <div className="flex flex-1 flex-col p-7">

                  <h3 className="text-2xl font-bold text-slate-900">
                    {subscription.name}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">
                    {subscription.description}
                  </p>

                  {/* PRECIO */}
                  <div className="mt-6">

                    <div className="flex items-end gap-1">

                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {price}
                      </span>

                      {subscription.id !== 'gratis' && (
                        <span className="mb-1 text-sm text-slate-500">
                          {billingPeriod === 'monthly'
                            ? '/mes'
                            : '/año'}
                        </span>
                      )}

                    </div>

                    {subscription.id !== 'gratis' &&
                      billingPeriod === 'yearly' && (
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Pagas 10 meses y disfrutas de 12.
                        </p>
                      )}

                  </div>

                  {/* ANUNCIOS */}
                  <div className="mt-6">

                    {subscription.noAds ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                        ✓ Sin anuncios
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                        • Con anuncios
                      </div>
                    )}

                  </div>

                  {/* CONTENIDO */}
                  <div className="mt-7 flex-1">

                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                      Contenido incluido
                    </h4>

                    <ul className="mt-4 space-y-3">

                      {subscription.contents.map((content) => (
                        <li
                          key={content}
                          className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                        >

                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            ✓
                          </span>

                          <span>
                            {content}
                          </span>

                        </li>
                      ))}

                    </ul>
                  </div>

                  {/* CONTRATAR */}
                  <div className="mt-8">

                    {subscription.id === 'gratis' ? (

                      <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                        Acceso gratuito
                      </div>

                    ) : (

                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleSubscriptionContact(
                              subscription
                            )
                          }
                          className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-700"
                        >
                          Contacta con nosotros

                          <span className="mt-1 block text-xs font-normal text-slate-300">
                            Email o Instagram
                          </span>
                        </button>

                        {/* COMBINACIÓN CON SOCIO */}
                        {subscription.canCombineWithSocio && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSocioCombination(
                                subscription
                              )
                            }
                            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Añadir Socio
                          </button>
                        )}
                      </>
                    )}

                  </div>

                  {subscription.canCombineWithSocio && (
                    <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                      Puedes combinar esta suscripción con
                      <strong> Socio</strong> para acceder también a
                      las ventajas de socio.
                    </p>
                  )}

                </div>
              </article>
            );
          })}

        </div>

        {/* EXPLICACIÓN DE LAS COMBINACIONES */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mb-3 text-3xl">
              ⭐
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Combina tu suscripción con Socio
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Las suscripciones <strong>Básica</strong>,{' '}
              <strong>Media</strong> y <strong>Premium</strong> pueden
              combinarse con la suscripción <strong>Socio</strong>.
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              De esta forma puedes disfrutar del contenido de tu
              suscripción y, además, acceder a las ventajas de ser
              socio, incluyendo las sugerencias y el contacto directo
              con el equipo directivo.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="font-semibold text-slate-900">
                ¿Quieres contratar una combinación?
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Escríbenos indicando qué suscripción quieres combinar
                con Socio y te informaremos de todos los detalles.
              </p>

              <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm font-bold text-slate-900 sm:flex-row sm:gap-5">

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-slate-600"
                >
                  Instagram: @{INSTAGRAM_USERNAME}
                </a>

                <span className="hidden sm:inline">
                  •
                </span>

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline underline-offset-2 hover:text-slate-600"
                >
                  {CONTACT_EMAIL}
                </a>

              </div>
            </div>

          </div>
        </div>

        {/* DONACIONES */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">

          <div className="grid lg:grid-cols-2">

            <div className="p-8 sm:p-10 lg:p-12">

              <div className="mb-4 text-4xl">
                ❤️
              </div>

              <h3 className="text-3xl font-bold text-slate-900">
                Apoya a Tercera Vía
              </h3>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Si quieres ayudarnos a seguir creciendo pero no quieres
                contratar una suscripción, también puedes realizar una
                donación.
              </p>

              <p className="mt-3 max-w-xl font-semibold leading-7 text-slate-700">
                Puedes donar la cantidad que quieras.
              </p>

              {/* CANTIDAD */}
              <div className="mt-8">

                <label
                  htmlFor="donation"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Cantidad de la donación
                </label>

                <div className="flex max-w-sm items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-slate-900">

                  <input
                    id="donation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={donationAmount}
                    onChange={(e) =>
                      setDonationAmount(e.target.value)
                    }
                    placeholder="Cantidad"
                    className="w-full border-0 px-4 py-3 text-slate-900 outline-none focus:ring-0"
                  />

                  <span className="px-4 font-bold text-slate-500">
                    €
                  </span>

                </div>
              </div>

              <button
                type="button"
                onClick={handleDonation}
                className="mt-6 rounded-xl bg-slate-900 px-6 py-4 font-bold text-white transition hover:bg-slate-700"
              >
                Contacta con nosotros para donar
              </button>

              <p className="mt-4 text-sm text-slate-500">
                Puedes contactar con nosotros por email o Instagram
                para realizar tu donación.
              </p>

            </div>

            {/* CONTACTO */}
            <div className="flex flex-col justify-center bg-slate-900 p-8 text-white sm:p-10 lg:p-12">

              <h4 className="text-2xl font-bold">
                Contacta con Tercera Vía
              </h4>

              <p className="mt-4 leading-7 text-slate-300">
                Para contratar una suscripción, combinarla con Socio o
                realizar una donación, ponte en contacto con nosotros.
              </p>

              <div className="mt-8 space-y-4">

                {/* INSTAGRAM */}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
                >

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900">
                    ◎
                  </span>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Instagram
                    </p>

                    <p className="font-semibold text-white">
                      @{INSTAGRAM_USERNAME}
                    </p>

                  </div>

                </a>

                {/* EMAIL */}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
                >

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900">
                    @
                  </span>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="break-all font-semibold text-white">
                      {CONTACT_EMAIL}
                    </p>

                  </div>

                </a>

              </div>
            </div>

          </div>
        </div>

        {/* PIE */}
        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            Para contratar cualquier suscripción, combinarla con Socio
            o realizar una donación, contacta con nosotros.
          </p>

          <div className="mt-3 flex flex-col items-center justify-center gap-1 text-sm font-semibold text-slate-700 sm:flex-row sm:gap-4">

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @{INSTAGRAM_USERNAME}
            </a>

            <span className="hidden sm:inline">
              •
            </span>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:underline"
            >
              {CONTACT_EMAIL}
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}