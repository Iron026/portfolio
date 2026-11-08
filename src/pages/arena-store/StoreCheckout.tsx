/**
 * Checkout estritamente simulado: não pede dados pessoais nem de pagamento,
 * não envia nada e não usa gateway. Ao concluir, esvazia o carrinho e mostra
 * "Compra simulada — nenhum pagamento foi realizado".
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Lock } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useCart } from './store-cart';
import { priceLines, simulationCode, totals, type PaymentMethod, type PricedLine } from './store-data';
import { OrderSummary } from './StoreCart';
import { useStore } from './store-i18n';

interface Receipt {
  code: string;
  lines: PricedLine[];
  t: ReturnType<typeof totals>;
  method: PaymentMethod;
}

export default function StoreCheckout() {
  const { t: all, cents, paths, payments, size: sizeName, product: shown } = useStore();
  const t = all.checkout;
  useDocumentTitle(t.docTitle);
  const { lines, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [aware, setAware] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (receipt) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      titleRef.current?.focus();
    }
  }, [receipt]);

  if (receipt) {
    return (
      <div className="mx-auto max-w-2xl py-4">
        <div className="rounded-3xl bg-(--as-card) p-6 ring-2 ring-(--as-orange) sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-(--as-low-bg) px-3 py-1 text-sm font-semibold text-(--as-low)">
            <Info aria-hidden="true" className="h-4 w-4" />
            {t.demo}
          </p>
          <h1 ref={titleRef} tabIndex={-1} className="mt-4 text-[1.9rem] font-bold tracking-tight outline-none sm:text-[2.2rem]">
            {t.doneTitle}
          </h1>
          <p className="mt-3 text-(--as-muted)">{t.doneText}</p>
          <dl className="mt-6 grid gap-3 rounded-2xl bg-(--as-bg) p-4 text-[0.95rem] sm:grid-cols-2">
            <div>
              <dt className="text-(--as-muted)">{t.code}</dt>
              <dd className="font-semibold tabular-nums">{receipt.code}</dd>
            </div>
            <div>
              <dt className="text-(--as-muted)">{t.method}</dt>
              <dd className="font-semibold">{payments[receipt.method]}</dd>
            </div>
          </dl>
          <h2 className="mt-6 font-sans text-lg font-semibold tracking-normal">{t.simulatedItems}</h2>
          <ul className="mt-2 divide-y divide-(--as-line)">
            {receipt.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 py-2 text-[0.95rem]">
                <span>
                  {l.qty} × {shown(l.product).name}
                  {l.size ? t.withSize(sizeName(l.size)) : ''}
                </span>
                <span className="tabular-nums">{cents(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-(--as-line) pt-3 text-[0.98rem]">
            <div className="flex justify-between"><dt>{t.subtotal}</dt><dd className="tabular-nums">{cents(receipt.t.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{all.summary.shipping}</dt><dd className="tabular-nums">{receipt.t.shipping ? cents(receipt.t.shipping) : all.summary.free}</dd></div>
            <div className="flex justify-between text-lg font-bold"><dt>{t.totalSim}</dt><dd className="tabular-nums" data-receipt-total>{cents(receipt.t.total)}</dd></div>
          </dl>
          <Link to={paths.store} className="mt-7 inline-flex rounded-full bg-(--as-orange-text) px-6 py-3 font-semibold text-white hover:brightness-95">
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  const priced = priceLines(lines);
  const sum = totals(lines);

  if (!priced.length) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-[2rem] font-bold">{t.emptyTitle}</h1>
        <p className="mt-2 text-(--as-muted)">{t.emptyText}</p>
        <Link to={paths.store} className="mt-6 inline-flex rounded-full bg-(--as-orange-text) px-6 py-3 font-semibold text-white">
          {t.seeProducts}
        </Link>
      </div>
    );
  }

  function finish() {
    if (!aware) {
      setError(t.confirmError);
      document.getElementById('as-ciente')?.focus();
      return;
    }
    setReceipt({ code: simulationCode(), lines: priced, t: sum, method });
    clear();
  }

  return (
    <div>
      <Link to={paths.cart} className="rounded font-semibold hover:underline">
        {t.backCart}
      </Link>
      <h1 className="mt-3 text-[2rem] font-bold tracking-tight">{t.title}</h1>
      <p className="mt-1 max-w-[62ch] text-(--as-muted)">{t.intro}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] [&>*]:min-w-0">
        <div className="space-y-6">
          <section aria-labelledby="as-itens" className="rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
            <h2 id="as-itens" className="font-sans text-lg font-semibold tracking-normal">{t.items}</h2>
            <ul className="mt-3 divide-y divide-(--as-line)">
              {priced.map((l) => (
                <li key={l.key} className="flex justify-between gap-3 py-2 text-[0.95rem]">
                  <span>
                    {l.qty} × {shown(l.product).name}
                    {l.size ? t.withSize(sizeName(l.size)) : ''}
                  </span>
                  <span className="tabular-nums">{cents(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </section>

          <fieldset className="rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
            <legend className="sr-only">{t.payment}</legend>
            <p className="font-semibold" aria-hidden="true">{t.payment}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(Object.keys(payments) as PaymentMethod[]).map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" name="as-pagamento" value={m} checked={method === m} onChange={() => setMethod(m)} className="peer sr-only" />
                  <span className="block rounded-xl p-3 text-[0.95rem] ring-1 ring-(--as-line) peer-checked:font-semibold peer-checked:ring-2 peer-checked:ring-(--as-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--as-orange-text)">
                    {payments[m]}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[0.9rem] text-(--as-muted)">
              <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {t.noData}
            </p>
          </fieldset>
        </div>

        <OrderSummary t={sum}>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-[0.95rem]">
            <input
              id="as-ciente"
              type="checkbox"
              checked={aware}
              onChange={(e) => {
                setAware(e.target.checked);
                setError('');
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'as-ciente-erro' : undefined}
              className="mt-1 h-5 w-5 shrink-0 accent-(--as-orange-text)"
            />
            <span>{t.aware}</span>
          </label>
          {error && (
            <p id="as-ciente-erro" className="mt-2 text-[0.9rem] font-medium text-(--as-low)">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={finish}
            className="mt-4 w-full rounded-full bg-(--as-orange-text) px-6 py-3.5 text-lg font-semibold text-white hover:brightness-95"
          >
            {t.simulate(cents(sum.total))}
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
