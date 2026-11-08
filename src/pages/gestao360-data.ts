/**
 * Gestão360 — dados fictícios e cálculos da demonstração.
 * Tudo roda no navegador: nada é enviado a um servidor e nenhum dado é real.
 * As funções aqui são puras (sem React) para poderem ser testadas isoladamente.
 */
export type TransactionKind = 'receita' | 'despesa';
export type Period = '30d' | '90d' | '365d';
export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD, no fuso local
  description: string;
  category: string;
  kind: TransactionKind;
  amount: number;
};

const revenue = [
  { description: 'Venda de produtos', category: 'Produtos', base: 4800 },
  { description: 'Contrato de serviços', category: 'Serviços', base: 3200 },
  { description: 'Mensalidades', category: 'Assinaturas', base: 1850 },
  { description: 'Venda para empresa', category: 'Produtos', base: 5400 },
  { description: 'Projeto sob demanda', category: 'Serviços', base: 2750 },
];
const expenses = [
  { description: 'Fornecedores', category: 'Fornecedores', base: 2300 },
  { description: 'Equipe e pessoal', category: 'Pessoal', base: 3400 },
  { description: 'Publicidade digital', category: 'Marketing', base: 950 },
  { description: 'Aluguel do escritório', category: 'Aluguel', base: 1800 },
  { description: 'Softwares e ferramentas', category: 'Tecnologia', base: 490 },
  { description: 'Materiais e compras', category: 'Fornecedores', base: 1250 },
];

const unique = (values: string[]) => Array.from(new Set(values));

/**
 * Textos de exibição em inglês. As categorias e descrições em português são
 * também os IDENTIFICADORES usados nos filtros e nos testes: não mudam.
 */
export type DemoLocale = 'pt' | 'en';
const CATEGORY_EN: Record<string, string> = {
  Produtos: 'Products',
  Serviços: 'Services',
  Assinaturas: 'Subscriptions',
  Fornecedores: 'Suppliers',
  Pessoal: 'Staff',
  Marketing: 'Marketing',
  Aluguel: 'Rent',
  Tecnologia: 'Technology',
};
const DESCRIPTION_EN: Record<string, string> = {
  'Venda de produtos': 'Product sales',
  'Contrato de serviços': 'Service contract',
  Mensalidades: 'Monthly fees',
  'Venda para empresa': 'Business sale',
  'Projeto sob demanda': 'Custom project',
  Fornecedores: 'Suppliers',
  'Equipe e pessoal': 'Team and staff',
  'Publicidade digital': 'Digital advertising',
  'Aluguel do escritório': 'Office rent',
  'Softwares e ferramentas': 'Software and tools',
  'Materiais e compras': 'Materials and purchases',
};
export const displayCategory = (category: string, locale: DemoLocale = 'pt') => (locale === 'en' ? (CATEGORY_EN[category] ?? category) : category);
export const displayDescription = (description: string, locale: DemoLocale = 'pt') => (locale === 'en' ? (DESCRIPTION_EN[description] ?? description) : description);

/** Categorias disponíveis no filtro, separadas por tipo. */
export const categoriesByKind: Record<TransactionKind, string[]> = {
  receita: unique(revenue.map((r) => r.category)),
  despesa: unique(expenses.map((e) => e.category)),
};

export const ALL_CATEGORIES = 'todas';

export const PERIODS: { value: Period; label: string; days: number }[] = [
  { value: '30d', label: '30 dias', days: 30 },
  { value: '90d', label: '90 dias', days: 90 },
  { value: '365d', label: '12 meses', days: 365 },
];

const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Gera uma receita e uma despesa a cada 3 dias, contando para trás a partir
 * do dia atual. Assim os filtros de período sempre têm dados, em qualquer data.
 * Os valores são determinísticos (sem sorteio): o mesmo dia gera os mesmos números.
 */
