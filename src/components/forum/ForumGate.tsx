import { LogIn, MessageSquare } from 'lucide-react';
import { useModal } from '@/lib/modalContext';

export default function ForumGate() {
  const { open } = useModal();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-paper-400/50 bg-paper-50 px-6 py-12 text-center shadow-sm sm:px-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#704c12]/10">
          <MessageSquare size={30} className="text-[#704c12]" />
        </div>
        <div className="space-y-3">
          <h1 className="font-serif text-4xl font-semibold text-ink-800 sm:text-5xl">Foro</h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
            Escribe propuestas para nuestros creadores, debate con la comunidad y comenta las ideas de otros lectores.
          </p>
        </div>
        <button
          onClick={() => open({ kind: 'auth', mode: 'login' })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#704c12] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#5d432c] hover:shadow-md active:scale-[0.98] sm:w-auto"
        >
          <LogIn size={16} />
          Inicia sesión o regístrate para participar en el foro de Tercera Vía
        </button>
        <p className="text-xs text-ink-400">Entrar es gratis y solo necesitas un minuto.</p>
      </div>
    </div>
  );
}
