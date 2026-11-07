import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowUp,
  Printer,
  Link2,
  Check,
  Menu,
  X,
  BookOpen,
  Scale,
} from 'lucide-react';
import { sectionHref } from '@/lib/router';

interface ArticleSection {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  highlight?: boolean;
  list?: { heading: string; text: string }[];
}

interface TitleSection {
  id: string;
  label: string;
  articles: ArticleSection[];
}

const PREAMBULO_PARAGRAPHS = [
  'Reconociendo que la concentración empresarial de los medios de comunicación y el modelo económico dependiente del impacto publicitario han convertido la polarización afectiva y la indignación en mercancías cotidianas;',
  'Constatando que esta dinámica no solo debilita el debate democrático, sino que expulsa a la ciudadanía mediante la fatiga informativa y condena al estudiantado de Periodismo a dinámicas laborales precarias basadas en el consumo rápido;',
  'La Tercera Vía proclama el presente Estatuto Fundamental, vinculante para todos sus miembros redactores, editores y colaboradores, como garantía innegociable de rigor, serenidad e independencia informativa.',
];

const TITLES: TitleSection[] = [
  {
    id: 'titulo-i',
    label: 'Título I',
    articles: [
      {
        id: 'articulo-1',
        number: 'Artículo 1',
        title: 'Del fin primordial.',
        paragraphs: [
          'La Asociación tiene como misión exclusiva trasladar al lector hechos estructurales, datos contrastados y contextos verificables, renunciando de manera expresa a la provocación deliberada de respuestas emocionales o identitarias.',
        ],
      },
      {
        id: 'articulo-2',
        number: 'Artículo 2',
        title: 'Del derecho a la pausa informativa (Regla de las 24 Horas).',
        paragraphs: [
          'Queda abolida la cobertura de última hora (breaking news) en materias de confrontación política o social. Ningún texto sobre un conflicto público podrá publicarse antes de transcurridas veinticuatro horas desde el inicio del acontecimiento. Este plazo constituye un derecho del redactor para verificar datos y una garantía para el lector contra la intoxicación ambiental.',
        ],
        highlight: true,
      },
    ],
  },
  {
    id: 'titulo-ii',
    label: 'Título II',
    articles: [
      {
        id: 'articulo-3',
        number: 'Artículo 3',
        title: 'De la sobriedad en la titulación.',
        paragraphs: [
          'Los titulares responderán únicamente a la pregunta de qué ha ocurrido en términos materiales. Queda estrictamente prohibido el uso de signos de interrogación o exclamación en los encabezados. La Asociación solo titula certezas demostradas.',
          'Queda desterrado el uso de metáforas bélicas, pugilísticas o catastrofistas (batalla, incendio, estalla, golpe, humillación). Las discrepancias parlamentarias o ideológicas se definirán estrictamente como debates, votaciones o desacuerdos formales.',
        ],
      },
      {
        id: 'articulo-4',
        number: 'Artículo 4',
        title: 'Del principio de parquedad adjetiva.',
        paragraphs: [
          'Se prohíbe la calificación moral o emocional de los hechos. Términos como histórico, vergonzoso, magistral, escándalo o desastre quedan excluidos del cuerpo informativo, salvo que formen parte de una cita textual atribuida y contextualizada.',
          'El análisis reposará en sustantivos concretos, magnitudes cuantitativas y verbos de acción directa.',
        ],
      },
    ],
  },
  {
    id: 'titulo-iii',
    label: 'Título III',
    articles: [
      {
        id: 'articulo-5',
        number: 'Artículo 5',
        title: 'De la no amplificación del insulto.',
        paragraphs: [
          'Las descalificaciones personales o adjetivaciones mutuas entre actores públicos carentes de propuesta legislativa, presupuestaria o de gestión no constituyen noticia. La Asociación no actuará como altavoz ni taquígrafo de declaraciones concebidas exclusivamente como provocación partidista.',
        ],
      },
      {
        id: 'articulo-6',
        number: 'Artículo 6',
        title: 'De la transparencia documental obligatoria.',
        paragraphs: [
          'Todo artículo que cite una ley, auto judicial, informe técnico o contrato de gasto público incluirá en su cierre un anexo de libre acceso con el enlace directo al documento primario íntegro, garantizando el derecho del lector a fiscalizar el trabajo periodístico sin intermediación.',
        ],
      },
      {
        id: 'articulo-7',
        number: 'Artículo 7',
        title: 'De la paridad de encuadre en el disenso.',
        paragraphs: [
          'En asuntos de controversia pública manifiesta, el texto articulará de manera simétrica los argumentos de las partes implicadas bajo dos apartados formales obligatorios:',
        ],
        list: [
          {
            heading: 'Hechos de consenso acreditados',
            text: 'Datos materiales aceptados por todos los actores.',
          },
          {
            heading: 'Puntos de discrepancia',
            text: 'Justificación técnica o ideológica de cada postura, sin jerarquizar una sobre otra mediante el diseño visual o el orden de lectura.',
          },
        ],
      },
    ],
  },
  {
    id: 'titulo-iv',
    label: 'Título IV',
    articles: [
      {
        id: 'articulo-8',
        number: 'Artículo 8',
        title: 'Del examen cruzado de sesgos.',
        paragraphs: [
          'Ningún artículo podrá difundirse bajo el sello de la Asociación sin la revisión y firma de un Editor de Descompresión, cuya única función será la detección y supresión de marcos polarizantes, adjetivos de carga subjetiva y vacíos documentales.',
        ],
      },
      {
        id: 'articulo-9',
        number: 'Artículo 9',
        title: 'De la ausencia de métricas especulativas.',
        paragraphs: [
          'La plataforma web y los canales de la Asociación no mostrarán públicamente contadores de lecturas, valoraciones (likes) ni clasificaciones de popularidad, subordinando el éxito del proyecto a la solidez argumental de los textos y no al volumen de tráfico digital.',
        ],
      },
    ],
  },
];

