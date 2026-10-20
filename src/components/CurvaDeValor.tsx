import { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { comparisonAxes, valorScores } from '@/data/mockData';
import { useReveal } from '@/hooks/useReveal';

const colors: Record<string, string> = {
  'La Tercera Vía': 'bg-earth-800',
  Newtral: 'bg-ink-400',
  'Maldita.es': 'bg-ink-500',
  'El Orden Mundial': 'bg-paper-500',
};

export default function CurvaDeValor() {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="curva" className="bg-paper-200 py-20 sm:py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-4 sm:px-6 reveal ${visible ? 'visible' : ''}`}
      >
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-earth-700">
            Qué nos hace distintos
          </span>
          <h2 className="mt-3 font-serif text-4xl text-earth-900 sm:text-5xl">
            Curva de Valor
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
            No somos un fact-checker más ni un ensayo geopolítico largo.
            Somos auditoría proactiva del marco de prensa, en 4 minutos,
            con impacto en tu día a día.
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setView('chart')}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              view === 'chart'
                ? 'bg-earth-800 text-paper-100 shadow-sm'
                : 'bg-paper-100 text-ink-600 hover:bg-paper-300'
            }`}
          >
            <BarChart3 size={16} />
            Gráfico
          </button>
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              view === 'table'
                ? 'bg-earth-800 text-paper-100 shadow-sm'
                : 'bg-paper-100 text-ink-600 hover:bg-paper-300'
            }`}
          >
            <Table2 size={16} />
            Tabla comparativa
          </button>
        </div>

        {view === 'chart' ? (
          /* Chart view */
          <div className="grid gap-6 sm:grid-cols-2">
            {valorScores.map((item) => (
              <div
                key={item.axis}
                className="rounded-2xl border border-paper-400/70 bg-paper-50 p-6 shadow-sm"
              >
                <h3 className="mb-4 font-serif text-lg font-semibold text-earth-900">
                  {item.axis}
                </h3>
                <div className="flex flex-col gap-3">
                  {item.valores.map((v) => (
                    <div key={v.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${
                            v.name === 'La Tercera Vía' ? 'text-earth-900' : 'text-ink-500'
                          }`}
                        >
                          {v.name}
                        </span>
                        <span className="text-xs text-ink-400">{v.score}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-paper-300">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            colors[v.name] ?? 'bg-ink-400'
                          } ${v.name === 'La Tercera Vía' ? 'shadow-sm' : ''}`}
                          style={{ width: `${v.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table view */
          <div className="overflow-x-auto rounded-2xl border border-paper-400/70 bg-paper-50 shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-paper-400 bg-paper-100">
                  <th className="px-4 py-4 font-serif text-base font-semibold text-earth-900">
                    Eje
                  </th>
                  <th className="px-4 py-4 font-serif text-base font-semibold text-earth-800">
                    La Tercera Vía
                  </th>
                  <th className="px-4 py-4 font-medium text-ink-500">Newtral</th>
                  <th className="px-4 py-4 font-medium text-ink-500">Maldita.es</th>
                  <th className="px-4 py-4 font-medium text-ink-500">El Orden Mundial</th>
                </tr>
              </thead>
              <tbody>
                {comparisonAxes.map((row, idx) => (
                  <tr
                    key={row.axis}
                    className={`border-b border-paper-300/60 ${
                      idx % 2 === 1 ? 'bg-paper-100/50' : ''
                    }`}
                  >
                    <td className="px-4 py-4 font-medium text-earth-800">{row.axis}</td>
                    <td className="px-4 py-4 rounded-lg bg-earth-800/5 font-medium text-earth-900">
                      {row.terceraVia}
                    </td>
                    <td className="px-4 py-4 text-ink-600">{row.newtral}</td>
                    <td className="px-4 py-4 text-ink-600">{row.maldita}</td>
                    <td className="px-4 py-4 text-ink-600">{row.elOrdenMundial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
