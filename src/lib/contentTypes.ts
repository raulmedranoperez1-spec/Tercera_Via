export interface WriterProfile {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  is_socio: boolean;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

export interface Article {
  id: string;
  author_id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
  likes: number;
  saves: number;
}

export interface Project {
  id: string;
  author_id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  content: string;
  project_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
}

export interface Podcast {
  id: string;
  author_id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
}

export type ContentTab = 'noticias' | 'proyectos' | 'podcasts';

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function initials(name: string | null, email: string): string {
  const base = name || email.split('@')[0] || '?';
  const parts = base.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

export function displayName(name: string | null, email: string): string {
  return name || email.split('@')[0] || 'Anónimo';
}
