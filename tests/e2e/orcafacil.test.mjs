import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const B = BASE;
const KEY = 'orcafacil:catalogo:v1';
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = []; const external = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
await ctx.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/ERR_|fonts/.test(m.text()) && errs.push(m.text()));
p.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !/fonts\.(googleapis|gstatic)/.test(u)) external.push(u); });
const nb = (s) => (s || '').replace(/ /g, ' ').trim();
const t = async (sel) => nb(await p.textContent(sel));
const qty = 'input[id$="-qtd"]', item = 'select[id$="-item"]', disc = 'input[id$="-desconto"]';
const add = async (id, q, m, a, pr) => {
  await p.selectOption(item, id); await p.fill(qty, q);
  for (const label of [m, a, pr]) await p.click(`fieldset label:has-text("${label}")`);
  await p.click('button:has-text("Adicionar ao orçamento")'); await p.waitForTimeout(60);
};

await p.goto(B + '/demos/orcafacil'); await p.waitForTimeout(400);
ok((await p.title()) === 'OrçaFácil: calculadora de orçamentos | Alto Code', 'título');
ok((await p.$$(`${item} option`)).length === 6, 'catálogo de exemplo com 6 itens');
ok(await p.isDisabled('button:has-text("Imprimir ou salvar em PDF")') && await p.isDisabled('button:has-text("Copiar resumo")'), 'sem itens: imprimir e copiar desabilitados');
ok((await p.textContent('main')).includes('Nenhum item ainda'), 'estado vazio');

// quantidades inválidas
await p.selectOption(item, 'cartao');
for (const [raw, msg] of [['', 'Informe a quantidade'], ['0', 'maior que zero'], ['-3', 'negativa'], ['2,5', 'número inteiro'], ['abc', 'número inteiro'], ['1001', 'máxima']]) {
  await p.fill(qty, raw); ok((await t('[data-preview-total]')) === 'Sem valor', `prévia vazia com "${raw}"`);
  await p.click('button:has-text("Adicionar ao orçamento")'); await p.waitForTimeout(50);
  const err = await t('p[id$="-qtd-erro"]');
  ok(err.includes(msg) && (await p.$$('[data-quote-line]')).length === 0 && await p.evaluate(() => document.activeElement?.id?.endsWith('-qtd')), `quantidade "${raw}" rejeitada: ${err}`);
}
await p.selectOption(item, 'banner');
for (const raw of ['2,555', '501', '0,00']) { await p.fill(qty, raw); await p.click('button:has-text("Adicionar ao orçamento")'); await p.waitForTimeout(40); ok((await p.$$('[data-quote-line]')).length === 0, `m² inválido "${raw}"`); }

// produtos distintos e combinações (valores conferidos à mão no teste unitário)
await add('cartao', '2', 'Premium', 'Especial', 'Urgente');
ok((await t('[data-quote-line] [data-line-total]')) === 'R$ 390,50', 'cartão premium/especial/urgente = R$ 390,50');
await add('banner', '2,5', 'Ecológico', 'Simples', 'Rápido');
await add('cardapio', '120', 'Padrão', 'Sem acabamento', 'Normal');
const totals = await p.$$eval('[data-line-total]', e => e.map(x => x.textContent.replace(/ /g, ' ')));
ok(JSON.stringify(totals) === '["R$ 390,50","R$ 236,42","R$ 780,00"]', 'três produtos distintos: ' + totals);
ok((await t('[data-subtotal]')) === 'R$ 1.406,92' && (await t('[data-total]')) === 'R$ 1.406,92', 'desconto 0%: total R$ 1.406,92');
// prévia ao vivo antes de adicionar
await p.selectOption(item, 'placa'); await p.fill(qty, '1'); await p.click('fieldset label:has-text("Premium")'); await p.click('fieldset label:has-text("Especial")'); await p.click('fieldset label:has-text("Urgente")');
// 118,00 × 1,30 = 153,40; +25% = 38,35 → 191,75; ×1 = 191,75; +35% = 67,1125 → 67,11; total 258,86
ok((await t('[data-preview-total]')) === 'R$ 258,86', 'prévia da combinação máxima na placa');
await p.click('fieldset label:has-text("Padrão")'); await p.click('fieldset label:has-text("Sem acabamento")'); await p.click('fieldset label:has-text("Normal")');
ok((await t('[data-preview-total]')) === 'R$ 118,00', 'prévia da combinação básica na placa');
// cálculo detalhado
await p.click('[data-quote-line] >> nth=1 >> summary');
const steps = await t('[data-quote-line] >> nth=1 >> dl');
ok(steps.includes('R$ 65,00') && steps.includes('R$ 74,75') && steps.includes('+R$ 7,48') && steps.includes('R$ 82,23') && steps.includes('R$ 205,58') && steps.includes('+R$ 30,84') && steps.includes('R$ 236,42'), 'cálculo detalhado do banner');

