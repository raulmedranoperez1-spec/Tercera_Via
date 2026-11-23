import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { EscanerNews, EscanerFrame } from '@/lib/escanerNews';

function FrameView({ label, frame }: { label: string; frame: EscanerFrame }) {
  return (
    <div className="rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-[#704c12]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#704c12]">
          {label}
        </span>
        {frame.periodico && <span className="text-xs text-ink-400">{frame.periodico}</span>}
      </div>
      <h3 className="mb-3 font-serif text-xl font-semibold leading-snug text-ink-800">{frame.titular || 'Sin titular'}</h3>
    </div>
  );
}

export default function EscanerNewsDetail({ news }: { news: EscanerNews }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <button
        onClick={() => {
          window.location.hash = '/noticias';
        }}
        className="mb-4 rounded-lg border border-paper-400 bg-paper-50 px-3 py-1.5 text-sm text-ink-600 transition-colors hover:bg-paper-100"
      >
        ← Volver
      </button>
      <header className="border-b border-paper-400/50 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a87945]">La Tercera Vía</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-earth-900 sm:text-5xl">{news.titulo}</h1>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <FrameView label="Marco 1" frame={news.marco1} />
        <FrameView label="Marco 2" frame={news.marco2} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-earth-800/30 bg-earth-800 p-6 text-paper-100 shadow-lg sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-100 font-serif text-lg font-semibold text-earth-800">
              3
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider text-paper-300">La Tercera Vía</span>
          </div>
          <p className="font-serif text-xl font-semibold leading-snug text-paper-100">{news.terceraVia.nombre || 'Sin título'}</p>
          {news.terceraVia.url && (
            <a
              href={news.terceraVia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-paper-100 px-4 py-2 text-sm font-medium text-earth-800 transition-colors hover:bg-paper-300"
            >
              Abrir {news.terceraVia.tipo}
              <ExternalLink size={15} />
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#3f6b4f]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-ink-500">Fuente primaria</span>
          </div>
          <p className="font-serif text-xl font-semibold text-earth-900">{news.fuentePrimaria.nombre || 'Sin fuente'}</p>
          {news.fuentePrimaria.enlace && (
            <a
              href={news.fuentePrimaria.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-earth-700 bg-paper-100 px-4 py-2 text-sm font-medium text-earth-800 transition-colors hover:bg-earth-800 hover:text-paper-100"
            >
              Ver documento primario
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
