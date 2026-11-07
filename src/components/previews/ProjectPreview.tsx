/**
 * Prévias dos projetos desenhadas em código (HTML/CSS), sem imagens externas:
 * carregam instantaneamente, ficam nítidas em qualquer tela e acompanham
 * a identidade visual. Todo o conteúdo é fictício.
 *
 * Tudo é dimensionado em `em` a partir da largura do container
 * (container queries), então a prévia escala como uma imagem.
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import {
  DEFAULT_FILTERS, buildTrend, createDemoTransactions, filterTransactions,
  moneyCompact, spendingByCategory, totalsFor,
} from '@/pages/gestao360-data';
import { formatPrice as formatImovelPrice, properties as imoveis } from '@/pages/imoveis/imoveis-data';
import { formatCents, products as storeProducts } from '@/pages/arena-store/store-data';
import { SAMPLE_CATALOG, calcLine, formatQty, money, quoteTotals, type QuoteLine } from '@/pages/orcafacil/orca-data';

export type PreviewKind = 'imoveis' | 'dashboard' | 'landing' | 'loja' | 'orcamento';

const labels: Record<PreviewKind, string> = {
  imoveis: 'Prévia do portal imobiliário Prime Imóveis: busca, filtros e cards de imóveis',
  dashboard: 'Prévia do painel Gestão360: indicadores, evolução financeira e despesas por categoria',
  landing: 'Prévia da landing page Nova Serviços: título, chamada e formulário de orçamento',
  loja: 'Prévia da loja Arena Store: categorias, produtos e carrinho',
  orcamento: 'Prévia do OrçaFácil: escolha de item e variáveis, cálculo e total do orçamento',
};

const urls: Record<PreviewKind, string> = {
  imoveis: 'altocode.netlify.app/demos/imoveis',
  dashboard: 'altocode.netlify.app/demos/gestao360',
  landing: 'altocode.netlify.app/demos/nova-servicos',
  loja: 'altocode.netlify.app/demos/arena-store',
  orcamento: 'altocode.netlify.app/demos/orcafacil',
};

export function ProjectPreview({ kind, className }: { kind: PreviewKind; className?: string }) {
  return (
    <div
      role="img"
      aria-label={labels[kind]}
      className={cn('@container overflow-hidden rounded-xl bg-card text-ink ring-1 ring-ink/10', className)}
    >
      <div aria-hidden="true" className="text-[2.05cqw] leading-[1.35]">
        <BrowserBar url={urls[kind]} />
        <div className="aspect-[16/10] overflow-hidden">
          {kind === 'imoveis' && <Imoveis />}
          {kind === 'dashboard' && <Dashboard />}
          {kind === 'landing' && <Landing />}
          {kind === 'loja' && <Loja />}
          {kind === 'orcamento' && <Orcamento />}
        </div>
      </div>
    </div>
  );
}

function BrowserBar({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-[0.9em] border-b border-line bg-paper px-[1.1em] py-[0.75em]">
      <div className="flex gap-[0.4em]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[0.7em] w-[0.7em] rounded-full bg-line" />
        ))}
      </div>
      <div className="flex-1 rounded-full bg-card px-[0.9em] py-[0.2em] text-[0.85em] text-slate ring-1 ring-line">
        {url}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ imóveis */

