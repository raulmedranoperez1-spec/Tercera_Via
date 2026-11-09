import { CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import type { NewsReviewReport } from '@/lib/news';
import { formatDate } from '@/lib/contentTypes';

interface DeontologicalReportProps {
  report: NewsReviewReport;
}

const ARTICLE_TITLES: Record<number, string> = {
  1: 'Del fin primordial',
  2: 'Regla de las 24 Horas',
  3: 'Sobriedad en la titulación',
  4: 'Parquedad adjetiva',
  5: 'No amplificación del insulto',
  6: 'Transparencia documental',
  7: 'Paridad de encuadre',
  8: 'Examen cruzado de sesgos',
  9: 'Ausencia de métricas especulativas',
};

export default function DeontologicalReport({ report }: DeontologicalReportProps) {
  const results = report.article_results ?? [];

  return (
    <div className="rounded-2xl border border-paper-400/50 bg-paper-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3 border-b border-paper-400/40 pb-4">
        <ShieldCheck size={22} className={report.passed ? 'text-accent-ok' : 'text-accent-err'} />
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink-800">Informe deontológico</h3>
          <p className="text-xs text-ink-400">{formatDate(report.created_at)}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
            report.passed ? 'bg-accent-ok/10 text-accent-ok' : 'bg-accent-err/10 text-accent-err'
          }`}
        >
          {report.passed ? 'Apto para revisión editorial' : 'Correcciones necesarias'}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result) => {
          const Icon =
            result.status === 'cumple'
              ? CheckCircle2
              : result.status === 'no_cumple'
                ? XCircle
                : AlertCircle;
          const color =
            result.status === 'cumple'
              ? 'text-accent-ok'
              : result.status === 'no_cumple'
                ? 'text-accent-err'
                : 'text-amber-600';
          const bgColor =
            result.status === 'cumple'
              ? 'bg-accent-ok/5'
              : result.status === 'no_cumple'
                ? 'bg-accent-err/5'
                : 'bg-amber-50';

          return (
            <div key={result.article_number} className={`rounded-lg ${bgColor} p-4`}>
              <div className="flex items-start gap-3">
                <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800">
                      Artículo {result.article_number}
                    </span>
                    <span className="text-xs text-ink-400">— {ARTICLE_TITLES[result.article_number] ?? ''}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{result.details}</p>
                  <span className={`mt-2 inline-block text-xs font-medium ${color}`}>
                    {result.status === 'cumple'
                      ? 'Cumple'
                      : result.status === 'no_cumple'
                        ? 'No cumple'
                        : 'Revisión necesaria'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
