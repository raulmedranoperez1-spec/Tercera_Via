import { useEffect, useState } from 'react';
import { MessageSquare, Users, ArrowRight, Loader2, Inbox, ShieldCheck, BookOpen } from 'lucide-react';
import { fetchCategories, type ForumCategory } from '@/lib/forum';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { forumCategoryHref, forumRulesHref, forumModerationHref, forumAdminHref, navigateTo, sectionHref } from '@/lib/router';

export default function ForumPage() {
  const { profile, session } = useAuth();
  const { open } = useModal();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isEditor = profile?.role === 'equipo_editorial';

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCategories()
      .then((cats) => {
        if (!active) return;
        setCategories(cats);
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudo cargar el foro. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-ink-800 sm:text-5xl">Foro</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
            Un espacio de participación y debate para la comunidad de La Tercera Vía.
            Intercambia opiniones, contrasta ideas y conversa con otros lectores.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={forumRulesHref()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-paper-400/60 px-4 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-paper-200"
          >
            <BookOpen size={16} />
            Normas
          </a>
          {isEditor && (
            <>
              <a
                href={forumModerationHref()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-paper-400/60 px-4 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-paper-200"
              >
                <ShieldCheck size={16} />
                Moderación
              </a>
              <a
                href={forumAdminHref()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-paper-400/60 px-4 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-paper-200"
              >
                Categorías
              </a>
            </>
          )}
        </div>
      </div>

      {/* New thread CTA */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-paper-400/50 bg-paper-50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#704c12]/10">
            <MessageSquare size={24} className="text-[#704c12]" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-ink-800">¿Tienes algo que decir?</p>
            <p className="text-sm text-ink-500">
              {session ? 'Crea un nuevo tema de debate en la categoría que elijas.' : 'Inicia sesión para participar en los debates.'}
            </p>
          </div>
        </div>
        {session ? (
          <button
            onClick={() => navigateTo('#/foro')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
          >
            Elige una categoría
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => open({ kind: 'auth', mode: 'signup' })}
            className="inline-flex items-center gap-2 rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
          >
            Registrarme gratis
          </button>
        )}
      </div>

      {/* Categories grid */}
      {categories.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-400/60 bg-paper-50/50 py-16 text-center">
          <Inbox size={40} className="text-ink-300" />
          <h3 className="font-serif text-xl text-ink-600">No hay categorías todavía</h3>
          <p className="max-w-sm text-sm text-ink-400">El equipo editorial aún no ha configurado las categorías del foro.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={forumCategoryHref(cat.slug)}
              className="group flex flex-col rounded-xl border border-paper-400/50 bg-paper-50 p-5 shadow-sm transition-all hover:border-[#704c12]/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-serif text-xl font-semibold text-ink-800 transition-colors group-hover:text-[#704c12]">
                  {cat.name}
                </h3>
                <ArrowRight size={18} className="mt-1 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-[#704c12]" />
              </div>
              {cat.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{cat.description}</p>
              )}
              <div className="mt-4 flex items-center gap-3 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <MessageSquare size={13} />
                  Ver temas
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Stats footer */}
      <div className="mt-10 flex items-center justify-center gap-6 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <Users size={15} />
          Comunidad de La Tercera Vía
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={15} />
          Moderado con IA y revisión editorial
        </span>
      </div>
    </div>
  );
}