// descontos
await p.fill(disc, '10'); await p.waitForTimeout(50);
ok((await t('[data-discount]')) === '−R$ 140,69' && (await t('[data-total]')) === 'R$ 1.266,23', 'desconto 10%');
await p.fill(disc, '45,5'); await p.waitForTimeout(50);
ok((await t('[data-total]')) === 'R$ 766,77' && (await t('p[id$="-desconto-msg"]')).includes('acima de 30%'), 'desconto elevado 45,5% com aviso (1.406,92 − 640,15)');
await p.fill(disc, '100'); await p.waitForTimeout(50);
ok((await t('[data-total]')) === 'R$ 0,00', 'desconto 100% = R$ 0,00');
for (const raw of ['-5', '120', 'dez', '7,555']) {
  await p.fill(disc, raw); await p.waitForTimeout(40);
  ok((await t('[data-total]')) === 'Não calculado' && await p.isDisabled('button:has-text("Imprimir ou salvar em PDF")') && (await p.getAttribute(disc, 'aria-invalid')) === 'true', `desconto inválido "${raw}" bloqueia a proposta`);
}
await p.fill(disc, '0'); await p.waitForTimeout(40);
ok((await t('[data-discount]')) === 'R$ 0,00' && (await t('[data-total]')) === 'R$ 1.406,92', 'voltar para 0%');
await p.fill(disc, '10');
// validade
await p.fill('input[id$="-validade"]', '0'); ok(await p.isDisabled('button:has-text("Copiar resumo")'), 'validade 0 inválida');
await p.fill('input[id$="-validade"]', '15');
// remover
await p.click('button[aria-label="Remover linha 3: Cardápio A4"]'); await p.waitForTimeout(50);
ok((await p.$$('[data-quote-line]')).length === 2 && (await t('[data-subtotal]')) === 'R$ 626,92' && (await t('[data-total]')) === 'R$ 564,23', 'remover linha recalcula (R$ 564,23)');

// proposta, resumo e impressão
await p.fill('input[id$="-cliente"]', 'Padaria Sol'); await p.fill('input[id$="-obs"]', 'Arte enviada pelo cliente');
ok((await t('[data-doc-total] >> nth=0')) === 'R$ 564,23', 'pré-visualização com o mesmo total');
await p.click('button:has-text("Copiar resumo")'); await p.waitForTimeout(80);
const clip = nb(await p.evaluate(() => navigator.clipboard.readText()));
ok(clip.includes('Cliente: Padaria Sol') && clip.includes('Validade: 15 dias') && clip.includes('Desconto (10%): −R$ 62,69') && clip.includes('Total: R$ 564,23') && clip.endsWith('Observações: Arte enviada pelo cliente') && !/\n\n\n/.test(clip), 'resumo copiado');
await p.click('button:has-text("Imprimir ou salvar em PDF")');
ok((await p.evaluate(() => window.__prints)) === 1, 'botão chama window.print()');
await p.emulateMedia({ media: 'print' });
const printState = await p.evaluate(() => ({ root: getComputedStyle(document.getElementById('root')).display, doc: getComputedStyle(document.querySelector('.orca-print-root')).display, text: document.querySelector('.orca-print-root').textContent }));
ok(printState.root === 'none' && printState.doc === 'block', 'na impressão só a proposta aparece');
ok(nb(printState.text).includes('Proposta comercial') && nb(printState.text).includes('R$ 564,23') && printState.text.includes('Padaria Sol') && printState.text.includes('fictícios'), 'proposta impressa com total e aviso');
await p.pdf({ path: OUT + '/orca-teste.pdf', format: 'A4' });
await p.emulateMedia({ media: 'screen' });
ok(await p.evaluate(() => getComputedStyle(document.querySelector('.orca-print-root')).display) === 'none', 'cópia de impressão escondida na tela');

