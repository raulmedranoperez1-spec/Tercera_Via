import { Heart, Bookmark, Calendar } from 'lucide-react';
import type { ArticleSummary } from '@/lib/writers';
import { formatDate } from '@/lib/contentTypes';
import { articleHref } from '@/lib/router';

interface ArticleCardProps {
  article: ArticleSummary;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={articleHref(article.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-paper-400/50 bg-paper-50 shadow-sm transition-all hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-paper-300">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paper-300 to-paper-400">
            <span className="font-serif text-3xl text-[#704c12]/30">A</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-[#704c12]">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {article.excerpt ?? ''}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {formatDate(article.published_at)}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart size={13} className="text-accent-err/70" />
              {article.likes}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark size={13} className="text-[#704c12]/70" />
              {article.saves}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
