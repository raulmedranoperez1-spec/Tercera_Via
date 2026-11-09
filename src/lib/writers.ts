import { supabase } from '@/lib/supabase';

export interface WriterProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface ArticleSummary {
  id: string;
  author_id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  format: string;
  published_at: string;
  likes: number;
  saves: number;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
}

export interface ProjectSummary {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  project_url: string | null;
  published_at: string;
}

export interface ProjectDetail extends ProjectSummary {
  content: string | null;
}

export interface PodcastSummary {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  published_at: string;
}

export interface ProfileUpdate {
  display_name: string;
  username: string;
  bio: string | null;
  avatar_url?: string;
}

const WRITER_COLUMNS = 'id, username, display_name, bio, avatar_url, role, created_at';

export async function fetchWriterProfile(id: string): Promise<WriterProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(WRITER_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as WriterProfile | null;
}

export async function updateOwnProfile(userId: string, update: ProfileUpdate): Promise<WriterProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select(WRITER_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('El perfil no se pudo actualizar.');
  return data as WriterProfile;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export async function fetchWriterArticles(authorId: string): Promise<ArticleSummary[]> {
  const { data, error } = await supabase
    .from('articles_public')
    .select('id, author_id, title, excerpt, cover_image_url, format, published_at, likes, saves')
    .eq('author_id', authorId)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArticleSummary[];
}

export async function fetchWriterProjects(authorId: string): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from('projects_public')
    .select('id, author_id, title, description, cover_image_url, project_url, published_at')
    .eq('author_id', authorId)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectSummary[];
}

export async function fetchWriterPodcasts(authorId: string): Promise<PodcastSummary[]> {
  const { data, error } = await supabase
    .from('podcasts_public')
    .select('id, author_id, title, description, cover_image_url, audio_url, duration_seconds, published_at')
    .eq('author_id', authorId)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PodcastSummary[];
}

export async function fetchArticleSummary(id: string): Promise<ArticleSummary | null> {
  const { data, error } = await supabase
    .from('articles_public')
    .select('id, author_id, title, excerpt, cover_image_url, format, published_at, likes, saves')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ArticleSummary | null;
}

export async function fetchArticleDetail(id: string): Promise<ArticleDetail | null> {
  const { data, error } = await supabase
    .from('articles_detail')
    .select('id, author_id, title, excerpt, content, cover_image_url, format, published_at, likes, saves')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ArticleDetail | null;
}

export async function fetchProjectSummary(id: string): Promise<ProjectSummary | null> {
  const { data, error } = await supabase
    .from('projects_public')
    .select('id, author_id, title, description, cover_image_url, project_url, published_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ProjectSummary | null;
}

export async function fetchProjectDetail(id: string): Promise<ProjectDetail | null> {
  const { data, error } = await supabase
    .from('projects_detail')
    .select('id, author_id, title, description, content, cover_image_url, project_url, published_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ProjectDetail | null;
}

export async function fetchPodcastSummary(id: string): Promise<PodcastSummary | null> {
  const { data, error } = await supabase
    .from('podcasts_public')
    .select('id, author_id, title, description, cover_image_url, audio_url, duration_seconds, published_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as PodcastSummary | null;
}

export async function fetchPodcastDetail(id: string): Promise<PodcastSummary | null> {
  const { data, error } = await supabase
    .from('podcasts_detail')
    .select('id, author_id, title, description, cover_image_url, audio_url, duration_seconds, published_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as PodcastSummary | null;
}
