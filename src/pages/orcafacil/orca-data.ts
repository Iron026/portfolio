/**
 * OrçaFácil — catálogo, variáveis de cálculo e regras do orçamento.
 * Configurado para uma gráfica rápida fictícia ("Ponto Gráfico").
 *
 * Todo valor monetário está em CENTAVOS (inteiros). Percentuais e
 * multiplicadores estão em pontos-base (1% = 100; ×1,30 = 13000).
 * Arredondamento: meio centavo para cima, a cada etapa mostrada ao cliente.
 * Funções puras (sem React e sem localStorage) para serem testadas isoladamente.
 */

export const BUSINESS = { name: 'Ponto Gráfico', city: 'Nova Aurora' };

/* ------------------------------------------------------------ unidades */

export type UnitId = 'pacote' | 'unidade' | 'm2';
export const UNITS: Record<UnitId, { label: string; plural: string; decimals: boolean; max: number }> = {
  pacote: { label: 'pacote', plural: 'pacotes', decimals: false, max: 1000 },
  unidade: { label: 'unidade', plural: 'unidades', decimals: false, max: 10000 },
  m2: { label: 'm²', plural: 'm²', decimals: true, max: 500 },
};

/* ------------------------------------------------------------ catálogo */

export interface CatalogItem {
  id: string;
  name: string;
  unit: UnitId;
  /** Preço base por unidade, em centavos. */
  price: number;
}

export const MAX_ITEMS = 10;

export const SAMPLE_CATALOG: CatalogItem[] = [
  { id: 'cartao', name: 'Cartão de visita (pacote com 500)', unit: 'pacote', price: 8900 },
  { id: 'panfleto', name: 'Panfleto A5 (pacote com 1.000)', unit: 'pacote', price: 15900 },
  { id: 'banner', name: 'Banner em lona', unit: 'm2', price: 6500 },
  { id: 'adesivo', name: 'Adesivo em vinil', unit: 'm2', price: 7200 },
  { id: 'cardapio', name: 'Cardápio A4', unit: 'unidade', price: 650 },
  { id: 'placa', name: 'Placa em PVC 3 mm', unit: 'm2', price: 11800 },
];

/* ------------------------------------------------------------ variáveis */

export interface Option {
  id: string;
  label: string;
  hint: string;
  /** Pontos-base: multiplicador (material) ou acréscimo percentual (acabamento e prazo). */
  bp: number;
}

/**
 * As três variáveis do nicho:
 * - Material: multiplica o preço base da unidade.
 * - Acabamento: acréscimo percentual sobre a unidade já com material.
 * - Prazo: acréscimo percentual sobre o total da linha.
 */
export const VARIABLES = {
  material: {
    label: 'Material',
    options: [
      { id: 'padrao', label: 'Padrão', hint: 'Papel ou lona de linha', bp: 10000 },
      { id: 'ecologico', label: 'Ecológico', hint: 'Reciclado ou certificado (×1,15)', bp: 11500 },
      { id: 'premium', label: 'Premium', hint: 'Gramatura maior e cor mais viva (×1,30)', bp: 13000 },
    ],
  },
  acabamento: {
    label: 'Acabamento',
    options: [
      { id: 'nenhum', label: 'Sem acabamento', hint: 'Corte reto', bp: 0 },
      { id: 'simples', label: 'Simples', hint: 'Laminação fosca ou ilhós (+10%)', bp: 1000 },
      { id: 'especial', label: 'Especial', hint: 'Verniz localizado ou corte especial (+25%)', bp: 2500 },
    ],
  },
  prazo: {
    label: 'Prazo',
    options: [
      { id: 'normal', label: 'Normal', hint: '5 dias úteis', bp: 0 },
      { id: 'rapido', label: 'Rápido', hint: '2 dias úteis (+15%)', bp: 1500 },
      { id: 'urgente', label: 'Urgente', hint: '24 horas (+35%)', bp: 3500 },
    ],
  },
} satisfies Record<string, { label: string; options: Option[] }>;

export type VariableId = keyof typeof VARIABLES;
export const VARIABLE_IDS = Object.keys(VARIABLES) as VariableId[];
export type Choices = Record<VariableId, string>;
export const DEFAULT_CHOICES: Choices = { material: 'padrao', acabamento: 'nenhum', prazo: 'normal' };

export function option(variable: VariableId, id: string): Option | undefined {
  return (VARIABLES[variable].options as Option[]).find((o) => o.id === id);
}

/* ------------------------------------------------------------ aritmética */

