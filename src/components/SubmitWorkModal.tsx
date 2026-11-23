import { useState } from 'react';
import { Newspaper } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import EscanerForm from '@/components/EscanerForm';
import { saveEscanerNews, type EscanerNews } from '@/lib/escanerNews';

interface SubmitWorkModalProps {
  formatSlug?: string;
  onSubmitted?: () => void;
  onClose: () => void;
}

const TALLY_EMBED_URL = 'https://tally.so/embed/aO2K2B?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

export default function SubmitWorkModal({ onClose }: SubmitWorkModalProps) {
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

  return (
    <ModalShell title="Publica tu proyecto" onClose={onClose}>
      <iframe
        src={TALLY_EMBED_URL}
        title="Formulario de publicación de proyectos"
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
            ¿Vas a publicar una noticia (parte informativa)?
          </span>
          <span className="text-xs font-medium text-[#704c12] underline">
            {showEscaner ? 'Ocultar' : 'Usar el Escáner de Marcos'}
          </span>
        </button>
        {saved && (
          <p className="mt-3 rounded-lg bg-[#3f6b4f]/10 px-3 py-2 text-sm text-[#3f6b4f]">
            Noticia guardada. Ya aparece en la sección Noticias de la web.
          </p>
        )}
        {showEscaner && <EscanerForm onCancel={() => setShowEscaner(false)} onSave={handleSave} />}
      </div>
    </ModalShell>
  );
}
