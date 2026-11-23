import ModalShell from '@/components/ModalShell';

interface SubmitWorkModalProps {
  formatSlug?: string;
  onSubmitted?: () => void;
  onClose: () => void;
}

const TALLY_EMBED_URL = 'https://tally.so/embed/aO2K2B?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

export default function SubmitWorkModal({ onClose }: SubmitWorkModalProps) {
  return (
    <ModalShell title="Publica tu proyecto" onClose={onClose}>
      <iframe
        src={TALLY_EMBED_URL}
        title="Formulario de publicación de proyectos"
        loading="lazy"
        style={{ border: 0, height: '622px', width: '100%' }}
        className="rounded-lg bg-transparent"
      />
    </ModalShell>
  );
}
