import { Suspense, useEffect, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import ProjectDetail from '@/pages/ProjectDetail';
import DemoPending from '@/pages/DemoPending';
import NotFound from '@/pages/NotFound';
import { lazyPage } from '@/utils/lazyPage';
import { HTML_LANG, type Locale } from '@/i18n/locale';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';

/*
 * As demonstrações são carregadas sob demanda (cada uma em um arquivo
 * separado no build): quem abre só o portfólio não baixa o código delas.
 * lazyPage trata arquivos de uma versão anterior do site (veja utils/lazyPage.ts).
 */
const Gestao360Demo = lazyPage(() => import('@/pages/Gestao360Demo'));
const PrimeImoveisLayout = lazyPage(() => import('@/pages/imoveis/PrimeImoveisLayout'));
const PrimeImoveisList = lazyPage(() => import('@/pages/imoveis/PrimeImoveisList'));
const PrimeImoveisDetail = lazyPage(() => import('@/pages/imoveis/PrimeImoveisDetail'));
const NovaServicosDemo = lazyPage(() => import('@/pages/nova-servicos/NovaServicosDemo'));
const StoreLayout = lazyPage(() => import('@/pages/arena-store/StoreLayout'));
const StoreCatalog = lazyPage(() => import('@/pages/arena-store/StoreCatalog'));
const StoreProduct = lazyPage(() => import('@/pages/arena-store/StoreProduct'));
const StoreCart = lazyPage(() => import('@/pages/arena-store/StoreCart'));
const StoreCheckout = lazyPage(() => import('@/pages/arena-store/StoreCheckout'));
const OrcaFacilDemo = lazyPage(() => import('@/pages/orcafacil/OrcaFacilDemo'));

/** Aviso exibido enquanto o código de uma demonstração é baixado. */
function DemoLoading() {
  const ui = useUi();
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-paper font-sans text-slate">
      {ui.common.loadingDemo}
    </div>
  );
}

const demo = (node: ReactNode) => <Suspense fallback={<DemoLoading />}>{node}</Suspense>;

/** Segmentos de rota por idioma (veja src/i18n/locale.ts). */
const SEG: Record<Locale, { projects: string; product: string; cart: string }> = {
  pt: { projects: 'projetos', product: 'produto', cart: 'carrinho' },
  en: { projects: 'projects', product: 'product', cart: 'cart' },
};

/**
 * Árvore de páginas de um idioma. As demonstrações ficam fora do MainLayout
 * porque têm layout próprio (cada uma com caminho de volta para Alto Code / Projetos).
 * Endereços desconhecidos em `demos/*` caem no DemoPending, que mostra a página 404.
 */
function routesFor(locale: Locale) {
  const seg = SEG[locale];
  return (
    <>
      <Route path="demos/gestao360" element={demo(<Gestao360Demo />)} />
      <Route path="demos/imoveis" element={demo(<PrimeImoveisLayout />)}>
        <Route index element={demo(<PrimeImoveisList />)} />
        <Route path=":id" element={demo(<PrimeImoveisDetail />)} />
      </Route>
      <Route path="demos/nova-servicos" element={demo(<NovaServicosDemo />)} />
      <Route path="demos/arena-store" element={demo(<StoreLayout />)}>
        <Route index element={demo(<StoreCatalog />)} />
        <Route path={`${seg.product}/:id`} element={demo(<StoreProduct />)} />
        <Route path={seg.cart} element={demo(<StoreCart />)} />
        <Route path="checkout" element={demo(<StoreCheckout />)} />
      </Route>
      <Route path="demos/orcafacil" element={demo(<OrcaFacilDemo />)} />
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path={`${seg.projects}/:slug`} element={<ProjectDetail />} />
        <Route path="demos/*" element={<DemoPending />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  );
}

/** Português na raiz; inglês sob /en, com os mesmos componentes. */
export default function App() {
  return (
    <>
      <DocumentLang />
      <Routes>
        <Route path="en">{routesFor('en')}</Route>
        {routesFor('pt')}
      </Routes>
    </>
  );
}

/** Mantém <html lang> igual ao idioma da página (leitores de tela, tradutores, hifenização). */
function DocumentLang() {
  const { locale } = useLocale();
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);
  return null;
}
