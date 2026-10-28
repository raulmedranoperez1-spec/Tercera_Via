import { ScanLine, Home, BarChart3, Users, Heart, MessageCircle } from 'lucide-react';

const items = [
  { icon: Home, label: 'Inicio', href: '#top' },
  { icon: ScanLine, label: 'Escáner', href: '#escaner' },
  { icon: BarChart3, label: 'Curva', href: '#curva' },
  { icon: MessageCircle, label: 'Comunidad', href: '#comunidad' },
  { icon: Heart, label: 'Planes', href: '#apoyo' },
];

export default function MobileNav() {
  const handleClick = (href: string) => {
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-paper-400/60 bg-paper-100/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => handleClick(item.href)}
              className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-earth-800 transition-colors hover:bg-paper-300"
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
