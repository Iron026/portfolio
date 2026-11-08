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

/** Idioma de exibição. Identificadores, chaves salvas e cálculos não mudam com o idioma. */
export type OrcaLocale = 'pt' | 'en';
const INTL: Record<OrcaLocale, string> = { pt: 'pt-BR', en: 'en-US' };

/* ------------------------------------------------------------ unidades */

export type UnitId = 'pacote' | 'unidade' | 'm2';
export const UNITS: Record<UnitId, { label: string; plural: string; decimals: boolean; max: number }> = {
  pacote: { label: 'pacote', plural: 'pacotes', decimals: false, max: 1000 },
  unidade: { label: 'unidade', plural: 'unidades', decimals: false, max: 10000 },
  m2: { label: 'm²', plural: 'm²', decimals: true, max: 500 },
};
const UNITS_EN: Record<UnitId, { label: string; plural: string }> = {
  pacote: { label: 'pack', plural: 'packs' },
  unidade: { label: 'unit', plural: 'units' },
  m2: { label: 'm²', plural: 'm²' },
};
/** Unidade com nomes no idioma pedido. */
export function unitText(unit: UnitId, locale: OrcaLocale = 'pt') {
  return locale === 'en' ? { ...UNITS[unit], ...UNITS_EN[unit] } : UNITS[unit];
}

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
const SAMPLE_NAMES_EN: Record<string, string> = {
  cartao: 'Business cards (pack of 500)',
  panfleto: 'A5 flyers (pack of 1,000)',
  banner: 'Vinyl banner',
  adesivo: 'Vinyl sticker',
  cardapio: 'A4 menu',
  placa: '3 mm PVC sign',
};
/**
 * Nome do item para exibição. Itens do exemplo ainda com o nome original
 * aparecem traduzidos; nomes cadastrados ou editados pela pessoa ficam como ela digitou.
 */
export function itemName(item: CatalogItem, locale: OrcaLocale = 'pt') {
  if (locale === 'en' && SAMPLE_NAMES_EN[item.id] && SAMPLE_CATALOG.some((s) => s.id === item.id && s.name === item.name)) return SAMPLE_NAMES_EN[item.id];
  return item.name;
}

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

const VARIABLES_EN: Record<VariableId, { label: string; options: Record<string, [label: string, hint: string]> }> = {
  material: {
    label: 'Material',
    options: {
      padrao: ['Standard', 'Regular paper or vinyl'],
      ecologico: ['Eco-friendly', 'Recycled or certified (×1.15)'],
      premium: ['Premium', 'Heavier stock and brighter color (×1.30)'],
    },
  },
  acabamento: {
    label: 'Finishing',
    options: {
      nenhum: ['No finishing', 'Straight cut'],
      simples: ['Basic', 'Matte lamination or grommets (+10%)'],
      especial: ['Special', 'Spot varnish or custom die cut (+25%)'],
    },
  },
  prazo: {
    label: 'Turnaround',
    options: {
      normal: ['Standard', '5 business days'],
      rapido: ['Fast', '2 business days (+15%)'],
      urgente: ['Rush', '24 hours (+35%)'],
    },
  },
};

/** Opção com rótulo e dica no idioma pedido (o valor em pontos-base é o mesmo). */
export function optionText(variable: VariableId, o: Option, locale: OrcaLocale = 'pt'): Option {
  const en = locale === 'en' ? VARIABLES_EN[variable].options[o.id] : undefined;
  return en ? { ...o, label: en[0], hint: en[1] } : o;
}
export function variableLabel(variable: VariableId, locale: OrcaLocale = 'pt') {
  return locale === 'en' ? VARIABLES_EN[variable].label : VARIABLES[variable].label;
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
 * Em inglês: "2.5", "1,250", "1,250.75", "10".
 * Aceita no máximo 2 casas decimais. Devolve centésimos (2,5 → 250) ou null.
 */
export function parseDecimal(raw: string, locale: OrcaLocale = 'pt'): number | null {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return null;
  if (locale === 'en') {
    if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(s)) return null;
    const value = Math.round(Number(s.replace(/,/g, '')) * 100);
    return Number.isFinite(value) ? value : null;
  }
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$|^\d+(\.\d{1,2})$/.test(s)) return null;
  let normalized: string;
  if (s.includes(',')) normalized = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d+\.\d{1,2}$/.test(s)) normalized = s; // "2.5" digitado com ponto
  else normalized = s.replace(/\./g, '');
  const value = Math.round(Number(normalized) * 100);
  return Number.isFinite(value) ? value : null;
}