const DISPOSICION_ID = 'disposicion-transitoria';
const DISPOSICION_PARAGRAPHS = [
  'El presente Código entrará en vigor en el momento de la constitución del comité de redacción inicial.',
  'Su incumplimiento voluntario o reiterado por parte de cualquier redactor conllevará la inadmisión de la pieza en el archivo público y la pérdida del sello de verificación deontológica de la Asociación.',
];

interface IndexEntry {
  id: string;
  label: string;
  subEntries?: { id: string; label: string }[];
}

const INDEX_ENTRIES: IndexEntry[] = [
  { id: 'preambulo', label: 'Preámbulo' },
  {
    id: 'titulo-i',
    label: 'Título I',
    subEntries: [
      { id: 'articulo-1', label: 'Art. 1 — Del fin primordial' },
      { id: 'articulo-2', label: 'Art. 2 — Regla de las 24 Horas' },
    ],
  },
  {
    id: 'titulo-ii',
    label: 'Título II',
    subEntries: [
      { id: 'articulo-3', label: 'Art. 3 — Sobriedad en la titulación' },
      { id: 'articulo-4', label: 'Art. 4 — Parquedad adjetiva' },
    ],
  },
  {
    id: 'titulo-iii',
    label: 'Título III',
    subEntries: [
      { id: 'articulo-5', label: 'Art. 5 — No amplificación del insulto' },
      { id: 'articulo-6', label: 'Art. 6 — Transparencia documental' },
      { id: 'articulo-7', label: 'Art. 7 — Paridad de encuadre' },
    ],
  },
  {
    id: 'titulo-iv',
    label: 'Título IV',
    subEntries: [
      { id: 'articulo-8', label: 'Art. 8 — Examen cruzado de sesgos' },
      { id: 'articulo-9', label: 'Art. 9 — Ausencia de métricas especulativas' },
    ],
  },
  { id: DISPOSICION_ID, label: 'Disposición Transitoria y Final' },
];