function HouseArt({ variant }: { variant: number }) {
  const palettes = [
    { sky: '#cfe3ec', wall: '#f3efe7', roof: '#33476b', accent: '#22c3b0' },
    { sky: '#dfe7f1', wall: '#e8edf3', roof: '#0d1a30', accent: '#e4b363' },
    { sky: '#d5ebe6', wall: '#f6f3ee', roof: '#5a6d8c', accent: '#0a7568' },
  ];
  const p = palettes[variant % palettes.length];
  return (
    <svg viewBox="0 0 120 72" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="72" fill={p.sky} />
      <rect y="56" width="120" height="16" fill="#b9cbb4" />
      {variant === 1 ? (
        <g>
          <rect x="34" y="14" width="52" height="44" fill={p.wall} />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={39 + c * 15} y={19 + r * 9} width="10" height="6" fill={p.roof} opacity="0.8" />
            )),
          )}
          <rect x="34" y="12" width="52" height="3" fill={p.roof} />
        </g>
      ) : (
        <g>
          <polygon points="28,34 60,14 92,34" fill={p.roof} />
          <rect x="34" y="33" width="52" height="25" fill={p.wall} />
          <rect x="54" y="42" width="12" height="16" fill={p.roof} />
          <rect x="40" y="39" width="10" height="8" fill={p.accent} opacity="0.85" />
          <rect x="70" y="39" width="10" height="8" fill={p.accent} opacity="0.85" />
        </g>
      )}
      <circle cx="16" cy="50" r="9" fill="#8fb39a" />
      <circle cx="104" cy="48" r="11" fill="#7fa78b" />
    </svg>
  );
}

