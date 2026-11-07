import * as D from '../../src/pages/imoveis/imoveis-data';
let pass = 0, fail = 0;
const ok = (c: boolean, m: string) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} -> ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
const P = D.properties;
const ids = (f: Partial<D.Filters>) => D.filterProperties(P, { ...D.EMPTY_FILTERS, ...f }).map(p => p.id);

eq(P.length, 12, '12 imóveis');
ok(new Set(P.map(p => p.id)).size === 12 && P.every(p => /^PI-1\d\d$/.test(p.id)), 'IDs únicos e estáveis');
ok(P.every(p => p.gallery.length >= 3 && p.description.length > 60 && p.area > 0 && p.price > 0), 'dados completos');
ok(P.filter(p => p.purpose === 'aluguel').every(p => p.price < 10000), 'aluguéis com valores mensais');
ok(P.filter(p => p.purpose === 'venda').every(p => p.price >= 100000), 'vendas com valores de venda');
ok(P.every(p => p.type !== 'comercial' || p.bedrooms === 0), 'sala comercial sem quartos');
ok(P.every(p => p.type !== 'casa' && p.type !== 'sobrado' || p.condo === 0 || p.features.includes('Condomínio fechado')), 'casas sem condomínio, salvo condomínio fechado');
// cada faixa tem pelo menos 1 imóvel
for (const purpose of ['venda', 'aluguel'] as const) for (const r of D.PRICE_RANGES[purpose]) ok(ids({ purpose, price: r.value }).length > 0, `faixa ${r.label} tem imóveis`);
// faixas cobrem todos e não se sobrepõem
for (const purpose of ['venda', 'aluguel'] as const) {
  const total = D.PRICE_RANGES[purpose].reduce((a, r) => a + ids({ purpose, price: r.value }).length, 0);
  eq(total, ids({ purpose }).length, `faixas de ${purpose} cobrem cada imóvel exatamente uma vez`);
}
// faixa sem finalidade é ignorada; faixa de outra finalidade é ignorada
eq(ids({ price: 'v1' }).length, 12, 'faixa sem finalidade não filtra');
eq(ids({ purpose: 'aluguel', price: 'v4' }).length, 6, 'faixa de venda com aluguel é ignorada');
eq(D.findRange('aluguel', 'v1'), undefined, 'findRange não mistura finalidades');

// busca
eq(ids({ q: 'piscina' }), ['PI-106', 'PI-109', 'PI-110'], 'busca por característica');
eq(ids({ q: 'centro' }), ['PI-102', 'PI-107', 'PI-108', 'PI-111'], 'busca por bairro');
eq(ids({ q: 'SOBRADO' }), ['PI-103', 'PI-112'], 'busca maiúscula pelo tipo/nome');
eq(ids({ q: 'suites' }), ['PI-103'], 'busca sem acento ("suites" → "3 suítes")');
eq(ids({ q: 'casa piscina' }), ['PI-110'], 'busca com várias palavras (E)');
eq(ids({ q: 'pi-104' }), ['PI-104'], 'busca por código');
eq(ids({ q: 'castelo medieval' }), [], 'busca sem resultado');
eq(ids({ q: '   ' }).length, 12, 'busca vazia');
eq(ids({ q: 'nova aurora' }).length, 12, 'busca pela cidade');

// filtros combinados
eq(ids({ purpose: 'venda' }), ['PI-101', 'PI-103', 'PI-104', 'PI-106', 'PI-108', 'PI-110'], 'venda');
eq(ids({ purpose: 'aluguel', neighborhood: 'Centro' }), ['PI-102', 'PI-107', 'PI-111'], 'aluguel + Centro');
eq(ids({ purpose: 'aluguel', neighborhood: 'Centro', bedrooms: 1 }), ['PI-102', 'PI-107'], 'aluguel + Centro + 1+ quartos (exclui comercial)');
eq(ids({ purpose: 'venda', type: 'casa', price: 'v3' }), ['PI-110'], 'venda + casa + 700 mil a 1 mi');
eq(ids({ purpose: 'venda', bedrooms: 3, price: 'v2' }), ['PI-101'], 'venda + 3+ quartos + 400 a 700 mil');
eq(ids({ purpose: 'aluguel', price: 'a2', type: 'apartamento' }), ['PI-102'], 'aluguel 2–3 mil apartamento');
eq(ids({ purpose: 'aluguel', price: 'a2' }), ['PI-102', 'PI-111'], 'aluguel R$ 2.000–3.000');
eq(ids({ bedrooms: 4 }), ['PI-106', 'PI-110'], '4+ quartos');
eq(ids({ type: 'cobertura', purpose: 'aluguel' }), [], 'combinação sem resultado');
eq(ids({ q: 'pets', purpose: 'aluguel' }), ['PI-105', 'PI-109'], 'busca + finalidade');

