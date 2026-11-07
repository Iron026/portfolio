/**
 * Arena Store — catálogo fictício, estoque ilustrativo e regras do carrinho.
 * Valores em CENTAVOS (inteiros) para que somas e totais nunca tenham erro de arredondamento.
 * Funções puras (sem React e sem localStorage) para serem testadas isoladamente.
 */

export type Category = 'calcados' | 'roupas' | 'acessorios';
export type ArtKind = 'tenis' | 'chuteira' | 'camisa' | 'bermuda' | 'jaqueta' | 'bola' | 'garrafa' | 'mochila';

export const CATEGORY_LABELS: Record<Category, string> = {
  calcados: 'Calçados',
  roupas: 'Roupas',
  acessorios: 'Acessórios',
};
export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Preço em centavos. É a ÚNICA fonte de preço: o carrinho salvo nunca guarda valores. */
  price: number;
  description: string;
  highlights: string[];
  art: ArtKind;
  color: string;
  /**
   * Estoque ilustrativo. Com tamanhos: unidades por tamanho.
   * Sem tamanhos (`sizes` vazio): unidades em `stock`.
   */
  sizes: string[];
  stockBySize: Record<string, number>;
  stock: number;
}

export const products: Product[] = [
  {
    id: 'AR-01', name: 'Tênis Corrida Leve', category: 'calcados', price: 34990, art: 'tenis', color: '#15191c',
    description: 'Tênis de corrida com cabedal em malha respirável e entressola macia para treinos diários de até 10 km.',
    highlights: ['Cabedal em malha respirável', 'Entressola com amortecimento', 'Peso aproximado: 240 g (tam. 40)'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'], stockBySize: { '37': 2, '38': 5, '39': 8, '40': 6, '41': 3, '42': 0, '43': 1 }, stock: 0,
  },
  {
    id: 'AR-02', name: 'Chuteira Society Pro', category: 'calcados', price: 27990, art: 'chuteira', color: '#c2410c',
    description: 'Chuteira para grama sintética com travas baixas, boa tração e cano baixo para mais mobilidade.',
    highlights: ['Travas para grama sintética', 'Cano baixo', 'Palmilha removível'],
    sizes: ['38', '39', '40', '41', '42', '43'], stockBySize: { '38': 4, '39': 6, '40': 6, '41': 5, '42': 2, '43': 0 }, stock: 0,
  },
  {
    id: 'AR-03', name: 'Camisa Dry Treino', category: 'roupas', price: 8990, art: 'camisa', color: '#22a59a',
    description: 'Camisa de treino em tecido leve que seca rápido, com costuras planas para evitar atrito.',
    highlights: ['Tecido de secagem rápida', 'Costuras planas', 'Proteção UV 30'],
    sizes: ['P', 'M', 'G', 'GG'], stockBySize: { P: 7, M: 10, G: 9, GG: 4 }, stock: 0,
  },
  {
    id: 'AR-04', name: 'Bermuda Running', category: 'roupas', price: 7990, art: 'bermuda', color: '#33476b',
    description: 'Bermuda de corrida com bermuda interna, cós com cordão e bolso traseiro com zíper para chave.',
    highlights: ['Bermuda interna de compressão', 'Bolso com zíper', 'Detalhes refletivos'],
    sizes: ['P', 'M', 'G', 'GG'], stockBySize: { P: 3, M: 6, G: 5, GG: 2 }, stock: 0,
  },
  {
    id: 'AR-05', name: 'Jaqueta Corta-vento', category: 'roupas', price: 21990, art: 'jaqueta', color: '#ff6b2c',
    description: 'Jaqueta leve e resistente ao vento, com capuz ajustável. Dobra dentro do próprio bolso.',
    highlights: ['Resistente ao vento e a garoa', 'Capuz ajustável', 'Guarda no próprio bolso'],
    sizes: ['P', 'M', 'G', 'GG'], stockBySize: { P: 0, M: 3, G: 2, GG: 1 }, stock: 0,
  },
  {
    id: 'AR-06', name: 'Bola de Futebol Pro', category: 'acessorios', price: 12990, art: 'bola', color: '#15191c',
    description: 'Bola de campo tamanho oficial, com 32 gomos costurados e câmara de butil que mantém a pressão por mais tempo.',
    highlights: ['Tamanho e peso oficiais', '32 gomos costurados', 'Câmara de butil'],
    sizes: [], stockBySize: {}, stock: 12,
  },
  {
    id: 'AR-07', name: 'Garrafa Térmica 750 ml', category: 'acessorios', price: 6990, art: 'garrafa', color: '#33476b',
    description: 'Garrafa de aço inox com parede dupla: mantém a bebida gelada por até 12 horas. Tampa com alça.',
    highlights: ['Aço inox com parede dupla', 'Gelada por até 12 horas', 'Livre de BPA'],
    sizes: [], stockBySize: {}, stock: 4,
  },
  {
    id: 'AR-08', name: 'Mochila Esportiva 25 L', category: 'acessorios', price: 15990, art: 'mochila', color: '#22a59a',
    description: 'Mochila com compartimento para tênis, bolso para notebook de até 15 polegadas e alças acolchoadas.',
    highlights: ['Compartimento ventilado para tênis', 'Bolso para notebook', 'Alças acolchoadas'],
    sizes: [], stockBySize: {}, stock: 0,
  },
];

export function getProduct(id: string | undefined) {
  if (!id) return undefined;
  return products.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export const hasSizes = (p: Product) => p.sizes.length > 0;

/** Unidades em estoque da variação (tamanho, ou o produto todo quando não há tamanhos). */
export function stockOf(p: Product, size: string | null): number {
  if (hasSizes(p)) return size && p.sizes.includes(size) ? p.stockBySize[size] ?? 0 : 0;
  return size === null ? p.stock : 0;
}

export function totalStock(p: Product) {
  return hasSizes(p) ? p.sizes.reduce((a, s) => a + (p.stockBySize[s] ?? 0), 0) : p.stock;
}

export type StockLevel = 'esgotado' | 'ultimas' | 'disponivel';
export const LOW_STOCK = 3;
export function stockLevel(units: number): StockLevel {
  if (units <= 0) return 'esgotado';
  return units <= LOW_STOCK ? 'ultimas' : 'disponivel';
}

/* ------------------------------------------------------------ vitrine */

export type Sort = 'relevancia' | 'menor-preco' | 'maior-preco';
export const SORT_LABELS: Record<Sort, string> = {
  relevancia: 'Destaques',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
};

export interface CatalogFilters {
  q: string;
  category: Category | '';
  sort: Sort;
}
export const DEFAULT_FILTERS: CatalogFilters = { q: '', category: '', sort: 'relevancia' };

const normalize = (v: string) => v.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

export function filterCatalog(list: Product[], f: CatalogFilters): Product[] {
  const words = normalize(f.q).split(' ').filter(Boolean);
  const result = list.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (!words.length) return true;
    const text = normalize([p.name, p.id, CATEGORY_LABELS[p.category], p.description, ...p.highlights].join(' '));
    return words.every((w) => text.includes(w));
  });
  if (f.sort === 'menor-preco') return [...result].sort((a, b) => a.price - b.price);
  if (f.sort === 'maior-preco') return [...result].sort((a, b) => b.price - a.price);
  return result;
}

