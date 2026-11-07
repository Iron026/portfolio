import * as D from '../../src/pages/arena-store/store-data';
let pass = 0, fail = 0;
const ok = (c: boolean, m: string) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} -> ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
const ids = (f: Partial<D.CatalogFilters>) => D.filterCatalog(D.products, { ...D.DEFAULT_FILTERS, ...f }).map(p => p.id);
const nb = (s: string) => s.replace(/ /g, ' ');

eq(D.products.length, 8, '8 produtos');
ok(new Set(D.products.map(p => p.id)).size === 8, 'IDs únicos');
eq(D.CATEGORIES.map(c => ids({ category: c }).length), [2, 3, 3], 'categorias: 2 calçados, 3 roupas, 3 acessórios');
ok(D.products.every(p => Number.isInteger(p.price) && p.price > 0), 'preços em centavos inteiros');
ok(D.products.every(p => D.hasSizes(p) ? p.sizes.every(s => s in p.stockBySize) && p.stock === 0 : Object.keys(p.stockBySize).length === 0), 'estoque coerente com tamanhos');
eq(D.products.filter(p => D.totalStock(p) === 0).map(p => p.id), ['AR-08'], 'um produto esgotado (mochila)');
eq(D.stockLevel(0), 'esgotado', 'nível esgotado'); eq(D.stockLevel(3), 'ultimas', 'últimas unidades'); eq(D.stockLevel(4), 'disponivel', 'disponível');

// busca, filtro, ordenação
eq(ids({ q: 'tenis' }), ['AR-01', 'AR-08'], 'busca sem acento ("tenis" acha tênis e a mochila com compartimento para tênis)');
eq(ids({ q: 'garrafa' }), ['AR-07'], 'busca por nome');
eq(ids({ q: 'acessorios' }), ['AR-06', 'AR-07', 'AR-08'], 'busca pela categoria');
eq(ids({ q: 'raquete de tenis de mesa' }), [], 'busca sem resultado');
eq(ids({ category: 'roupas', q: 'vento' }), ['AR-05'], 'categoria + busca');
eq(ids({ sort: 'menor-preco' })[0], 'AR-07', 'menor preço primeiro');
eq(ids({ sort: 'maior-preco' })[0], 'AR-01', 'maior preço primeiro');
const prices = D.filterCatalog(D.products, { ...D.DEFAULT_FILTERS, sort: 'menor-preco' }).map(p => p.price);
ok(prices.every((p, i) => i === 0 || prices[i - 1] <= p), 'ordenação crescente');
eq(D.filtersFromParams(new URLSearchParams('categoria=xx&ordem=yy')), D.DEFAULT_FILTERS, 'parâmetros inválidos');
eq(D.filtersToParams({ q: 'bola', category: 'acessorios', sort: 'menor-preco' }).toString(), 'q=bola&categoria=acessorios&ordem=menor-preco', 'filtros → URL');