export default function CodigoDeontologico() {
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Código Deontológico — Tercera Vía';

    const onScroll = () => {
      setShowBackTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0 },
    );

    const sections = document.querySelectorAll('[data-toc-target]');
    sections.forEach((s) => observer.observe(s));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const copyLink = useCallback(
    async (id: string) => {
      const url = `${window.location.origin}${window.location.pathname}#/codigo-deontologico#${id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // fallback: select and prompt
        window.prompt('Copia el enlace:', url);
      }
    },
    [],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleTocClick = useCallback(
    (id: string) => {
      setMobileTocOpen(false);
      const el = document.getElementById(id);
      if (el) {
        const offset = 100;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    },
    [],
  );

  return (
    <div className="bg-paper-100 print:bg-white">
      {/* Document header */}
      <header className="border-b border-paper-400/60 bg-paper-50 print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth-700">
            Tercera Vía
          </p>
          <p className="mt-1 text-sm text-ink-400">
            Periodismo universitario independiente
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-3xl font-semibold leading-tight text-earth-900 sm:text-4xl lg:text-5xl">
            Carta Magna y Código Deontológico de la Tercera Vía
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-paper-400 bg-paper-100 px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-earth-600 hover:text-earth-800"
            >
              <Printer size={16} />
              Imprimir / Guardar como PDF
            </button>
            <a
              href={sectionHref('/')}
              className="inline-flex items-center gap-2 rounded-lg border border-paper-400 bg-paper-100 px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-earth-600 hover:text-earth-800"
            >
              <BookOpen size={16} />
              Volver al inicio
            </a>
          </div>
        </div>
      </header>

      {/* Mobile TOC toggle */}
      <div className="sticky top-0 z-30 border-b border-paper-400/50 bg-paper-100/95 backdrop-blur-md lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-earth-800"
          aria-expanded={mobileTocOpen}
        >
          <span className="flex items-center gap-2">
            <Scale size={16} />
            Índice del documento
          </span>
          {mobileTocOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        {mobileTocOpen && (
          <nav className="max-h-[60vh] overflow-y-auto border-t border-paper-400/40 px-4 py-3">
            <MobileToc
              entries={INDEX_ENTRIES}
              activeId={activeId}
              onNavigate={handleTocClick}
            />
          </nav>
        )}
      </div>

      {/* Main layout: sidebar + content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex gap-8 py-10 lg:py-14">
          {/* Desktop sticky sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block print:hidden">
            <div className="sticky top-8">
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-earth-700">
                <Scale size={15} />
                Índice
              </p>
              <DesktopToc
                entries={INDEX_ENTRIES}
                activeId={activeId}
                onNavigate={handleTocClick}
              />
            </div>
          </aside>

          {/* Document content */}
          <article ref={contentRef} className="min-w-0 flex-1 max-w-3xl">
            {/* Preámbulo */}
            <section
              id="preambulo"
              data-toc-target
              className="scroll-mt-32 border-l-4 border-earth-300/60 bg-paper-50/50 p-6 sm:p-8"
            >
              <h2 className="font-serif text-2xl font-semibold uppercase tracking-wide text-earth-900 sm:text-3xl">
                Preámbulo
              </h2>
              <div className="mt-4 space-y-4">
                {PREAMBULO_PARAGRAPHS.map((para, i) => (
                  <p
                    key={i}
                    className={`text-base leading-[1.8] text-ink-700 ${
                      i === PREAMBULO_PARAGRAPHS.length - 1
                        ? 'font-medium text-ink-800'
                        : ''
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* Titles */}
            <div className="mt-12 space-y-14">
              {TITLES.map((title) => (
                <div key={title.id}>
                  <h2
                    id={title.id}
                    data-toc-target
                    className="scroll-mt-32 border-b-2 border-earth-200 pb-3 font-serif text-2xl font-semibold text-earth-900 sm:text-3xl"
                  >
                    {fullTitleLabel(title.id, title.label)}
                  </h2>
                  <div className="mt-6 space-y-8">
                    {title.articles.map((art) => (
                      <ArticleBlock
                        key={art.id}
                        article={art}
                        copiedId={copiedId}
                        onCopy={copyLink}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Disposición Transitoria y Final */}
            <section
              id={DISPOSICION_ID}
              data-toc-target
              className="mt-14 scroll-mt-32 rounded-xl border border-earth-200/70 bg-paper-50 p-6 sm:p-8"
            >
              <h2 className="font-serif text-2xl font-semibold text-earth-900 sm:text-3xl">
                Disposición Transitoria y Final
              </h2>
              <div className="mt-4 space-y-4">
                {DISPOSICION_PARAGRAPHS.map((para, i) => (
                  <p
                    key={i}
                    className={`text-base leading-[1.8] text-ink-700 ${
                      i === 0 ? 'font-medium text-ink-800' : ''
                    }`}
                  >
                    {i === 0 && (
                      <span className="font-serif text-lg font-semibold text-earth-800">
                        Única.{' '}
                      </span>
                    )}
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* Document footer */}
            <div className="mt-12 border-t border-paper-400/40 pt-6 text-center print:hidden">
              <a
                href={sectionHref('/')}
                className="text-sm text-ink-400 transition-colors hover:text-earth-800"
              >
                ← Volver al inicio
              </a>
            </div>
          </article>
        </div>
      </div>

      {/* Back to top button */}
      {showBackTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-earth-800 text-paper-100 shadow-lg transition-all hover:bg-earth-900 print:hidden"
          aria-label="Volver arriba"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

function ArticleBlock({
  article,
  copiedId,
  onCopy,
}: {
  article: ArticleSection;
  copiedId: string | null;
  onCopy: (id: string) => void;
}) {
  const isCopied = copiedId === article.id;

  if (article.highlight) {
    return (
      <div
        id={article.id}
        data-toc-target
        className="scroll-mt-32 overflow-hidden rounded-xl border-2 border-earth-300/60 bg-earth-50/40"
      >
        <div className="flex items-center gap-3 border-b border-earth-200/60 bg-earth-800 px-6 py-4">
          <Clock24Icon />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-paper-100">
              Regla de las 24 Horas
            </p>
            <p className="text-xs text-paper-300">{article.number}</p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(article.id)}
            className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-paper-200 transition-colors hover:bg-earth-700"
            aria-label="Copiar enlace a esta sección"
          >
            {isCopied ? (
              <>
                <Check size={13} />
                Copiado
              </>
            ) : (
              <>
                <Link2 size={13} />
                Copiar
              </>
            )}
          </button>
        </div>
        <div className="px-6 py-5 sm:px-8 sm:py-6">
          <h3 className="font-serif text-xl font-semibold text-earth-900 sm:text-2xl">
            {article.title}
          </h3>
          <div className="mt-3 space-y-4">
            {article.paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-ink-700">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={article.id}
      data-toc-target
      className="scroll-mt-32 group"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-earth-800/10 font-serif text-sm font-bold text-earth-800">
          {article.number.replace('Artículo ', '')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-semibold text-earth-900 sm:text-2xl">
              <span className="text-earth-700">{article.number}.</span>{' '}
              {article.title}
            </h3>
            <button
              type="button"
              onClick={() => onCopy(article.id)}
              className="ml-1 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-ink-300 opacity-0 transition-all hover:text-earth-700 group-hover:opacity-100"
              aria-label="Copiar enlace a esta sección"
            >
              {isCopied ? (
                <>
                  <Check size={13} className="text-accent-ok" />
                  <span className="text-accent-ok">Copiado</span>
                </>
              ) : (
                <>
                  <Link2 size={13} />
                  <span className="hidden sm:inline">Copiar enlace</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-3 space-y-4">
            {article.paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-ink-700">
                {para}
              </p>
            ))}
          </div>
          {article.list && (
            <dl className="mt-5 space-y-4">
              {article.list.map((item) => (
                <div
                  key={item.heading}
                  className="rounded-lg border-l-2 border-earth-300/70 bg-paper-50/60 px-5 py-4"
                >
                  <dt className="font-serif text-base font-semibold text-earth-800">
                    {item.heading}
                  </dt>
                  <dd className="mt-1 text-base leading-[1.8] text-ink-600">
                    {item.text}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopToc({
  entries,
  activeId,
  onNavigate,
}: {
  entries: IndexEntry[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.id}>
          <button
            type="button"
            onClick={() => onNavigate(entry.id)}
            className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
              activeId === entry.id
                ? 'bg-earth-800/10 font-semibold text-earth-800'
                : 'text-ink-500 hover:bg-paper-200/60 hover:text-earth-700'
            }`}
          >
            {entry.label}
          </button>
          {entry.subEntries && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-paper-300/60 pl-3">
              {entry.subEntries.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onNavigate(sub.id)}
                  className={`block w-full rounded-md px-2.5 py-1 text-left text-xs transition-colors ${
                    activeId === sub.id
                      ? 'font-semibold text-earth-800'
                      : 'text-ink-400 hover:text-earth-600'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function MobileToc({
  entries,
  activeId,
  onNavigate,
}: {
  entries: IndexEntry[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.id}>
          <button
            type="button"
            onClick={() => onNavigate(entry.id)}
            className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              activeId === entry.id
                ? 'bg-earth-800/10 font-semibold text-earth-800'
                : 'text-ink-600 hover:bg-paper-200'
            }`}
          >
            {entry.label}
          </button>
          {entry.subEntries && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-paper-300/60 pl-3">
              {entry.subEntries.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onNavigate(sub.id)}
                  className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                    activeId === sub.id
                      ? 'font-semibold text-earth-800'
                      : 'text-ink-400 hover:text-earth-600'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function fullTitleLabel(id: string, shortLabel: string): string {
  switch (id) {
    case 'titulo-i':
      return 'Título I: De los principios fundamentales y el tiempo editorial';
    case 'titulo-ii':
      return 'Título II: De la titulación y el lenguaje';
    case 'titulo-iii':
      return 'Título III: De las fuentes y el tratamiento de la política';
    case 'titulo-iv':
      return 'Título IV: De la edición y el gobierno colectivo';
    default:
      return shortLabel;
  }
}

function Clock24Icon() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-100/15">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-paper-100"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    </span>
  );
}
