import { useState } from 'react';
import { ShieldCheck, ExternalLink, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { framingArticles } from '@/data/mockData';
import { useReveal } from '@/hooks/useReveal';

function highlightText(text: string, words: string[], side: 'left' | 'right') {
  let result = text;
  const sorted = [...words].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(`(${escaped})`, 'gi'),
      `<mark class="adj-${side}">$1</mark>`
    );
  }
  return result;
}

export default function EscanerDeMarcos() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { ref, visible } = useReveal<HTMLDivElement>();

  const article = framingArticles[activeIdx];

  const goPrev = () =>
    setActiveIdx((i) => (i === 0 ? framingArticles.length - 1 : i - 1));
  const goNext = () =>
    setActiveIdx((i) => (i === framingArticles.length - 1 ? 0 : i + 1));

  return (
    <section id="escaner" className="bg-paper-200 py-20 sm:py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-earth-700">
            La pieza central
          </span>
          <h2 className="mt-3 font-serif text-4xl text-earth-900 sm:text-5xl">
            El Escáner de Marcos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
            La misma noticia, enmarcada por dos medios de signo opuesto.
            En el centro, los hechos verificados. Al final, la fuente primaria.
          </p>
        </div>

        {/* Article selector */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {framingArticles.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                idx === activeIdx
                  ? 'bg-earth-800 text-paper-100 shadow-sm'
                  : 'bg-paper-100 text-ink-600 hover:bg-paper-300'
              }`}
            >
              {art.title}
            </button>
          ))}
        </div>

        {/* Comparison grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: Conservative */}
          <div className="rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-accent-err/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-err">
                Marco Conservador
              </span>
              <span className="text-xs text-ink-400">{article.conservative.outlet}</span>
            </div>
            <h3 className="mb-3 font-serif text-xl font-semibold leading-snug text-ink-800">
              {article.conservative.headline}
            </h3>
            <p
              className="text-sm leading-relaxed text-ink-600"
              dangerouslySetInnerHTML={{
                __html: highlightText(
                  article.conservative.body,
                  article.conservative.highlightedWords,
                  'left'
                ),
              }}
            />
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
              <span className="inline-block h-3 w-3 rounded mark adj-left" />
              Adjetivos subjetivos resaltados
            </div>
          </div>

          {/* Right: Progressive */}
          <div className="rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-accent-ok/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-ok">
                Marco Progresista
              </span>
              <span className="text-xs text-ink-400">{article.progressive.outlet}</span>
            </div>
            <h3 className="mb-3 font-serif text-xl font-semibold leading-snug text-ink-800">
              {article.progressive.headline}
            </h3>
            <p
              className="text-sm leading-relaxed text-ink-600"
              dangerouslySetInnerHTML={{
                __html: highlightText(
                  article.progressive.body,
                  article.progressive.highlightedWords,
                  'right'
                ),
              }}
            />
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
              <span className="inline-block h-3 w-3 rounded mark adj-right" />
              Adjetivos subjetivos resaltados
            </div>
          </div>
        </div>

        {/* Center: La Tercera Vía */}
        <div className="mt-4 rounded-2xl border-2 border-earth-800/30 bg-earth-800 p-6 text-paper-100 shadow-lg sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-100 font-serif text-lg font-semibold text-earth-800">
              3
            </span>
            <div>
              <span className="block text-sm font-semibold uppercase tracking-wider text-paper-300">
                La Tercera Vía
              </span>
              <span className="text-xs text-paper-400">Hechos verificados</span>
            </div>
          </div>
          <h3 className="mb-4 font-serif text-2xl font-semibold leading-snug text-paper-100">
            {article.terceraVia.headline}
          </h3>
          <p className="text-base leading-relaxed text-paper-200">
            {article.terceraVia.body}
          </p>
        </div>

        {/* Primary source button */}
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-paper-400/70 bg-paper-50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-accent-ok" />
            <div>
              <p className="text-sm font-medium text-ink-500">Fuente primaria verificada</p>
              <p className="font-serif text-lg font-semibold text-earth-900">
                {article.primarySource.label}
              </p>
            </div>
          </div>
          <a
            href={article.primarySource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-earth-700 bg-paper-100 px-6 py-3 text-sm font-medium text-earth-800 transition-all hover:bg-earth-800 hover:text-paper-100"
          >
            Ver documento primario ({article.primarySource.type})
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={goPrev}
            className="flex items-center gap-1 rounded-full border border-paper-400 bg-paper-100 px-4 py-2 text-sm font-medium text-ink-600 transition-all hover:bg-paper-300"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-sm text-ink-400">
            {activeIdx + 1} / {framingArticles.length}
          </span>
          <button
            onClick={goNext}
            className="flex items-center gap-1 rounded-full border border-paper-400 bg-paper-100 px-4 py-2 text-sm font-medium text-ink-600 transition-all hover:bg-paper-300"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Quote */}
        <div className="mt-12 flex justify-center">
          <blockquote className="flex max-w-xl items-start gap-3 text-center">
            <Quote size={24} className="mt-1 shrink-0 text-earth-300" />
            <p className="font-serif text-lg italic leading-relaxed text-ink-500">
              "La pregunta no es qué dicen los medios, sino qué no dicen cuando deciden
              cómo decirlo."
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
