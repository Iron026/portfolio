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
import { PAYMENT_LABELS, formatCents, priceLines, simulationCode, totals, type PaymentMethod, type PricedLine } from './store-data';
import { OrderSummary } from './StoreCart';
import { STORE_PATH } from './StoreLayout';

interface Receipt {
  code: string;
  lines: PricedLine[];
  t: ReturnType<typeof totals>;
  method: PaymentMethod;
}

export default function StoreCheckout() {
  useDocumentTitle('Checkout simulado · Arena Store');
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
            Demonstração
          </p>
          <h1 ref={titleRef} tabIndex={-1} className="mt-4 text-[1.9rem] font-bold tracking-tight outline-none sm:text-[2.2rem]">
            Compra simulada: nenhum pagamento foi realizado
          </h1>
          <p className="mt-3 text-(--as-muted)">
            Nada foi cobrado, nenhum pedido foi enviado e nenhum produto será entregue. O carrinho foi esvaziado para você testar de novo.
          </p>
          <dl className="mt-6 grid gap-3 rounded-2xl bg-(--as-bg) p-4 text-[0.95rem] sm:grid-cols-2">
            <div>
              <dt className="text-(--as-muted)">Código da simulação</dt>
              <dd className="font-semibold tabular-nums">{receipt.code}</dd>
            </div>
            <div>
              <dt className="text-(--as-muted)">Forma de pagamento escolhida</dt>
              <dd className="font-semibold">{PAYMENT_LABELS[receipt.method]}</dd>
            </div>
          </dl>
          <h2 className="mt-6 font-sans text-lg font-semibold tracking-normal">Itens simulados</h2>
          <ul className="mt-2 divide-y divide-(--as-line)">
            {receipt.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 py-2 text-[0.95rem]">
                <span>
                  {l.qty} × {l.product.name}
                  {l.size ? ` (tamanho ${l.size})` : ''}
                </span>
                <span className="tabular-nums">{formatCents(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-(--as-line) pt-3 text-[0.98rem]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatCents(receipt.t.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Frete fictício</dt><dd className="tabular-nums">{receipt.t.shipping ? formatCents(receipt.t.shipping) : 'Grátis'}</dd></div>
            <div className="flex justify-between text-lg font-bold"><dt>Total simulado</dt><dd className="tabular-nums" data-receipt-total>{formatCents(receipt.t.total)}</dd></div>
          </dl>
          <Link to={STORE_PATH} className="mt-7 inline-flex rounded-full bg-(--as-orange-text) px-6 py-3 font-semibold text-white hover:brightness-95">
            Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  const priced = priceLines(lines);
  const t = totals(lines);

  if (!priced.length) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-[2rem] font-bold">Não há itens para o checkout</h1>
        <p className="mt-2 text-(--as-muted)">Adicione produtos ao carrinho para simular uma compra.</p>
        <Link to={STORE_PATH} className="mt-6 inline-flex rounded-full bg-(--as-orange-text) px-6 py-3 font-semibold text-white">
          Ver produtos
        </Link>
      </div>
    );
  }

  function finish() {
    if (!aware) {
      setError('Confirme que entendeu que esta é uma compra simulada.');
      document.getElementById('as-ciente')?.focus();
      return;
    }
    setReceipt({ code: simulationCode(), lines: priced, t, method });
    clear();
  }

  return (
    <div>
      <Link to={`${STORE_PATH}/carrinho`} className="rounded font-semibold hover:underline">
        Voltar ao carrinho
      </Link>
      <h1 className="mt-3 text-[2rem] font-bold tracking-tight">Checkout simulado</h1>
      <p className="mt-1 max-w-[62ch] text-(--as-muted)">
        Esta etapa imita o fim de uma compra, mas não pede dados pessoais nem de cartão e não se conecta a nenhum meio de pagamento.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] [&>*]:min-w-0">
        <div className="space-y-6">
          <section aria-labelledby="as-itens" className="rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
            <h2 id="as-itens" className="font-sans text-lg font-semibold tracking-normal">Itens</h2>
            <ul className="mt-3 divide-y divide-(--as-line)">
              {priced.map((l) => (
                <li key={l.key} className="flex justify-between gap-3 py-2 text-[0.95rem]">
                  <span>
                    {l.qty} × {l.product.name}
                    {l.size ? ` (tamanho ${l.size})` : ''}
                  </span>
                  <span className="tabular-nums">{formatCents(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </section>

          <fieldset className="rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
            <legend className="sr-only">Forma de pagamento</legend>
            <p className="font-semibold" aria-hidden="true">Forma de pagamento</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" name="as-pagamento" value={m} checked={method === m} onChange={() => setMethod(m)} className="peer sr-only" />
                  <span className="block rounded-xl p-3 text-[0.95rem] ring-1 ring-(--as-line) peer-checked:font-semibold peer-checked:ring-2 peer-checked:ring-(--as-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--as-orange-text)">
                    {PAYMENT_LABELS[m]}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[0.9rem] text-(--as-muted)">
              <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Nenhum dado de pagamento é solicitado. A escolha serve só para mostrar o fluxo.
            </p>
          </fieldset>
        </div>

        <OrderSummary t={t}>
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
            <span>Entendo que esta é uma compra simulada e que nenhum pagamento será feito.</span>
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
            Simular compra de {formatCents(t.total)}
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
