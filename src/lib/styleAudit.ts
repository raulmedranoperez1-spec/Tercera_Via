import { callEdgeFunction } from '@/lib/edgeFunctions';

export const STYLE_AUDIT_MIN_LENGTH = 40;

export interface StyleAuditResponse {
  result: string;
}

export function auditDraft(text: string): Promise<StyleAuditResponse> {
  return callEdgeFunction<StyleAuditResponse>('style-audit', { text });
}
