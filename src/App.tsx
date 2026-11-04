import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import EscanerDeMarcos from '@/components/EscanerDeMarcos';
import FichaDeImpacto from '@/components/FichaDeImpacto';
import Apoyo from '@/components/Apoyo';
import Contacto from '@/components/Contacto';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { toSectionPath, useRoute, type SectionPath } from '@/lib/router';
import { useScrollProgress } from '@/hooks/useReveal';

const SECTION_VIEWS: Record<SectionPath, ReactNode> = {
  '/': <Hero />,
  '/escaner': <EscanerDeMarcos />,
  '/impacto': <FichaDeImpacto />,
  '/apoyo': <Apoyo />,
  '/contacto': <Contacto />,
};

function App() {
  const progress = useScrollProgress();
  const current = toSectionPath(useRoute());

  return (
    <div id="top" className="min-h-screen bg-paper-100 pb-16 lg:pb-0">
      {/* Reading progress bar */}
      <div className="fixed left-0 right-0 top-0 z-[60] h-0.5 bg-transparent">
        <div
          className="reading-progress h-full bg-earth-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Header />

      <main>
        <div key={current} className="animate-fade-up">
          {SECTION_VIEWS[current]}
        </div>
      </main>

      <Footer />
      <MobileNav current={current} />
    </div>
  );
}

export default App;
