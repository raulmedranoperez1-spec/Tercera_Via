import { useRef } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import EscanerDeMarcos from '@/components/EscanerDeMarcos';
import FichaDeImpacto from '@/components/FichaDeImpacto';
import SobreNosotros from '@/components/SobreNosotros';
import CurvaDeValor from '@/components/CurvaDeValor';
import Apoyo from '@/components/Apoyo';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { useScrollProgress } from '@/hooks/useReveal';

function App() {
  const subscribeRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress();

  const scrollToSubscribe = () => {
    subscribeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div id="top" className="min-h-screen bg-paper-100 pb-16 lg:pb-0">
      {/* Reading progress bar */}
      <div className="fixed left-0 right-0 top-0 z-[60] h-0.5 bg-transparent">
        <div
          className="reading-progress h-full bg-earth-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Header onSubscribeClick={scrollToSubscribe} />

      <main>
        <Hero subscribeRef={subscribeRef} />
        <EscanerDeMarcos />
        <FichaDeImpacto />
        <CurvaDeValor />
        <SobreNosotros />
        <Apoyo />
      </main>

      <Footer onSubscribeClick={scrollToSubscribe} />
      <MobileNav />
    </div>
  );
}

export default App;
