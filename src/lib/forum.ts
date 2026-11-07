import { supabase } from '@/lib/supabase';

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumThreadSummary {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  body: string;
  moderation_status: string;
  moderation_reason: string | null;
  post_count: number;
  last_activity_at: string;
  created_at: string;
  author_name: string | null;
  author_username: string | null;
  author_avatar: string | null;
}

export interface ForumThreadDetail extends ForumThreadSummary {
  category_name: string;
  category_slug: string;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  parent_post_id: string | null;
  body: string;
  moderation_status: string;
  moderation_reason: string | null;
  edited_at: string | null;
  created_at: string;
  author_name: string | null;
  author_username: string | null;
  author_avatar: string | null;
  author_role: string | null;
}

const THREAD_AUTHOR_JOIN = `
  id, category_id, author_id, title, body, moderation_status,
  moderation_reason, post_count, last_activity_at, created_at,
  author:profiles!forum_threads_author_id_fkey(display_name, username, avatar_url)
`;

const POST_AUTHOR_JOIN = `
  id, thread_id, author_id, parent_post_id, body, moderation_status,
  moderation_reason, edited_at, created_at,
  author:profiles!forum_posts_author_id_fkey(display_name, username, avatar_url, role)
`;

function mapThreadAuthor(row: Record<string, unknown>): ForumThreadSummary {
  const author = (row.author as Record<string, string | null> | null) ?? {};
  const { author: _a, ...rest } = row;
  void _a;
  return {
    ...(rest as unknown as Omit<ForumThreadSummary, 'author_name' | 'author_username' | 'author_avatar'>),
    author_name: author.display_name ?? null,
    author_username: author.username ?? null,
    author_avatar: author.avatar_url ?? null,
  };
}

function mapPostAuthor(row: Record<string, unknown>): ForumPost {
  const author = (row.author as Record<string, string | null> | null) ?? {};
  const { author: _a, ...rest } = row;
  void _a;
  return {
    ...(rest as unknown as Omit<ForumPost, 'author_name' | 'author_username' | 'author_avatar' | 'author_role'>),
    author_name: author.display_name ?? null,
    author_username: author.username ?? null,
    author_avatar: author.avatar_url ?? null,
    author_role: author.role ?? null,
  };
}

export async function fetchCategories(): Promise<ForumCategory[]> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('id, slug, name, description, sort_order, is_active, created_at')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ForumCategory[];
}

export async function fetchCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('id, slug, name, description, sort_order, is_active, created_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as ForumCategory | null;
}

export async function fetchCategoryById(id: string): Promise<ForumCategory | null> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('id, slug, name, description, sort_order, is_active, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ForumCategory | null;
}

export async function fetchThreadsByCategory(categoryId: string): Promise<ForumThreadSummary[]> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(THREAD_AUTHOR_JOIN)
    .eq('category_id', categoryId)
    .order('last_activity_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapThreadAuthor(r as unknown as Record<string, unknown>));
}

export async function fetchThreadById(id: string): Promise<ForumThreadDetail | null> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`${THREAD_AUTHOR_JOIN}, category:forum_categories!forum_threads_category_id_fkey(name, slug)`)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as Record<string, unknown>;
  const category = (row.category as Record<string, string> | null) ?? {};
  const mapped = mapThreadAuthor(row);
  return {
    ...mapped,
    category_name: category.name ?? '',
    category_slug: category.slug ?? '',
  };
}

export async function fetchPostsByThread(threadId: string): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(POST_AUTHOR_JOIN)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => mapPostAuthor(r as unknown as Record<string, unknown>));
}

export interface NewThreadInput {
  category_id: string;
  title: string;
  body: string;
}

export async function createThread(input: NewThreadInput): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('forum_threads')
    .insert(input)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo crear el tema.');
  return { id: (data as { id: string }).id };
}

export interface NewPostInput {
  thread_id: string;
  parent_post_id?: string | null;
  body: string;
}

export async function createPost(input: NewPostInput): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert(input)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo publicar el mensaje.');
  return { id: (data as { id: string }).id };
}

export async function updatePost(postId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .update({ body, edited_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw error;
}

export async function updateThread(threadId: string, title: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .update({ title, body })
    .eq('id', threadId);
  if (error) throw error;
}

export async function deleteThread(threadId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId);
  if (error) throw error;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
}

export async function moderateThread(threadId: string, status: string, reason: string | null): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .update({ moderation_status: status, moderation_reason: reason })
    .eq('id', threadId);
  if (error) throw error;
}

export async function moderatePost(postId: string, status: string, reason: string | null): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .update({ moderation_status: status, moderation_reason: reason })
    .eq('id', postId);
  if (error) throw error;
}

export async function fetchFlaggedThreads(): Promise<ForumThreadSummary[]> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(THREAD_AUTHOR_JOIN)
    .in('moderation_status', ['marcado', 'oculto', 'eliminado'])
    .order('last_activity_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapThreadAuthor(r as unknown as Record<string, unknown>));
}

export async function fetchFlaggedPosts(): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(POST_AUTHOR_JOIN)
    .in('moderation_status', ['marcado', 'oculto', 'eliminado'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapPostAuthor(r as unknown as Record<string, unknown>));
}

export interface CategoryInput {
  slug: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export async function createCategory(input: CategoryInput): Promise<void> {
  const { error } = await supabase.from('forum_categories').insert(input);
  if (error) throw error;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  const { error } = await supabase.from('forum_categories').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('forum_categories').delete().eq('id', id);
  if (error) throw error;
}

export interface ModerationResult {
  recommendation: 'publicar' | 'marcar' | 'sugerir_ocultacion';
  reasons: string[];
  confidence: 'alta' | 'media' | 'baja';
}

export async function moderateWithAI(text: string): Promise<ModerationResult> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/forum-moderate`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error ?? `Error ${response.status}`);
  }
  return (await response.json()) as ModerationResult;
}
