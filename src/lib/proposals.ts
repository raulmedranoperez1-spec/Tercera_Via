import { supabase } from '@/lib/supabase';

export interface ProposalAuthor {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface Proposal {
  id: string;
  author_id: string;
  body: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author: ProposalAuthor;
  liked_by_me: boolean;
}

export interface ProposalComment {
  id: string;
  proposal_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: ProposalAuthor;
}

function readAuthor(row: Record<string, unknown>): ProposalAuthor {
  const author = (row.author as Partial<ProposalAuthor> | null) ?? {};
  return {
    display_name: author.display_name ?? null,
    username: author.username ?? null,
    avatar_url: author.avatar_url ?? null,
  };
}

export const PROPOSAL_MAX_LENGTH = 1000;

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function authorName(author: ProposalAuthor): string {
  return author.display_name || author.username || 'Usuario';
}

export async function fetchProposals(userId: string): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from('forum_proposals')
    .select('id, author_id, body, like_count, comment_count, created_at, author:profiles!forum_proposals_author_id_fkey(display_name, username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const ids = rows.map((r) => r.id as string);
  const likedIds = new Set<string>();

  if (ids.length > 0) {
    const { data: likes, error: likesError } = await supabase
      .from('forum_proposal_likes')
      .select('proposal_id')
      .eq('user_id', userId)
      .in('proposal_id', ids);
    if (likesError) throw likesError;
    for (const like of likes ?? []) likedIds.add((like as { proposal_id: string }).proposal_id);
  }

  return rows.map((row) => {
    const { author: _author, ...rest } = row;
    void _author;
    return {
      ...(rest as unknown as Omit<Proposal, 'author' | 'liked_by_me'>),
      author: readAuthor(row),
      liked_by_me: likedIds.has(row.id as string),
    };
  });
}

export async function createProposal(body: string): Promise<void> {
  const { error } = await supabase.from('forum_proposals').insert({ body });
  if (error) throw error;
}

export async function deleteProposal(id: string): Promise<void> {
  const { error } = await supabase.from('forum_proposals').delete().eq('id', id);
  if (error) throw error;
}

export async function setProposalLiked(proposalId: string, userId: string, liked: boolean): Promise<void> {
  if (liked) {
    const { error } = await supabase
      .from('forum_proposal_likes')
      .insert({ proposal_id: proposalId, user_id: userId });
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('forum_proposal_likes')
    .delete()
    .eq('proposal_id', proposalId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchProposalComments(proposalId: string): Promise<ProposalComment[]> {
  const { data, error } = await supabase
    .from('forum_proposal_comments')
    .select('id, proposal_id, author_id, body, created_at, author:profiles!forum_proposal_comments_author_id_fkey(display_name, username, avatar_url)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const { author: _author, ...rest } = row;
    void _author;
    return {
      ...(rest as unknown as Omit<ProposalComment, 'author'>),
      author: readAuthor(row),
    };
  });
}

export async function createProposalComment(proposalId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('forum_proposal_comments')
    .insert({ proposal_id: proposalId, body });
  if (error) throw error;
}

export async function deleteProposalComment(id: string): Promise<void> {
  const { error } = await supabase.from('forum_proposal_comments').delete().eq('id', id);
  if (error) throw error;
}
