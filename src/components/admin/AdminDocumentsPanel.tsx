import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { adminApi, type AdminDocument, type DocumentStatus } from '@/lib/adminApi';
import { describeError } from '@/lib/edgeFunctions';

interface AdminDocumentsPanelProps {
  token: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const STATUS_LABELS: Record<DocumentStatus, { label: string; className: string }> = {
  procesando: { label: 'Procesando', className: 'bg-earth-100 text-earth-800' },
  listo: { label: 'Listo', className: 'bg-emerald-50 text-accent-ok' },
  error: { label: 'Error', className: 'bg-red-50 text-accent-err' },
};

export default function AdminDocumentsPanel({ token }: AdminDocumentsPanelProps) {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await adminApi.listDocuments(token);
      setDocuments(response.documents);
    } catch (err) {
      setLoadError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setActionError('');
    if (file.size > MAX_FILE_BYTES) {
      setActionError('El archivo supera el tamaño máximo de 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const response = await adminApi.uploadDocument(token, file);
      if (response.document.status === 'error') {
        setActionError(response.document.error_message ?? 'No se pudo procesar el documento.');
      }
      await loadDocuments();
    } catch (err) {
      setActionError(describeError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError('');
    try {
      await adminApi.deleteDocument(token, id);
      setConfirmingId(null);
      await loadDocuments();
    } catch (err) {
      setActionError(describeError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-black/20 bg-white p-6 text-center">
        <p className="text-sm leading-relaxed text-black/70">
          Sube el Libro de estilo en PDF o DOCX (máximo 5 MB). El agente lo divide en fragmentos y los usa para revisar los borradores.
        </p>
        <label className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
          <Upload size={16} />
          {uploading ? 'Procesando documento...' : 'Subir documento'}
          <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUpload} className="sr-only" disabled={uploading} />
        </label>
      </div>

      {actionError && <p role="alert" className="text-sm text-accent-err">{actionError}</p>}

      {loading && <p className="text-sm text-black/60">Cargando documentos...</p>}
      {loadError && (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-accent-err">{loadError}</p>
          <button type="button" onClick={loadDocuments} className="rounded-lg border border-black/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && documents.length === 0 && (
        <p className="text-center text-sm text-black/60">Todavía no hay documentos cargados.</p>
      )}

      {!loading && !loadError && documents.length > 0 && (
        <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl bg-white">
          {documents.map((doc) => {
            const status = STATUS_LABELS[doc.status];
            const confirming = confirmingId === doc.id;
            return (
              <li key={doc.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText size={20} className="mt-0.5 shrink-0 text-earth-700" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-black">{doc.file_name}</p>
                    <p className="text-xs text-black/55">
                      {new Date(doc.created_at).toLocaleDateString('es-ES')}
                      {doc.status === 'listo' && ` · ${doc.chunk_count} fragmentos`}
                    </p>
                    {doc.status === 'error' && doc.error_message && (
                      <p className="mt-1 text-xs text-accent-err">{doc.error_message}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                  {confirming ? (
                    <>
                      <button type="button" onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id} className="rounded-lg bg-accent-err px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                        {deletingId === doc.id ? 'Eliminando...' : 'Confirmar'}
                      </button>
                      <button type="button" onClick={() => setConfirmingId(null)} className="rounded-lg border border-black/20 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-black/5">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmingId(doc.id)} aria-label={`Eliminar ${doc.file_name}`} className="rounded-lg p-2 text-black/50 transition-colors hover:bg-red-50 hover:text-accent-err">
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