const MESSAGES = {
  pt: {
    qtyEmpty: 'Informe a quantidade.',
    qtyNegative: 'A quantidade não pode ser negativa.',
    qtyDecimal: 'Use um número com até 2 casas decimais, por exemplo 2,5.',
    qtyInteger: 'Use um número inteiro, por exemplo 3.',
    qtyWhole: (unit: string) => `Este item é vendido por ${unit}: use um número inteiro.`,
    qtyZero: 'A quantidade precisa ser maior que zero.',
    qtyMax: (max: string, plural: string) => `Quantidade máxima por linha: ${max} ${plural}.`,
    discountNegative: 'O desconto não pode ser negativo.',
    discountFormat: 'Use um percentual com até 2 casas decimais, por exemplo 7,5.',
    discountMax: 'O desconto máximo é 100%.',
    discountHigh: 'Desconto acima de 30%: confira se está correto antes de enviar.',
    priceEmpty: 'Informe o preço base.',
    priceFormat: 'Use o formato 89,90.',
    priceZero: 'O preço precisa ser maior que zero.',
    priceMax: 'O preço máximo é R$ 100.000,00.',
    nameShort: 'O nome precisa ter pelo menos 2 caracteres.',
    nameLong: 'Use no máximo 60 caracteres.',
    nameTaken: 'Já existe um item com este nome.',
  },
  en: {
    qtyEmpty: 'Enter the quantity.',
    qtyNegative: 'The quantity cannot be negative.',
    qtyDecimal: 'Use a number with up to 2 decimal places, for example 2.5.',
    qtyInteger: 'Use a whole number, for example 3.',
    qtyWhole: (unit: string) => `This item is sold by the ${unit}: use a whole number.`,
    qtyZero: 'The quantity must be greater than zero.',
    qtyMax: (max: string, plural: string) => `Maximum quantity per line: ${max} ${plural}.`,
    discountNegative: 'The discount cannot be negative.',
    discountFormat: 'Use a percentage with up to 2 decimal places, for example 7.5.',
    discountMax: 'The maximum discount is 100%.',
    discountHigh: 'Discount above 30%: check that it is correct before sending.',
    priceEmpty: 'Enter the base price.',
    priceFormat: 'Use the format 89.90.',
    priceZero: 'The price must be greater than zero.',
    priceMax: 'The maximum price is R$100,000.00.',
    nameShort: 'The name must have at least 2 characters.',
    nameLong: 'Use at most 60 characters.',
    nameTaken: 'An item with this name already exists.',
  },
};

export function validateQty(raw: string, unit: UnitId, locale: OrcaLocale = 'pt'): { qty?: number; error?: string } {
  const u = unitText(unit, locale);
  const m = MESSAGES[locale];
  if (!raw.trim()) return { error: m.qtyEmpty };
  if (/^-/.test(raw.trim())) return { error: m.qtyNegative };
  const qty = parseDecimal(raw, locale);
  if (qty === null) return { error: u.decimals ? m.qtyDecimal : m.qtyInteger };
  if (!u.decimals && qty % 100 !== 0) return { error: m.qtyWhole(u.label) };
  if (qty <= 0) return { error: m.qtyZero };
  if (qty > u.max * 100) return { error: m.qtyMax(u.max.toLocaleString(INTL[locale]), u.plural) };
  return { qty };
}

export function validateDiscount(raw: string, locale: OrcaLocale = 'pt'): { bp?: number; error?: string; warning?: string } {
  const m = MESSAGES[locale];
  if (!raw.trim()) return { bp: 0 };
  if (/^-/.test(raw.trim())) return { error: m.discountNegative };
  const bp = parseDecimal(raw.replace('%', ''), locale);
  if (bp === null) return { error: m.discountFormat };
  if (bp > MAX_DISCOUNT_BP) return { error: m.discountMax };
  if (bp > HIGH_DISCOUNT_BP) return { bp, warning: m.discountHigh };
  return { bp };
}

export function validatePrice(raw: string, locale: OrcaLocale = 'pt'): { cents?: number; error?: string } {
  const m = MESSAGES[locale];
  const v = parseDecimal(raw.replace(/^R\$\s*/i, ''), locale);
  if (!raw.trim()) return { error: m.priceEmpty };
  if (v === null) return { error: m.priceFormat };
  if (v <= 0) return { error: m.priceZero };
  if (v > 100_000_00) return { error: m.priceMax };
  return { cents: v };
}