export function createDemoTransactions(today: Date = new Date()): Transaction[] {
  const result: Transaction[] = [];
  for (let daysAgo = 0; daysAgo <= 390; daysAgo += 3) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    const n = Math.floor(daysAgo / 3);
    const inItem = revenue[n % revenue.length];
    const outItem = expenses[(n * 3 + Math.floor(n / 4)) % expenses.length];
    const ratio = 0.77 + ((n * 19) % 38) / 100;
    const ratioOut = 0.82 + ((n * 11) % 34) / 100;
    result.push({
      id: `REC-${String(n + 1).padStart(4, '0')}`,
      date: dateKey(date),
      description: inItem.description,
      category: inItem.category,
      kind: 'receita',
      amount: Math.round(inItem.base * ratio * 100) / 100,
    });
    result.push({
      id: `DES-${String(n + 1).padStart(4, '0')}`,
      date: dateKey(date),
      description: outItem.description,
      category: outItem.category,
      kind: 'despesa',
      amount: Math.round(outItem.base * ratioOut * 100) / 100,
    });
  }
  return result;
}

/** Primeiro dia incluído no período (o dia atual conta como o último). */
export function periodStart(period: Period, today: Date = new Date()): Date {
  const days = PERIODS.find((p) => p.value === period)?.days ?? 365;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days + 1);
}

export interface Filters {
  period: Period;
  kind: 'todos' | TransactionKind;
  category: string;
  search: string;
}

export const DEFAULT_FILTERS: Filters = { period: '90d', kind: 'todos', category: ALL_CATEGORIES, search: '' };

const normalize = (value: string) =>
  value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/**
 * Aplica todos os filtros e ordena do mais recente para o mais antigo.
 * A busca considera o texto exibido no idioma da página (`locale`).
 */
export function filterTransactions(rows: Transaction[], filters: Filters, today: Date = new Date(), locale: DemoLocale = 'pt'): Transaction[] {
  const start = dateKey(periodStart(filters.period, today));
  const end = dateKey(today);
  const needle = normalize(filters.search);
  return rows
    .filter((t) => {
      if (t.date < start || t.date > end) return false;
      if (filters.kind !== 'todos' && t.kind !== filters.kind) return false;
      if (filters.category !== ALL_CATEGORIES && t.category !== filters.category) return false;
      if (needle && !normalize(`${t.id} ${displayDescription(t.description, locale)} ${displayCategory(t.category, locale)}`).includes(needle)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

/** Soma em centavos para evitar erros de arredondamento de ponto flutuante. */
export function sumFor(transactions: Transaction[], kind: TransactionKind): number {
  const cents = transactions
    .filter((t) => t.kind === kind)
    .reduce((acc, item) => acc + Math.round(item.amount * 100), 0);
  return cents / 100;
}

export interface Totals {
  revenue: number;
  expenses: number;
  result: number;
  count: number;
}

export function totalsFor(transactions: Transaction[]): Totals {
  const rev = sumFor(transactions, 'receita');
  const exp = sumFor(transactions, 'despesa');
  return { revenue: rev, expenses: exp, result: Math.round((rev - exp) * 100) / 100, count: transactions.length };
}

/** `partial`: o intervalo começa antes do período ou termina depois de hoje. */
export type TrendPoint = { key: string; label: string; receita: number; despesa: number; partial: boolean };

/**
 * Agrupa por semana (30 e 90 dias) ou por mês (12 meses).
 * Todos os intervalos do período aparecem, mesmo sem transações (valor zero),
 * para que o eixo do tempo não "pule" semanas ou meses.
 */
export function buildTrend(transactions: Transaction[], period: Period, today: Date = new Date(), intl = 'pt-BR'): TrendPoint[] {
  const weekly = period !== '365d';
  const bucketOf = (d: Date) =>
    weekly
      ? new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)) // segunda-feira
      : new Date(d.getFullYear(), d.getMonth(), 1);
  const labelOf = (d: Date) => {
    if (weekly) return intl === 'pt-BR' ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : new Intl.DateTimeFormat(intl, { month: 'short', day: 'numeric' }).format(d);
    const month = new Intl.DateTimeFormat(intl, { month: 'short' }).format(d).replace('.', '');
    return `${month}/${String(d.getFullYear()).slice(-2)}`;
  };

  const points = new Map<string, TrendPoint>();
  const start = periodStart(period, today);
  const next = (d: Date) =>
    weekly ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7) : new Date(d.getFullYear(), d.getMonth() + 1, 1);
  let cursor = bucketOf(start);
  const last = bucketOf(today);
  while (cursor <= last) {
    const key = dateKey(cursor);
    const end = new Date(next(cursor).getFullYear(), next(cursor).getMonth(), next(cursor).getDate() - 1);
    const partial = cursor < start || end > today;
    points.set(key, { key, label: labelOf(cursor), receita: 0, despesa: 0, partial });
    cursor = next(cursor);
  }
  for (const t of transactions) {
    const point = points.get(dateKey(bucketOf(parseDate(t.date))));
    if (point) point[t.kind] = Math.round((point[t.kind] + t.amount) * 100) / 100;
  }
  return Array.from(points.values());
}

export function spendingByCategory(transactions: Transaction[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.kind === 'despesa') map.set(t.category, (map.get(t.category) ?? 0) + Math.round(t.amount * 100));
  }
  return Array.from(map, ([name, cents]) => ({ name, value: cents / 100 })).sort((a, b) => b.value - a.value);
}

