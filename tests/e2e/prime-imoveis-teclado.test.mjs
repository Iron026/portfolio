import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const B = BASE;
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
const active = (p) => p.evaluate(() => { const a = document.activeElement; return (a?.id || a?.getAttribute('aria-label') || a?.dataset?.property || a?.textContent || '').trim().slice(0, 40); });
// -------- celular
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  p.on('pageerror', e => errs.push(e.message));
  for (const u of ['/demos/imoveis', '/demos/imoveis/PI-106', '/demos/imoveis/PI-111']) {
    await p.goto(B + u); await p.waitForTimeout(400);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= 390, `sem rolagem horizontal em ${u} (${sw}px)`);
  }
  await p.goto(B + '/demos/imoveis'); await p.waitForTimeout(300);
  ok(await p.isHidden('#pi-filtros'), 'celular: filtros recolhidos');
  await p.tap('button[aria-controls="pi-filtros"]'); await p.waitForTimeout(100);
  ok(await p.isVisible('#pi-filtros') && await p.getAttribute('button[aria-controls="pi-filtros"]', 'aria-expanded') === 'true', 'celular: abrir filtros');
  await p.selectOption('#pi-tipo', 'sobrado'); await p.waitForTimeout(150);
  ok((await p.textContent('button[aria-controls="pi-filtros"]')).includes('Filtros (1)'), 'contador de filtros no botão');
  ok((await p.$$('[data-property]')).length === 2, 'celular: filtro funciona');
  await p.tap('[data-property="PI-112"]'); await p.waitForTimeout(400);
  ok((await p.textContent('h1')) === 'Sobrado com escritório', 'celular: tocar no card abre detalhe');
  ok(await p.isVisible('text=Ver valores e consultar'), 'celular: preço e atalho logo abaixo do título');
  await p.tap('text=Ver valores e consultar'); await p.waitForTimeout(500);
  const top = await p.evaluate(() => Math.round(document.getElementById('pi-valores').getBoundingClientRect().top));
  ok(top >= -2 && top < 120, 'atalho rola até os valores: ' + top);
  await p.screenshot({ path: OUT + '/pi-m-valores.png' });
  await p.tap('text=Consultar imóvel'); await p.waitForTimeout(100);
  ok(await p.isVisible('textarea'), 'celular: consulta abre');
  await p.close();
}
// -------- teclado (desktop)
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(B + '/demos/imoveis'); await p.waitForTimeout(300);
  const order = [];
  for (let i = 0; i < 16; i++) { await p.keyboard.press('Tab'); order.push(await active(p)); }
  console.log('Tab:', order.join(' > '));
  ok(order.includes('pi-q') && order.includes('pi-tipo') && order.includes('pi-bairro'), 'busca e filtros alcançáveis por Tab');
  ok(order.indexOf('Comprar') < order.indexOf('pi-q'), 'ordem: finalidade antes da busca');
  // finalidade com Enter
  await p.focus('button[aria-pressed]:has-text("Alugar")'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok((await p.$$('[data-property]')).length === 6, 'Enter em "Alugar"');
  // quartos: radios com setas
  await p.focus('input[name="pi-quartos"][value="0"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150);
  ok(await p.isChecked('input[name="pi-quartos"][value="2"]') && (await p.$$('[data-property]')).length === 4, 'setas nos quartos (2+)');
  const focusRing = await p.evaluate(() => getComputedStyle(document.activeElement.nextElementSibling).outlineStyle);
  ok(focusRing !== 'none', 'foco visível nos chips de quartos: ' + focusRing);
  // select de preço pelo teclado
  await p.focus('#pi-preco'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150);
  ok((await p.inputValue('#pi-preco')) === 'a1' && (await p.$$('[data-property]')).length === 0, 'preço pelo teclado (até 2 mil e 2+ quartos → vazio)');
  // card com Enter
  await p.goto(B + '/demos/imoveis?q=varanda'); await p.waitForTimeout(300);
  await p.focus('[data-property="PI-104"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok((await p.textContent('h1')) === 'Apartamento com varanda gourmet', 'Enter no card abre detalhe');
  // galeria e consulta pelo teclado
  await p.focus('button[aria-label="Próxima imagem"]'); await p.keyboard.press('Enter');
  ok((await p.textContent('figcaption')).includes('2 de 4'), 'Enter no botão da galeria');
  await p.keyboard.press('ArrowRight'); ok((await p.textContent('figcaption')).includes('3 de 4'), 'setas na galeria');
  await p.focus('text=Consultar imóvel'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  ok((await active(p)) === 'Mensagem de consulta', 'Enter em Consultar → foco no painel');
  await p.keyboard.press('Tab'); ok((await p.evaluate(() => document.activeElement.getAttribute('autocomplete'))) === 'name', 'Tab segue para o nome');
  await p.keyboard.type('Bruno'); ok((await p.inputValue('textarea')).startsWith('Olá! Meu nome é Bruno.'), 'digitar atualiza mensagem');
  // voltar pelo teclado
  await p.focus('text=Voltar para os resultados'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok(new URL(p.url()).search === '?q=varanda' && (await active(p)) === 'PI-104', 'voltar pelo teclado devolve foco ao card');
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement.closest('.pi-card')).outlineStyle);
  ok(ring === 'solid', 'card focado tem contorno visível');
  await p.close();
}
console.log('erros:', errs); console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail || errs.length) process.exit(1);
