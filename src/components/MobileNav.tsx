import { Briefcase, Heart, Home, MessageCircle, ScanLine } from 'lucide-react';
import { sectionHref, type SectionPath } from '@/lib/router';

const items: { icon: typeof Home; label: string; path: SectionPath }[] = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: ScanLine, label: 'Escáner', path: '/escaner' },
  { icon: Briefcase, label: 'Impacto', path: '/impacto' },
  { icon: MessageCircle, label: 'Foro', path: '/foro' },
  { icon: Heart, label: 'Apoyo', path: '/apoyo' },
];

export default function MobileNav({ current }: { current: SectionPath }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-paper-400/60 bg-paper-100/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.path === current;
          return (
            <a
              key={item.path}
              href={sectionHref(item.path)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors hover:bg-paper-300 ${active ? 'text-earth-900' : 'text-earth-700'}`}
            >
              <Icon size={20} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