// adicionar com variações e estoque
let r = D.addToCart([], 'AR-03', null, 1); eq([r.added, r.reason], [0, 'sem-tamanho'], 'roupa exige tamanho');
r = D.addToCart([], 'AR-03', 'XG', 1); eq(r.reason, 'tamanho-invalido', 'tamanho inexistente');
r = D.addToCart([], 'AR-06', 'M', 1); eq(r.reason, 'tamanho-invalido', 'acessório não aceita tamanho');
r = D.addToCart([], 'AR-01', '42', 1); eq(r.reason, 'esgotado', 'tamanho esgotado');
r = D.addToCart([], 'AR-08', null, 1); eq(r.reason, 'esgotado', 'produto esgotado');
let cart: D.CartLine[] = [];
cart = D.addToCart(cart, 'AR-03', 'M', 2).lines;
cart = D.addToCart(cart, 'AR-03', 'G', 1).lines;
cart = D.addToCart(cart, 'AR-01', '40', 1).lines;
cart = D.addToCart(cart, 'AR-06', null, 3).lines;
cart = D.addToCart(cart, 'AR-03', 'M', 1).lines;
eq(cart, [{ productId: 'AR-03', size: 'M', qty: 3 }, { productId: 'AR-03', size: 'G', qty: 1 }, { productId: 'AR-01', size: '40', qty: 1 }, { productId: 'AR-06', size: null, qty: 3 }], 'variações diferentes em linhas separadas; mesma variação soma');
eq(D.cartCount(cart), 8, 'contador = soma das quantidades');
// subtotal conferido à mão: 3×89,90 + 1×89,90 + 349,90 + 3×129,90 = 269,70 + 89,90 + 349,90 + 389,70 = 1.099,20
let t = D.totals(cart);
eq([t.subtotal, t.shipping, t.total], [109920, 0, 109920], 'subtotal R$ 1.099,20 e frete grátis');
// limite de estoque
r = D.addToCart([], 'AR-07', null, 10); eq([r.added, r.reason, r.lines[0].qty], [4, 'limite', 4], 'pede 10 garrafas, só 4 em estoque');
r = D.addToCart(r.lines, 'AR-07', null, 1); eq([r.added, r.reason], [0, 'limite'], 'não passa do estoque');
eq(D.setLineQty(r.lines, 'AR-07|', 99)[0].qty, 4, 'ajuste limitado ao estoque');
eq(D.setLineQty(r.lines, 'AR-07|', 0)[0].qty, 1, 'quantidade mínima 1');
eq(D.setLineQty(r.lines, 'AR-07|', 2.7)[0].qty, 2, 'quantidade inteira');
// remover
cart = D.removeLine(cart, 'AR-03|M');
eq(cart.map(D.lineKey), ['AR-03|G', 'AR-01|40', 'AR-06|'], 'remover só a variação escolhida');
t = D.totals(cart); eq(t.subtotal, 8990 + 34990 + 3 * 12990, 'subtotal após remover');
// frete
t = D.totals([{ productId: 'AR-07', size: null, qty: 1 }]);
eq([t.subtotal, t.shipping, t.total, t.missingForFreeShipping], [6990, 2490, 9480, 22910], 'frete abaixo de R$ 299');
t = D.totals([{ productId: 'AR-04', size: 'M', qty: 3 }, { productId: 'AR-07', size: null, qty: 1 }]);
eq([t.subtotal, t.shipping], [30960, 0], 'frete grátis a partir de R$ 299 (R$ 309,60)');
t = D.totals([{ productId: 'AR-04', size: 'M', qty: 2 }, { productId: 'AR-03', size: 'M', qty: 1 }, { productId: 'AR-05', size: 'GG', qty: 0 }]);
eq(D.totals([]), { subtotal: 0, shipping: 0, total: 0, count: 0, missingForFreeShipping: 0 }, 'carrinho vazio sem frete');
eq(nb(D.formatCents(109920)), 'R$ 1.099,20', 'formatação');

// carrinho salvo
eq(D.restoreCart(null), { lines: [], dropped: 0, adjusted: 0, corrupted: false }, 'nada salvo');
eq(D.restoreCart('{isso não é json').corrupted, true, 'JSON corrompido');
eq(D.restoreCart('"texto"').corrupted, true, 'formato inesperado');
eq(D.restoreCart('{"a":1}').corrupted, true, 'objeto sem lista');
const saved = D.serializeCart([{ productId: 'AR-03', size: 'M', qty: 2 }, { productId: 'AR-06', size: null, qty: 1 }]);
eq(D.restoreCart(saved).lines, [{ productId: 'AR-03', size: 'M', qty: 2 }, { productId: 'AR-06', size: null, qty: 1 }], 'ida e volta');
ok(!saved.includes('price') && !saved.includes('8990'), 'carrinho salvo não guarda preço');
const tampered = JSON.stringify([
  { productId: 'AR-03', size: 'M', qty: 2, price: 1 },          // preço adulterado: ignorado
  { productId: 'AR-99', size: null, qty: 1 },                   // produto inexistente
  { productId: 'AR-01', size: '42', qty: 1 },                   // tamanho esgotado
  { productId: 'AR-01', size: 'XX', qty: 1 },                   // tamanho inexistente
  { productId: 'AR-06', size: null, qty: -3 },                  // quantidade negativa
  { productId: 'AR-06', size: null, qty: '2' },                 // quantidade em texto
  { productId: 'AR-07', size: null, qty: 999 },                 // acima do estoque
  { productId: 'AR-03', size: 'M', qty: 1 },                    // duplicado: soma
  null, 42, 'x',
]);
const rest = D.restoreCart(tampered);
eq(rest.lines, [{ productId: 'AR-03', size: 'M', qty: 3 }, { productId: 'AR-07', size: null, qty: 4 }], 'carrinho adulterado: só itens válidos, estoque respeitado, duplicados somados');
eq([rest.dropped, rest.adjusted, rest.corrupted], [8, 1, false], 'contagem de descartados e ajustados');
eq(D.totals(rest.lines).subtotal, 3 * 8990 + 4 * 6990, 'preço vem do catálogo, não do salvo');
eq(D.restoreCart(JSON.stringify({ lines: [{ productId: 'ar-06', size: '', qty: 1 }] })).lines, [{ productId: 'AR-06', size: null, qty: 1 }], 'aceita formato com "lines", id minúsculo e tamanho vazio');
ok(/^SIM-\d{8}-\d{6}$/.test(D.simulationCode(new Date(2026, 9, 20, 17, 5, 9))), 'código de simulação');
console.log(`\n${pass} passaram, ${fail} falharam`); if (fail) process.exit(1);