/** Arredonda meio centavo para cima (valores do orçamento nunca são negativos). */
const roundHalfUp = (x: number) => Math.floor(x + 0.5 + 1e-9);
/**
 * Aplica pontos-base a um valor em centavos, com arredondamento.
 * Divide o valor em duas partes para que nenhuma multiplicação passe do limite
 * de precisão do JavaScript (2^53), mesmo em valores muito altos.
 */
export function applyBp(cents: number, bp: number) {
  const high = Math.floor(cents / 10000);
  const low = cents - high * 10000;
  return high * bp + roundHalfUp((low * bp) / 10000);
}

/* ------------------------------------------------------------ linhas */

export interface QuoteLine {
  uid: string;
  itemId: string;
  /** Quantidade em centésimos (2,5 m² = 250; 3 pacotes = 300). */
  qty: number;
  choices: Choices;
}

export interface Breakdown {
  item: CatalogItem;
  qty: number;
  basePrice: number;
  materialUnit: number;     // preço da unidade com material
  finishingAmount: number;  // acréscimo do acabamento por unidade
  unitPrice: number;        // unidade final
  goods: number;            // unidade final × quantidade
  rushAmount: number;       // acréscimo do prazo
  lineTotal: number;
  options: Record<VariableId, Option>;
}

export function calcLine(line: QuoteLine, catalog: CatalogItem[]): Breakdown | null {
  const item = catalog.find((i) => i.id === line.itemId);
  const options = {} as Record<VariableId, Option>;
  for (const v of VARIABLE_IDS) {
    const o = option(v, line.choices[v]);
    if (!o) return null;
    options[v] = o;
  }
  if (!item || !(line.qty > 0)) return null;
  const materialUnit = applyBp(item.price, options.material.bp);
  const finishingAmount = applyBp(materialUnit, options.acabamento.bp);
  const unitPrice = materialUnit + finishingAmount;
  const goods = roundHalfUp((unitPrice * line.qty) / 100);
  const rushAmount = applyBp(goods, options.prazo.bp);
  return { item, qty: line.qty, basePrice: item.price, materialUnit, finishingAmount, unitPrice, goods, rushAmount, lineTotal: goods + rushAmount, options };
}

export const MAX_DISCOUNT_BP = 10000; // 100%
export const HIGH_DISCOUNT_BP = 3000; // acima de 30%, a interface pede conferência

export function quoteTotals(lines: QuoteLine[], catalog: CatalogItem[], discountBp: number) {
  const rows = lines.map((l) => calcLine(l, catalog)).filter((b): b is Breakdown => b !== null);
  const subtotal = rows.reduce((a, r) => a + r.lineTotal, 0);
  const bp = Math.min(Math.max(0, Math.floor(discountBp) || 0), MAX_DISCOUNT_BP);
  const discount = applyBp(subtotal, bp);
  return { rows, subtotal, discountBp: bp, discount, total: subtotal - discount };
}

/* ------------------------------------------------------------ entrada de dados */

/**
 * Lê números no formato brasileiro: "2,5", "1.250", "1.250,75", "10".
 * Aceita no máximo 2 casas decimais. Devolve centésimos (2,5 → 250) ou null.
 */
export function parseDecimal(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$|^\d+(\.\d{1,2})$/.test(s)) return null;
  let normalized: string;
  if (s.includes(',')) normalized = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d+\.\d{1,2}$/.test(s)) normalized = s; // "2.5" digitado com ponto
  else normalized = s.replace(/\./g, '');
  const value = Math.round(Number(normalized) * 100);
  return Number.isFinite(value) ? value : null;
}

export function validateQty(raw: string, unit: UnitId): { qty?: number; error?: string } {
  const u = UNITS[unit];
  if (!raw.trim()) return { error: 'Informe a quantidade.' };
  if (/^-/.test(raw.trim())) return { error: 'A quantidade não pode ser negativa.' };
  const qty = parseDecimal(raw);
  if (qty === null) return { error: u.decimals ? 'Use um número com até 2 casas decimais, por exemplo 2,5.' : 'Use um número inteiro, por exemplo 3.' };
  if (!u.decimals && qty % 100 !== 0) return { error: `Este item é vendido por ${u.label}: use um número inteiro.` };
  if (qty <= 0) return { error: 'A quantidade precisa ser maior que zero.' };
  if (qty > u.max * 100) return { error: `Quantidade máxima por linha: ${u.max.toLocaleString('pt-BR')} ${u.plural}.` };
  return { qty };
}

export function validateDiscount(raw: string): { bp?: number; error?: string; warning?: string } {
  if (!raw.trim()) return { bp: 0 };
  if (/^-/.test(raw.trim())) return { error: 'O desconto não pode ser negativo.' };
  const bp = parseDecimal(raw.replace('%', ''));
  if (bp === null) return { error: 'Use um percentual com até 2 casas decimais, por exemplo 7,5.' };
  if (bp > MAX_DISCOUNT_BP) return { error: 'O desconto máximo é 100%.' };
  if (bp > HIGH_DISCOUNT_BP) return { bp, warning: 'Desconto acima de 30%: confira se está correto antes de enviar.' };
  return { bp };
}