export function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const category = params.get('categoria');
  const sort = params.get('ordem');
  return {
    q: (params.get('q') ?? '').slice(0, 60),
    category: CATEGORIES.includes(category as Category) ? (category as Category) : '',
    sort: sort && sort in SORT_LABELS ? (sort as Sort) : 'relevancia',
  };
}

export function filtersToParams(f: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set('q', f.q);
  if (f.category) params.set('categoria', f.category);
  if (f.sort !== 'relevancia') params.set('ordem', f.sort);
  return params;
}

/* ------------------------------------------------------------ carrinho */

/** O que fica salvo: só produto, tamanho e quantidade. Nunca preço, nome ou dados pessoais. */
export interface CartLine {
  productId: string;
  size: string | null;
  qty: number;
}

export const lineKey = (l: Pick<CartLine, 'productId' | 'size'>) => `${l.productId}|${l.size ?? ''}`;

export function cartCount(lines: CartLine[]) {
  return lines.reduce((a, l) => a + l.qty, 0);
}

/** Quantas unidades daquela variação já estão no carrinho. */
export function qtyInCart(lines: CartLine[], productId: string, size: string | null) {
  return lines.find((l) => lineKey(l) === lineKey({ productId, size }))?.qty ?? 0;
}

export type AddResult = { lines: CartLine[]; added: number; reason?: 'sem-tamanho' | 'tamanho-invalido' | 'esgotado' | 'limite' };

/**
 * Adiciona respeitando o estoque da variação. Se pedir mais do que resta,
 * adiciona o que for possível e informa o motivo.
 */
