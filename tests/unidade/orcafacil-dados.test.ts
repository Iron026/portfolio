import * as D from '../../src/pages/orcafacil/orca-data';
let pass = 0, fail = 0;
const ok = (c: boolean, m: string) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} -> ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
const C = D.SAMPLE_CATALOG;
const L = (itemId: string, qty: number, m = 'padrao', a = 'nenhum', p = 'normal'): D.QuoteLine => ({ uid: itemId + qty + m + a + p, itemId, qty, choices: { material: m, acabamento: a, prazo: p } });
const nb = (s: string) => s.replace(/ /g, ' ');

ok(C.length <= D.MAX_ITEMS && C.length >= 2, 'catálogo de exemplo dentro do limite');
ok(C.every(i => Number.isInteger(i.price) && i.price > 0), 'preços em centavos');
eq(D.VARIABLE_IDS, ['material', 'acabamento', 'prazo'], 'três variáveis');

// produto distinto + combinações (conferidas à mão)
// Cartão R$ 89,00 × 2 pacotes, padrão, sem acabamento, normal = 178,00
eq(D.calcLine(L('cartao', 200), C)!.lineTotal, 17800, 'cartão básico 2 pacotes = R$ 178,00');
// Cartão premium (89,00×1,30 = 115,70) + especial 25% (28,925 → 28,93) = 144,63; ×2 = 289,26; urgente +35% = 101,241 → 101,24; total 390,50
let b = D.calcLine(L('cartao', 200, 'premium', 'especial', 'urgente'), C)!;
eq([b.materialUnit, b.finishingAmount, b.unitPrice, b.goods, b.rushAmount, b.lineTotal], [11570, 2893, 14463, 28926, 10124, 39050], 'cartão premium/especial/urgente = R$ 390,50');
// Banner R$ 65,00/m² × 2,5 m², ecológico (74,75) + simples 10% (7,475 → 7,48) = 82,23; ×2,5 = 205,575 → 205,58; rápido +15% = 30,837 → 30,84; total 236,42
b = D.calcLine(L('banner', 250, 'ecologico', 'simples', 'rapido'), C)!;
eq([b.materialUnit, b.finishingAmount, b.unitPrice, b.goods, b.rushAmount, b.lineTotal], [7475, 748, 8223, 20558, 3084, 23642], 'banner 2,5 m² ecológico/simples/rápido = R$ 236,42');
// Cardápio R$ 6,50 × 120 unidades, padrão/sem/normal = 780,00
eq(D.calcLine(L('cardapio', 12000), C)!.lineTotal, 78000, 'cardápio 120 un = R$ 780,00');
// todas as 27 combinações: total = goods + rush, sempre ≥ básico
const basic = D.calcLine(L('placa', 100), C)!.lineTotal;
let combos = 0;
for (const m of ['padrao', 'ecologico', 'premium']) for (const a of ['nenhum', 'simples', 'especial']) for (const p of ['normal', 'rapido', 'urgente']) {
  const r = D.calcLine(L('placa', 100, m, a, p), C)!; combos++;
  ok(r.lineTotal === r.goods + r.rushAmount && r.unitPrice === r.materialUnit + r.finishingAmount && r.lineTotal >= basic, `combinação ${m}/${a}/${p}`);
}
eq(combos, 27, '27 combinações');
eq(D.calcLine(L('placa', 100, 'xx'), C), null, 'opção inexistente');
eq(D.calcLine(L('nada', 100), C), null, 'item inexistente');

// totais e descontos
const lines = [L('cartao', 200, 'premium', 'especial', 'urgente'), L('banner', 250, 'ecologico', 'simples', 'rapido')];
let t = D.quoteTotals(lines, C, 0);
eq([t.subtotal, t.discount, t.total], [62692, 0, 62692], 'desconto 0%: subtotal = total = R$ 626,92');
t = D.quoteTotals(lines, C, 1000);  // 10% de 626,92 = 62,692 → 62,69
eq([t.discount, t.total], [6269, 56423], 'desconto 10%');
t = D.quoteTotals(lines, C, 4550);  // 45,5% de 626,92 = 285,2486 → 285,25
eq([t.discount, t.total], [28525, 34167], 'desconto elevado 45,5%');
t = D.quoteTotals(lines, C, 10000);
eq([t.discount, t.total], [62692, 0], 'desconto 100% = total zero');
t = D.quoteTotals(lines, C, 99999); eq(t.discountBp, 10000, 'desconto limitado a 100% no cálculo');
t = D.quoteTotals(lines, C, -500); eq(t.discountBp, 0, 'desconto negativo vira 0 no cálculo');
eq(D.quoteTotals([], C, 1000).total, 0, 'orçamento vazio');
// meio centavo: 50% de R$ 0,01 = 0,005 → 0,01
eq(D.applyBp(1, 5000), 1, 'meio centavo arredonda para cima');
eq(D.applyBp(3, 5000), 2, '1,5 centavo → 2');
// precisão com valores muito altos (acima de 2^53 no produto intermediário)
eq(D.applyBp(3_300_000_000_001, 3333), 1_099_890_000_000, 'pontos-base exatos em valor muito alto');

