import * as D from '../../src/pages/gestao360-data';
let pass = 0, fail = 0;
const ok = (cond: boolean, msg: string) => { if (cond) pass++; else { fail++; console.log('FAIL:', msg); } };
const eq = (a: unknown, b: unknown, msg: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} -> got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);

const today = new Date(2026, 9, 20); // 20/10/2026
const rows = D.createDemoTransactions(today);
eq(rows.length, 131 * 2, 'gera 131 receitas + 131 despesas (0..390 a cada 3 dias)');
ok(new Set(rows.map(r => r.id)).size === rows.length, 'IDs únicos');
eq(D.createDemoTransactions(today), rows, 'determinístico');

// períodos
const f = (p: Partial<D.Filters>) => D.filterTransactions(rows, { ...D.DEFAULT_FILTERS, ...p }, today);
eq(f({ period: '30d' }).length, 20, '30 dias: dias 0,3..27 = 10 datas × 2');
eq(f({ period: '90d' }).length, 60, '90 dias: 30 datas × 2');
eq(f({ period: '365d' }).length, 244, '12 meses: dias 0..363 = 122 datas × 2');
eq(D.dateKey(D.periodStart('30d', today)), '2026-09-21', 'início do período de 30 dias');
ok(f({ period: '30d' }).every(t => t.date >= '2026-09-21' && t.date <= '2026-10-20'), '30d dentro do intervalo');
ok(f({ period: '365d' }).every(t => t.date >= '2025-10-21'), '12 meses começa em 21/10/2025');
// ordenação
const s = f({});
ok(s.every((t, i) => i === 0 || s[i - 1].date >= t.date), 'ordenado do mais recente');

// somas conferidas manualmente (independente de sumFor)
for (const period of ['30d', '90d', '365d'] as const) {
  const list = f({ period });
  const manualRev = list.filter(t => t.kind === 'receita').reduce((a, t) => a + t.amount, 0);
  const manualExp = list.filter(t => t.kind === 'despesa').reduce((a, t) => a + t.amount, 0);
  const tot = D.totalsFor(list);
  ok(Math.abs(tot.revenue - manualRev) < 0.005, `${period} receita ${tot.revenue} ≈ ${manualRev}`);
  ok(Math.abs(tot.expenses - manualExp) < 0.005, `${period} despesa`);
  ok(Math.abs(tot.result - (manualRev - manualExp)) < 0.005, `${period} resultado`);
  eq(tot.count, list.length, `${period} contagem`);
  // gráfico de evolução soma o mesmo que os indicadores
  const trend = D.buildTrend(list, period, today);
  const tr = trend.reduce((a, p) => a + p.receita, 0), td = trend.reduce((a, p) => a + p.despesa, 0);
  ok(Math.abs(tr - tot.revenue) < 0.01 && Math.abs(td - tot.expenses) < 0.01, `${period} gráfico de evolução = indicadores`);
  // categorias somam o total de despesas
  const cat = D.spendingByCategory(list).reduce((a, c) => a + c.value, 0);
  ok(Math.abs(cat - tot.expenses) < 0.01, `${period} categorias = despesas`);
  console.log(period, JSON.stringify(tot), 'pontos:', trend.map(p => p.label).join(' '));
}
// valor de referência fixo para 30 dias (calculado à mão abaixo)
const t30 = f({ period: '30d' });
console.log('30d linhas:', t30.map(t => `${t.date} ${t.id} ${t.amount}`).join(' | '));

// tipo e categoria
ok(f({ kind: 'receita' }).every(t => t.kind === 'receita'), 'filtro só receitas');
eq(D.totalsFor(f({ kind: 'receita' })).expenses, 0, 'só receitas → despesas 0');
ok(f({ category: 'Pessoal' }).every(t => t.category === 'Pessoal') && f({ category: 'Pessoal' }).length > 0, 'categoria Pessoal');
eq(f({ kind: 'receita', category: 'Pessoal' }).length, 0, 'receita + Pessoal → vazio');
eq(D.spendingByCategory(f({ kind: 'receita' })).length, 0, 'sem despesas p/ gráfico de categorias');
eq(D.categoriesByKind, { receita: ['Produtos', 'Serviços', 'Assinaturas'], despesa: ['Fornecedores', 'Pessoal', 'Marketing', 'Aluguel', 'Tecnologia'] }, 'categorias por tipo');

