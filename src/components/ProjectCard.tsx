import { Calendar, ExternalLink } from 'lucide-react';
import type { Project } from '@/lib/contentTypes';
import { formatDate } from '@/lib/contentTypes';
import { projectHref } from '@/lib/router';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a
      href={projectHref(project.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-paper-400/50 bg-paper-50 shadow-sm transition-all hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-paper-300">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-earth-200 to-earth-300">
            <ExternalLink size={28} className="text-[#704c12]/30" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-[#704c12]">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {project.description}
        </p>
        <div className="mt-auto flex items-center pt-3 text-xs text-ink-400">
          <Calendar size={13} className="mr-1.5" />
          {formatDate(project.published_at)}
        </div>
      </div>
    </a>
  );
}
