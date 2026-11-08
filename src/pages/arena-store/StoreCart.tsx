/** Carrinho: ajuste de quantidades, remoção, subtotal, frete fictício e total. */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Truck } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useCart } from './store-cart';
import { priceLines, totals, FREE_SHIPPING_FROM } from './store-data';
import { ProductArt } from './store-art';
import { QtyStepper } from './store-ui';
import { useStore } from './store-i18n';

export default function StoreCart() {
  const { t: all, cents, paths, size: sizeName, product: shown } = useStore();
  const t = all.cartPage;
  useDocumentTitle(t.docTitle);
  const { lines, setQty, remove, clear } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState('');
  const priced = priceLines(lines);
  const sum = totals(lines);

  if (!priced.length) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-[2rem] font-bold">{t.empty}</h1>
        <p className="mx-auto mt-2 max-w-md text-(--as-muted)">{status || t.emptyText}</p>
        <Link to={paths.store} className="mt-6 inline-flex rounded-full bg-(--as-orange-text) px-6 py-3 font-semibold text-white hover:brightness-95">
          {t.seeProducts}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[2rem] font-bold tracking-tight">{t.title}</h1>
        <Link to={paths.store} className="rounded font-semibold hover:underline">
          {t.keepShopping}
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] [&>*]:min-w-0">
        <section aria-label={t.items}>
          <ul className="divide-y divide-(--as-line) rounded-2xl bg-(--as-card) ring-1 ring-(--as-line)">
            {priced.map((l) => {
              const name = shown(l.product).name;
              const size = l.size ? sizeName(l.size) : null;
              const label = t.lineLabel(name, size);
              return (
                <li key={l.key} data-line={l.key} className="flex gap-4 p-4">
                  <Link to={paths.product(l.product.id)} className="block h-20 w-24 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32" tabIndex={-1} aria-hidden="true">
                    <ProductArt kind={l.product.art} color={l.product.color} className="h-full w-full" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-sans text-[1.02rem] font-semibold tracking-normal">
                        <Link to={paths.product(l.product.id)} className="rounded hover:underline">
                          {name}
                        </Link>
                      </h2>
                      <p className="text-[0.9rem] text-(--as-muted)">
                        {t.sizeEach(size, cents(l.unitPrice))}
                      </p>
                      {l.qty >= l.maxQty && <p className="mt-1 text-[0.82rem] text-(--as-low)">{t.limit(l.maxQty)}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                      <QtyStepper id={`as-qtd-${l.key}`} value={l.qty} max={l.maxQty} onChange={(n) => setQty(l.key, n)} label={label} size="sm" />
                      <p className="font-semibold tabular-nums" data-line-total>
                        {cents(l.lineTotal)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          remove(l.key);
                          setStatus(t.removed(label));
                        }}
                        className="inline-flex items-center gap-1.5 rounded text-[0.9rem] font-medium text-(--as-muted) hover:text-(--as-low)"
                        aria-label={t.remove(label)}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        {t.removeShort}
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
                <span>{t.confirmClear}</span>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setStatus(t.cleared);
                  }}
                  className="rounded-full bg-(--as-ink) px-4 py-1.5 font-semibold text-white"
                >
                  {t.yes}
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="rounded-full px-4 py-1.5 font-semibold ring-1 ring-(--as-line)">
                  {t.cancel}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="rounded text-[0.92rem] font-medium text-(--as-muted) underline underline-offset-2 hover:text-(--as-ink)">
                {t.clear}
              </button>
            )}
          </div>
        </section>

        <OrderSummary t={sum}>
          <Link
            to={paths.checkout}
            className="mt-5 block rounded-full bg-(--as-orange-text) px-6 py-3.5 text-center text-lg font-semibold text-white hover:brightness-95"
          >
            {t.checkout}
          </Link>
          <p className="mt-3 text-center text-[0.85rem] text-(--as-muted)">{t.noPayment}</p>
        </OrderSummary>
      </div>
    </div>
  );
}

export function OrderSummary({ t, children }: { t: ReturnType<typeof totals>; children?: ReactNode }) {
  const { t: all, cents } = useStore();
  const s = all.summary;
  return (
    <aside aria-label={s.label} className="h-fit rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
      <h2 className="font-sans text-lg font-semibold tracking-normal">{s.title}</h2>
      <dl className="mt-4 space-y-2 text-[0.98rem]">
        <div className="flex justify-between gap-3">
          <dt>{s.subtotal(t.count)}</dt>
          <dd className="tabular-nums" data-subtotal>{cents(t.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>{s.shipping}</dt>
          <dd className="tabular-nums" data-shipping>{t.shipping ? cents(t.shipping) : s.free}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-(--as-line) pt-3 text-lg font-bold">
          <dt>{s.total}</dt>
          <dd className="tabular-nums" data-total>{cents(t.total)}</dd>
        </div>
      </dl>
      <p className="mt-3 flex items-start gap-2 text-[0.88rem] text-(--as-muted)">
        <Truck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {t.missingForFreeShipping
          ? s.missing(cents(t.missingForFreeShipping), cents(FREE_SHIPPING_FROM))
          : s.freeFrom(cents(FREE_SHIPPING_FROM))}
      </p>
      {children}
    </aside>
  );
}
