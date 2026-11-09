import { callEdgeFunction } from '@/lib/edgeFunctions';
import type { NewsReviewArticleResult } from '@/lib/news';

export interface DeontologicalReviewResult {
  articles: NewsReviewArticleResult[];
  summary: string;
  passed: boolean;
}

export function reviewNewsDeontology(
  text: string,
  eventStartAt: string | null,
): Promise<DeontologicalReviewResult> {
  return callEdgeFunction<DeontologicalReviewResult>('news-review', {
    text,
    event_start_at: eventStartAt,
  });
}