export function addToCart(lines: CartLine[], productId: string, size: string | null, qty: number): AddResult {
  const p = getProduct(productId);
  if (!p) return { lines, added: 0, reason: 'tamanho-invalido' };
  if (hasSizes(p) && !size) return { lines, added: 0, reason: 'sem-tamanho' };
  if (hasSizes(p) ? !p.sizes.includes(size!) : size !== null) return { lines, added: 0, reason: 'tamanho-invalido' };
  const stock = stockOf(p, size);
  if (stock <= 0) return { lines, added: 0, reason: 'esgotado' };
  const current = qtyInCart(lines, p.id, size);
  const wanted = Math.max(1, Math.floor(qty));
  const added = Math.min(wanted, stock - current);
  if (added <= 0) return { lines, added: 0, reason: 'limite' };
  const key = lineKey({ productId: p.id, size });
  const exists = lines.some((l) => lineKey(l) === key);
  const next = exists
    ? lines.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + added } : l))
    : [...lines, { productId: p.id, size, qty: added }];
  return { lines: next, added, reason: added < wanted ? 'limite' : undefined };
}

/** Define a quantidade de uma linha (limitada entre 1 e o estoque). */
export function setLineQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  return lines.map((l) => {
    if (lineKey(l) !== key) return l;
    const p = getProduct(l.productId);
    const max = p ? stockOf(p, l.size) : l.qty;
    return { ...l, qty: Math.min(Math.max(1, Math.floor(qty) || 1), max) };
  });
}

export const removeLine = (lines: CartLine[], key: string) => lines.filter((l) => lineKey(l) !== key);

export interface PricedLine extends CartLine {
  key: string;
  product: Product;
  unitPrice: number;
  lineTotal: number;
  maxQty: number;
}

/** Junta cada linha ao catálogo. O preço SEMPRE vem do catálogo. */
export function priceLines(lines: CartLine[]): PricedLine[] {
  return lines.flatMap((l) => {
    const product = getProduct(l.productId);
    if (!product) return [];
    return [{ ...l, key: lineKey(l), product, unitPrice: product.price, lineTotal: product.price * l.qty, maxQty: stockOf(product, l.size) }];
  });
}

/** Frete fictício: grátis a partir de R$ 299,00; abaixo disso, R$ 24,90. */
export const FREE_SHIPPING_FROM = 29900;
export const SHIPPING_FEE = 2490;

export function totals(lines: CartLine[]) {
  const priced = priceLines(lines);
  const subtotal = priced.reduce((a, l) => a + l.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping, count: cartCount(lines), missingForFreeShipping: subtotal > 0 && shipping ? FREE_SHIPPING_FROM - subtotal : 0 };
}

/* ------------------------------------------------------------ carrinho salvo */

export const STORAGE_KEY = 'arena-store:carrinho:v1';

export interface Restored {
  lines: CartLine[];
  /** Quantos itens salvos foram descartados ou ajustados. */
  dropped: number;
  adjusted: number;
  corrupted: boolean;
}

/**
 * Lê o carrinho salvo sem confiar nele: aceita só produtos e tamanhos que
 * existem, quantidades inteiras dentro do estoque, junta duplicados e ignora
 * qualquer outro campo (inclusive preços).
 */
export function restoreCart(raw: string | null): Restored {
  const empty: Restored = { lines: [], dropped: 0, adjusted: 0, corrupted: false };
  if (raw === null || raw === '') return empty;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ...empty, corrupted: true };
  }
  const items = Array.isArray(data) ? data : data && typeof data === 'object' && Array.isArray((data as { lines?: unknown }).lines) ? (data as { lines: unknown[] }).lines : null;
  if (!items) return { ...empty, corrupted: true };

  let lines: CartLine[] = [];
  let dropped = 0;
  let adjusted = 0;
  for (const item of items.slice(0, 50)) {
    if (!item || typeof item !== 'object') { dropped++; continue; }
    const { productId, size, qty } = item as Record<string, unknown>;
    const p = typeof productId === 'string' ? getProduct(productId) : undefined;
    const sz = size === null || size === undefined || size === '' ? null : typeof size === 'string' ? size : undefined;
    const q = typeof qty === 'number' && Number.isFinite(qty) ? Math.floor(qty) : NaN;
    if (!p || sz === undefined || !(q >= 1)) { dropped++; continue; }
    const result = addToCart(lines, p.id, sz, q);
    if (result.added === 0) { dropped++; continue; }
    if (result.added < q) adjusted++;
    lines = result.lines;
  }
  return { lines, dropped, adjusted, corrupted: false };
}

export function serializeCart(lines: CartLine[]) {
  return JSON.stringify(lines.map(({ productId, size, qty }) => ({ productId, size, qty })));
}

/* ------------------------------------------------------------ formatação e checkout */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatCents = (cents: number) => brl.format(cents / 100);

export type PaymentMethod = 'pix' | 'cartao' | 'boleto';
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix (simulado)',
  cartao: 'Cartão de crédito (simulado)',
  boleto: 'Boleto (simulado)',
};

/** Código apenas para exibição na confirmação; não identifica nenhum pedido real. */
export function simulationCode(now: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `SIM-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
