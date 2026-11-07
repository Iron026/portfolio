import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const B = BASE + '/demos/arena-store';
const KEY = 'arena-store:carrinho:v1';
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = []; const external = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => m.type() === 'error' && !/ERR_|fonts/.test(m.text()) && errs.push(m.text()));
p.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !/fonts\.(googleapis|gstatic)/.test(u)) external.push(u); });
const nb = (s) => (s || '').replace(/ /g, ' ').trim();
const badge = async () => nb(await p.textContent('[data-cart-count]'));
const txt = async (sel) => nb(await p.textContent(sel));
const stored = () => p.evaluate((k) => localStorage.getItem(k), KEY);
const cards = () => p.$$eval('[data-product]', a => a.map(x => x.dataset.product));

// vitrine
await p.goto(B); await p.waitForTimeout(400);
ok((await cards()).length === 8 && (await badge()) === '0', 'vitrine com 8 produtos e carrinho 0');
ok((await p.title()) === 'Arena Store: artigos esportivos | Alto Code', 'título');
ok(!(await p.$('header.fixed')), 'sem cabeçalho do portfólio');
await p.fill('#as-q', 'garrafa'); await p.waitForTimeout(100);
ok(JSON.stringify(await cards()) === '["AR-07"]' && (await txt('#as-contagem')) === '1 produto para “garrafa”', 'busca "garrafa"');
await p.fill('#as-q', 'tenis'); await p.waitForTimeout(100);
ok(JSON.stringify(await cards()) === '["AR-01","AR-08"]', 'busca sem acento "tenis"');
await p.fill('#as-q', 'skate'); await p.waitForTimeout(100);
ok((await cards()).length === 0 && (await p.textContent('main')).includes('Nenhum produto encontrado'), 'busca sem resultado → estado vazio');
await p.click('text=Ver todos os produtos'); await p.waitForTimeout(100);
ok((await cards()).length === 8 && (await p.inputValue('#as-q')) === '', 'limpar pelo estado vazio');
await p.click('button[aria-pressed]:has-text("Roupas")'); await p.waitForTimeout(100);
ok(JSON.stringify(await cards()) === '["AR-03","AR-04","AR-05"]' && (await p.textContent('h1')) === 'Roupas', 'filtro Roupas');
await p.selectOption('#as-ordem', 'menor-preco'); await p.waitForTimeout(100);
ok(JSON.stringify(await cards()) === '["AR-04","AR-03","AR-05"]', 'roupas por menor preço');
await p.reload(); await p.waitForTimeout(300);
ok(JSON.stringify(await cards()) === '["AR-04","AR-03","AR-05"]' && new URL(p.url()).search === '?categoria=roupas&ordem=menor-preco', 'filtros mantidos ao atualizar');
await p.click('nav[aria-label="Categorias"] >> text=Acessórios'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["AR-06","AR-07","AR-08"]', 'menu Acessórios');
ok((await p.textContent('article:has([data-product="AR-08"])')).includes('Esgotado'), 'mochila marcada como esgotada');

// produto com tamanho: sem tamanho → erro
await p.goto(B + '/produto/AR-03'); await p.waitForTimeout(300);
ok((await p.textContent('h1')) === 'Camisa Dry Treino' && (await p.textContent('main')).includes('R$') , 'página do produto');
await p.click('text=Adicionar ao carrinho'); await p.waitForTimeout(100);
ok((await txt('[role=status]')).includes('Escolha um tamanho') && (await badge()) === '0', 'sem tamanho: não adiciona e avisa');
ok(await p.evaluate(() => document.activeElement?.name) === 'as-tamanho', 'foco vai para os tamanhos');
// variação 1: M × 2
await p.click('label:has(input[value="M"])');
await p.click('button[aria-label="Aumentar quantidade de Camisa Dry Treino"]');
ok((await p.inputValue('#as-qtd')) === '2', 'quantidade 2 pelo +');
await p.click('text=Adicionar ao carrinho'); await p.waitForTimeout(80);
ok((await badge()) === '2', 'contador muda na hora: 2');
ok((await txt('[role=status]')).startsWith('2 unidades adicionadas: Camisa Dry Treino (tamanho M).'), 'mensagem de adição');
// variação 2: G × 1
await p.click('label:has(input[value="G"])'); await p.click('text=Adicionar ao carrinho'); await p.waitForTimeout(80);
ok((await badge()) === '3', 'segunda variação: contador 3');
// tamanho esgotado desabilitado
await p.goto(B + '/produto/AR-01'); await p.waitForTimeout(300);
ok(await p.isDisabled('input[name="as-tamanho"][value="42"]') && !(await p.isDisabled('input[name="as-tamanho"][value="40"]')), 'tênis tamanho 42 esgotado e desabilitado');
await p.click('label:has(input[value="43"])');
ok((await txt('fieldset')).includes('Última unidade'), 'estoque do tamanho 43: última unidade');
ok((await p.isDisabled('button[aria-label^="Aumentar quantidade"]')), 'não passa de 1 no tamanho com 1 unidade');
await p.click('text=Adicionar ao carrinho'); await p.waitForTimeout(80);
ok((await badge()) === '4' && await p.isDisabled('text=Adicionar ao carrinho'), 'tênis 43 adicionado; botão bloqueia pelo estoque');
ok((await p.textContent('main')).includes('1 unidade desta opção já no carrinho (limite do estoque)'), 'aviso de limite');
// produto sem tamanho: quantidade digitada acima do estoque é limitada
await p.goto(B + '/produto/AR-07'); await p.waitForTimeout(300);
await p.fill('#as-qtd', '10'); await p.waitForTimeout(50);
ok((await p.inputValue('#as-qtd')) === '4', 'quantidade digitada limitada ao estoque (4)');
await p.click('text=Adicionar ao carrinho'); await p.waitForTimeout(80);
ok((await badge()) === '8', '4 garrafas: contador 8');
// esgotado
await p.goto(B + '/produto/AR-08'); await p.waitForTimeout(300);
ok(!(await p.$('text=Adicionar ao carrinho')) && (await p.textContent('main')).includes('Este produto está esgotado'), 'produto esgotado sem botão de compra');

// carrinho
await p.click('header a[aria-label^="Carrinho"]'); await p.waitForTimeout(300);
ok((await p.getAttribute('header a[aria-label^="Carrinho"]', 'aria-label')) === 'Carrinho, 8 itens', 'rótulo acessível do contador');
const lineKeys = await p.$$eval('[data-line]', l => l.map(x => x.dataset.line));
ok(JSON.stringify(lineKeys) === '["AR-03|M","AR-03|G","AR-01|43","AR-07|"]', 'linhas por variação: ' + lineKeys);
// 2×89,90 + 89,90 + 349,90 + 4×69,90 = 179,80 + 89,90 + 349,90 + 279,60 = 899,20
ok((await txt('[data-subtotal]')) === 'R$ 899,20' && (await txt('[data-shipping]')) === 'Grátis' && (await txt('[data-total]')) === 'R$ 899,20', 'subtotal e total corretos (R$ 899,20)');
await p.click('[data-line="AR-03|M"] button[aria-label^="Aumentar"]'); await p.waitForTimeout(80);
ok((await txt('[data-line="AR-03|M"] [data-line-total]')) === 'R$ 269,70' && (await txt('[data-subtotal]')) === 'R$ 989,10' && (await badge()) === '9', 'aumentar no carrinho atualiza linha, subtotal e contador');
ok(await p.isDisabled('[data-line="AR-07|"] button[aria-label^="Aumentar"]'), 'garrafa no limite do estoque');
await p.click('[data-line="AR-03|M"] button[aria-label^="Diminuir"]'); await p.waitForTimeout(80);
ok((await txt('[data-subtotal]')) === 'R$ 899,20', 'diminuir');
await p.click('button[aria-label="Remover Tênis Corrida Leve, tamanho 43"]'); await p.waitForTimeout(80);
ok((await badge()) === '7' && (await txt('[data-subtotal]')) === 'R$ 549,30' && (await txt('[role=status]')).includes('removido'), 'remover atualiza contador e subtotal (R$ 549,30)');
const savedNow = await stored();
ok(savedNow === '[{"productId":"AR-03","size":"M","qty":2},{"productId":"AR-03","size":"G","qty":1},{"productId":"AR-07","size":null,"qty":4}]', 'localStorage só com produto, tamanho e quantidade');
// atualizar a página
await p.reload(); await p.waitForTimeout(300);
ok((await badge()) === '7' && (await txt('[data-subtotal]')) === 'R$ 549,30', 'atualizar a página recupera o carrinho');
// abrir em outra aba (mesmo navegador)
const p2 = await ctx.newPage(); await p2.goto(B); await p2.waitForTimeout(300);
ok(nb(await p2.textContent('[data-cart-count]')) === '7', 'outra aba vê o mesmo carrinho');
await p2.close();
// frete abaixo de R$ 299
await p.click('[data-line="AR-07|"] button[aria-label^="Remover"]'); await p.waitForTimeout(80);
ok((await txt('[data-subtotal]')) === 'R$ 269,70' && (await txt('[data-shipping]')) === 'R$ 24,90' && (await txt('[data-total]')) === 'R$ 294,60', 'frete fictício abaixo de R$ 299 (269,70 + 24,90)');
ok((await p.textContent('main')).replace(/ /g, ' ').includes('Faltam R$ 29,30 para o frete grátis'), 'quanto falta para frete grátis');

// carrinho adulterado: preço falso e itens inválidos
await p.evaluate((k) => localStorage.setItem(k, JSON.stringify([
  { productId: 'AR-06', size: null, qty: 2, price: 1, name: 'Bola grátis' },
  { productId: 'AR-99', size: null, qty: 1 }, { productId: 'AR-05', size: 'P', qty: 1 }, { productId: 'AR-07', size: null, qty: 50 },
])), KEY);
await p.reload(); await p.waitForTimeout(300);
ok((await txt('[data-subtotal]')) === 'R$ 539,40' && (await badge()) === '6', 'preço do catálogo, não do salvo (2×129,90 + 4×69,90 = 539,40)');
const notice = await txt('header + div[role=status]');
ok(notice.includes('2 itens salvos foram removidos') && notice.includes('1 quantidade foi ajustada'), 'aviso de recuperação: ' + notice);
ok(!(await p.textContent('main')).includes('Bola grátis'), 'nome adulterado ignorado');
await p.click('button[aria-label="Fechar aviso"]'); ok(!(await p.$('header + div[role=status]')), 'fechar aviso');
// JSON corrompido
await p.evaluate((k) => localStorage.setItem(k, '{carrinho quebrado'), KEY);
await p.reload(); await p.waitForTimeout(300);
ok((await badge()) === '0' && (await txt('header + div[role=status]')).includes('foi reiniciado') && (await p.textContent('h1')) === 'Seu carrinho está vazio', 'JSON corrompido: carrinho reiniciado com aviso');
ok((await stored()) === null, 'dado corrompido removido do armazenamento');

// checkout simulado
await p.goto(B + '/produto/AR-06'); await p.waitForTimeout(300);
await p.click('button[aria-label^="Aumentar"]'); await p.click('text=Adicionar ao carrinho');
await p.goto(B + '/produto/AR-04'); await p.waitForTimeout(300); await p.click('label:has(input[value="GG"])'); await p.click('text=Adicionar ao carrinho');
await p.goto(B + '/carrinho'); await p.waitForTimeout(300);
const cartTotal = await txt('[data-total]');
ok(cartTotal === 'R$ 339,70', 'total antes do checkout (2×129,90 + 79,90)');
await p.click('text=Ir para o checkout simulado'); await p.waitForTimeout(300);
ok((await p.$$('main input[type=text], main input[type=email], main input[type=tel], main input:not([type])')).length === 0, 'checkout não pede dados pessoais nem de cartão');
await p.click('button:has-text("Simular compra")'); await p.waitForTimeout(100);
ok((await p.textContent('#as-ciente-erro')).includes('Confirme') && await p.evaluate(() => document.activeElement?.id) === 'as-ciente' && (await badge()) === '3', 'exige confirmação de que é simulação');
await p.check('#as-ciente'); await p.click('label:has-text("Boleto (simulado)")');
ok((await txt('button:has-text("Simular compra")')) === 'Simular compra de R$ 339,70', 'botão mostra o total');
await p.click('button:has-text("Simular compra")'); await p.waitForTimeout(200);
ok((await p.textContent('h1')) === 'Compra simulada: nenhum pagamento foi realizado' && await p.evaluate(() => document.activeElement?.tagName) === 'H1', 'confirmação visível e focada');
ok((await txt('[data-receipt-total]')) === 'R$ 339,70' && (await p.textContent('main')).includes('Boleto (simulado)') && /SIM-\d{8}-\d{6}/.test(await p.textContent('main')), 'resumo da simulação');
ok((await badge()) === '0' && (await stored()) === null, 'carrinho esvaziado após simular');
ok(!/pedido confirmado|pagamento aprovado|compra realizada|pedido enviado/i.test(await p.textContent('main')), 'sem frases de compra real');
await p.click('text=Voltar para a loja'); await p.waitForTimeout(200);
ok(new URL(p.url()).pathname === '/demos/arena-store', 'voltar para a loja');
await p.goto(B + '/checkout'); await p.waitForTimeout(200);
ok((await p.textContent('h1')) === 'Não há itens para o checkout', 'checkout sem itens');
// esvaziar com confirmação
await p.goto(B + '/produto/AR-06'); await p.waitForTimeout(200); await p.click('text=Adicionar ao carrinho');
await p.goto(B + '/carrinho'); await p.waitForTimeout(200);
await p.click('text=Esvaziar carrinho'); await p.click('text=Cancelar');
ok((await badge()) === '1', 'cancelar esvaziar');
await p.click('text=Esvaziar carrinho'); await p.click('text=Sim, esvaziar'); await p.waitForTimeout(80);
ok((await badge()) === '0' && (await p.textContent('h1')) === 'Seu carrinho está vazio', 'esvaziar carrinho');
// rotas
await p.goto(B + '/produto/AR-99'); await p.waitForTimeout(200); ok((await p.textContent('h1')) === 'Produto não encontrado', 'produto inexistente');
await p.goto(B + '/produto/ar-02'); await p.waitForTimeout(200); ok((await p.textContent('h1')) === 'Chuteira Society Pro', 'código em minúsculas');
await p.goto(B + '/qualquer'); await p.waitForTimeout(200); ok((await p.textContent('h1')) === 'Esta página não existe', 'rota inválida → 404 do portfólio');
await p.goto(B); await p.waitForTimeout(200);
await p.click('nav[aria-label="Você está em"] >> text=Projetos'); await p.waitForTimeout(1500);
ok(new URL(p.url()).pathname === '/' && p.url().endsWith('#projetos'), 'voltar para Alto Code / Projetos');
await p.goto(B); await p.click('text=Ver detalhes do projeto'); await p.waitForTimeout(300);
ok(new URL(p.url()).pathname === '/projetos/arena-store', 'Ver detalhes do projeto');
ok(external.length === 0, 'nenhuma requisição externa (sem pagamento/API): ' + external.join(', '));

// celular e teclado
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on('pageerror', e => errs.push(e.message));
await m.goto(B + '/produto/AR-03'); await m.waitForTimeout(200);
await m.evaluate((k) => localStorage.setItem(k, '[{"productId":"AR-03","size":"M","qty":1},{"productId":"AR-07","size":null,"qty":1}]'), KEY);
for (const path of ['', '/produto/AR-03', '/carrinho', '/checkout']) for (const w of [320, 390]) {
  await m.setViewportSize({ width: w, height: 800 }); await m.goto(B + path); await m.waitForTimeout(250);
  const sw = await m.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= w, `sem rolagem horizontal em ${path || '/'} a ${w}px (${sw})`);
}
await m.setViewportSize({ width: 390, height: 844 }); await m.goto(B + '/produto/AR-04'); await m.waitForTimeout(200);
await m.focus('input[name="as-tamanho"][value="P"]'); await m.keyboard.press('ArrowRight'); await m.keyboard.press('ArrowRight');
ok(await m.isChecked('input[name="as-tamanho"][value="G"]'), 'tamanhos com setas do teclado');
await m.keyboard.press('Tab'); await m.keyboard.press('Tab'); await m.keyboard.press('Enter');
ok((await m.inputValue('#as-qtd')) === '2', 'Tab até o + e Enter aumenta a quantidade');
await m.focus('text=Adicionar ao carrinho'); await m.keyboard.press('Enter'); await m.waitForTimeout(80);
ok(nb(await m.textContent('[data-cart-count]')) === '4', 'adicionar pelo teclado no celular');
console.log('erros:', errs); console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail || errs.length) process.exit(1);