export function validateItemName(raw: string, catalog: CatalogItem[], editingId?: string, locale: OrcaLocale = 'pt'): string | undefined {
  const m = MESSAGES[locale];
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < 2) return m.nameShort;
  if (name.length > 60) return m.nameLong;
  const key = name.toLocaleLowerCase(INTL[locale]);
  // Compara com o nome salvo e com o nome exibido (itens de exemplo aparecem traduzidos em inglês).
  if (catalog.some((i) => i.id !== editingId && [i.name, itemName(i, locale)].some((n) => n.toLocaleLowerCase(INTL[locale]) === key))) return m.nameTaken;
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

const BRL: Record<OrcaLocale, Intl.NumberFormat> = {
  pt: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
  en: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL' }),
};
/** Valores sempre em reais; só a escrita do número segue o idioma (R$ 1.234,56 / R$1,234.56). */
export const money = (cents: number, locale: OrcaLocale = 'pt') => BRL[locale].format(cents / 100);

export function formatQty(qty: number, unit: UnitId, locale: OrcaLocale = 'pt') {
  const u = unitText(unit, locale);
  const n = (qty / 100).toLocaleString(INTL[locale], { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return unit === 'm2' ? `${n} m²` : `${n} ${qty === 100 ? u.label : u.plural}`;
}

export const formatPercent = (bp: number, locale: OrcaLocale = 'pt') => `${(bp / 100).toLocaleString(INTL[locale], { maximumFractionDigits: 2 })}%`;
export const formatMultiplier = (bp: number, locale: OrcaLocale = 'pt') =>
  `×${(bp / 10000).toLocaleString(INTL[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/** Valor em centavos no formato do campo de preço (89,90 / 89.90). */
export const centsToInput = (cents: number, locale: OrcaLocale = 'pt') => {
  const s = (cents / 100).toFixed(2);
  return locale === 'en' ? s : s.replace('.', ',');
};
/** Data no formato do idioma. */
export const formatDate = (d: Date, locale: OrcaLocale = 'pt') => d.toLocaleDateString(INTL[locale]);

/** Especificação curta de uma linha: "2 pacotes · Premium · Simples · Prazo rápido". */
export function specLine(r: Breakdown, locale: OrcaLocale = 'pt') {
  const o = (v: VariableId) => optionText(v, r.options[v], locale).label;
  const rush = locale === 'en' ? `${o('prazo')} turnaround` : `Prazo ${o('prazo').toLowerCase()}`;
  return `${formatQty(r.qty, r.item.unit, locale)} · ${o('material')} · ${o('acabamento')} · ${rush}`;
}

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

const SUMMARY = {
  pt: {
    proposal: 'Proposta',
    date: 'Data',
    validity: 'Validade',
    days: (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
    client: 'Cliente',
    discount: 'Desconto',
    notes: 'Observações',
  },
  en: {
    proposal: 'Proposal',
    date: 'Date',
    validity: 'Valid for',
    days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    client: 'Client',
    discount: 'Discount',
    notes: 'Notes',
  },
};

/** Resumo em texto puro para copiar e colar (WhatsApp, e-mail), no idioma da página. */
export function summaryText(t: ReturnType<typeof quoteTotals>, info: ProposalInfo, locale: OrcaLocale = 'pt') {
  const s = SUMMARY[locale];
  const $ = (c: number) => money(c, locale);
  // `null` marca linhas opcionais ausentes; '' é uma linha em branco proposital.
  const lines: Array<string | null> = [
    `${s.proposal} ${info.number}: ${BUSINESS.name}`,
    `${s.date}: ${formatDate(info.date, locale)} · ${s.validity}: ${s.days(info.validityDays)}`,
    info.client.trim() ? `${s.client}: ${info.client.trim()}` : null,
    '',
    ...t.rows.map((r, i) => `${i + 1}. ${itemName(r.item, locale)}: ${specLine(r, locale)}: ${$(r.lineTotal)}`),
    '',
    `Subtotal: ${$(t.subtotal)}`,
    t.discount ? `${s.discount} (${formatPercent(t.discountBp, locale)}): −${$(t.discount)}` : null,
    `Total: ${$(t.total)}`,
    ...(info.notes.trim() ? ['', `${s.notes}: ${info.notes.trim()}`] : []),
  ];
  return lines.filter((l): l is string => l !== null).join('\n');
}
