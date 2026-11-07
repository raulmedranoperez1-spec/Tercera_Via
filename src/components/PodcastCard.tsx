import { Calendar, Play, Clock } from 'lucide-react';
import type { PodcastSummary } from '@/lib/writers';
import { formatDate, formatDuration } from '@/lib/contentTypes';

interface PodcastCardProps {
  podcast: PodcastSummary;
  onPlay: (podcast: PodcastSummary) => void;
}

export default function PodcastCard({ podcast, onPlay }: PodcastCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-paper-400/50 bg-paper-50 shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-paper-300 sm:aspect-[16/9]">
        {podcast.cover_image_url ? (
          <img
            src={podcast.cover_image_url}
            alt={podcast.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-earth-200 to-earth-400">
            <Play size={32} className="text-white/40" fill="currentColor" />
          </div>
        )}
        <button
          type="button"
          onClick={() => onPlay(podcast)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30"
          aria-label={`Reproducir ${podcast.title}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
            <Play size={20} className="ml-0.5 text-[#704c12]" fill="currentColor" />
          </span>
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink-800">
          {podcast.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {podcast.description ?? ''}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {formatDate(podcast.published_at)}
          </span>
          {podcast.duration_seconds && podcast.duration_seconds > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {formatDuration(podcast.duration_seconds)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onPlay(podcast)}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#704c12] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5d432c]"
        >
          <Play size={15} fill="currentColor" />
          Reproducir
        </button>
      </div>
    </div>
  );
}