// validações de quantidade
const q = (raw: string, unit: D.UnitId) => D.validateQty(raw, unit);
eq(q('3', 'pacote'), { qty: 300 }, 'inteiro válido');
eq(q('2,5', 'm2'), { qty: 250 }, 'decimal com vírgula');
eq(q('2.5', 'm2'), { qty: 250 }, 'decimal com ponto');
eq(q('1.250', 'unidade'), { qty: 125000 }, 'milhar com ponto');
for (const [raw, unit] of [['', 'pacote'], ['0', 'pacote'], ['-2', 'pacote'], ['2,5', 'pacote'], ['abc', 'm2'], ['2,555', 'm2'], ['1e3', 'unidade'], ['10001', 'unidade'], ['501', 'm2'], ['0,00', 'm2'], ['  ', 'm2']] as const)
  ok(!!q(raw, unit).error, `quantidade inválida "${raw}" (${unit}): ${q(raw, unit).error}`);
// desconto
eq(D.validateDiscount(''), { bp: 0 }, 'desconto vazio = 0');
eq(D.validateDiscount('0'), { bp: 0 }, 'desconto 0');
eq(D.validateDiscount('7,5'), { bp: 750 }, 'desconto 7,5%');
eq(D.validateDiscount('10%'), { bp: 1000 }, 'aceita símbolo %');
ok(!!D.validateDiscount('45').warning && D.validateDiscount('45').bp === 4500, 'desconto elevado com aviso');
for (const raw of ['-5', '101', 'dez', '5,555']) ok(!!D.validateDiscount(raw).error, `desconto inválido "${raw}"`);
// preço e nome do cadastro
eq(D.validatePrice('89,90'), { cents: 8990 }, 'preço 89,90');
eq(D.validatePrice('R$ 1.250,00'), { cents: 125000 }, 'preço com R$ e milhar');
for (const raw of ['', '0', 'abc', '-3', '100000,01']) ok(!!D.validatePrice(raw).error, `preço inválido "${raw}"`);
ok(!!D.validateItemName('a', C) && !!D.validateItemName(' banner EM lona ', C) && !D.validateItemName('Banner em lona', C, 'banner'), 'nome: curto, duplicado, edição do próprio');
// catálogo salvo
eq(D.restoreCatalog(null).catalog, C, 'sem dados: exemplo');
eq(D.restoreCatalog('{x').corrupted, true, 'JSON corrompido');
const r = D.restoreCatalog(JSON.stringify([{ id: 'a', name: 'Item A', unit: 'm2', price: 1000 }, { id: 'a', name: 'Dup', unit: 'm2', price: 1 }, { id: 'b', name: 'X', unit: 'm2', price: 10 }, { id: 'c', name: 'Preço quebrado', unit: 'm2', price: 10.5 }, { id: 'd', name: 'Unidade ruim', unit: 'kg', price: 10 }]));
eq(r.catalog.map(i => i.id), ['a'], 'catálogo salvo: descarta duplicados e inválidos');
eq(D.restoreCatalog(JSON.stringify(Array.from({ length: 14 }, (_, i) => ({ id: 'i' + i, name: 'Item ' + i, unit: 'unidade', price: 100 })))).catalog.length, 10, 'no máximo 10 itens');
// formatação
eq(nb(D.money(62692)), 'R$ 626,92', 'moeda');
eq(D.formatQty(250, 'm2'), '2,5 m²', 'quantidade m²'); eq(D.formatQty(100, 'pacote'), '1 pacote', 'singular'); eq(D.formatQty(300, 'pacote'), '3 pacotes', 'plural');
eq(D.formatPercent(4550), '45,5%', 'percentual');
// resumo
const info: D.ProposalInfo = { number: 'ORC-1', client: '', validityDays: 7, notes: '', date: new Date(2026, 9, 20) };
const s0 = nb(D.summaryText(D.quoteTotals(lines, C, 0), info));
ok(!/\n\n\n/.test(s0) && !/Subtotal: [^\n]+\n\nTotal/.test(s0), 'resumo sem linhas em branco sobrando:\n' + s0);
ok(s0.includes('Total: R$ 626,92') && !s0.includes('Desconto') && !s0.includes('Cliente'), 'resumo sem desconto e sem cliente');
const s1 = nb(D.summaryText(D.quoteTotals(lines, C, 1000), { ...info, client: 'Padaria Sol', notes: 'Arte do cliente' }));
ok(s1.includes('Cliente: Padaria Sol') && s1.includes('Desconto (10%): −R$ 62,69') && s1.includes('Total: R$ 564,23') && s1.endsWith('Observações: Arte do cliente'), 'resumo completo:\n' + s1);
console.log(`\n${pass} passaram, ${fail} falharam`); if (fail) process.exit(1);
