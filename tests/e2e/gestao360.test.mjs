import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
import fs from 'node:fs';
const out = OUT; const base = BASE;
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
async function run(viewport, tag) {
  const ctx = await b.newContext({ viewport, acceptDownloads: true, timezoneId: 'America/Sao_Paulo' });
  await ctx.addInitScript(() => { const T = new Date(2026, 9, 20, 10).getTime(); const O = Date; globalThis.Date = class extends O { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(`${tag}: ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|TUNNEL|ERR_NAME_NOT_RESOLVED/.test(m.text())) errs.push(`${tag}: ${m.text()}`); });
  await p.goto(base + '/demos/gestao360'); await p.waitForTimeout(600);
  const kpi = async () => p.$$eval('[data-kpi]', els => Object.fromEntries(els.map(e => [e.dataset.kpi, e.textContent.replace(/\s/g, ' ')])));
  const paths = async () => p.$$eval('.g360-panel-trend svg path', ps => ps.map(x => x.getAttribute('d')).join('|'));
  return { ctx, p, kpi, paths };
}
// ---------- desktop
{
  const { ctx, p, kpi, paths } = await run({ width: 1440, height: 900 }, 'desktop');
  ok((await p.textContent('h1')).includes('Gestão360'), 'carrega pela URL direta');
  ok(!(await p.$('header.fixed')), 'sem cabeçalho do portfólio duplicado');
  ok((await p.title()).startsWith('Gestão360'), 'título da aba');
  let k = await kpi(); console.log('90d', k);
  ok(k['Receitas'] === 'R$ 93.420,00' && k['Despesas'] === 'R$ 51.912,30' && k['Resultado'] === 'R$ 41.507,70' && k['Transações'] === '60', 'KPIs 90 dias batem com o teste de cálculo');
  await p.screenshot({ path: out + '/g360-desktop.png', fullPage: true });
  const p90 = await paths();
  await p.selectOption('#g360-period', '30d'); await p.waitForTimeout(150);
  k = await kpi(); console.log('30d', k);
  ok(k['Receitas'] === 'R$ 31.140,00' && k['Despesas'] === 'R$ 18.358,10' && k['Transações'] === '20', 'KPIs 30 dias (conferido à mão)');
  ok((await paths()) !== p90, 'gráfico de evolução muda com o período');
  ok((await p.textContent('.g360-panel-trend p')).includes('semana'), '30 dias agrupa por semana');
  const axis30 = await p.$$eval('.g360-panel-trend text', t => t.map(x => x.textContent));
  console.log('eixo 30d', axis30.join(' '));
  await p.selectOption('#g360-period', '365d'); await p.waitForTimeout(150);
  k = await kpi(); ok(k['Transações'] === '244' && k['Receitas'] === 'R$ 380.448,00', '12 meses');
  // tipo
  const donutBefore = await p.$$eval('.g360-pie-chart path', x => x.length);
  await p.selectOption('#g360-kind', 'receita'); await p.waitForTimeout(150);
  k = await kpi(); ok(k['Despesas'] === 'R$ 0,00' && k['Transações'] === '122', 'apenas receitas');
  ok((await p.textContent('.g360-chart-grid')).includes('"Apenas receitas" está ativo'), 'estado vazio do gráfico de categorias');
  const catOptions = await p.$$eval('#g360-cat option', o => o.map(x => x.textContent));
  ok(!catOptions.includes('Pessoal') && catOptions.includes('Produtos'), 'categorias do filtro acompanham o tipo');
  // categoria
  await p.selectOption('#g360-kind', 'todos');
  await p.selectOption('#g360-cat', 'Pessoal'); await p.waitForTimeout(150);
  k = await kpi(); ok(k['Receitas'] === 'R$ 0,00' && Number(k['Transações']) > 0, 'categoria Pessoal');
  const rowsCat = await p.$$eval('.g360-table-scroll tbody tr td:nth-child(3)', t => [...new Set(t.map(x => x.textContent))]);
  ok(rowsCat.length === 1 && rowsCat[0] === 'Pessoal', 'tabela só com Pessoal');
  ok((await p.$$eval('.g360-legend li', l => l.length)) === 1, 'rosca com 1 categoria');
  ok((await p.$$('.g360-pie-chart circle')).length === 1, 'rosca de 1 fatia desenhada como anel');
  // tipo despesa mantém categoria Pessoal, tipo receita a descarta
  await p.selectOption('#g360-kind', 'receita'); await p.waitForTimeout(100);
  ok((await p.inputValue('#g360-cat')) === 'todas', 'trocar para receitas descarta categoria de despesa');
  // busca
  await p.click('text=Limpar filtros');
  await p.fill('#g360-search', 'servicos'); await p.waitForTimeout(150);
  const desc = await p.$$eval('.g360-table-scroll tbody tr', rs => rs.map(r => r.cells[1].textContent + ' ' + r.cells[2].textContent));
  ok(desc.length > 0 && desc.every(d => /serviç/i.test(d)), 'busca sem acento encontra "Serviços" (descrição ou categoria)');
  await p.fill('#g360-search', 'nada-encontrado'); await p.waitForTimeout(150);
  ok((await p.textContent('.g360-table-scroll tbody')).includes('Nenhuma transação encontrada'), 'estado sem resultados na tabela');
  ok(await p.isDisabled('.g360-export'), 'exportar desabilitado sem resultados');
  ok((await p.textContent('#g360-export-help')).includes('Nenhuma transação'), 'explicação da exportação vazia');
  ok((await kpi())['Transações'] === '0', 'KPI zero sem resultados');
  ok((await p.textContent('.g360-panel-trend')).includes('Nenhum dado'), 'gráfico de evolução vazio');
  await p.click('tbody >> text=Limpar filtros'); await p.waitForTimeout(150);
  ok((await kpi())['Transações'] === '60', 'limpar filtros pela tabela vazia');
  // paginação
  ok((await p.textContent('.g360-pagination')).includes('Exibindo 1 a 9 de 60'), 'paginação inicial');
  await p.click('text=Próxima'); await p.waitForTimeout(100);
  ok((await p.textContent('.g360-pagination')).includes('Exibindo 10 a 18 de 60') && (await p.textContent('.g360-pagination')).includes('Página 2 de 7'), 'próxima página');
  for (let i = 0; i < 6; i++) await p.click('text=Próxima').catch(() => {});
  ok((await p.textContent('.g360-pagination')).includes('Exibindo 55 a 60') && await p.isDisabled('text=Próxima'), 'última página');
  await p.selectOption('#g360-period', '30d'); await p.waitForTimeout(100);
  ok((await p.textContent('.g360-pagination')).includes('Página 1 de 3'), 'filtro volta para página 1');
  // CSV do conjunto filtrado
  await p.selectOption('#g360-cat', 'Fornecedores'); await p.waitForTimeout(100);
  const expected = (await kpi())['Transações'];
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.g360-export')]);
  const csvPath = out + '/' + dl.suggestedFilename(); await dl.saveAs(csvPath);
  const buf = fs.readFileSync(csvPath);
  ok(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, 'CSV com BOM UTF-8');
  const lines = buf.toString('utf8').slice(1).split('\r\n').filter(Boolean);
  ok(lines.length - 1 === Number(expected), `CSV tem ${lines.length - 1} linhas = ${expected} do filtro`);
  ok(lines.slice(1).every(l => l.includes('"Fornecedores"')), 'CSV só com o filtro atual');
  ok(dl.suggestedFilename() === 'gestao360-transacoes-2026-10-20.csv', 'nome do arquivo');
  ok((await p.textContent('[role=status]')).includes(`${expected} transações do filtro atual`), 'mensagem após exportar');
  console.log('CSV:', lines.slice(0, 3).join(' || '));
  // tooltip por teclado
  await p.click('text=Limpar filtros');
  await p.focus('.g360-chart-area'); await p.keyboard.press('Home'); await p.waitForTimeout(100);
  const tip = await p.textContent('.g360-tooltip').catch(() => '');
  ok(tip.includes('20/07 (parcial)') && tip.includes('Receitas'), 'tooltip via teclado: ' + tip);
  await p.keyboard.press('ArrowRight'); ok((await p.textContent('.g360-tooltip')).includes('27/07'), 'seta direita avança');
  // tooltip por mouse
  const box = await (await p.$('.g360-panel-trend svg rect')).boundingBox();
  await p.mouse.move(box.x + box.width - 2, box.y + 20); await p.waitForTimeout(80);
  ok((await p.textContent('.g360-tooltip')).includes('19/10'), 'tooltip via mouse');
  // tabela acessível do gráfico
  ok((await p.$$eval('.g360-trend table tbody tr', r => r.length)) === 14, 'tabela alternativa do gráfico (14 semanas)');
  ok((await p.textContent('.g360-chart-note')).includes('20/07 e 19/10'), 'nota de pontos parciais');
  // navegação de volta
  await p.click('.g360-back'); await p.waitForTimeout(300);
  ok(new URL(p.url()).pathname === '/projetos/gestao360' && (await p.textContent('h1')) === 'Gestão360', 'Ver detalhes do projeto → /projetos/gestao360');
  await p.goBack(); await p.waitForTimeout(300);
  await p.click('.g360-top-kicker >> text=Projetos'); await p.waitForTimeout(500);
  ok((new URL(p.url()).pathname === '/' && new URL(p.url()).hash === '#projetos') && (await p.$('#projetos')), 'breadcrumb Projetos → seção projetos');
  await ctx.close();
}
// ---------- mobile
{
  const { ctx, p } = await run({ width: 390, height: 844 }, 'mobile');
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 390, `sem rolagem horizontal no celular (${sw}px)`);
  await p.screenshot({ path: out + '/g360-mobile.png', fullPage: true });
  // tab order
  const order = [];
  for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => (document.activeElement?.id || document.activeElement?.textContent || '').trim().slice(0, 28))); }
  console.log('Tab:', order.join(' > '));
  ok(order.includes('g360-period') && order.includes('g360-search'), 'filtros alcançáveis pelo teclado');
  await ctx.close();
}
console.log('erros de console:', errs);
console.log(`\n${pass} passaram, ${fail} falharam`);
await b.close();
if (fail || errs.length) process.exit(1);
