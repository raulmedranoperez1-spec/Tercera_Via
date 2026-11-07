import { Mail, Phone, UserRound } from 'lucide-react';

const CONTACT_EMAIL = 'terceravia65@gmail.com';
const CONTACT_PHONE = '+34 000 000 000';

interface TeamMember {
  name: string;
  photo?: string;
}

const TEAM: TeamMember[] = [
  { name: 'Xènia Ibáñez Sevilla', photo: '/images/about-us/IMG_4473.jpeg' },
  { name: 'María Mounaam Romera', photo: '/images/about-us/62418eda-4737-498a-ac41-5f156e5e8066.jpeg' },
  { name: 'Alejandro Valle Cano', photo: '/images/about-us/2d6399e3-96cc-470c-92f1-56ec62538910.jpeg' },
  { name: 'Raúl Medrano Pérez', photo: '/images/about-us/dfec4163-eda8-4bbb-96ee-425e0a9dd176.jpeg' },
  { name: 'Jose Agustín Pérez Garrido' },
  { name: 'Borja Martínez Arcas' },
];

function TeamPhoto({ name, photo }: TeamMember) {
  if (photo) {
    return <img src={photo} alt={name} className="aspect-square w-full rounded-2xl object-cover" />;
  }
  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-earth-700/40 bg-paper-50 text-earth-700/60">
      <UserRound size={32} />
      <span className="text-xs font-medium uppercase tracking-wide">Foto</span>
    </div>
  );
}

export default function Contacto() {
  return (
    <section id="contacto" className="bg-paper-200 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-earth-700">Contacto</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-earth-900 sm:text-4xl">
            Quiénes hacemos La Tercera Vía
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border border-paper-400/70 bg-paper-50 p-6 sm:p-8">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 text-ink-800 transition-colors hover:text-earth-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-800 text-paper-100">
                <Mail size={18} />
              </span>
              <span className="break-all font-medium">{CONTACT_EMAIL}</span>
            </a>
            <div className="flex items-center gap-3 text-ink-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-800 text-paper-100">
                <Phone size={18} />
              </span>
              <span className="font-medium">{CONTACT_PHONE}</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-6 font-serif text-xl font-semibold text-earth-900">Integrantes del grupo</h3>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {TEAM.map((member) => (
                <li key={member.name} className="flex flex-col gap-3">
                  <TeamPhoto {...member} />
                  <span className="text-sm font-medium leading-snug text-ink-800">{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