// busca: sem acento, maiúsculas, por ID e categoria
ok(f({ search: 'servicos' }).length > 0 && f({ search: 'servicos' }).every(t => /servi/i.test(t.description + t.category)), 'busca sem acento');
eq(f({ search: 'ALUGUEL' }).length, f({ category: 'Aluguel' }).length, 'busca maiúscula = categoria');
eq(f({ search: 'REC-0001' }).map(t => t.id), ['REC-0001'], 'busca por ID');
eq(f({ search: 'xyz-inexistente' }).length, 0, 'busca sem resultado');
eq(f({ search: '   ' }).length, 60, 'busca só com espaços é ignorada');

// tendência: buckets
const w = D.buildTrend(f({ period: '30d' }), '30d', today);
ok(w.length >= 5 && w.length <= 6, `30d semanal tem ${w.length} semanas`);
const m90 = D.buildTrend(f({ period: '90d' }), '90d', today);
eq(m90.length, 14, '90d semanal: 14 semanas');
eq(m90[0].label, '20/07', '90d começa na segunda 20/07 (período inicia 23/07)');
eq(m90.filter(p => p.partial).map(p => p.label), ['20/07', '19/10'], '90d: primeira e última semana parciais');
eq(w.filter(p => p.partial).map(p => p.label), ['19/10'], '30d: só a última semana é parcial (21/09 é segunda)');
const m12 = D.buildTrend(f({ period: '365d' }), '365d', today);
eq(m12.length, 13, '12 meses: out/25 parcial até out/26 parcial = 13 pontos');
eq(m12.filter(p => p.partial).map(p => p.label), ['out/25', 'out/26'], '12 meses: pontas parciais');
eq(D.buildTrend([], '90d', today).every(p => p.receita === 0 && p.despesa === 0), true, 'tendência vazia zera');

// CSV
const sample: D.Transaction[] = [
  { id: 'REC-0001', date: '2026-10-20', description: 'Venda "especial"; à vista', category: 'Serviços', kind: 'receita', amount: 1234.5 },
  { id: 'DES-0001', date: '2026-01-05', description: '=HYPERLINK("x")', category: 'Pessoal', kind: 'despesa', amount: 99 },
];
const csv = D.transactionsToCsv(sample);
ok(csv.charCodeAt(0) === 0xfeff, 'BOM UTF-8');
const lines = csv.slice(1).split('\r\n');
eq(lines[0], '"ID";"Data";"Descrição";"Categoria";"Tipo";"Valor (R$)"', 'cabeçalho');
eq(lines[1], '"REC-0001";"20/10/2026";"Venda ""especial""; à vista";"Serviços";"Receita";1234,50', 'linha 1: aspas, ; e vírgula decimal');
eq(lines[2], `"DES-0001";"05/01/2026";"'=HYPERLINK(""x"")";"Pessoal";"Despesa";99,00`, 'linha 2: proteção contra fórmula');
eq(lines.length, 4, 'CRLF + linha final vazia');
ok(!/\n(?<!\r\n)/.test(csv.replace(/\r\n/g, '')), 'só CRLF');
eq(D.csvFileName(today), 'gestao360-transacoes-2026-10-20.csv', 'nome do arquivo');
const full = D.transactionsToCsv(f({}));
eq(full.slice(1).split('\r\n').filter(Boolean).length, 61, 'CSV 90d: cabeçalho + 60 linhas');
const csvSum = full.slice(1).split('\r\n').slice(1).filter(Boolean).reduce((a, l) => {
  const c = l.split(';'); const v = Number(c[5].replace(',', '.')); return a + (c[4] === '"Receita"' ? v : -v);
}, 0);
ok(Math.abs(csvSum - D.totalsFor(f({})).result) < 0.01, 'soma do CSV = resultado do painel');

// formatação
eq(D.formatMoney(1234.5).replace(/\s/g, ' '), 'R$ 1.234,50', 'moeda');
eq(D.formatDate('2026-03-07'), '07/03/2026', 'data');
console.log(`\n${pass} passaram, ${fail} falharam`);
if (fail) process.exit(1);