// contador de filtros
eq(D.activeFilterCount(D.EMPTY_FILTERS), 0, 'nenhum filtro');
eq(D.activeFilterCount({ ...D.EMPTY_FILTERS, purpose: 'venda', price: 'v2', bedrooms: 2, q: 'x' }), 4, '4 filtros');
eq(D.activeFilterCount({ ...D.EMPTY_FILTERS, price: 'v2' }), 0, 'faixa sem finalidade não conta');

// URL
const f1: D.Filters = { q: 'varanda', purpose: 'venda', type: 'apartamento', neighborhood: 'Alto da Colina', price: 'v2', bedrooms: 2 };
const qs = D.filtersToParams(f1).toString();
eq(qs, 'q=varanda&finalidade=venda&tipo=apartamento&bairro=Alto+da+Colina&preco=v2&quartos=2', 'filtros → URL');
eq(D.filtersFromParams(new URLSearchParams(qs)), f1, 'URL → filtros (ida e volta)');
eq(D.filtersFromParams(new URLSearchParams('finalidade=xx&tipo=nave&bairro=Marte&quartos=9&preco=a1')), D.EMPTY_FILTERS, 'URL inválida é ignorada');
eq(D.filtersFromParams(new URLSearchParams('finalidade=aluguel&preco=v1')).price, '', 'preço de venda em aluguel é descartado');
eq(D.filtersToParams(D.EMPTY_FILTERS).toString(), '', 'sem filtros → URL limpa');

// detalhes
eq(D.getProperty('pi-106')?.title, 'Cobertura duplex com piscina', 'getProperty sem diferenciar maiúsculas');
eq(D.getProperty('PI-999'), undefined, 'id inexistente');

// formatação e cálculos
const nb = (s: string) => s.replace(/\u00a0/g, ' ');
eq(nb(D.formatPrice(D.getProperty('PI-101')!)), 'R$ 680.000', 'preço de venda');
eq(nb(D.formatPrice(D.getProperty('PI-102')!)), 'R$ 2.400/mês', 'preço de aluguel');
eq(D.summary(D.getProperty('PI-101')!), '3 quartos · 2 banheiros · 160 m²', 'resumo');
eq(D.summary(D.getProperty('PI-111')!), '1 banheiro · 55 m²', 'resumo comercial (sem quartos, singular)');
eq(D.pricePerSquareMeter(D.getProperty('PI-101')!), 4250, 'R$/m²');
eq(D.pricePerSquareMeter(D.getProperty('PI-102')!), null, 'sem R$/m² no aluguel');
eq(D.monthlyTotal(D.getProperty('PI-102')!), 2400 + 520 + 85, 'custo mensal');
const msg = D.consultMessage(D.getProperty('PI-102')!, ' Ana ', 'visita');
eq(nb(msg), 'Olá! Meu nome é Ana.\nTenho interesse no imóvel PI-102: Apartamento 2 quartos, em Centro (Nova Aurora).\nAluguel por R$ 2.400/mês. 2 quartos · 1 banheiro · 64 m².\nGostaria de agendar uma visita.', 'mensagem de consulta');
ok(D.consultMessage(D.getProperty('PI-101')!, '', 'proposta').startsWith('Olá!\n'), 'mensagem sem nome');
console.log(`\n${pass} passaram, ${fail} falharam`); if (fail) process.exit(1);