export function validatePrice(raw: string): { cents?: number; error?: string } {
  const v = parseDecimal(raw.replace(/^R\$\s*/i, ''));
  if (!raw.trim()) return { error: 'Informe o preço base.' };
  if (v === null) return { error: 'Use o formato 89,90.' };
  if (v <= 0) return { error: 'O preço precisa ser maior que zero.' };
  if (v > 100_000_00) return { error: 'O preço máximo é R$ 100.000,00.' };
  return { cents: v };
}

export function validateItemName(raw: string, catalog: CatalogItem[], editingId?: string): string | undefined {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < 2) return 'O nome precisa ter pelo menos 2 caracteres.';
  if (name.length > 60) return 'Use no máximo 60 caracteres.';
  if (catalog.some((i) => i.id !== editingId && i.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) return 'Já existe um item com este nome.';
  return undefined;
}

/* ------------------------------------------------------------ catálogo salvo */

export const CATALOG_KEY = 'orcafacil:catalogo:v1';

/** Lê o catálogo salvo descartando itens inválidos; sem dados válidos, usa o exemplo. */
export function restoreCatalog(raw: string | null): { catalog: CatalogItem[]; restored: boolean; corrupted: boolean } {
  if (raw === null || raw === '') return { catalog: SAMPLE_CATALOG, restored: false, corrupted: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { catalog: SAMPLE_CATALOG, restored: false, corrupted: true };
  }
  if (!Array.isArray(data)) return { catalog: SAMPLE_CATALOG, restored: false, corrupted: true };
  const seen = new Set<string>();
  const catalog: CatalogItem[] = [];
  for (const it of data) {
    if (catalog.length >= MAX_ITEMS || !it || typeof it !== 'object') continue;
    const { id, name, unit, price } = it as Record<string, unknown>;
    if (typeof id !== 'string' || !id || seen.has(id)) continue;
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 60) continue;
    if (typeof unit !== 'string' || !(unit in UNITS)) continue;
    if (typeof price !== 'number' || !Number.isInteger(price) || price <= 0 || price > 100_000_00) continue;
    seen.add(id);
    catalog.push({ id, name: name.trim(), unit: unit as UnitId, price });
  }
  return catalog.length ? { catalog, restored: true, corrupted: false } : { catalog: SAMPLE_CATALOG, restored: false, corrupted: true };
}

/* ------------------------------------------------------------ formatação */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const money = (cents: number) => brl.format(cents / 100);

export function formatQty(qty: number, unit: UnitId) {
  const u = UNITS[unit];
  const n = (qty / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return unit === 'm2' ? `${n} m²` : `${n} ${qty === 100 ? u.label : u.plural}`;
}

export const formatPercent = (bp: number) => `${(bp / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
export const formatMultiplier = (bp: number) => `×${(bp / 10000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function proposalNumber(now: Date = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `ORC-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}`;
}

export interface ProposalInfo {
  number: string;
  client: string;
  validityDays: number;
  notes: string;
  date: Date;
}

/** Resumo em texto puro para copiar e colar (WhatsApp, e-mail). */
export function summaryText(t: ReturnType<typeof quoteTotals>, info: ProposalInfo) {
  const date = info.date.toLocaleDateString('pt-BR');
  // `null` marca linhas opcionais ausentes; '' é uma linha em branco proposital.
  const lines: Array<string | null> = [
    `Proposta ${info.number}: ${BUSINESS.name}`,
    `Data: ${date} · Validade: ${info.validityDays} ${info.validityDays === 1 ? 'dia' : 'dias'}`,
    info.client.trim() ? `Cliente: ${info.client.trim()}` : null,
    '',
    ...t.rows.map((r, i) =>
      `${i + 1}. ${r.item.name}: ${formatQty(r.qty, r.item.unit)} · ${r.options.material.label} · ${r.options.acabamento.label} · Prazo ${r.options.prazo.label.toLowerCase()}: ${money(r.lineTotal)}`,
    ),
    '',
    `Subtotal: ${money(t.subtotal)}`,
    t.discount ? `Desconto (${formatPercent(t.discountBp)}): −${money(t.discount)}` : null,
    `Total: ${money(t.total)}`,
    ...(info.notes.trim() ? ['', `Observações: ${info.notes.trim()}`] : []),
  ];
  return lines.filter((l): l is string => l !== null).join('\n');
}