/* ------------------------------------------------------------ formatação */

/** Valores sempre em reais (a empresa fictícia é brasileira); só o formato muda com o idioma. */
export function formatMoney(value: number, intl = 'pt-BR'): string {
  return new Intl.NumberFormat(intl, { style: 'currency', currency: 'BRL' }).format(value);
}

export const moneyCompact = (value: number, intl = 'pt-BR') =>
  new Intl.NumberFormat(intl, { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export function formatDate(date: string, intl = 'pt-BR'): string {
  return new Intl.DateTimeFormat(intl, intl === 'pt-BR' ? undefined : { month: 'short', day: 'numeric', year: 'numeric' }).format(parseDate(date));
}

/* ------------------------------------------------------------------- CSV */

/**
 * Célula de CSV entre aspas. Textos que começam com = + - @ recebem um
 * apóstrofo para o Excel não interpretá-los como fórmula (injeção de CSV).
 */
function csvCell(value: string): string {
  const safe = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * CSV no padrão do Excel em português: UTF-8 com BOM (acentos corretos),
 * separador ponto e vírgula, vírgula decimal, data dd/mm/aaaa e quebra de linha CRLF.
 * O valor sai sem sinal; a coluna "Tipo" indica se é receita ou despesa.
 * Em inglês: cabeçalhos em inglês, vírgula como separador, ponto decimal e data ISO (AAAA-MM-DD).
 */
export function transactionsToCsv(transactions: Transaction[], locale: DemoLocale = 'pt'): string {
  if (locale === 'en') {
    const header = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount (BRL)'];
    const lines = transactions.map((t) => [
      csvCell(t.id),
      csvCell(t.date),
      csvCell(displayDescription(t.description, 'en')),
      csvCell(displayCategory(t.category, 'en')),
      csvCell(t.kind === 'receita' ? 'Revenue' : 'Expense'),
      t.amount.toFixed(2),
    ]);
    return '\ufeff' + [header.map(csvCell), ...lines].map((row) => row.join(',')).join('\r\n') + '\r\n';
  }
  const header = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
  const lines = transactions.map((t) => [
    csvCell(t.id),
    csvCell(formatDate(t.date)),
    csvCell(t.description),
    csvCell(t.category),
    csvCell(t.kind === 'receita' ? 'Receita' : 'Despesa'),
    t.amount.toFixed(2).replace('.', ','),
  ]);
  return '﻿' + [header.map(csvCell), ...lines].map((row) => row.join(';')).join('\r\n') + '\r\n';
}

export function csvFileName(today: Date = new Date(), locale: DemoLocale = 'pt') {
  return `gestao360-${locale === 'en' ? 'transactions' : 'transacoes'}-${dateKey(today)}.csv`;
}
