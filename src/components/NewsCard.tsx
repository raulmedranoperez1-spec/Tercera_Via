import { ExternalLink, BookOpen, ShieldCheck } from 'lucide-react';

export interface NewsItem {
  titulo: string;
  descripcion: string;
  archivoUrl: string;
  fuenteUrl: string;
  medio1: string;
  titular1: string;
  medio2: string;
  titular2: string;
}

export default function NewsCard({ news }: { news: NewsItem }) {
  const hasFrame2 = !!(news.medio2 || news.titular2);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-paper-400/50 bg-paper-50 shadow-sm transition-all hover:shadow-md">
      <div className="p-5 sm:p-6">
        {news.titulo && (
          <h3 className="font-serif text-xl font-semibold leading-snug text-ink-800">{news.titulo}</h3>
        )}
        {news.descripcion && (
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{news.descripcion}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 px-5 sm:px-6">
        {news.archivoUrl && (
          <a
            href={news.archivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#704c12] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
          >
            <BookOpen size={15} />
            Leer noticia completa
          </a>
        )}
        {news.fuenteUrl && (
          <a
            href={news.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-paper-400 bg-paper-100 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-[#704c12]/40 hover:text-[#704c12]"
          >
            <ShieldCheck size={15} />
            Ver fuente primaria
          </a>
        )}
      </div>

      <div className="mt-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="overflow-hidden rounded-xl border border-earth-800/30">
          <div className="bg-earth-800 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-paper-300">
              Escáner de Marcos
            </span>
          </div>
          <table className="w-full border-collapse bg-[#f7f1e7] text-left text-sm">
            <thead>
              <tr className="border-b border-paper-400/70 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2 font-semibold">Medio</th>
                <th className="px-4 py-2 font-semibold">Titular</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-paper-400/70 bg-[#704c12]/10">
                <td className="px-4 py-2.5 font-semibold text-[#5d432c]">Nuestro medio</td>
                <td className="px-4 py-2.5 font-medium text-ink-800">{news.titulo || '—'}</td>
              </tr>
              <tr className="border-b border-paper-400/70">
                <td className="px-4 py-2.5 text-ink-600">{news.medio1 || '—'}</td>
                <td className="px-4 py-2.5 text-ink-600">{news.titular1 || '—'}</td>
              </tr>
              {hasFrame2 && (
                <tr>
                  <td className="px-4 py-2.5 text-ink-600">{news.medio2 || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-600">{news.titular2 || '—'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!news.archivoUrl && !news.fuenteUrl && (
        <span className="mb-4 flex items-center gap-1.5 px-5 text-xs text-ink-400 sm:px-6">
          <ExternalLink size={12} />
          Sin enlaces disponibles todavía
        </span>
      )}
    </article>
  );
}
