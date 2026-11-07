/**
 * Composição do hero: uma "bancada" com quatro abas, uma para cada tipo
 * de trabalho. É interativa (teclado e toque) e os números da planilha
 * são calculados de verdade a partir dos dados de exemplo.
 */
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/utils/cn';

const tabs = [
  { id: 'site', label: 'Site' },
  { id: 'planilha', label: 'Planilha' },
  { id: 'automacao', label: 'Automação' },
  { id: 'sistema', label: 'Sistema' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function HeroWorkbench() {
  const [active, setActive] = useState<TabId>('planilha');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((t) => t.id === active);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="animate-rise overflow-hidden rounded-xl bg-card text-ink ring-1 ring-white/10 [animation-delay:120ms]">
      <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="type-tag ml-2 text-slate">altocode/bancada</span>
      </div>
        <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-3 py-2.5 sm:px-4">
          <div
            role="tablist"
            aria-label="Exemplos de trabalho"
            onKeyDown={onKeyDown}
            className="flex gap-1 overflow-x-auto"
          >
            {tabs.map((tab, i) => {
              const selected = tab.id === active;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`${baseId}-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                    selected ? 'bg-ink text-white' : 'text-slate hover:bg-card hover:text-ink',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <span className="hidden text-xs text-slate sm:block">Exemplo ilustrativo</span>
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="h-[19rem] sm:h-[19.5rem]"
        >
          <div key={active} className="h-full animate-fade">
            {active === 'site' && <SitePanel />}
            {active === 'planilha' && <SheetPanel />}
            {active === 'automacao' && <AutomationPanel />}
            {active === 'sistema' && <SystemPanel />}
          </div>
        </div>
    </div>
  );
}

/* ------------------------------------------------------------- planilha */

const sheetRows = [
  { mes: 'Julho', receita: 18450, despesas: 11320 },
  { mes: 'Agosto', receita: 19980, despesas: 12105 },
  { mes: 'Setembro', receita: 21240, despesas: 12870 },
  { mes: 'Outubro', receita: 22760, despesas: 13190 },
];

const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function SheetPanel() {
  const [selected, setSelected] = useState<'receita' | 'despesas' | 'lucro'>('lucro');
  const totals = sheetRows.reduce(
    (acc, row) => ({
      receita: acc.receita + row.receita,
      despesas: acc.despesas + row.despesas,
    }),
    { receita: 0, despesas: 0 },
  );
  const lucroTotal = totals.receita - totals.despesas;
  const margin = (lucroTotal / totals.receita) * 100;
  const formulas = {
    receita: '=SOMA(B2:B5)',
    despesas: '=SOMA(C2:C5)',
    lucro: '=SOMA(D2:D5)',
  };
  const values = { receita: totals.receita, despesas: totals.despesas, lucro: lucroTotal };
  const columns: Array<{ key: 'receita' | 'despesas' | 'lucro'; label: string; col: string }> = [
    { key: 'receita', label: 'Receita', col: 'B' },
    { key: 'despesas', label: 'Despesas', col: 'C' },
    { key: 'lucro', label: 'Lucro', col: 'D' },
  ];

  return (
    <div className="flex h-full flex-col text-sm">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2 font-code text-[0.8rem]">
        <span className="rounded bg-paper px-1.5 text-slate ring-1 ring-line">
          {columns.find((c) => c.key === selected)?.col}6
        </span>
        <span className="text-slate italic">fx</span>
        <span className="truncate text-ink">{formulas[selected]}</span>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[19rem] text-[0.8rem] sm:text-sm border-collapse text-left tabular-nums">
          <caption className="sr-only">Planilha de exemplo com receita, despesas e lucro por mês</caption>
          <thead>
            <tr className="bg-paper text-[0.8rem] text-slate">
              <th scope="col" className="w-8 max-sm:hidden border-r border-b border-line px-2 py-1.5 text-center font-normal" />
              <th scope="col" className="border-r border-b border-line px-2 py-1.5 sm:px-3 font-medium">Mês</th>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="border-r border-b border-line px-2 py-1.5 sm:px-3 text-right font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheetRows.map((row, i) => (
              <tr key={row.mes}>
                <td className="max-sm:hidden border-r border-b border-line bg-paper px-2 py-1.5 text-center text-[0.75rem] text-slate">{i + 2}</td>
                <td className="border-r border-b border-line px-2 py-1.5 sm:px-3">{row.mes}</td>
                <td className="border-r border-b border-line px-2 py-1.5 sm:px-3 text-right">{brl(row.receita)}</td>
                <td className="border-r border-b border-line px-2 py-1.5 sm:px-3 text-right">{brl(row.despesas)}</td>
                <td className="border-r border-b border-line px-2 py-1.5 sm:px-3 text-right">{brl(row.receita - row.despesas)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="max-sm:hidden border-r border-line bg-paper px-2 py-1.5 text-center text-[0.75rem] font-normal text-slate">6</td>
              <td className="border-r border-line px-2 py-1.5 sm:px-3">Total</td>
              {columns.map((c) => (
                <td key={c.key} className="border-r border-line p-0 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(c.key)}
                    aria-pressed={selected === c.key}
                    aria-label={`Ver fórmula do total de ${c.label.toLowerCase()}`}
                    className={cn(
                      'w-full px-2 py-1.5 sm:px-3 text-right',
                      selected === c.key ? 'bg-tide-wash outline-2 -outline-offset-2 outline-tide-deep' : 'hover:bg-paper',
                    )}
                  >
                    {brl(values[c.key])}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line px-3 py-2.5">
        <p className="text-[0.8rem] text-slate">Toque nos totais para ver a fórmula de cada um.</p>
        <p className="shrink-0 text-sm">
          Margem <span className="font-semibold tabular-nums text-tide-deep">{margin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ site */

function SitePanel() {
  return (
    <div className="flex h-full flex-col bg-[#f4f8f7]">
      <div className="flex items-center justify-between px-5 py-3 text-sm">
        <span className="font-title font-semibold">Ateliê Bem Feito</span>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">Agendar visita</span>
      </div>
      <div className="flex flex-1 flex-col justify-center px-5 pb-4 sm:px-7">
        <p className="font-title text-[1.45rem] leading-tight font-medium tracking-[-0.03em] sm:text-[1.75rem]">
          Móveis planejados para espaços pequenos
        </p>
        <p className="mt-2 max-w-sm text-sm text-slate">
          Projeto, fabricação e montagem com acompanhamento em cada etapa.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
          {['Cozinhas', 'Quartos', 'Home office'].map((item, i) => (
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

function AutomationPanel() {
  const steps = [
    { title: 'Pedido recebido pelo formulário', detail: 'Cliente: Marina S. · 2 itens' },
    { title: 'Linha criada na planilha de pedidos', detail: 'Aba "Pedidos", linha 148' },
    { title: 'Estoque atualizado', detail: 'Baixa automática de 2 unidades' },
    { title: 'Confirmação enviada ao cliente', detail: 'Modelo de mensagem padrão' },
  ];
  return (
    <div className="flex h-full flex-col px-5 py-4">
      <p className="text-sm font-semibold">Rotina: novo pedido</p>
      <ol className="mt-3 flex flex-1 flex-col justify-between">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-3 pb-1">
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="absolute top-7 bottom-[-0.6rem] left-[0.8rem] w-px bg-line" />
            )}
            <span className="relative z-10 grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full bg-tide-wash text-xs font-semibold text-tide-deep ring-1 ring-tide-deep/30">
              {i + 1}
            </span>
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

function SystemPanel() {
  const orders = [
    { id: '#1042', client: 'Padaria Sol', status: 'Em produção', tone: 'bg-tide-wash text-tide-deep' },
    { id: '#1041', client: 'Mercado Bom Preço', status: 'Entregue', tone: 'bg-paper text-slate' },
    { id: '#1040', client: 'Café Central', status: 'Aguardando', tone: 'bg-[#fbf1dc] text-[#7a5a12]' },
    { id: '#1039', client: 'Loja Ponto Certo', status: 'Entregue', tone: 'bg-paper text-slate' },
  ];
  return (
    <div className="flex h-full">
      <div className="hidden w-28 flex-col gap-1.5 bg-ink p-3 text-xs text-mist sm:flex">
        <span className="mb-1 font-title text-sm font-semibold text-white">Painel</span>
        <span className="rounded bg-ink-2 px-2 py-1 text-white">Pedidos</span>
        <span className="px-2 py-1">Clientes</span>
        <span className="px-2 py-1">Produtos</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Abertos', '12'],
            ['Hoje', '5'],
            ['Atrasados', '1'],
          ].map(([label, value]) => (
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
