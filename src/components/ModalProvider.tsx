import { useCallback, useMemo, useState, type ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';
import AccountModal from '@/components/AccountModal';
import SubmitWorkModal from '@/components/SubmitWorkModal';
import EditProfileModal from '@/components/EditProfileModal';
import { ModalContext, type ModalRequest } from '@/lib/modalContext';

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ModalRequest | null>(null);

  const close = useCallback(() => setRequest(null), []);
  const open = useCallback((next: ModalRequest) => setRequest(next), []);
  const controls = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ModalContext.Provider value={controls}>
      {children}
      {request?.kind === 'auth' && (
        <AuthModal key={request.mode} initialMode={request.mode} onClose={close} />
      )}
      {request?.kind === 'account' && <AccountModal onClose={close} />}
      {request?.kind === 'edit-profile' && <EditProfileModal onClose={close} />}
      {request?.kind === 'share' && (
        <SubmitWorkModal
          formatSlug={request.formatSlug}
          onSubmitted={request.onSubmitted}
          onClose={close}
        />
      )}
    </ModalContext.Provider>
  );
}
