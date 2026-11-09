import { supabase } from '@/lib/supabase';

export type NewsStatus =
  | 'borrador'
  | 'pendiente_revision_auto'
  | 'correcciones_necesarias'
  | 'pendiente_revision_editor'
  | 'modificaciones_solicitadas'
  | 'aprobada'
  | 'publicada'
  | 'rechazada'
  | 'retirada';

export interface NewsSource {
  label: string;
  url: string;
}

export interface NewsItem {
  id: string;
  author_id: string;
  title: string;
  subtitle: string | null;
  body: string;
  cover_image_url: string | null;
  cover_caption: string | null;
  category: string | null;
  tags: string[];
  sources: NewsSource[];
  status: NewsStatus;
  event_start_at: string | null;
  content_hash: string | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_version: string | null;
  editor_notes: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsMediaItem {
  id: string;
  news_id: string;
  file_path: string;
  file_url: string;
  file_type: 'image' | 'document' | 'audio' | 'video';
  file_name: string;
  mime_type: string;
  file_size: number;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface NewsReviewArticleResult {
  article_number: number;
  status: 'cumple' | 'no_cumple' | 'revision_necesaria';
  details: string;
}

export interface NewsReviewReport {
  id: string;
  news_id: string;
  report_text: string;
  article_results: NewsReviewArticleResult[];
  passed: boolean;
  created_at: string;
}

export interface NewsEditorReview {
  id: string;
  news_id: string;
  editor_id: string;
  result: 'aprobada' | 'rechazada' | 'modificaciones';
  notes: string | null;
  content_hash: string;
  created_at: string;
}

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  borrador: 'Borrador',
  pendiente_revision_auto: 'Pendiente de revisión automática',
  correcciones_necesarias: 'Correcciones necesarias',
  pendiente_revision_editor: 'Pendiente de revisión editorial',
  modificaciones_solicitadas: 'Modificaciones solicitadas',
  aprobada: 'Aprobada y firmada',
  publicada: 'Publicada',
  rechazada: 'Rechazada',
  retirada: 'Retirada del archivo público',
};

export const NEWS_STATUS_COLORS: Record<NewsStatus, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  pendiente_revision_auto: 'bg-blue-100 text-blue-700',
  correcciones_necesarias: 'bg-orange-100 text-orange-700',
  pendiente_revision_editor: 'bg-purple-100 text-purple-700',
  modificaciones_solicitadas: 'bg-orange-100 text-orange-700',
  aprobada: 'bg-green-100 text-green-700',
  publicada: 'bg-[#704c12]/10 text-[#5d432c]',
  rechazada: 'bg-red-100 text-red-700',
  retirada: 'bg-gray-200 text-gray-600',
};

const NEWS_COLUMNS = 'id, author_id, title, subtitle, body, cover_image_url, cover_caption, category, tags, sources, status, event_start_at, content_hash, approved_by, approved_at, approval_version, editor_notes, published_at, created_at, updated_at';

function computeHash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

export function newsContentHash(item: { title: string; subtitle: string | null; body: string }): string {
  return computeHash(`${item.title}||${item.subtitle ?? ''}||${item.body}`);
}

export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from('news')
    .select(NEWS_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as NewsItem | null;
}

export async function fetchPublishedNews(limit = 20): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select(NEWS_COLUMNS)
    .eq('status', 'publicada')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NewsItem[];
}

export async function fetchNewsByAuthor(authorId: string): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select(NEWS_COLUMNS)
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsItem[];
}

export async function fetchNewsForReview(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select(NEWS_COLUMNS)
    .in('status', ['pendiente_revision_editor', 'aprobada', 'modificaciones_solicitadas', 'rechazada'])
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsItem[];
}

