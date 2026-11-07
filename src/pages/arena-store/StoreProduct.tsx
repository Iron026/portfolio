/** Página do produto: descrição, tamanho, quantidade e "Adicionar ao carrinho". */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CircleAlert, ShoppingBag } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useCart } from './store-cart';
import { CATEGORY_LABELS, formatCents, getProduct, hasSizes, qtyInCart, stockOf, totalStock } from './store-data';
import { ProductArt } from './store-art';
import { QtyStepper, StockBadge } from './store-ui';
import { STORE_PATH } from './StoreLayout';

type Feedback = { tone: 'ok' | 'erro'; text: string } | null;

export default function StoreProduct() {
  const { id } = useParams();
  const product = getProduct(id);
  useDocumentTitle(
    product ? `${product.name} · Arena Store` : 'Produto não encontrado · Arena Store',
    product ? `${product.name}: ${product.description}` : undefined,
  );
  const { lines, add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Outro produto: recomeça a escolha.
  useEffect(() => {
    setSize(null);
    setQty(1);
    setFeedback(null);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="py-10">
        <h1 className="text-[2rem] font-bold">Produto não encontrado</h1>
        <p className="mt-2 text-(--as-muted)">O código {id ? `“${id}”` : 'informado'} não existe no catálogo.</p>
        <Link to={STORE_PATH} className="mt-6 inline-flex rounded-full bg-(--as-orange-text) px-5 py-2.5 font-semibold text-white">
          Ver todos os produtos
        </Link>
      </div>
    );
  }

  const p = product;
  const sized = hasSizes(p);
  const variant = sized ? size : null;
  const stock = sized ? (size ? stockOf(p, size) : 0) : stockOf(p, null);
  const inCart = sized && !size ? 0 : qtyInCart(lines, p.id, variant);
  const available = Math.max(0, stock - inCart);
  const soldOut = totalStock(p) === 0;
  const maxQty = Math.max(1, available);

  function chooseSize(s: string) {
    setSize(s);
    setFeedback(null);
    const left = stockOf(p, s) - qtyInCart(lines, p.id, s);
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, left)));
  }

  function onAdd() {
    if (sized && !size) {
      setFeedback({ tone: 'erro', text: 'Escolha um tamanho para adicionar ao carrinho.' });
      document.querySelector<HTMLInputElement>('input[name="as-tamanho"]:not(:disabled)')?.focus();
      return;
    }
    const result = add(p.id, variant, qty);
    const label = `${p.name}${variant ? ` (tamanho ${variant})` : ''}`;
    if (result.added === 0) {
      setFeedback({
        tone: 'erro',
        text: result.reason === 'esgotado' ? 'Esta opção está esgotada.' : 'Você já tem no carrinho todas as unidades disponíveis desta opção.',
      });
      return;
    }
    setFeedback({
      tone: 'ok',
      text:
        result.added < qty
          ? `Adicionadas ${result.added} de ${qty} unidades de ${label}: é o que restava em estoque.`
          : `${result.added === 1 ? '1 unidade adicionada' : `${result.added} unidades adicionadas`}: ${label}.`,
    });
    setQty(1);
  }

  return (
    <div>
      <Link to={STORE_PATH} className="inline-flex items-center gap-2 rounded font-semibold hover:underline">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Voltar para a loja
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
        <div className="self-start overflow-hidden rounded-3xl ring-1 ring-(--as-line)">
          <ProductArt kind={p.art} color={p.color} className="block aspect-[4/3] w-full" label={`Ilustração do produto ${p.name}`} />
          <p className="bg-(--as-card) px-4 py-2 text-[0.8rem] text-(--as-muted)">Ilustração do produto, não é foto real.</p>
        </div>

        <div>
          <p className="text-[0.92rem] font-medium text-(--as-muted)">
            {CATEGORY_LABELS[p.category]} · Código {p.id}
          </p>
          <h1 className="mt-1 text-[2rem] font-bold tracking-tight sm:text-[2.4rem]">{p.name}</h1>
          <p className="mt-2 font-display text-[1.8rem] font-bold tabular-nums">{formatCents(p.price)}</p>
          <p className="mt-4 max-w-[60ch] text-[1.02rem] leading-relaxed">{p.description}</p>
          <ul className="mt-4 space-y-1.5">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-[0.98rem]">
                <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-(--as-ok)" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-7 rounded-2xl bg-(--as-card) p-5 ring-1 ring-(--as-line)">
            {soldOut ? (
              <div>
                <StockBadge units={0} />
                <p className="mt-3 text-(--as-muted)">Este produto está esgotado no momento. Veja outros itens da loja.</p>
                <Link to={STORE_PATH} className="mt-4 inline-flex rounded-full px-5 py-2.5 font-semibold ring-1 ring-(--as-ink)/30">
                  Ver outros produtos
                </Link>
              </div>
            ) : (
              <>
                {sized && (
                  <fieldset>
                    <legend className="font-semibold">Tamanho</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.sizes.map((s) => {
                        const units = stockOf(p, s);
                        const out = units === 0;
                        return (
                          <label key={s} className={out ? 'cursor-not-allowed' : 'cursor-pointer'}>
                            <input
                              type="radio"
                              name="as-tamanho"
                              value={s}
                              checked={size === s}
                              disabled={out}
                              onChange={() => chooseSize(s)}
                              className="peer sr-only"
                            />
                            <span
                              className={`grid h-11 min-w-11 place-items-center rounded-xl px-3 font-semibold ring-1 tabular-nums peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--as-orange-text) ${
                                out
                                  ? 'bg-(--as-bg) text-(--as-muted) line-through ring-(--as-line)'
                                  : 'ring-(--as-line) peer-checked:bg-(--as-ink) peer-checked:text-white peer-checked:ring-(--as-ink) hover:ring-(--as-ink)/50'
                              }`}
                            >
                              {s}
                              {out && <span className="sr-only"> (esgotado)</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 min-h-[1.5rem] text-[0.92rem]" aria-live="polite">
                      {size ? <StockBadge units={stock} /> : <span className="text-(--as-muted)">Escolha um tamanho para ver o estoque. Tamanhos riscados estão esgotados.</span>}
                    </p>
                  </fieldset>
                )}
                {!sized && (
                  <p className="min-h-[1.5rem]">
                    <StockBadge units={stock} />
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div>
                    <p className="mb-1.5 text-[0.92rem] font-semibold" aria-hidden="true">
                      Quantidade
                    </p>
                    <QtyStepper id="as-qtd" value={Math.min(qty, maxQty)} max={maxQty} onChange={setQty} label={p.name} />
                  </div>
                  {inCart > 0 && (
                    <p className="text-[0.9rem] text-(--as-muted)">
                      {inCart === 1 ? '1 unidade' : `${inCart} unidades`} desta opção já no carrinho
                      {available === 0 ? ' (limite do estoque)' : ''}.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onAdd}
                  disabled={(!sized || !!size) && available === 0}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--as-orange-text) px-6 py-3.5 text-lg font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:bg-(--as-muted)"
                >
                  <ShoppingBag aria-hidden="true" className="h-5 w-5" />
                  Adicionar ao carrinho
                </button>
                <div role="status" aria-live="polite" className="mt-3 min-h-[1.5rem]">
                  {feedback && (
                    <p className={`flex items-start gap-2 text-[0.95rem] font-medium ${feedback.tone === 'ok' ? 'text-(--as-ok)' : 'text-(--as-low)'}`}>
                      {feedback.tone === 'ok' ? <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
                      <span>
                        {feedback.text}{' '}
                        {feedback.tone === 'ok' && (
                          <Link to={`${STORE_PATH}/carrinho`} className="rounded font-semibold whitespace-nowrap text-(--as-orange-text) underline underline-offset-2">
                            Ver carrinho
                          </Link>
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