// catálogo: cadastrar, editar, persistir
await p.click('button:has-text("Novo item")');
await p.fill('input[id$="-nome"]', 'Caneca personalizada'); await p.selectOption('select[id$="-unidade"]', 'unidade'); await p.fill('input[id$="-preco"]', 'abc');
await p.click('button:has-text("Adicionar ao catálogo")'); ok((await t('p[id$="-preco-erro"]')).includes('89,90'), 'preço inválido no cadastro');
await p.fill('input[id$="-preco"]', '32,90'); await p.click('button:has-text("Adicionar ao catálogo")'); await p.waitForTimeout(50);
ok((await p.$$(`${item} option`)).length === 7, 'item cadastrado aparece na calculadora');
await add('item-' , '3', 'Padrão', 'Sem acabamento', 'Normal').catch(() => {});
const caneca = await p.$eval(item, (s) => [...s.options].find(o => o.textContent.startsWith('Caneca'))?.value);
await add(caneca, '3', 'Padrão', 'Sem acabamento', 'Normal');
ok((await p.$$eval('[data-line-total]', e => e.map(x => x.textContent.replace(/ /g, ' ')))).includes('R$ 98,70'), 'item novo calculado (3 × 32,90)');
await p.click('button[aria-label="Editar Caneca personalizada"]'); await p.fill('input[id$="-preco"]', '35'); await p.click('button:has-text("Salvar alterações")'); await p.waitForTimeout(50);
ok((await p.$$eval('[data-line-total]', e => e.map(x => x.textContent.replace(/ /g, ' ')))).includes('R$ 105,00'), 'editar preço recalcula a linha');
await p.reload(); await p.waitForTimeout(400);
ok((await p.$$(`${item} option`)).length === 7 && (await p.$$('[data-quote-line]')).length === 0, 'catálogo persiste ao atualizar; orçamento não é guardado');
ok((await p.textContent('main')).includes('não sincroniza com outros dispositivos'), 'explica que não sincroniza');
for (let i = 0; i < 3; i++) { await p.click('button:has-text("Novo item")'); await p.fill('input[id$="-nome"]', 'Extra ' + i); await p.fill('input[id$="-preco"]', '10'); await p.click('button:has-text("Adicionar ao catálogo")'); await p.waitForTimeout(30); }
ok(await p.isDisabled('button:has-text("Novo item")') && (await p.textContent('main')).includes('limite de 10 itens'), 'limite de 10 itens');
await p.click('text=Restaurar catálogo de exemplo'); await p.click('button:has-text("Restaurar")'); await p.waitForTimeout(50);
ok((await p.$$(`${item} option`)).length === 6, 'restaurar exemplo');
await p.evaluate((k) => localStorage.setItem(k, '{quebrado'), KEY); await p.reload(); await p.waitForTimeout(300);
ok((await p.textContent('main')).includes('não pôde ser lido') && (await p.$$(`${item} option`)).length === 6, 'catálogo corrompido: aviso e exemplo');
ok(external.length === 0, 'nenhuma requisição externa: ' + external.join(', '));

