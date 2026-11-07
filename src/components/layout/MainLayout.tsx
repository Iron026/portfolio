import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MotionProvider } from '@/hooks/useMotion';

/** Rola até a seção indicada no endereço (#servicos) ou ao topo ao trocar de página. */
function ScrollManager() {
  const { pathname, hash, search, key } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // Aguarda a página renderizar antes de rolar
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }, 30);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash, search, key]);
  return null;
}

export function MainLayout() {
  return (
    // font-text: o portfólio usa a tipografia da marca; as demonstrações ficam fora deste layout.
    <MotionProvider>
      <div className="brand font-text">
        <ScrollManager />
        <Header />
        <main id="conteudo" tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
    </MotionProvider>
  );
}
