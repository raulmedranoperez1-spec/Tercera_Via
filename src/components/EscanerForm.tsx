import { useRef, useState } from 'react';
import { FileText, Plus, Upload } from 'lucide-react';
import type { EscanerFrame, EscanerTerceraVia } from '@/lib/escanerNews';

interface EscanerFormProps {
  onCancel: () => void;
  onSave: (data: {
    titulo: string;
    marco1: EscanerFrame;
    marco2: EscanerFrame;
    terceraVia: EscanerTerceraVia;
    fuentePrimaria: { nombre: string; enlace: string };
  }) => void;
}

const inputClass =
  'w-full rounded-lg border border-paper-400 bg-paper-50 px-3 py-2 text-sm text-ink-800 outline-none transition-colors focus:border-[#704c12]';

function FrameBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: EscanerFrame;
  onChange: (next: EscanerFrame) => void;
}) {
  return (
    <div className="rounded-xl border border-paper-400/70 bg-paper-50 p-4">
      <span className="mb-3 inline-flex rounded-md bg-[#704c12]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#704c12]">
        {label}
      </span>
      <input
        type="text"
        placeholder="Titular del marco"
        value={value.titular}
        onChange={(e) => onChange({ ...value, titular: e.target.value })}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Nombre del periódico"
        value={value.periodico}
        onChange={(e) => onChange({ ...value, periodico: e.target.value })}
        className={`${inputClass} mt-2`}
      />
    </div>
  );
}

export default function EscanerForm({ onCancel, onSave }: EscanerFormProps) {
  const [titulo, setTitulo] = useState('');
  const [marco1, setMarco1] = useState<EscanerFrame>({ titular: '', periodico: '' });
  const [marco2, setMarco2] = useState<EscanerFrame>({ titular: '', periodico: '' });
  const [terceraVia, setTerceraVia] = useState<EscanerTerceraVia>({ tipo: 'enlace', nombre: '', url: '' });
  const [fuenteNombre, setFuenteNombre] = useState('');
  const [fuenteEnlace, setFuenteEnlace] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!titulo.trim()) {
      setError('Escribe un título para la noticia.');
      return;
    }
    onSave({
      titulo: titulo.trim(),
      marco1,
      marco2,
      terceraVia,
      fuentePrimaria: { nombre: fuenteNombre.trim(), enlace: fuenteEnlace.trim() },
    });
  };

  return (
    <div className="mt-6 rounded-2xl border border-paper-400/60 bg-[#f7f1e7] p-4 sm:p-6">
      <h3 className="font-serif text-xl font-semibold text-ink-800">Modelo El Escáner de Marcos</h3>
      <p className="mt-1 text-sm text-ink-500">
        Rellena los dos marcos comparativos, tu pieza de la Tercera Vía y la fuente primaria.
      </p>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-500">Título de la noticia</label>
      <input
        type="text"
        placeholder="Título de la noticia"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className={`${inputClass} mt-1`}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FrameBlock label="Marco 1" value={marco1} onChange={setMarco1} />
        <FrameBlock label="Marco 2" value={marco2} onChange={setMarco2} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-earth-800/30 bg-earth-800 p-4 text-paper-100">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper-300">Tercera Vía</span>
          <div className="mt-2 flex gap-1.5">
            {(['archivo', 'documento', 'enlace'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTerceraVia({ ...terceraVia, tipo })}
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  terceraVia.tipo === tipo ? 'bg-paper-100 text-earth-800' : 'bg-white/10 text-paper-200 hover:bg-white/20'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={terceraVia.nombre}
            onChange={(e) => setTerceraVia({ ...terceraVia, nombre: e.target.value })}
            className={`${inputClass} mt-2`}
          />
          {terceraVia.tipo === 'enlace' ? (
            <input
              type="url"
              placeholder="https://..."
              value={terceraVia.url}
              onChange={(e) => setTerceraVia({ ...terceraVia, url: e.target.value })}
              className={`${inputClass} mt-2`}
            />
          ) : (
            <div className="mt-2">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setTerceraVia({ ...terceraVia, tipo: 'archivo', nombre: file.name, url: '' });
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-paper-100/40 px-3 py-2 text-sm text-paper-200 transition-colors hover:bg-white/10"
              >
                <Upload size={15} />
                {terceraVia.nombre || 'Añadir archivo o documento'}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-paper-400/70 bg-paper-50 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#704c12]">Fuente primaria</span>
          <input
            type="text"
            placeholder="Nombre de la fuente primaria"
            value={fuenteNombre}
            onChange={(e) => setFuenteNombre(e.target.value)}
            className={`${inputClass} mt-2`}
          />
          <input
            type="url"
            placeholder="Enlace o documento primario"
            value={fuenteEnlace}
            onChange={(e) => setFuenteEnlace(e.target.value)}
            className={`${inputClass} mt-2`}
          />
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-400">
            <FileText size={13} />
            También puedes pegar un enlace a documento
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-accent-err">{error}</p>}

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-paper-400 px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-paper-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg bg-[#704c12] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
        >
          <Plus size={15} />
          Guardar noticia
        </button>
      </div>
    </div>
  );
}
