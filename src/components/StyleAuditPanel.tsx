import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import StyleAuditResult from '@/components/StyleAuditResult';
import { auditDraft, STYLE_AUDIT_MIN_LENGTH } from '@/lib/styleAudit';
import { describeError } from '@/lib/edgeFunctions';

interface StyleAuditPanelProps {
  text: string;
  buttonClassName: string;
  disabledHint?: string;
}

export default function StyleAuditPanel({ text, buttonClassName, disabledHint }: StyleAuditPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const canAudit = text.trim().length >= STYLE_AUDIT_MIN_LENGTH;

  const handleAudit = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const response = await auditDraft(text.trim());
      setResult(response.result);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={handleAudit} disabled={!canAudit || loading} className={buttonClassName}>
        <Sparkles size={17} />
        {loading ? 'Auditando...' : 'Auditar con Libro de Estilo'}
      </button>
      {!canAudit && disabledHint && <p className="text-xs text-black/55">{disabledHint}</p>}
      {error && <p role="alert" className="text-sm text-accent-err">{error}</p>}
      {result && <StyleAuditResult result={result} />}
    </div>
  );
}
