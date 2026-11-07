import { ArrowLeft, BookOpen, ShieldCheck, Users, Scale, MessageSquare, Eye } from 'lucide-react';
import { forumHref } from '@/lib/router';

const RULES = [
  {
    icon: Users,
    title: 'Respeto',
    text: 'Ningún mensaje puede contener insultos, amenazas o ataques personales. Trata a los demás participantes como te gustaría ser tratado.',
  },
  {
    icon: ShieldCheck,
    title: 'Veracidad',
    text: 'Contrasta las afirmaciones con fuentes. La desinformación intencional será retirada. Si no estás seguro de algo, indícalo abiertamente.',
  },
  {
    icon: Scale,
    title: 'Sin odio',
    text: 'Se rechaza cualquier forma de discriminación por origen, género, orientación, religión o discapacidad. La diversidad de perspectivas enriquece el debate.',
  },
  {
    icon: MessageSquare,
    title: 'Sin spam',
    text: 'No se permite contenido promocional no autorizado ni enlaces irrelevantes. El foro es un espacio de conversación, no de publicidad.',
  },
  {
    icon: Eye,
    title: 'Argumentación',
    text: 'Favorece el contraste de ideas y el debate razonado frente al eslogan o la arenga. Argumenta tus posiciones y escucha las de los demás.',
  },
  {
    icon: BookOpen,
    title: 'Identidad',
    text: 'Participa con tu cuenta. Los contenidos son atribuibles a su autor. No se permiten cuentas falsas ni suplantación de identidad.',
  },
];

export default function ForumRulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <a href={forumHref()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        Foro
      </a>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#704c12]/10">
          <BookOpen size={24} className="text-[#704c12]" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-800 sm:text-4xl">Normas de participación</h1>
          <p className="mt-1 text-sm text-ink-500">Coherentes con la Carta Magna y el Código Deontológico de La Tercera Vía.</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {RULES.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.title}
              className="flex gap-4 rounded-xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm animate-fade-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#704c12]/10">
                <Icon size={20} className="text-[#704c12]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink-800">
                  <span className="text-[#704c12]">{idx + 1}.</span> {rule.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{rule.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-[#704c12]/20 bg-[#704c12]/5 p-5">
        <h3 className="font-serif text-lg font-semibold text-ink-800">Moderación</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Un sistema de inteligencia artificial analiza cada intervención para detectar
          incumplimientos de las normas. La IA puede señalar contenidos sospechosos y
          recomendar acciones, pero no impone sanciones por sí misma. El equipo editorial
          revisa los contenidos marcados y decide si los restaura, oculta o elimina.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Puedes editar tus mensajes durante las 24 horas siguientes a su publicación.
          Después de ese plazo, solo el equipo editorial puede modificarlos.
        </p>
      </div>
    </div>
  );
}
