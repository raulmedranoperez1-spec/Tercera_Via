import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Bookmark, Calendar, Loader2 } from 'lucide-react';
import { fetchArticleDetail, fetchWriterProfile, type ArticleDetail, type WriterProfile } from '@/lib/writers';
import { formatDate, displayName } from '@/lib/contentTypes';
import { sectionHref, writerHref } from '@/lib/router';

interface ArticleDetailPageProps {
  articleId: string;
}

export default function ArticleDetailPage({ articleId }: ArticleDetailPageProps) {
  const [article, setArticle] = useState<ArticleDetail | null | undefined>(undefined);
  const [author, setAuthor] = useState<WriterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchArticleDetail(articleId)
      .then(async (a) => {
        if (!active) return;
        if (!a) {
          setArticle(null);
          setError('No se encontró este artículo.');
          return;
        }
        setArticle(a);
        if (a.author_id) {
          const w = await fetchWriterProfile(a.author_id);
          if (active) setAuthor(w);
        }
      })
      .catch(() => {
        if (active) setError('No se pudo cargar el artículo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#704c12]" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">{error || 'Artículo no encontrado.'}</p>
        <a href={sectionHref('/')} className="mt-6 inline-block rounded-lg bg-[#704c12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]">
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <a href={sectionHref('/')} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-[#704c12]">
        <ArrowLeft size={16} />
        Volver
      </a>

      {/* Cover */}
      {article.cover_image_url && (
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-paper-300">
          <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Title + meta */}
      <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-800 sm:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-500">{article.excerpt}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-paper-400/40 py-4 text-sm text-ink-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={15} />
          {formatDate(article.published_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Heart size={15} className="text-accent-err/70" />
          {article.likes}
        </span>
        <span className="flex items-center gap-1.5">
          <Bookmark size={15} className="text-[#704c12]/70" />
          {article.saves}
        </span>
        {author && (
          <a
            href={writerHref(author.id)}
            className="ml-auto flex items-center gap-2 rounded-full bg-paper-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-paper-300"
          >
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-paper-300">
              {author.avatar_url ? (
                <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-[#5d432c]">{displayName(author.display_name, author.username ?? 'E')[0]}</span>
              )}
            </span>
            {displayName(author.display_name, author.username ?? 'Escritor')}
          </a>
        )}
      </div>

      {/* Content */}
      <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-700">
        {article.content.split('\n').map((para, i) =>
          para.trim() ? <p key={i}>{para}</p> : null
        )}
      </div>
    </article>
  );
}
