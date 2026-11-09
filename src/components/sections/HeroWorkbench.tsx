/**
 * Composição do hero: uma "bancada" com quatro abas, uma para cada tipo
 * de trabalho. É interativa (teclado e toque) e os números da planilha
 * são calculados de verdade a partir dos dados de exemplo.
 * Textos nos dois idiomas em WB (abaixo); valores em reais nos dois.
 */
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/locale';
import { cn } from '@/utils/cn';

export type TabId = 'site' | 'planilha' | 'automacao' | 'sistema';
export const TAB_IDS: TabId[] = ['site', 'planilha', 'automacao', 'sistema'];
/** Serviço (src/data/services.ts) que cada aba exemplifica. */
export const TAB_SERVICE: Record<TabId, string> = { site: 'sites', planilha: 'planilhas', automacao: 'automacoes', sistema: 'sistemas' };

const WB = {
  pt: {
    tablist: 'Exemplos de trabalho',
    tabs: { site: 'Site', planilha: 'Planilha', automacao: 'Automação', sistema: 'Sistema' },
    /** Rótulos para telas abaixo de 360 px (iguais aos completos quando já cabem). */
    tabsShort: { site: 'Site', planilha: 'Planilha', automacao: 'Automação', sistema: 'Sistema' },
    illustrative: 'Exemplo ilustrativo',
    sheet: {
      caption: 'Planilha de exemplo com receita, despesas e lucro por mês',
      row: 'Linha',
      month: 'Mês',
      months: ['Julho', 'Agosto', 'Setembro', 'Outubro'],
      cols: { receita: 'Receita', despesas: 'Despesas', lucro: 'Lucro' },
      total: 'Total',
      fn: 'SOMA',
      seeFormula: (label: string) => `ver fórmula do total de ${label.toLowerCase()}`,
      hint: 'Toque nos totais para ver a fórmula de cada um.',
      margin: 'Margem',
    },
    site: {
      brand: 'Ateliê Bem Feito',
      cta: 'Agendar visita',
      title: 'Móveis planejados para espaços pequenos',
      text: 'Projeto, fabricação e montagem com acompanhamento em cada etapa.',
      items: ['Cozinhas', 'Quartos', 'Home office'],
    },
    automation: {
      title: 'Rotina: novo pedido',
      steps: [
        { title: 'Pedido recebido pelo formulário', detail: 'Cliente: Marina S. · 2 itens' },
        { title: 'Linha criada na planilha de pedidos', detail: 'Aba "Pedidos", linha 148' },
        { title: 'Estoque atualizado', detail: 'Baixa automática de 2 unidades' },
        { title: 'Confirmação enviada ao cliente', detail: 'Modelo de mensagem padrão' },
      ],
    },
    system: {
      panel: 'Painel',
      menu: ['Pedidos', 'Clientes', 'Produtos'],
      kpis: [['Abertos', '12'], ['Hoje', '5'], ['Atrasados', '1']] as Array<[string, string]>,
      status: { prod: 'Em produção', done: 'Entregue', wait: 'Aguardando' },
    },
  },
  en: {
    tablist: 'Work examples',
    tabs: { site: 'Website', planilha: 'Spreadsheet', automacao: 'Automation', sistema: 'System' },
    tabsShort: { site: 'Site', planilha: 'Sheet', automacao: 'Automation', sistema: 'System' },
    illustrative: 'Illustrative example',
    sheet: {
      caption: 'Sample spreadsheet with revenue, expenses and profit by month',
      row: 'Row',
      month: 'Month',
      months: ['July', 'August', 'September', 'October'],
      cols: { receita: 'Revenue', despesas: 'Expenses', lucro: 'Profit' },
      total: 'Total',
      fn: 'SUM',
      seeFormula: (label: string) => `see the ${label.toLowerCase()} total formula`,
      hint: 'Tap the totals to see each formula.',
      margin: 'Margin',
    },
    site: {
      brand: 'Ateliê Bem Feito',
      cta: 'Book a visit',
      title: 'Custom furniture for small spaces',
      text: 'Design, manufacturing and installation, with follow-up at every step.',
      items: ['Kitchens', 'Bedrooms', 'Home office'],
    },
    automation: {
      title: 'Routine: new order',
      steps: [
        { title: 'Order received through the form', detail: 'Customer: Marina S. · 2 items' },
        { title: 'Row added to the orders sheet', detail: '"Orders" tab, row 148' },
        { title: 'Stock updated', detail: '2 units deducted automatically' },
        { title: 'Confirmation sent to the customer', detail: 'Standard message template' },
      ],
    },
    system: {
      panel: 'Dashboard',
      menu: ['Orders', 'Customers', 'Products'],
      kpis: [['Open', '12'], ['Today', '5'], ['Late', '1']] as Array<[string, string]>,
      status: { prod: 'In production', done: 'Delivered', wait: 'Pending' },
    },
  },
} satisfies Record<Locale, unknown>;

type Text = (typeof WB)['pt'];

/**
 * A aba ativa é controlada pelo Início: o título e o painel de inspeção acompanham a escolha.
 */
