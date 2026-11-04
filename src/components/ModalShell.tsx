import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalShell({ title, onClose, children }: ModalShellProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#f7f1e7] p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-black/50 transition-colors hover:bg-black/10 hover:text-black" aria-label="Cerrar">
          <X size={20} />
        </button>
        <h2 className="mb-6 pr-8 font-serif text-3xl font-semibold text-black">{title}</h2>
        {children}
      </div>
    </div>
  );
}
