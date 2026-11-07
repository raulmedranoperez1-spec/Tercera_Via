import { createContext, useContext } from 'react';
import type { FormatSlug } from '@/lib/formats';

export type ModalRequest =
  | { kind: 'auth'; mode: 'login' | 'signup' }
  | { kind: 'account' }
  | { kind: 'edit-profile' }
  | { kind: 'share'; formatSlug?: FormatSlug; onSubmitted?: () => void }
  | { kind: 'forum-new-thread'; categoryId: string; categoryName: string };

export interface ModalControls {
  open: (request: ModalRequest) => void;
  close: () => void;
}

export const ModalContext = createContext<ModalControls | null>(null);

export function useModal(): ModalControls {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal debe usarse dentro de ModalProvider');
  return ctx;
}
