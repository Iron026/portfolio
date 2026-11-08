import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';

// Fontes das demonstrações, hospedadas junto com o site (sem Google Fonts).
// O navegador só baixa cada arquivo quando uma página usa aquela fonte.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css'; // usado em totais e destaques das demonstrações
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css'; // números em destaque (OrçaFácil)
import './styles/fonts.css'; // fontes da marca Alto Code (WOFF2 locais em public/fonts)
import './styles/index.css';

import App from './App';

import { AppErrorBoundary } from './components/layout/AppErrorBoundary';

/**
 * Por padrão usa URLs limpas (/projetos/gestao360), que exigem a regra
 * de redirecionamento já incluída em public/_redirects.
 * Para hospedagens sem essa regra (ex.: GitHub Pages), gere o build com
 * VITE_HASH_ROUTER=true para usar endereços do tipo /#/projetos/gestao360.
 */
const useHash = import.meta.env.VITE_HASH_ROUTER === 'true';
const Router = useHash ? HashRouter : BrowserRouter;

/**
 * Compatibilidade entre os dois formatos de endereço, para que links já
 * compartilhados continuem funcionando:
 * - modo com "#": /demos/gestao360 vira /#/demos/gestao360 e /#projetos vira /#/#projetos;
 * - modo com URLs limpas: /#/demos/gestao360 vira /demos/gestao360.
 */
if (useHash) {
  const { pathname, search, hash } = window.location;
  // Só converte rotas do próprio site (evita mexer em prévias hospedadas em outro caminho).
  if (/^\/(demos|projetos)\//.test(pathname)) {
    window.location.replace(`/#${pathname}${search}${hash.startsWith('#/') ? '' : hash}`);
  }
  const fixLegacyHash = () => {
    const current = window.location;
    if (current.hash && !current.hash.startsWith('#/')) window.location.replace(`${current.pathname}#/${current.hash}`);
  };
  fixLegacyHash();
  window.addEventListener('hashchange', fixLegacyHash);
} else if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1) || '/');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      {/* nenhum erro de renderização deixa a página vazia (veja AppErrorBoundary) */}
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </Router>
  </StrictMode>,
);
