/**
 * OrçaFácil — calculadora de orçamentos para pequenas empresas.
 * Rota: /demos/orcafacil (fora do MainLayout). Configurado para uma gráfica fictícia.
 * Sem login, API ou banco: o catálogo fica apenas no localStorage deste navegador.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CircleAlert, Copy, Plus, Printer, Trash2 } from 'lucide-react';
import { site } from '@/config/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  BUSINESS, CATALOG_KEY, DEFAULT_CHOICES, SAMPLE_CATALOG, UNITS, VARIABLES, VARIABLE_IDS,
  calcLine, formatMultiplier, formatPercent, formatQty, money, proposalNumber, quoteTotals, restoreCatalog, summaryText,
  validateDiscount, validateQty,
  type CatalogItem, type Choices, type Option, type ProposalInfo, type QuoteLine,
} from './orca-data';
import { CatalogManager } from './CatalogManager';
import { Proposal } from './Proposal';
import './orca.css';

const MAX_LINES = 15;

function loadCatalog() {
  try {
    return restoreCatalog(window.localStorage.getItem(CATALOG_KEY));
  } catch {
    return restoreCatalog(null);
  }
}

export default function OrcaFacilDemo() {
  useDocumentTitle('OrçaFácil: calculadora de orçamentos', 'Calculadora comercial demonstrativa: monte orçamentos com material, acabamento e prazo, aplique desconto e imprima a proposta.');

  // Página no topo e classe no <body> para as regras de impressão só valerem aqui.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.classList.add('orca-page');
    return () => document.body.classList.remove('orca-page');
  }, []);

  const initial = useRef<ReturnType<typeof loadCatalog> | null>(null);
  if (!initial.current) initial.current = loadCatalog();
  const [catalog, setCatalog] = useState<CatalogItem[]>(initial.current.catalog);
  const [storageOk, setStorageOk] = useState(true);
  const [catalogNotice] = useState(initial.current.corrupted ? 'O catálogo salvo neste navegador não pôde ser lido. Usamos o catálogo de exemplo.' : '');

  useEffect(() => {
    try {
      window.localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [catalog]);

  // Formulário de linha
  const baseId = useId();
  const [itemId, setItemId] = useState(catalog[0]?.id ?? '');
  const [qtyRaw, setQtyRaw] = useState('1');
  const [choices, setChoices] = useState<Choices>(DEFAULT_CHOICES);
  const [qtyError, setQtyError] = useState('');
  const [lineStatus, setLineStatus] = useState('');
  const item = catalog.find((i) => i.id === itemId) ?? catalog[0];
  useEffect(() => {
    if (!catalog.some((i) => i.id === itemId)) setItemId(catalog[0]?.id ?? '');
  }, [catalog, itemId]);

  const qtyCheck = item ? validateQty(qtyRaw, item.unit) : { error: 'Cadastre um item.' };
  const previewLine = item && qtyCheck.qty ? calcLine({ uid: 'preview', itemId: item.id, qty: qtyCheck.qty, choices }, catalog) : null;

  // Orçamento
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [discountRaw, setDiscountRaw] = useState('0');
  const [client, setClient] = useState('');
  const [validityRaw, setValidityRaw] = useState('7');
  const [notes, setNotes] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [copyFallback, setCopyFallback] = useState('');
  const [number] = useState(() => proposalNumber());
  const [date] = useState(() => new Date());

  const discount = validateDiscount(discountRaw);
  const t = useMemo(() => quoteTotals(lines, catalog, discount.bp ?? 0), [lines, catalog, discount.bp]);
  const validity = Number(validityRaw);
  const validityError = !/^\d{1,2}$/.test(validityRaw.trim()) || validity < 1 || validity > 90 ? 'Use de 1 a 90 dias.' : '';
  const info: ProposalInfo = { number, client, validityDays: validityError ? 7 : validity, notes, date };
  const canIssue = t.rows.length > 0 && !discount.error && !validityError;

  function addLine() {
    if (!item) return;
    if (lines.length >= MAX_LINES) {
      setQtyError(`O orçamento aceita até ${MAX_LINES} linhas.`);
      return;
    }
    const check = validateQty(qtyRaw, item.unit);
    if (check.error) {
      setQtyError(check.error);
      document.getElementById(`${baseId}-qtd`)?.focus();
      return;
    }
    setQtyError('');
    setLines((ls) => [...ls, { uid: `${Date.now().toString(36)}-${ls.length}`, itemId: item.id, qty: check.qty!, choices }]);
    setLineStatus(`${item.name} (${formatQty(check.qty!, item.unit)}) adicionado ao orçamento.`);
    setCopyStatus('');
  }

  function removeLine(uid: string, name: string) {
    setLines((ls) => ls.filter((l) => l.uid !== uid));
    setLineStatus(`${name} removido do orçamento.`);
  }

  async function copySummary() {
    const text = summaryText(t, info);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback('');
      setCopyStatus('Resumo copiado. Cole no WhatsApp ou no e-mail para enviar ao cliente.');
    } catch {
      setCopyFallback(text);
      setCopyStatus('Não foi possível copiar automaticamente. O texto está selecionado abaixo: use Ctrl+C (ou toque e segure).');
      window.setTimeout(() => {
        const el = document.getElementById(`${baseId}-resumo-texto`) as HTMLTextAreaElement | null;
        el?.focus();
        el?.select();
      }, 0);
    }
  }

  const usedIds = new Set(lines.map((l) => l.itemId));

  return (
    <div className="orca-root font-sans">
      <aside aria-label="Sobre esta demonstração" className="orca-on-dark bg-(--orca-ink) text-[0.8rem] text-white/85">
        <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
          <nav aria-label="Você está em">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="rounded hover:text-white hover:underline">{site.name}</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li><Link to={{ pathname: '/', hash: '#projetos' }} className="rounded hover:text-white hover:underline">Projetos</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="font-semibold text-white">OrçaFácil</li>
            </ol>
          </nav>
          <p className="flex flex-wrap items-center gap-x-3">
            <span>Demonstração com empresa e preços fictícios</span>
            <Link to="/projetos/orcafacil" className="rounded font-semibold text-white underline underline-offset-2">Ver detalhes do projeto</Link>
          </p>
        </div>
      </aside>

      <header className="border-b border-(--orca-line) bg-white">
        <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <OrcaMark />
            <div>
              <p className="font-display text-[1.3rem] font-bold tracking-tight">OrçaFácil</p>
              <p className="text-[0.85rem] text-(--orca-muted)">Configurado para: {BUSINESS.name}, gráfica rápida (fictícia)</p>
            </div>
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-[76rem] px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <section aria-labelledby="orca-titulo" className="max-w-3xl">
          <h1 id="orca-titulo" className="text-[2rem] font-bold tracking-tight sm:text-[2.5rem]">
            Orçamentos padronizados em poucos minutos
          </h1>
          <p className="mt-2 text-[1.05rem] text-(--orca-muted)">
            O preço sai das mesmas regras toda vez: você escolhe o item, a quantidade, o material, o acabamento e o prazo, e a proposta fica pronta para imprimir ou enviar.
          </p>
        </section>
        {catalogNotice && <p role="status" className="mt-4 rounded-xl bg-(--orca-warn-bg) px-4 py-3 text-[0.92rem] text-(--orca-warn)">{catalogNotice}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
          {/* ------------------------------------------------ montar linha */}
          <section aria-labelledby={`${baseId}-montar`} className="rounded-2xl bg-white p-5 ring-1 ring-(--orca-line) sm:p-6">
            <h2 id={`${baseId}-montar`} className="text-[1.3rem] font-semibold">1. Adicione os itens</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem] [&>*]:min-w-0">
              <div>
                <label htmlFor={`${baseId}-item`} className="text-[0.92rem] font-medium">Produto ou serviço</label>
                <select
                  id={`${baseId}-item`}
                  value={item?.id ?? ''}
                  onChange={(e) => { setItemId(e.target.value); setQtyError(''); }}
                  className="mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue)"
                >
                  {catalog.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}: {money(i.price)}/{UNITS[i.unit].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${baseId}-qtd`} className="text-[0.92rem] font-medium">
                  Quantidade {item ? `(${UNITS[item.unit].label})` : ''}
                </label>
                <input
                  id={`${baseId}-qtd`}
                  inputMode={item && UNITS[item.unit].decimals ? 'decimal' : 'numeric'}
                  value={qtyRaw}
                  onChange={(e) => { setQtyRaw(e.target.value); setQtyError(''); }}
                  aria-invalid={!!qtyError}
                  aria-describedby={`${baseId}-qtd-dica${qtyError ? ` ${baseId}-qtd-erro` : ''}`}
                  className="orca-num mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue) aria-[invalid=true]:ring-(--orca-error)"
                />
                <p id={`${baseId}-qtd-dica`} className="mt-1 text-[0.8rem] text-(--orca-muted)">
                  {item && UNITS[item.unit].decimals ? 'Aceita decimais, ex.: 2,5' : 'Número inteiro'}
                </p>
              </div>
            </div>
            {qtyError && (
              <p id={`${baseId}-qtd-erro`} className="mt-2 flex items-start gap-1.5 text-[0.9rem] font-medium text-(--orca-error)">
                <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {qtyError}
              </p>
            )}

            {VARIABLE_IDS.map((v) => (
              <fieldset key={v} className="mt-5">
                <legend className="text-[0.92rem] font-medium">{VARIABLES[v].label}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {(VARIABLES[v].options as Option[]).map((o) => (
                    <label key={o.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`${baseId}-${v}`}
                        value={o.id}
                        checked={choices[v] === o.id}
                        onChange={() => setChoices((c) => ({ ...c, [v]: o.id }))}
                        className="peer sr-only"
                      />
                      <span className="block h-full rounded-xl p-3 ring-1 ring-(--orca-line) peer-checked:bg-(--orca-wash) peer-checked:ring-2 peer-checked:ring-(--orca-blue) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--orca-blue)">
                        <span className="block font-semibold">{o.label}</span>
                        <span className="block text-[0.82rem] text-(--orca-muted)">{o.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-(--orca-line) pt-4">
              <p className="text-[0.95rem]" aria-live="polite">
                Valor desta linha:{' '}
                <strong className="orca-num text-[1.15rem]" data-preview-total>{previewLine ? money(previewLine.lineTotal) : 'Sem valor'}</strong>
              </p>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-2 rounded-full bg-(--orca-blue) px-5 py-2.5 font-semibold text-white hover:bg-(--orca-blue-2)"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Adicionar ao orçamento
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] text-[0.9rem] font-medium text-(--orca-blue)">{lineStatus}</p>
          </section>

          {/* ------------------------------------------------ itens e totais */}
          <section aria-labelledby={`${baseId}-itens`} className="rounded-2xl bg-white p-5 ring-1 ring-(--orca-line) sm:p-6">
            <h2 id={`${baseId}-itens`} className="text-[1.3rem] font-semibold">2. Confira o orçamento</h2>
            {t.rows.length === 0 ? (
              <p className="mt-4 rounded-xl bg-(--orca-bg) p-5 text-center text-(--orca-muted)">
                Nenhum item ainda. Escolha um produto, a quantidade e as opções, e clique em “Adicionar ao orçamento”.
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {lines.map((l, i) => {
                  const r = calcLine(l, catalog);
                  if (!r) return null;
                  return (
                    <li key={l.uid} data-quote-line className="rounded-xl ring-1 ring-(--orca-line)">
                      <div className="flex items-start justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="font-semibold">
                            <span className="orca-num text-(--orca-muted)">{i + 1}.</span> {r.item.name}
                          </p>
                          <p className="text-[0.85rem] text-(--orca-muted)">
                            {formatQty(r.qty, r.item.unit)} · {r.options.material.label} · {r.options.acabamento.label} · Prazo {r.options.prazo.label.toLowerCase()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="orca-num font-semibold" data-line-total>{money(r.lineTotal)}</span>
                          <button type="button" onClick={() => removeLine(l.uid, r.item.name)} aria-label={`Remover linha ${i + 1}: ${r.item.name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-(--orca-wash)">
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <details className="border-t border-(--orca-line) px-3 py-2 text-[0.88rem]">
                        <summary className="cursor-pointer font-medium text-(--orca-blue)">Ver cálculo</summary>
                        <dl className="orca-num mt-2 space-y-1">
                          <Step label={`Preço base por ${UNITS[r.item.unit].label}`} value={money(r.basePrice)} />
                          <Step label={`Material ${r.options.material.label.toLowerCase()} (${formatMultiplier(r.options.material.bp)})`} value={money(r.materialUnit)} />
                          <Step label={`Acabamento ${r.options.acabamento.label.toLowerCase()} (+${formatPercent(r.options.acabamento.bp)})`} value={`+${money(r.finishingAmount)}`} />
                          <Step label="Preço final da unidade" value={money(r.unitPrice)} strong />
                          <Step label={`× ${formatQty(r.qty, r.item.unit)}`} value={money(r.goods)} />
                          <Step label={`Prazo ${r.options.prazo.label.toLowerCase()} (+${formatPercent(r.options.prazo.bp)})`} value={`+${money(r.rushAmount)}`} />
                          <Step label="Total da linha" value={money(r.lineTotal)} strong />
                        </dl>
                      </details>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
              <div>
                <label htmlFor={`${baseId}-desconto`} className="text-[0.92rem] font-medium">Desconto (%)</label>
                <input
                  id={`${baseId}-desconto`}
                  inputMode="decimal"
                  value={discountRaw}
                  onChange={(e) => setDiscountRaw(e.target.value)}
                  aria-invalid={!!discount.error}
                  aria-describedby={discount.error || discount.warning ? `${baseId}-desconto-msg` : undefined}
                  className="orca-num mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue) aria-[invalid=true]:ring-(--orca-error)"
                />
                {(discount.error || discount.warning) && (
                  <p id={`${baseId}-desconto-msg`} className={`mt-1 text-[0.85rem] font-medium ${discount.error ? 'text-(--orca-error)' : 'text-(--orca-warn)'}`}>
                    {discount.error ?? discount.warning}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${baseId}-validade`} className="text-[0.92rem] font-medium">Validade da proposta (dias)</label>
                <input
                  id={`${baseId}-validade`}
                  inputMode="numeric"
                  value={validityRaw}
                  onChange={(e) => setValidityRaw(e.target.value)}
                  aria-invalid={!!validityError}
                  aria-describedby={validityError ? `${baseId}-validade-erro` : undefined}
                  className="orca-num mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue) aria-[invalid=true]:ring-(--orca-error)"
                />
                {validityError && <p id={`${baseId}-validade-erro`} className="mt-1 text-[0.85rem] font-medium text-(--orca-error)">{validityError}</p>}
              </div>
            </div>

            <dl className="mt-5 space-y-1.5 border-t border-(--orca-line) pt-4 text-[1rem]">
              <div className="flex justify-between gap-3">
                <dt>Subtotal</dt>
                <dd className="orca-num" data-subtotal>{money(t.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Desconto{t.discountBp && !discount.error ? ` (${formatPercent(t.discountBp)})` : ''}</dt>
                <dd className="orca-num" data-discount>{discount.error ? 'Não calculado' : t.discount ? `−${money(t.discount)}` : money(0)}</dd>
              </div>
              <div className="flex justify-between gap-3 text-[1.35rem] font-bold">
                <dt>Total</dt>
                <dd className="orca-num" data-total>{discount.error ? 'Não calculado' : money(t.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* ------------------------------------------------ proposta */}
        <section aria-labelledby={`${baseId}-proposta`} className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-(--orca-line) sm:p-6">
          <h2 id={`${baseId}-proposta`} className="text-[1.3rem] font-semibold">3. Gere a proposta</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
            <div>
              <label htmlFor={`${baseId}-cliente`} className="text-[0.92rem] font-medium">Cliente <span className="font-normal text-(--orca-muted)">(opcional)</span></label>
              <input id={`${baseId}-cliente`} value={client} maxLength={80} onChange={(e) => setClient(e.target.value)} placeholder="Ex.: Padaria Sol" className="mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue)" />
            </div>
            <div>
              <label htmlFor={`${baseId}-obs`} className="text-[0.92rem] font-medium">Observações <span className="font-normal text-(--orca-muted)">(opcional)</span></label>
              <input id={`${baseId}-obs`} value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: arte enviada pelo cliente" className="mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue)" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!canIssue}
              className="inline-flex items-center gap-2 rounded-full bg-(--orca-blue) px-5 py-2.5 font-semibold text-white hover:bg-(--orca-blue-2) disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Printer aria-hidden="true" className="h-4 w-4" />
              Imprimir ou salvar em PDF
            </button>
            <button
              type="button"
              onClick={copySummary}
              disabled={!canIssue}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-(--orca-blue) ring-1 ring-(--orca-blue) hover:bg-(--orca-wash) disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
              Copiar resumo
            </button>
          </div>
          <p className="mt-2 text-[0.85rem] text-(--orca-muted)">
            {canIssue
              ? 'Para gerar um PDF, escolha “Salvar como PDF” no destino da janela de impressão do navegador. Só a proposta é impressa.'
              : t.rows.length === 0
                ? 'Adicione pelo menos um item para gerar a proposta.'
                : 'Corrija o desconto ou a validade para gerar a proposta.'}
          </p>
          <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] text-[0.9rem] font-medium text-(--orca-blue)">{copyStatus}</p>
          {copyFallback && (
            <textarea id={`${baseId}-resumo-texto`} readOnly value={copyFallback} rows={8} aria-label="Resumo do orçamento" className="orca-num mt-2 w-full rounded-lg bg-(--orca-bg) p-3 text-[0.85rem] ring-1 ring-(--orca-line)" />
          )}

          {t.rows.length > 0 && !discount.error && (
            <div className="mt-6">
              <p className="mb-2 text-[0.85rem] font-medium text-(--orca-muted)">Pré-visualização</p>
              <div className="rounded-2xl bg-(--orca-bg) p-2 sm:p-4">
                <Proposal t={t} info={info} idPrefix={`${baseId}-tela`} />
              </div>
            </div>
          )}
        </section>

        <div className="mt-6">
          <CatalogManager
            catalog={catalog}
            usedIds={usedIds}
            storageOk={storageOk}
            onSave={(it) => setCatalog((c) => (c.some((x) => x.id === it.id) ? c.map((x) => (x.id === it.id ? it : x)) : [...c, it]))}
            onRemove={(id) => {
              setCatalog((c) => c.filter((x) => x.id !== id));
              setLines((ls) => ls.filter((l) => l.itemId !== id));
            }}
            onRestore={() => {
              setCatalog(SAMPLE_CATALOG);
              setLines((ls) => ls.filter((l) => SAMPLE_CATALOG.some((s) => s.id === l.itemId)));
            }}
          />
        </div>
      </main>

      <footer className="orca-on-dark bg-(--orca-ink) text-white/80">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-3 px-4 py-8 text-[0.9rem] sm:px-6 md:flex-row md:justify-between lg:px-8">
          <p className="max-w-xl">
            {BUSINESS.name}, preços e clientes são fictícios. Nada é enviado a servidores: o catálogo fica salvo apenas neste navegador.
          </p>
          <p>
            Projeto demonstrativo de {site.name}.{' '}
            <Link to={{ pathname: '/', hash: '#projetos' }} className="rounded font-semibold text-white underline underline-offset-2">Ver outros projetos</Link>
          </p>
        </div>
      </footer>

      {/* Cópia da proposta usada só na impressão (fica direto no <body>). */}
      {createPortal(
        <div className="orca-print-root" aria-hidden="true">
          <div className="orca-root font-sans">
            {canIssue ? (
              <Proposal t={t} info={info} idPrefix={`${baseId}-impressao`} />
            ) : (
              <p>Nenhuma proposta para imprimir: adicione itens ao orçamento no OrçaFácil.</p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Step({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'font-semibold' : ''}`}>
      <dt className="font-sans">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function OrcaMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--orca-blue)" />
      <rect x="11" y="9" width="18" height="22" rx="2.5" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <path d="M15 15h10M15 20h10M15 25h5" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