// navegação e portfólio
await p.click('nav[aria-label="Você está em"] >> text=Projetos'); await p.waitForTimeout(1500);
ok(new URL(p.url()).pathname === '/' && p.url().endsWith('#projetos'), 'voltar para Alto Code / Projetos');
const cards = await p.$$eval('#projetos article h3', h => h.map(x => x.textContent));
ok(JSON.stringify(cards) === '["Prime Imóveis","Gestão360","Nova Serviços","Arena Store","OrçaFácil"]', 'cinco projetos, os quatro anteriores preservados: ' + cards);
const orcaArt = p.locator('article', { has: p.locator('h3', { hasText: 'OrçaFácil' }) });
ok(await orcaArt.getByRole('link', { name: 'Testar demonstração' }).getAttribute('href') === '/demos/orcafacil' && await orcaArt.getByRole('link', { name: 'Estudo de caso', exact: true }).getAttribute('href') === '/projetos/orcafacil', 'cartão do OrçaFácil com os dois botões');
ok((await orcaArt.textContent()).includes('Projeto demonstrativo'), 'selo de projeto demonstrativo');
await orcaArt.locator('img').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
const cap = await orcaArt.locator('img').first().evaluate(i => [i.complete && i.naturalWidth > 0, i.getAttribute('src'), i.alt]);
ok(cap[0] && cap[1].startsWith('/projetos/orcafacil/tela-1') && cap[2].includes('OrçaFácil'), 'captura real do OrçaFácil no cartão');
ok((await p.textContent('footer')).includes('OrçaFácil'), 'rodapé lista o OrçaFácil');
await p.goto(B + '/projetos/orcafacil'); await p.waitForTimeout(300);
const det = await p.textContent('main');
ok((await p.textContent('h1')) === 'OrçaFácil' && det.includes('Testar demonstração') && det.includes('Proposta para imprimir ou salvar em PDF pelo navegador') && !/gerador de PDF/i.test(det), 'página de detalhes coerente');
await p.reload(); await p.waitForTimeout(300); ok((await p.textContent('h1')) === 'OrçaFácil', 'atualizar /projetos/orcafacil');
await p.goto(B + '/demos/orcafacil'); await p.reload(); await p.waitForTimeout(300);
ok((await p.textContent('h1')).startsWith('Orçamentos padronizados'), 'URL direta /demos/orcafacil');
// impressão fora do OrçaFácil não é afetada
await p.goto(B + '/'); await p.waitForTimeout(300); await p.emulateMedia({ media: 'print' });
const outside = await p.evaluate(() => ({ root: getComputedStyle(document.getElementById('root')).display, cls: document.body.classList.contains('orca-page'), portal: !!document.querySelector('.orca-print-root') }));
ok(outside.root !== 'none' && !outside.cls && !outside.portal, 'regras de impressão não valem fora do OrçaFácil: ' + JSON.stringify(outside));
await p.emulateMedia({ media: 'screen' });

// celular e teclado
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on('pageerror', e => errs.push(e.message));
for (const w of [320, 390]) { await m.setViewportSize({ width: w, height: 800 }); await m.goto(B + '/demos/orcafacil'); await m.waitForTimeout(300);
  await m.click('button:has-text("Adicionar ao orçamento")'); await m.waitForTimeout(80);
  const sw = await m.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `sem rolagem horizontal a ${w}px (${sw})`); }
await m.setViewportSize({ width: 390, height: 844 });
await m.focus('input[name$="-material"][value="padrao"]'); await m.keyboard.press('ArrowRight'); await m.keyboard.press('ArrowRight');
ok(await m.isChecked('input[name$="-material"][value="premium"]'), 'variáveis com setas do teclado');
const ring = await m.evaluate(() => getComputedStyle(document.activeElement.nextElementSibling).outlineStyle); ok(ring !== 'none', 'foco visível nas opções');
await m.focus('button:has-text("Adicionar ao orçamento")'); await m.keyboard.press('Enter'); await m.waitForTimeout(60);
ok((await m.$$('[data-quote-line]')).length === 2, 'adicionar pelo teclado');
console.log('erros:', errs); console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail || errs.length) process.exit(1);