export function HeroWorkbench({ active, onActiveChange: setActive, panelId }: { active: TabId; onActiveChange: (id: TabId) => void; panelId?: string }) {
  const { locale, intl } = useLocale();
  const t: Text = WB[locale];
  const ownId = useId();
  const baseId = panelId ?? ownId;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // Indicador que desliza até a aba escolhida (posição medida, então funciona com textos de qualquer tamanho)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[TAB_IDS.indexOf(active)];
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    tabRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [active, locale]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = TAB_IDS.indexOf(active);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % TAB_IDS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + TAB_IDS.length) % TAB_IDS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TAB_IDS.length - 1;
    else return;
    event.preventDefault();
    setActive(TAB_IDS[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-[12px] bg-card text-ink ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-3 py-2.5 sm:px-4">
        <div role="tablist" aria-label={t.tablist} onKeyDown={onKeyDown} className="bench-tabs relative flex flex-1 gap-0.5 rounded-lg bg-[#e6ebf2] p-1 sm:flex-none">
          {pill && <span aria-hidden="true" className="bench-pill" style={{ transform: `translateX(${pill.x - 4}px)`, width: pill.w }} />}
          {TAB_IDS.map((id, i) => {
            const selected = id === active;
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`${baseId}-tab-${id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(id)}
                className={cn(
                  'relative z-10 min-h-9 flex-auto rounded-md px-1.5 py-1.5 text-[0.8rem] font-medium whitespace-nowrap transition-colors duration-200 min-[400px]:px-2.5 min-[400px]:text-sm sm:flex-none sm:px-3',
                  selected ? 'text-white' : 'text-slate hover:text-ink',
                )}
              >
                {t.tabsShort[id] === t.tabs[id] ? (
                  t.tabs[id]
                ) : (
                  <>
                    <span className="max-[359px]:hidden">{t.tabs[id]}</span>
                    <span className="min-[360px]:hidden">{t.tabsShort[id]}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <span className="hidden text-xs text-slate sm:block">{t.illustrative}</span>
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="h-[19rem] sm:h-[19.5rem]">
        <div key={`${active}-${locale}`} className="bench-in h-full">
          {active === 'site' && <SitePanel t={t} />}
          {active === 'planilha' && <SheetPanel t={t} intl={intl} />}
          {active === 'automacao' && <AutomationPanel t={t} />}
          {active === 'sistema' && <SystemPanel t={t} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- planilha */

const sheetValues = [
  { receita: 18450, despesas: 11320 },
  { receita: 19980, despesas: 12105 },
  { receita: 21240, despesas: 12870 },
  { receita: 22760, despesas: 13190 },
];

type Col = 'receita' | 'despesas' | 'lucro';

function SheetPanel({ t, intl }: { t: Text; intl: string }) {
  const [selected, setSelected] = useState<Col>('lucro');
  const money = (value: number) => value.toLocaleString(intl, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const totals = sheetValues.reduce((acc, row) => ({ receita: acc.receita + row.receita, despesas: acc.despesas + row.despesas }), { receita: 0, despesas: 0 });
  const lucroTotal = totals.receita - totals.despesas;
  const margin = (lucroTotal / totals.receita) * 100;
  const letter: Record<Col, string> = { receita: 'B', despesas: 'C', lucro: 'D' };
  const values: Record<Col, number> = { receita: totals.receita, despesas: totals.despesas, lucro: lucroTotal };
  const cols: Col[] = ['receita', 'despesas', 'lucro'];

  return (
    <div className="flex h-full flex-col text-sm">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2 font-code text-[0.8rem]">
        <span className="rounded bg-paper px-1.5 text-slate ring-1 ring-line">{letter[selected]}6</span>
        <span className="text-slate italic">fx</span>
        <span className="truncate text-ink">{`=${t.sheet.fn}(${letter[selected]}2:${letter[selected]}5)`}</span>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[19rem] border-collapse text-left text-[0.8rem] tabular-nums sm:text-sm">
          <caption className="sr-only">{t.sheet.caption}</caption>
          <thead>
            <tr className="bg-paper text-[0.8rem] text-slate">
              <th scope="col" className="w-8 border-r border-b border-line px-2 py-1.5 text-center font-normal max-sm:hidden">
                <span className="sr-only">{t.sheet.row}</span>
              </th>
              <th scope="col" className="border-r border-b border-line px-2 py-1.5 font-medium sm:px-3">
                {t.sheet.month}
              </th>
              {cols.map((c) => (
                <th key={c} scope="col" className="border-r border-b border-line px-2 py-1.5 text-right font-medium sm:px-3">
                  {t.sheet.cols[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheetValues.map((row, i) => (
              <tr key={t.sheet.months[i]}>
                <td className="border-r border-b border-line bg-paper px-2 py-1.5 text-center text-[0.75rem] text-slate max-sm:hidden">{i + 2}</td>
                <td className="border-r border-b border-line px-2 py-1.5 sm:px-3">{t.sheet.months[i]}</td>
                <td className="border-r border-b border-line px-2 py-1.5 text-right sm:px-3">{money(row.receita)}</td>
                <td className="border-r border-b border-line px-2 py-1.5 text-right sm:px-3">{money(row.despesas)}</td>
                <td className="border-r border-b border-line px-2 py-1.5 text-right sm:px-3">{money(row.receita - row.despesas)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border-r border-line bg-paper px-2 py-1.5 text-center text-[0.75rem] font-normal text-slate max-sm:hidden">6</td>
              <td className="border-r border-line px-2 py-1.5 sm:px-3">{t.sheet.total}</td>
              {cols.map((c) => (
                <td key={c} className="border-r border-line p-0 text-right">
                  {/* O nome acessível começa pelo valor visível (WCAG 2.5.3) */}
                  <button
                    type="button"
                    onClick={() => setSelected(c)}
                    aria-pressed={selected === c}
                    data-col={c}
                    className={cn('w-full px-2 py-1.5 text-right transition-colors sm:px-3', selected === c ? 'bg-[color-mix(in_srgb,var(--cat-light,#0a7568)_10%,white)] outline-2 -outline-offset-2 outline-[var(--cat-light,#0a7568)]' : 'hover:bg-paper')}
                  >
                    {money(values[c])}
                    <span className="sr-only">, {t.sheet.seeFormula(t.sheet.cols[c])}</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line px-3 py-2.5">
        <p className="text-[0.8rem] text-slate">{t.sheet.hint}</p>
        <p className="shrink-0 text-sm">
          {t.sheet.margin} <span className="font-semibold text-[var(--cat-light,#0a7568)] tabular-nums">{margin.toLocaleString(intl, { maximumFractionDigits: 1 })}%</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ site */

function SitePanel({ t }: { t: Text }) {
  return (
    <div className="flex h-full flex-col bg-[#f4f8f7]">
      <div className="flex items-center justify-between px-5 py-3 text-sm">
        <span className="font-title font-semibold">{t.site.brand}</span>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{t.site.cta}</span>
      </div>
      <div className="flex flex-1 flex-col justify-center px-5 pb-4 sm:px-7">
        <p className="font-title text-[1.45rem] leading-tight font-medium tracking-[-0.03em] sm:text-[1.75rem]">{t.site.title}</p>
        <p className="mt-2 max-w-sm text-sm text-slate">{t.site.text}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
          {t.site.items.map((item, i) => (
            <div key={item} className="rounded-lg bg-card p-2 ring-1 ring-line">
              <div className={cn('mb-2 h-10 rounded', ['bg-[#d9e6e2]', 'bg-[#e4e8ef]', 'bg-[#ece7dd]'][i])} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- automação */

function AutomationPanel({ t }: { t: Text }) {
  const steps = t.automation.steps;
  return (
    <div className="flex h-full flex-col px-5 py-4">
      <p className="text-sm font-semibold">{t.automation.title}</p>
      <ol className="mt-3 flex flex-1 flex-col justify-between">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-3 pb-1">
            {i < steps.length - 1 && <span aria-hidden="true" className="absolute top-7 bottom-[-0.6rem] left-[0.8rem] w-px bg-line" />}
            <span className="relative z-10 grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--cat-light,#0a7568)_10%,white)] text-xs font-semibold text-[var(--cat-light,#0a7568)] ring-1 ring-[color-mix(in_srgb,var(--cat-light,#0a7568)_35%,transparent)]">{i + 1}</span>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-slate">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --------------------------------------------------------------- sistema */

function SystemPanel({ t }: { t: Text }) {
  const s = t.system.status;
  const orders = [
    { id: '#1042', client: 'Padaria Sol', status: s.prod, tone: 'bg-[color-mix(in_srgb,var(--cat-light,#0a7568)_10%,white)] text-[var(--cat-light,#0a7568)]' },
    { id: '#1041', client: 'Mercado Bom Preço', status: s.done, tone: 'bg-paper text-slate' },
    { id: '#1040', client: 'Café Central', status: s.wait, tone: 'bg-[#fbf1dc] text-[#7a5a12]' },
    { id: '#1039', client: 'Loja Ponto Certo', status: s.done, tone: 'bg-paper text-slate' },
  ];
  return (
    <div className="flex h-full">
      <div className="hidden w-28 flex-col gap-1.5 bg-ink p-3 text-xs text-mist sm:flex">
        <span className="mb-1 font-title text-sm font-semibold text-white">{t.system.panel}</span>
        {t.system.menu.map((m, i) => (
          <span key={m} className={cn('px-2 py-1', i === 0 && 'rounded bg-ink-2 text-white')}>
            {m}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="grid grid-cols-3 gap-2">
          {t.system.kpis.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-paper p-2.5 ring-1 ring-line">
              <p className="text-xs text-slate">{label}</p>
              <p className="font-title text-lg font-medium tracking-[-0.02em]">{value}</p>
            </div>
          ))}
        </div>
        <ul className="mt-3 flex-1 divide-y divide-line text-sm">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-slate tabular-nums">{o.id}</span>
              <span className="flex-1 truncate">{o.client}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs', o.tone)}>{o.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
