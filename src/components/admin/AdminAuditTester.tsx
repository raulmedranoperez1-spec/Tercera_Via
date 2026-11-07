import { useState } from 'react';
import StyleAuditPanel from '@/components/StyleAuditPanel';
import { STYLE_AUDIT_MIN_LENGTH } from '@/lib/styleAudit';

const textareaClass = 'w-full resize-y rounded-lg border border-black/15 bg-white px-4 py-3 text-sm leading-relaxed text-black outline-none focus:border-[#a87945]';

export default function AdminAuditTester() {
  const [draft, setDraft] = useState('');

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-black/70">
        Pega un borrador para ejecutar la revisión con el prompt y los documentos actuales. El resultado es el mismo que verá el redactor al enviar su trabajo.
      </p>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={12} maxLength={15000} placeholder="Pega aquí el texto del borrador" aria-label="Borrador de prueba" className={textareaClass} />
      <StyleAuditPanel
        text={draft}
        buttonClassName="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a87945] hover:text-black disabled:opacity-40"
        disabledHint={`Escribe al menos ${STYLE_AUDIT_MIN_LENGTH} caracteres para ejecutar la prueba.`}
      />
    </div>
  );
}
