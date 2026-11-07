/**
 * Layout da Arena Store (fora do MainLayout do portfólio): faixa de volta
 * para Alto Code / Projetos, cabeçalho com contador do carrinho e rodapé.
 * O CartProvider fica aqui para que o contador reflita qualquer mudança na hora.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { site } from '@/config/site';
import { CartProvider, useCart } from './store-cart';
import { CATEGORIES, CATEGORY_LABELS, cartCount } from './store-data';
import './store.css';

export const STORE_PATH = '/demos/arena-store';

export default function StoreLayout() {
  return (
    <CartProvider>
      <StoreShell />
    </CartProvider>
  );
}

function StoreShell() {
  const { pathname } = useLocation();
  const { lines, notice, dismissNotice, storageAvailable } = useCart();
  const count = cartCount(lines);

  // Anima o contador quando muda (adição ou remoção).
  const [bump, setBump] = useState(false);
  const previous = useRef(count);
  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    setBump(true);
    const t = window.setTimeout(() => setBump(false), 320);
    return () => window.clearTimeout(t);
  }, [count]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="as-root font-sans">
      <aside aria-label="Sobre esta demonstração" className="as-on-dark bg-black/90 text-[0.8rem] text-white/85">
        <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
          <nav aria-label="Você está em">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="rounded hover:text-white hover:underline">{site.name}</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li><Link to={{ pathname: '/', hash: '#projetos' }} className="rounded hover:text-white hover:underline">Projetos</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="font-semibold text-white">Arena Store</li>
            </ol>
          </nav>
          <p className="flex flex-wrap items-center gap-x-3">
            <span>Loja fictícia: nenhuma compra é processada</span>
            <Link to="/projetos/arena-store" className="rounded font-semibold text-white underline underline-offset-2">
              Ver detalhes do projeto
            </Link>
          </p>
        </div>
      </aside>

      <header className="as-on-dark sticky top-0 z-40 bg-(--as-ink) text-white">
        <div className="mx-auto flex h-16 max-w-[76rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to={STORE_PATH} className="flex items-center gap-2 rounded-lg" aria-label="Arena Store: início da loja">
            <ArenaMark />
            <span className="font-display text-[1.25rem] font-bold tracking-tight whitespace-nowrap">Arena Store</span>
          </Link>
          <nav aria-label="Categorias" className="hidden md:block">
            <ul className="flex gap-1">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link to={{ pathname: STORE_PATH, search: `?categoria=${c}` }} className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-white/85 hover:bg-white/10 hover:text-white">
                    {CATEGORY_LABELS[c]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            to={`${STORE_PATH}/carrinho`}
            className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/15"
            aria-label={`Carrinho, ${count === 1 ? '1 item' : `${count} itens`}`}
          >
            <ShoppingBag aria-hidden="true" className="h-5 w-5" />
            <span className="max-sm:sr-only">Carrinho</span>
            <span
              data-cart-count
              aria-hidden="true"
              className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[0.8rem] font-bold tabular-nums ${count ? 'bg-(--as-orange) text-(--as-ink)' : 'bg-white/20 text-white'} ${bump ? 'as-bump' : ''}`}
            >
              {count}
            </span>
          </Link>
        </div>
        <nav aria-label="Categorias (celular)" className="border-t border-white/10 md:hidden">
          <ul className="mx-auto flex max-w-[76rem] gap-1 overflow-x-auto px-3 py-1.5">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link to={{ pathname: STORE_PATH, search: `?categoria=${c}` }} className="block rounded-full px-3 py-1.5 text-[0.9rem] whitespace-nowrap text-white/85 hover:text-white">
                  {CATEGORY_LABELS[c]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {(notice || !storageAvailable) && (
        <div role="status" className="border-b border-(--as-low)/20 bg-(--as-low-bg) text-(--as-low)">
          <div className="mx-auto flex max-w-[76rem] items-start justify-between gap-4 px-4 py-3 text-[0.92rem] sm:px-6 lg:px-8">
            <p>
              {notice || 'Seu navegador não permite salvar o carrinho. Ele funciona normalmente, mas será esvaziado ao fechar ou atualizar a página.'}
            </p>
            {notice && (
              <button type="button" onClick={dismissNotice} className="rounded p-1 hover:bg-black/5" aria-label="Fechar aviso">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <main id="conteudo" className="mx-auto max-w-[76rem] px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="as-on-dark mt-16 bg-(--as-ink) text-white/80">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-4 px-4 py-10 text-[0.92rem] sm:px-6 md:flex-row md:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <ArenaMark className="h-8 w-8 shrink-0" />
            <p className="max-w-md">
              A Arena Store é uma loja fictícia. Produtos, preços, estoques e frete são ilustrativos. O carrinho fica salvo só neste navegador e nenhum pagamento é realizado.
            </p>
          </div>
          <p>
            Projeto demonstrativo de {site.name}.{' '}
            <Link to={{ pathname: '/', hash: '#projetos' }} className="rounded font-semibold text-(--as-orange) underline underline-offset-2">
              Ver outros projetos
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function ArenaMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--as-orange)" />
      <path d="M10 29 L20 10 L30 29" fill="none" stroke="var(--as-ink)" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 22.5 H25.5" stroke="var(--as-ink)" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
