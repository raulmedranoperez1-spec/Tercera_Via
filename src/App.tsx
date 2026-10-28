import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import EscanerDeMarcos from '@/components/EscanerDeMarcos';
import FichaDeImpacto from '@/components/FichaDeImpacto';
import SobreNosotros from '@/components/SobreNosotros';
import CurvaDeValor from '@/components/CurvaDeValor';
import Apoyo from '@/components/Apoyo';
import ComunidadDeSocios from '@/components/ComunidadDeSocios';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import AuthModal from '@/components/AuthModal';
import ProjectSubmissionModal from '@/components/ProjectSubmissionModal';
import { useScrollProgress } from '@/hooks/useReveal';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const progress = useScrollProgress();

  const scrollToSection = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
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

      <Header
        onSubscribeClick={() => scrollToSection('#apoyo')}
        onAuthClick={() => setAuthOpen(true)}
        onSubmissionClick={() => setSubmissionOpen(true)}
        onSobreNosotrosClick={() => scrollToSection('#sobre-nosotros')}
      />

      <main>
        <Hero
          onSubmissionClick={() => setSubmissionOpen(true)}
          onExploreClick={() => scrollToSection('#escaner')}
        />
        <EscanerDeMarcos />
        <FichaDeImpacto />
        <CurvaDeValor />
        <SobreNosotros onSubmissionClick={() => setSubmissionOpen(true)} />
        <ComunidadDeSocios />
        <Apoyo />
      </main>

      <Footer onSubscribeClick={() => scrollToSection('#apoyo')} />
      <MobileNav />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ProjectSubmissionModal open={submissionOpen} onClose={() => setSubmissionOpen(false)} />
    </div>
  );
}

export default App;