function Imoveis() {
  // Os três primeiros imóveis do catálogo real da demonstração.
  const cards = imoveis.slice(0, 3).map((p) => ({
    title: p.title,
    place: p.neighborhood,
    price: formatImovelPrice(p),
    meta: [p.bedrooms ? `${p.bedrooms} qts` : null, `${p.bathrooms} banh`, `${p.area} m²`].filter(Boolean).join(' · '),
  }));
  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex items-center justify-between bg-ink px-[1.6em] py-[0.9em] text-white">
        <span className="font-title text-[1.25em] font-semibold">Prime Imóveis</span>
        <div className="flex gap-[1.2em] text-[0.9em] text-mist">
          <span>Comprar</span>
          <span>Alugar</span>
          <span className="rounded-full bg-tide px-[0.8em] text-ink">Todos</span>
        </div>
      </div>
      <div className="px-[1.6em] pt-[1.2em]">
        <div className="flex items-center gap-[0.6em] rounded-[0.6em] bg-card px-[0.9em] py-[0.6em] ring-1 ring-line">
          <span className="h-[0.9em] w-[0.9em] rounded-full ring-2 ring-slate/60" />
          <span className="text-slate">Buscar por bairro, rua ou característica</span>
        </div>
        <div className="mt-[0.8em] flex flex-wrap gap-[0.5em] text-[0.9em]">
          {['Todos', 'Comprar', 'Alugar'].map((chip, i) => (
            <span
              key={chip}
              className={cn(
                'rounded-full px-[0.8em] py-[0.15em]',
                i === 0 ? 'bg-ink text-white' : 'bg-card text-ink ring-1 ring-line',
              )}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 items-start gap-[1em] px-[1.6em] pt-[1em]">
        {cards.map((card, i) => (
          <div key={card.title} className="overflow-hidden rounded-[0.6em] bg-card ring-1 ring-line">
            <div className="h-[8.6em]">
              <HouseArt variant={i} />
            </div>
            <div className="p-[0.8em]">
              <div className="font-semibold text-ink">{card.price}</div>
              <div className="mt-[0.15em] text-ink">{card.title}</div>
              <div className="text-[0.85em] text-slate">{card.place}</div>
              <div className="mt-[0.4em] text-[0.8em] text-slate">{card.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- dashboard */

/**
 * A prévia do Gestão360 é calculada com os mesmos dados e funções da
 * demonstração (12 meses), então os números nunca contradizem o app.
 */
let dashboardCache: ReturnType<typeof computeDashboard> | null = null;
function computeDashboard() {
  const today = new Date();
  const rows = filterTransactions(createDemoTransactions(today), { ...DEFAULT_FILTERS, period: '365d' }, today);
  return { totals: totalsFor(rows), trend: buildTrend(rows, '365d', today), spending: spendingByCategory(rows).slice(0, 4) };
}

function Dashboard() {
  const { totals, trend, spending } = (dashboardCache ??= computeDashboard());
  const max = Math.max(1, ...trend.flatMap((p) => [p.receita, p.despesa]));
  const toPoints = (values: number[]) =>
    values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 200},${86 - (v / max) * 76}`).join(' ');
  const compact = (v: number) => `R$ ${moneyCompact(v)}`;
  const kpis = [
    { label: 'Receitas', value: compact(totals.revenue), tone: 'text-ink' },
    { label: 'Despesas', value: compact(totals.expenses), tone: 'text-ink' },
    { label: 'Resultado', value: compact(totals.result), tone: 'text-tide-deep' },
    { label: 'Transações', value: totals.count.toLocaleString('pt-BR'), tone: 'text-ink' },
  ];
  const topSpending = spending[0]?.value || 1;
  return (
    <div className="flex h-full bg-paper">
      <div className="flex w-[17%] flex-col gap-[0.7em] bg-ink px-[1em] py-[1.1em] text-[0.9em] text-mist">
        <span className="mb-[0.4em] font-title text-[1.15em] font-semibold text-white">Alto Code</span>
        <span className="rounded-[0.4em] bg-ink-2 px-[0.5em] py-[0.2em] text-white">Gestão360</span>
        <span className="mt-auto px-[0.5em] text-[0.85em]">Ambiente fictício</span>
      </div>
      <div className="flex flex-1 flex-col gap-[0.9em] p-[1.2em]">
        <div className="flex items-center justify-between">
          <span className="font-title text-[1.2em] font-semibold text-ink">Gestão360</span>
          <div className="flex gap-[0.4em] text-[0.85em]">
            {['30 dias', '90 dias', '12 meses'].map((p, i) => (
              <span
                key={p}
                className={cn('rounded-full px-[0.7em] py-[0.1em]', i === 2 ? 'bg-ink text-white' : 'bg-card ring-1 ring-line')}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-[0.7em]">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-[0.5em] bg-card p-[0.7em] ring-1 ring-line">
              <div className="text-[0.8em] text-slate">{k.label}</div>
              <div className={cn('mt-[0.2em] font-title text-[1.2em] font-semibold', k.tone)}>{k.value}</div>
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-[1.7fr_1fr] gap-[0.7em]">
          <div className="flex flex-col rounded-[0.5em] bg-card p-[0.8em] ring-1 ring-line">
            <div className="text-[0.85em] font-medium text-ink">Evolução financeira</div>
            <svg viewBox="0 0 200 92" className="mt-[0.4em] w-full flex-1" preserveAspectRatio="none">
              {[20, 45, 70].map((y) => (
                <line key={y} x1="0" x2="200" y1={y} y2={y} stroke="#dfe4ec" strokeWidth="0.6" />
              ))}
              <polyline points={toPoints(trend.map((p) => p.despesa))} fill="none" stroke="#dc7890" strokeWidth="1.6" />
              <polyline points={toPoints(trend.map((p) => p.receita))} fill="none" stroke="#12978a" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex flex-col rounded-[0.5em] bg-card p-[0.8em] ring-1 ring-line">
            <div className="text-[0.85em] font-medium text-ink">Despesas por categoria</div>
            <div className="mt-[0.6em] flex flex-1 flex-col justify-center gap-[0.55em]">
              {spending.map((item) => (
                <div key={item.name}>
                  <div className="text-[0.75em] text-slate">{item.name}</div>
                  <div className="mt-[0.15em] h-[0.5em] rounded-full bg-paper">
                    <div className="h-full rounded-full bg-ink-2" style={{ width: `${(item.value / topSpending) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ landing */

function Landing() {
  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] bg-[#f3f7f6]">
      <div className="flex flex-col px-[2em] py-[1.4em]">
        <span className="font-title text-[1.15em] font-semibold text-ink">Nova Serviços</span>
        <div className="mt-auto mb-auto">
          <div className="font-title text-[2.3em] leading-[1.05] font-semibold text-ink">
            Manutenção residencial sem dor de cabeça
          </div>
          <p className="mt-[0.7em] max-w-[24em] text-slate">
            Elétrica, hidráulica, pintura e montagem com horário marcado e orçamento antes do serviço.
          </p>
          <div className="mt-[1.1em] flex gap-[0.6em]">
            <span className="rounded-full bg-[#0b5563] px-[1.1em] py-[0.45em] font-semibold text-white">
              Pedir orçamento
            </span>
            <span className="rounded-full px-[1.1em] py-[0.45em] text-ink ring-1 ring-ink/25">Ver serviços</span>
          </div>
        </div>
        <div className="flex gap-[1.2em] text-[0.85em] text-slate">
          <span>Elétrica</span>
          <span>Hidráulica</span>
          <span>Pintura</span>
          <span>Montagem</span>
        </div>
      </div>
      <div className="flex items-center bg-[#e2eff1] px-[1.6em]">
        <div className="w-full rounded-[0.8em] bg-card p-[1.1em] shadow-[0_0.6em_1.6em_-0.6em_rgba(13,26,48,0.25)]">
          <div className="font-semibold text-ink">Pedir orçamento</div>
          {['Seu nome', 'WhatsApp', 'Tipo de serviço'].map((field) => (
            <div key={field} className="mt-[0.6em]">
              <div className="text-[0.8em] text-slate">{field}</div>
              <div className="mt-[0.2em] h-[1.8em] rounded-[0.4em] bg-paper ring-1 ring-line" />
            </div>
          ))}
          <div className="mt-[0.9em] rounded-full bg-[#0b5563] py-[0.45em] text-center font-semibold text-white">
            Preparar pedido
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- loja */

function ProductArt({ type }: { type: 'tenis' | 'bola' | 'camisa' | 'garrafa' }) {
  const art: Record<typeof type, ReactNode> = {
    tenis: (
      <path d="M14 44 C 22 44 30 36 34 30 L 44 34 C 52 38 66 40 84 42 C 92 43 96 48 94 54 L 14 54 Z" fill="#0d1a30" />
    ),
    bola: (
      <g>
        <circle cx="54" cy="38" r="20" fill="#ffffff" stroke="#0d1a30" strokeWidth="2.5" />
        <polygon points="54,30 61,35 58,43 50,43 47,35" fill="#0d1a30" />
      </g>
    ),
    camisa: (
      <path d="M38 18 L 48 14 C 50 19 58 19 60 14 L 70 18 L 80 28 L 72 34 L 70 30 L 70 60 L 38 60 L 38 30 L 36 34 L 28 28 Z" fill="#22c3b0" />
    ),
    garrafa: (
      <g>
        <rect x="47" y="12" width="14" height="7" rx="2" fill="#0d1a30" />
        <rect x="42" y="19" width="24" height="42" rx="7" fill="#33476b" />
        <rect x="42" y="32" width="24" height="10" fill="#22c3b0" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 108 72" className="block h-full w-full">
      <rect width="108" height="72" fill="#eef1f5" />
      {art[type]}
    </svg>
  );
}

function Loja() {
  // Quatro produtos reais do catálogo da demonstração (nomes, preços e tamanhos).
  const products = ['AR-01', 'AR-06', 'AR-03', 'AR-07'].map((id) => {
    const p = storeProducts.find((x) => x.id === id)!;
    return { name: p.name, price: formatCents(p.price), type: p.art as 'tenis' | 'bola' | 'camisa' | 'garrafa', sizes: p.sizes.length ? ['P', 'M', 'G'].filter((s) => p.sizes.includes(s)) : [] };
  });
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-line px-[1.6em] py-[0.9em]">
        <span className="font-title text-[1.25em] font-bold tracking-tight text-ink">Arena Store</span>
        <div className="flex items-center gap-[1.2em] text-[0.9em] text-slate">
          <span>Calçados</span>
          <span>Roupas</span>
          <span>Acessórios</span>
          <span className="rounded-full bg-ink px-[0.9em] py-[0.15em] text-white">Carrinho</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-[1.6em] py-[1.1em]">
        <div className="flex items-baseline justify-between">
          <span className="font-title text-[1.4em] font-semibold text-ink">Todos os produtos</span>
          <span className="text-[0.85em] text-slate">{storeProducts.length} produtos</span>
        </div>
        <div className="mt-[0.9em] grid flex-1 grid-cols-4 gap-[0.9em]">
          {products.map((p) => (
            <div key={p.name} className="flex flex-col">
              <div className="aspect-[3/2] overflow-hidden rounded-[0.5em]">
                <ProductArt type={p.type} />
              </div>
              <div className="mt-[0.5em] text-ink">{p.name}</div>
              <div className="font-semibold text-ink">{p.price}</div>
              <div className="mt-[0.4em] flex min-h-[1.8em] gap-[0.3em] text-[0.75em]">
                {p.sizes.map((s, i) => (
                  <span
                    key={s}
                    className={cn(
                      'grid h-[1.8em] w-[1.8em] place-items-center rounded-[0.3em]',
                      i === 1 ? 'bg-ink text-white' : 'ring-1 ring-line',
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- orçamento */

/** Calculado com as mesmas regras da demonstração OrçaFácil. */
const ORCA_SAMPLE: QuoteLine[] = [
  { uid: 'a', itemId: 'banner', qty: 250, choices: { material: 'premium', acabamento: 'simples', prazo: 'urgente' } },
  { uid: 'b', itemId: 'cartao', qty: 200, choices: { material: 'padrao', acabamento: 'nenhum', prazo: 'normal' } },
];

function Orcamento() {
  const t = quoteTotals(ORCA_SAMPLE, SAMPLE_CATALOG, 1000);
  const first = calcLine(ORCA_SAMPLE[0], SAMPLE_CATALOG)!;
  return (
    <div className="grid h-full grid-cols-[1.1fr_1fr] gap-[1em] bg-[#f4f5f8] p-[1.4em]">
      <div className="flex flex-col rounded-[0.6em] bg-card p-[1em] ring-1 ring-line">
        <span className="font-title text-[1.15em] font-bold text-ink">OrçaFácil</span>
        <span className="mt-[0.6em] text-[0.8em] text-slate">Produto ou serviço</span>
        <span className="mt-[0.2em] rounded-[0.4em] px-[0.6em] py-[0.35em] text-ink ring-1 ring-line">{first.item.name}</span>
        {(['Material', 'Acabamento', 'Prazo'] as const).map((label, i) => {
          const chosen = [first.options.material, first.options.acabamento, first.options.prazo][i];
          return (
            <div key={label} className="mt-[0.6em]">
              <span className="text-[0.8em] text-slate">{label}</span>
              <div className="mt-[0.2em] flex gap-[0.4em] text-[0.85em]">
                <span className="rounded-[0.4em] bg-[#eef1fb] px-[0.6em] py-[0.2em] font-semibold text-[#2844c7] ring-1 ring-[#2844c7]">{chosen.label}</span>
              </div>
            </div>
          );
        })}
        <span className="mt-auto rounded-full bg-[#2844c7] py-[0.4em] text-center font-semibold text-white">Adicionar ao orçamento</span>
      </div>
      <div className="flex flex-col rounded-[0.6em] bg-card p-[1em] ring-1 ring-line">
        <span className="font-semibold text-ink">Proposta</span>
        {t.rows.map((r) => (
          <div key={r.item.id} className="mt-[0.6em] flex justify-between gap-[0.6em] border-b border-line pb-[0.4em] text-[0.85em]">
            <span className="text-ink">{r.item.name.split(' (')[0]} · {formatQty(r.qty, r.item.unit)}</span>
            <span className="font-code text-ink">{money(r.lineTotal)}</span>
          </div>
        ))}
        <div className="mt-auto space-y-[0.2em] text-[0.85em]">
          <div className="flex justify-between text-slate"><span>Subtotal</span><span className="font-code">{money(t.subtotal)}</span></div>
          <div className="flex justify-between text-slate"><span>Desconto 10%</span><span className="font-code">−{money(t.discount)}</span></div>
          <div className="flex justify-between text-[1.2em] font-bold text-ink"><span>Total</span><span className="font-code">{money(t.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
