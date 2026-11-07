import { useState, type CSSProperties, type ReactNode } from 'react';
import { useTicker } from '@/hooks/useMotion';
import { cn } from '@/utils/cn';

/**
 * Ilustrações técnicas animadas dos seis serviços. Cada uma mostra, em pequena
 * escala, o tipo de solução: página se organizando, registros entrando num
 * sistema, gráfico atualizando, fórmula recalculando, dados percorrendo um fluxo
 * e um orçamento sendo recalculado. Os dados são fictícios e as contas, reais.
 *
 * São decorativas (aria-hidden): o texto do cartão descreve o serviço.
 * `active` vem do MotionArea: falso fora da tela, com a aba em segundo plano ou
 * com as animações pausadas; aí os temporizadores param e o CSS congela.
 */

type Props = { active: boolean };
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/* ------------------------------------------------------------ sites (CSS) */
/** Blocos de uma página chegando ao lugar, um a um, com a moldura de seleção. */
export function SitesIllustration() {
  const blocks: Array<{ x: number; y: number; w: number; h: number; dx: number; dy: number; d: number; tone: string }> = [
    { x: 24, y: 30, w: 272, h: 8, dx: 0, dy: -14, d: 0, tone: 'ink' },
    { x: 24, y: 48, w: 136, h: 9, dx: -26, dy: 0, d: 0.5, tone: 'ink' },
    { x: 24, y: 61, w: 104, h: 5, dx: -26, dy: 0, d: 0.8, tone: 'slate' },
    { x: 24, y: 72, w: 46, h: 10, dx: 0, dy: 16, d: 1.1, tone: 'tide' },
    { x: 184, y: 48, w: 112, h: 36, dx: 30, dy: 0, d: 1.5, tone: 'ice' },
    { x: 24, y: 94, w: 84, h: 22, dx: 0, dy: 18, d: 2, tone: 'card' },
    { x: 118, y: 94, w: 84, h: 22, dx: 0, dy: 18, d: 2.25, tone: 'card' },
    { x: 212, y: 94, w: 84, h: 22, dx: 0, dy: 18, d: 2.5, tone: 'card' },
  ];
  return (
    <svg viewBox="0 0 320 128" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <rect x="12" y="10" width="296" height="114" rx="6" className="fill-white stroke-ice-2" />
      <g className="fill-ice-2">
        <circle cx="22" cy="19" r="2" /><circle cx="29" cy="19" r="2" /><circle cx="36" cy="19" r="2" />
      </g>
      {blocks.map((b, i) => (
        <g key={i} className="svc-site-block" style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--d': `${b.d}s` } as CSSProperties}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" className={`svc-fill-${b.tone}`} />
          {/* moldura de seleção que pisca quando o bloco encaixa */}
          <rect x={b.x - 2.5} y={b.y - 2.5} width={b.w + 5} height={b.h + 5} rx="1" className="svc-site-frame fill-none stroke-tide" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------- sistemas (ticker) */
const ORDERS = [
  ['#2051', 'Cartões 500 un.'],
  ['#2052', 'Banner 2 m²'],
  ['#2053', 'Adesivos 100 un.'],
  ['#2054', 'Folhetos 1.000 un.'],
  ['#2055', 'Placa em PVC'],
  ['#2056', 'Crachás 40 un.'],
];
const STATUS = [
  { label: 'Novo', cls: 'bg-amber/20 text-amber' },
  { label: 'Em produção', cls: 'bg-lavender-glow/25 text-lavender-2' },
  { label: 'Concluído', cls: 'bg-tide/15 text-tide' },
];
/** Painel de pedidos: um registro novo entra e os anteriores avançam de status. */
export function SystemsIllustration({ active }: Props) {
  const [n, setN] = useState(3);
  useTicker(active, 2400, () => setN((v) => v + 1));
  const rows = [0, 1, 2].map((k) => {
    const idx = n - 1 - k;
    return { key: idx, order: ORDERS[idx % ORDERS.length], status: STATUS[Math.min(k, 2)] };
  });
  return (
    <div className="flex h-full flex-col px-4 py-3 text-[10.5px] leading-none text-mist">
      <div className="flex items-center justify-between font-code text-[9.5px] tracking-wide text-mist/80">
        <span>Pedidos</span>
        <span className="text-tide">{n + 2047} registros</span>
      </div>
      <div className="mt-2 grid flex-1 content-start gap-1 overflow-hidden">
        {rows.map((r, k) => (
          <div key={r.key} className={cn('grid grid-cols-[3.2rem_1fr_auto] items-center gap-2 rounded-md bg-white/[0.04] px-2.5 py-1 ring-1 ring-white/[0.07]', k === 0 && 'svc-row-in')}>
            <span className="font-code text-white/90">{r.order[0]}</span>
            <span className="truncate">{r.order[1]}</span>
            <span className={cn('rounded-full px-2 py-[3px] font-medium transition-colors duration-500', r.status.cls)}>{r.status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------- dashboards (ticker) */
const SERIES = [
  [42, 58, 50, 66, 61, 74, 70],
  [38, 46, 63, 55, 72, 68, 81],
  [55, 49, 60, 71, 64, 79, 76],
  [47, 62, 57, 64, 77, 70, 88],
];
/** Barras e indicador se atualizando quando o "filtro" muda. */
export function DashboardIllustration({ active }: Props) {
  const [i, setI] = useState(0);
  useTicker(active, 2200, () => setI((v) => (v + 1) % SERIES.length));
  const data = SERIES[i];
  const total = data.reduce((a, b) => a + b, 0) * 130;
  const prev = SERIES[(i + SERIES.length - 1) % SERIES.length].reduce((a, b) => a + b, 0) * 130;
  const delta = ((total - prev) / prev) * 100;
  return (
    <div className="flex h-full items-stretch gap-4 px-4 py-3">
      <div className="flex w-[38%] flex-col justify-between">
        <span className="font-code text-[9.5px] text-slate">Receita no período</span>
        <span key={i} className="svc-value-in font-title text-[17px] font-semibold tracking-[-0.02em] text-ink">{brl.format(total).replace(',00', '')}</span>
        <span className={cn('w-fit rounded-full px-2 py-0.5 font-code text-[9.5px]', delta >= 0 ? 'bg-tide-wash text-tide-deep' : 'bg-amber/15 text-amber-deep')}>
          {delta >= 0 ? '+' : ''}
          {delta.toFixed(1).replace('.', ',')}%
        </span>
      </div>
      <div className="flex flex-1 items-end gap-[6%] border-b border-l border-ice-2 pb-px pl-px">
        {data.map((v, k) => (
          <span
            key={k}
            className={cn('h-full flex-1 origin-bottom rounded-t-[2px] transition-transform duration-700 ease-out', k === data.length - 1 ? 'bg-tide' : 'bg-ink/80')}
            style={{ transform: `scaleY(${v / 100})` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ planilhas (ticker) */
const SHEETS = [
  [['Cartões', 2, 89], ['Banner', 3, 65], ['Adesivos', 4, 32]],
  [['Folhetos', 5, 48], ['Placa', 1, 120], ['Crachás', 6, 12]],
];
/** Células recebendo dados e a fórmula recalculando o total. */
export function SheetIllustration({ active }: Props) {
  const [step, setStep] = useState(0); // 0..6: linhas aparecem; 7..9: total em destaque
  useTicker(active, 900, () => setStep((s) => (s + 1) % 20));
  const sheet = SHEETS[Math.floor(step / 10) % SHEETS.length];
  const local = step % 10;
  const shown = Math.min(local, 3);
  const total = sheet.slice(0, shown).reduce((a, r) => a + Number(r[1]) * Number(r[2]), 0);
  const done = local >= 4;
  return (
    <div className="flex h-full flex-col px-4 py-2.5 font-code text-[9.5px] text-mist">
      <div className="flex items-center gap-2 rounded bg-white/[0.05] px-2 py-1 ring-1 ring-white/[0.08]">
        <span className="text-tide">fx</span>
        <span className="text-white/90">{done ? '=SOMA(D2:D4)' : shown ? `=B${shown + 1}*C${shown + 1}` : '...'}</span>
      </div>
      <div className="mt-1.5 grid flex-1 grid-cols-[1.3fr_0.6fr_0.8fr_1fr] content-start gap-px overflow-hidden rounded bg-white/[0.08]">
        {['Item', 'Qtd', 'Preço', 'Total'].map((h) => (
          <span key={h} className="bg-ink-2 px-1.5 py-[2px] text-mist/80">{h}</span>
        ))}
        {sheet.map((r, k) => {
          const on = k < shown;
          return (
            <span key={`${step}-${k}`} className="contents">
              <span className="bg-night px-1.5 py-[2px] text-white/85">{on ? r[0] : ''}</span>
              <span className="bg-night px-1.5 py-[2px] text-right">{on ? r[1] : ''}</span>
              <span className="bg-night px-1.5 py-[2px] text-right">{on ? r[2] : ''}</span>
              <span className={cn('bg-night px-1.5 py-[2px] text-right', on && k === shown - 1 && !done && 'svc-cell-hit')}>{on ? Number(r[1]) * Number(r[2]) : ''}</span>
            </span>
          );
        })}
        <span className="col-span-3 bg-ink-2 px-1.5 py-[2px] text-mist/80">Total</span>
        <span className={cn('bg-ink-2 px-1.5 py-[2px] text-right text-white transition-colors duration-300', done && 'svc-total-on')}>{total ? brl.format(total) : ''}</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- automação (CSS) */
/** Um registro percorrendo as etapas de um fluxo; cada etapa acende na passagem. */
export function AutomationIllustration() {
  const steps = ['Pedido', 'Planilha', 'Aviso', 'Relatório'];
  const xs = [40, 120, 200, 280];
  return (
    <svg viewBox="0 0 320 128" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <line x1="40" y1="56" x2="280" y2="56" className="stroke-ice-2" strokeWidth="2" strokeDasharray="3 5" />
      {xs.map((x, k) => (
        <g key={x} className="svc-auto-node" style={{ '--d': `${k * 1.5}s` } as CSSProperties}>
          <rect x={x - 17} y="39" width="34" height="34" rx="8" className="svc-auto-box fill-white stroke-ice-2" />
          <rect x={x - 6} y={50} width="12" height="12" rx="2" className="svc-auto-dot fill-ink" />
          <text x={x} y="96" textAnchor="middle" className="fill-slate font-code text-[10px]">
            {steps[k]}
          </text>
        </g>
      ))}
      {/* o "registro" que viaja entre as etapas */}
      <g className="svc-auto-packet">
        <rect x="31" y="50" width="18" height="13" rx="2" className="fill-amber" />
        <path d="M34 54.5h12M34 58.5h8" className="stroke-night" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------- calculadora (ticker) */
const SCENARIOS = [
  { qty: 1, premium: false, rapido: false },
  { qty: 2, premium: false, rapido: false },
  { qty: 2, premium: true, rapido: false },
  { qty: 3, premium: true, rapido: false },
  { qty: 3, premium: true, rapido: true },
  { qty: 4, premium: false, rapido: true },
];
/** Variáveis mudando e o valor do orçamento sendo recalculado (preço × qtd × fatores). */
export function CalculatorIllustration({ active }: Props) {
  const [i, setI] = useState(0);
  useTicker(active, 2000, () => setI((v) => (v + 1) % SCENARIOS.length));
  const s = SCENARIOS[i];
  const total = 89 * s.qty * (s.premium ? 1.3 : 1) * (s.rapido ? 1.15 : 1);
  const seg = (on: boolean) => cn('rounded px-1.5 py-0.5 transition-colors duration-300', on ? 'bg-night text-white' : 'text-mist/80');
  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] gap-4 px-4 py-3 text-[10px] text-mist">
      <div className="grid content-center gap-2.5">
        <div>
          <div className="flex justify-between font-code text-[9.5px]">
            <span>Quantidade</span>
            <span className="text-white">{s.qty} pct.</span>
          </div>
          <div className="relative mt-1.5 h-1 rounded-full bg-white/10">
            <span className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-tide transition-transform duration-500" style={{ transform: `scaleX(${s.qty / 4})` }} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-code text-[9.5px]">Material</span>
          <span className="flex rounded bg-white/[0.06] p-0.5">
            <span className={seg(!s.premium)}>Padrão</span>
            <span className={seg(s.premium)}>Premium</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-code text-[9.5px]">Prazo</span>
          <span className="flex rounded bg-white/[0.06] p-0.5">
            <span className={seg(!s.rapido)}>Normal</span>
            <span className={seg(s.rapido)}>Rápido</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center rounded-lg bg-white/[0.05] px-3 ring-1 ring-white/[0.08]">
        <span className="font-code text-[9.5px]">Total do orçamento</span>
        <span key={i} className="svc-value-in mt-1 font-title text-[17px] font-semibold tracking-[-0.02em] text-white">{brl.format(total)}</span>
        <span className="mt-1 font-code text-[9px] text-mist/70">
          89 × {s.qty}
          {s.premium ? ' × 1,30' : ''}
          {s.rapido ? ' × 1,15' : ''}
        </span>
      </div>
    </div>
  );
}

/** Ilustração e tom do painel de cada serviço (alternando claro e escuro na grade). */
export const SERVICE_ART: Record<string, { tone: 'light' | 'dark'; render: (active: boolean) => ReactNode }> = {
  sites: { tone: 'light', render: () => <SitesIllustration /> },
  sistemas: { tone: 'dark', render: (a) => <SystemsIllustration active={a} /> },
  dashboards: { tone: 'light', render: (a) => <DashboardIllustration active={a} /> },
  planilhas: { tone: 'dark', render: (a) => <SheetIllustration active={a} /> },
  automacoes: { tone: 'light', render: () => <AutomationIllustration /> },
  ferramentas: { tone: 'dark', render: (a) => <CalculatorIllustration active={a} /> },
};
