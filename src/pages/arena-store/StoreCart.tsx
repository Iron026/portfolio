/** Carrinho: ajuste de quantidades, remoção, subtotal, frete fictício e total. */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Truck } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useCart } from './store-cart';
import { formatCents, priceLines, totals, FREE_SHIPPING_FROM } from './store-data';
import { ProductArt } from './store-art';
import { QtyStepper } from './store-ui';
import { STORE_PATH } from './StoreLayout';

export default function StoreCart() {
  useDocumentTitle('Carrinho · Arena Store');
  const { lines, setQty, remove, clear } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState('');
  const priced = priceLines(lines);
  const t = totals(lines);

  if (!priced.length) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-[2rem] font-bold">Seu carrinho está vazio</h1>
        <p className="mx-auto mt-2 max-w-md text-(--as-muted)">{status || 'Escolha um produto, o tamanho e a quantidade para adicioná-lo aqui.'}</p>
        <Link to={STORE_PATH} className="mt-6 inline-flex rounded-full bg-(--as-orange-text) px-6 py-3 font-semibold text-white hover:brightness-95">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[2rem] font-bold tracking-tight">Carrinho</h1>
        <Link to={STORE_PATH} className="rounded font-semibold hover:underline">
          Continuar comprando
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] [&>*]:min-w-0">
        <section aria-label="Itens do carrinho">
          <ul className="divide-y divide-(--as-line) rounded-2xl bg-(--as-card) ring-1 ring-(--as-line)">
            {priced.map((l) => {
              const label = `${l.product.name}${l.size ? `, tamanho ${l.size}` : ''}`;
              return (
                <li key={l.key} data-line={l.key} className="flex gap-4 p-4">
                  <Link to={`${STORE_PATH}/produto/${l.product.id}`} className="block h-20 w-24 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32" tabIndex={-1} aria-hidden="true">
                    <ProductArt kind={l.product.art} color={l.product.color} className="h-full w-full" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-sans text-[1.02rem] font-semibold tracking-normal">
                        <Link to={`${STORE_PATH}/produto/${l.product.id}`} className="rounded hover:underline">
                          {l.product.name}
                        </Link>
                      </h2>
                      <p className="text-[0.9rem] text-(--as-muted)">
                        {l.size ? `Tamanho ${l.size} · ` : ''}
                        {formatCents(l.unitPrice)} cada
                      </p>
                      {l.qty >= l.maxQty && <p className="mt-1 text-[0.82rem] text-(--as-low)">Limite do estoque: {l.maxQty === 1 ? '1 unidade' : `${l.maxQty} unidades`}.</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                      <QtyStepper id={`as-qtd-${l.key}`} value={l.qty} max={l.maxQty} onChange={(n) => setQty(l.key, n)} label={label} size="sm" />
                      <p className="font-semibold tabular-nums" data-line-total>
                        {formatCents(l.lineTotal)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          remove(l.key);
                          setStatus(`${label} removido do carrinho.`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded text-[0.9rem] font-medium text-(--as-muted) hover:text-(--as-low)"
                        aria-label={`Remover ${label}`}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] text-[0.92rem] text-(--as-muted)">
            {status}
          </p>
          <div className="mt-1">
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-3 text-[0.95rem]">
                <span>Remover todos os itens?</span>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setStatus('Todos os itens foram removidos do carrinho.');
                  }}
                  className="rounded-full bg-(--as-ink) px-4 py-1.5 font-semibold text-white"
                >
                  Sim, esvaziar
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="rounded-full px-4 py-1.5 font-semibold ring-1 ring-(--as-line)">
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="rounded text-[0.92rem] font-medium text-(--as-muted) underline underline-offset-2 hover:text-(--as-ink)">
                Esvaziar carrinho
              </button>
            )}
          </div>
        </section>

        <OrderSummary t={t}>
          <Link
            to={`${STORE_PATH}/checkout`}
            className="mt-5 block rounded-full bg-(--as-orange-text) px-6 py-3.5 text-center text-lg font-semibold text-white hover:brightness-95"
          >
            Ir para o checkout simulado
          </Link>
          <p className="mt-3 text-center text-[0.85rem] text-(--as-muted)">Nenhum pagamento é realizado nesta loja.</p>
        </OrderSummary>
      </div>
    </div>
  );
}

export function OrderSummary({ t, children }: { t: ReturnType<typeof totals>; children?: ReactNode }) {
  return (
    <aside aria-label="Resumo do pedido" className="h-fit rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
      <h2 className="font-sans text-lg font-semibold tracking-normal">Resumo</h2>
      <dl className="mt-4 space-y-2 text-[0.98rem]">
        <div className="flex justify-between gap-3">
          <dt>Subtotal ({t.count === 1 ? '1 item' : `${t.count} itens`})</dt>
          <dd className="tabular-nums" data-subtotal>{formatCents(t.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Frete fictício</dt>
          <dd className="tabular-nums" data-shipping>{t.shipping ? formatCents(t.shipping) : 'Grátis'}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-(--as-line) pt-3 text-lg font-bold">
          <dt>Total</dt>
          <dd className="tabular-nums" data-total>{formatCents(t.total)}</dd>
        </div>
      </dl>
      <p className="mt-3 flex items-start gap-2 text-[0.88rem] text-(--as-muted)">
        <Truck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {t.missingForFreeShipping
          ? `Faltam ${formatCents(t.missingForFreeShipping)} para o frete grátis (a partir de ${formatCents(FREE_SHIPPING_FROM)}).`
          : `Frete grátis a partir de ${formatCents(FREE_SHIPPING_FROM)}.`}
      </p>
      {children}
    </aside>
  );
}