export async function createNewsDraft(): Promise<NewsItem> {
  const { data, error } = await supabase
    .from('news')
    .insert({ title: 'Sin título', body: '', status: 'borrador' })
    .select(NEWS_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo crear el borrador.');
  return data as NewsItem;
}

export async function updateNews(id: string, updates: Partial<NewsItem>): Promise<NewsItem> {
  const { data, error } = await supabase
    .from('news')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(NEWS_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo guardar la noticia.');
  return data as NewsItem;
}

export async function deleteNews(id: string): Promise<void> {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchNewsMedia(newsId: string): Promise<NewsMediaItem[]> {
  const { data, error } = await supabase
    .from('news_media')
    .select('*')
    .eq('news_id', newsId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as NewsMediaItem[];
}

export async function uploadNewsMedia(
  userId: string,
  newsId: string,
  file: File,
  fileType: 'image' | 'document' | 'audio' | 'video',
  sortOrder: number = 0,
  caption?: string,
): Promise<NewsMediaItem> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${userId}/${newsId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('news-media')
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (uploadError) throw uploadError;

  const fileUrl = supabase.storage.from('news-media').getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase
    .from('news_media')
    .insert({
      news_id: newsId,
      file_path: path,
      file_url: fileUrl,
      file_type: fileType,
      file_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      sort_order: sortOrder,
      caption: caption ?? null,
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo registrar el archivo.');
  return data as NewsMediaItem;
}

export async function deleteNewsMediaItem(mediaId: string, filePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage.from('news-media').remove([filePath]);
  if (storageError) throw storageError;
  const { error } = await supabase.from('news_media').delete().eq('id', mediaId);
  if (error) throw error;
}

export async function fetchReviewReports(newsId: string): Promise<NewsReviewReport[]> {
  const { data, error } = await supabase
    .from('news_review_reports')
    .select('*')
    .eq('news_id', newsId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsReviewReport[];
}

export async function fetchEditorReviews(newsId: string): Promise<NewsEditorReview[]> {
  const { data, error } = await supabase
    .from('news_editor_reviews')
    .select('*')
    .eq('news_id', newsId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsEditorReview[];
}

export async function submitForAutoReview(newsId: string): Promise<void> {
  const { error } = await supabase
    .from('news')
    .update({ status: 'pendiente_revision_auto', updated_at: new Date().toISOString() })
    .eq('id', newsId);
  if (error) throw error;
}

export async function submitForEditorReview(newsId: string): Promise<void> {
  const { error } = await supabase
    .from('news')
    .update({ status: 'pendiente_revision_editor', updated_at: new Date().toISOString() })
    .eq('id', newsId);
  if (error) throw error;
}

export async function publishNews(newsId: string): Promise<void> {
  const { error } = await supabase
    .from('news')
    .update({ status: 'publicada', published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', newsId);
  if (error) throw error;
}

export async function editorReviewAction(
  newsId: string,
  result: 'aprobada' | 'rechazada' | 'modificaciones',
  notes: string,
  contentHash: string,
): Promise<void> {
  const editorId = (await supabase.auth.getUser()).data.user?.id;
  if (!editorId) throw new Error('No se pudo identificar al editor.');

  const { error: reviewError } = await supabase.from('news_editor_reviews').insert({
    news_id: newsId,
    editor_id: editorId,
    result,
    notes,
    content_hash: contentHash,
  });
  if (reviewError) throw reviewError;

  const statusMap: Record<typeof result, NewsStatus> = {
    aprobada: 'aprobada',
    rechazada: 'rechazada',
    modificaciones: 'modificaciones_solicitadas',
  };

  const updates: Record<string, unknown> = {
    status: statusMap[result],
    updated_at: new Date().toISOString(),
    editor_notes: notes || null,
  };

  if (result === 'aprobada') {
    updates.approved_by = editorId;
    updates.approved_at = new Date().toISOString();
    updates.approval_version = contentHash;
  }

  const { error } = await supabase.from('news').update(updates).eq('id', newsId);
  if (error) throw error;
}

export function classifyFileType(mime: string): 'image' | 'document' | 'audio' | 'video' | null {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf' || mime.includes('document') || mime === 'text/plain') return 'document';
  return null;
}

export const ACCEPTED_FILE_TYPES = '.jpg,.jpeg,.png,.webp,.pdf,.docx,.doc,.txt,.mp3,.wav,.m4a,.aac,.mp4,.mov,.webm';
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
