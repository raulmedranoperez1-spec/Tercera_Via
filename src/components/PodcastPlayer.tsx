import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, Volume2, Volume1, VolumeX } from 'lucide-react';
import type { PodcastSummary } from '@/lib/writers';
import { formatDate, formatDuration } from '@/lib/contentTypes';

interface PodcastPlayerProps {
  podcast: PodcastSummary;
  onClose: () => void;
}

export default function PodcastPlayer({ podcast, onClose }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.duration_seconds ?? 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnd = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    if (podcast.audio_url) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [podcast.audio_url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !podcast.audio_url) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = Number(e.target.value);
    setVolume(vol);
    audio.volume = vol;
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] border-t border-paper-400/60 bg-earth-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Cover + title */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:w-64">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-earth-800">
            {podcast.cover_image_url ? (
              <img src={podcast.cover_image_url} alt={podcast.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Play size={16} className="text-paper-400" fill="currentColor" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-paper-100">{podcast.title}</p>
            <p className="truncate text-xs text-paper-400">{formatDate(podcast.published_at)}</p>
          </div>
        </div>

        {/* Play/pause + seek */}
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!podcast.audio_url}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100 text-earth-900 transition-colors hover:bg-paper-200 disabled:opacity-40"
            aria-label={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
          </button>
          <span className="hidden w-12 text-right text-xs text-paper-400 sm:block">
            {formatDuration(Math.floor(currentTime))}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={seek}
            disabled={!podcast.audio_url}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-paper-400/30 accent-paper-100 disabled:opacity-40"
            style={{ background: `linear-gradient(to right, #f8f3e9 ${pct}%, rgba(220,200,166,0.3) ${pct}%)` }}
          />
          <span className="hidden w-12 text-xs text-paper-400 sm:block">
            {formatDuration(Math.floor(duration))}
          </span>
        </div>

        {/* Volume + close */}
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={toggleMute} className="text-paper-400 transition-colors hover:text-paper-100" aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
            {muted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={changeVolume}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-paper-400/30 accent-paper-100"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-paper-400 transition-colors hover:bg-earth-800 hover:text-paper-100"
          aria-label="Cerrar reproductor"
        >
          <X size={18} />
        </button>
      </div>

      {podcast.audio_url && (
        <audio ref={audioRef} src={podcast.audio_url} preload="metadata" />
      )}
      {!podcast.audio_url && (
        <p className="px-4 pb-2 text-center text-xs text-paper-400">
          Audio no disponible para este podcast.
        </p>
      )}
    </div>
  );
}
