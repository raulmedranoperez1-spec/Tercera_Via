import { useState } from 'react';
import { Newspaper, PenLine } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import EscanerForm from '@/components/EscanerForm';
import { saveEscanerNews, type EscanerNews } from '@/lib/escanerNews';

interface SubmitWorkModalProps {
  initialTab?: 'creativa' | 'informativa';
  onSubmitted?: () => void;
  onClose: () => void;
}

const TALLY_CREATIVA_URL = 'https://tally.so/embed/aO2K2B?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';
const TALLY_INFORMATIVA_URL = 'https://tally.so/embed/gb9JdJ?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

type Tab = 'creativa' | 'informativa';

export default function SubmitWorkModal({ initialTab = 'creativa', onClose }: SubmitWorkModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showEscaner, setShowEscaner] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (data: Omit<EscanerNews, 'id' | 'creadoEn'>) => {
    const news: EscanerNews = {
      ...data,
      id: crypto.randomUUID(),
      creadoEn: new Date().toISOString(),
    };
    saveEscanerNews(news);
    setSaved(true);
  };

  const tabButtonClass = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
      active ? 'bg-[#704c12] text-white shadow-sm' : 'text-ink-600 hover:bg-paper-100 hover:text-[#704c12]'
    }`;

  return (
    <ModalShell title="Publica tu proyecto" onClose={onClose}>
      <div className="mb-4 flex gap-1.5 rounded-xl border border-paper-400/60 bg-paper-100 p-1.5">
        <button
          type="button"
          onClick={() => setTab('creativa')}
          className={tabButtonClass(tab === 'creativa')}
          aria-pressed={tab === 'creativa'}
        >
          <PenLine size={15} />
          Parte Creativa
        </button>
        <button
          type="button"
          onClick={() => setTab('informativa')}
          className={tabButtonClass(tab === 'informativa')}
          aria-pressed={tab === 'informativa'}
        >
          <Newspaper size={15} />
          <span className="hidden sm:inline">Parte Informativa</span>
          <span className="sm:hidden">Noticias</span>
        </button>
      </div>

      {tab === 'creativa' ? (
        <iframe
          key="creativa"
          src={TALLY_CREATIVA_URL}
          title="Formulario de publicación de proyectos creativos"
          loading="lazy"
          style={{ border: 0, height: '622px', width: '100%' }}
          className="rounded-lg bg-transparent"
        />
      ) : (
        <>
          <iframe
            key="informativa"
            src={TALLY_INFORMATIVA_URL}
            title="Formulario de publicación de noticias"
            loading="lazy"
            style={{ border: 0, height: '622px', width: '100%' }}
            className="rounded-lg bg-transparent"
          />

          <div className="mt-4 rounded-xl border border-paper-400/60 bg-paper-50 p-4">
            <button
              type="button"
              onClick={() => setShowEscaner((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <Newspaper size={16} className="text-[#704c12]" />
                ¿Prefieres rellenar el modelo El Escáner de Marcos aquí?
              </span>
              <span className="text-xs font-medium text-[#704c12] underline">
                {showEscaner ? 'Ocultar' : 'Abrir'}
              </span>
            </button>
            {saved && (
              <p className="mt-3 rounded-lg bg-[#3f6b4f]/10 px-3 py-2 text-sm text-[#3f6b4f]">
                Noticia guardada. Ya aparece en la sección Noticias de la web.
              </p>
            )}
            {showEscaner && <EscanerForm onCancel={() => setShowEscaner(false)} onSave={handleSave} />}
          </div>
        </>
      )}
    </ModalShell>
  );
}
