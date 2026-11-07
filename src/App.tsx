import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import EscanerDeMarcos from '@/components/EscanerDeMarcos';
import FichaDeImpacto from '@/components/FichaDeImpacto';
import Apoyo from '@/components/Apoyo';
import Contacto from '@/components/Contacto';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import WriterProfilePage from '@/components/WriterProfilePage';
import ArticleDetailPage from '@/components/ArticleDetailPage';
import ProjectDetailPage from '@/components/ProjectDetailPage';
import CodigoDeontologico from '@/components/CodigoDeontologico';
import ForumPage from '@/components/ForumPage';
import ForumCategoryPage from '@/components/ForumCategoryPage';
import ForumThreadPage from '@/components/ForumThreadPage';
import ForumRulesPage from '@/components/ForumRulesPage';
import ForumModerationPage from '@/components/ForumModerationPage';
import ForumAdminPage from '@/components/ForumAdminPage';
import AdminPage from '@/components/AdminPage';
import { toSectionPath, useRoute, resolveRoute, type SectionPath } from '@/lib/router';
import { useScrollProgress } from '@/hooks/useReveal';
import { useAuth } from '@/lib/authContext';

const SECTION_VIEWS: Record<SectionPath, ReactNode> = {
  '/': <Hero />,
  '/escaner': <EscanerDeMarcos />,
  '/impacto': <FichaDeImpacto />,
  '/apoyo': <Apoyo />,
  '/contacto': <Contacto />,
  '/foro': <ForumPage />,
};

function App() {
  const progress = useScrollProgress();
  const rawPath = useRoute();
  const route = resolveRoute(rawPath);
  const current = route.kind === 'section' ? route.path : '/';
  const { session } = useAuth();

  let content: ReactNode;
  if (route.kind === 'section') {
    content = SECTION_VIEWS[route.path];
  } else if (route.kind === 'me') {
    content = session ? (
      <WriterProfilePage writerId={session.user.id} />
    ) : (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-ink-600">Necesitas iniciar sesión para ver tu perfil.</p>
      </div>
    );
  } else if (route.kind === 'writer') {
    content = <WriterProfilePage writerId={route.id} />;
  } else if (route.kind === 'article') {
    content = <ArticleDetailPage articleId={route.id} />;
  } else if (route.kind === 'project') {
    content = <ProjectDetailPage projectId={route.id} />;
  } else if (route.kind === 'codigo-deontologico') {
    content = <CodigoDeontologico />;
  } else if (route.kind === 'forum') {
    content = <ForumPage />;
  } else if (route.kind === 'forum-category') {
    content = <ForumCategoryPage slug={route.slug} />;
  } else if (route.kind === 'forum-thread') {
    content = <ForumThreadPage threadId={route.id} />;
  } else if (route.kind === 'forum-rules') {
    content = <ForumRulesPage />;
  } else if (route.kind === 'forum-moderation') {
    content = <ForumModerationPage />;
  } else if (route.kind === 'forum-admin') {
    content = <ForumAdminPage />;
  } else if (route.kind === 'admin') {
    content = <AdminPage />;
  } else {
    content = SECTION_VIEWS['/'];
  }

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
        <div key={rawPath} className="animate-fade-up">
          {content}
        </div>
      </main>

      <Footer />
      <MobileNav current={current} />
    </div>
  );
}

export default App;
