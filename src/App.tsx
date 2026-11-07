import { Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import ProjectDetail from '@/pages/ProjectDetail';
import DemoPending from '@/pages/DemoPending';
import NotFound from '@/pages/NotFound';
import { lazyPage } from '@/utils/lazyPage';

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
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-paper font-sans text-slate">
      Carregando demonstração…
    </div>
  );
}

const demo = (node: ReactNode) => <Suspense fallback={<DemoLoading />}>{node}</Suspense>;

/**
 * Rotas do site.
 * As demonstrações ficam fora do MainLayout porque têm layout próprio
 * (cada uma com caminho de volta para Alto Code / Projetos).
 * Endereços desconhecidos em `demos/*` caem no DemoPending, que mostra a página 404.
 */
export default function App() {
  return (
    <Routes>
      <Route path="demos/gestao360" element={demo(<Gestao360Demo />)} />
      <Route path="demos/imoveis" element={demo(<PrimeImoveisLayout />)}>
        <Route index element={demo(<PrimeImoveisList />)} />
        <Route path=":id" element={demo(<PrimeImoveisDetail />)} />
      </Route>
      <Route path="demos/nova-servicos" element={demo(<NovaServicosDemo />)} />
      <Route path="demos/arena-store" element={demo(<StoreLayout />)}>
        <Route index element={demo(<StoreCatalog />)} />
        <Route path="produto/:id" element={demo(<StoreProduct />)} />
        <Route path="carrinho" element={demo(<StoreCart />)} />
        <Route path="checkout" element={demo(<StoreCheckout />)} />
      </Route>
      <Route path="demos/orcafacil" element={demo(<OrcaFacilDemo />)} />
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="projetos/:slug" element={<ProjectDetail />} />
        <Route path="demos/*" element={<DemoPending />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
