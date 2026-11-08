// Site bilíngue: rotas em inglês, seletor PT/EN mantendo a página, idioma do documento,
// canonical/hreflang, ausência de português nas páginas em inglês e nenhum redirecionamento forçado.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];

// Nomes próprios que ficam em português de propósito (marca, projetos, empresas e lugares fictícios, produtos).
const NAMES = [
  'Alto Code', 'Iron Cruz', 'Prime Imóveis', 'Gestão360', 'Nova Serviços', 'Arena Store', 'OrçaFácil', 'Ponto Gráfico', 'Nova Aurora',
  'Análise e Desenvolvimento de Software', 'Caixa em Dia', 'FluxoPronto', 'Pituba',
];
// Palavras comuns do português que não deveriam aparecer em texto em inglês.
const PT = /\b(você|não|para|com|está|são|uma|seu|sua|seus|suas|também|então|pelo|pela|até|após|sobre|quando|como|mais|todos|nenhum|projetos?|serviços?|orçamento|necessidade|mensagem|canal|demonstração|página|contato|empresa|imóve(l|is)|ver|fechar|abrir|buscar|carrinho|preço|valor|cliente|desconto|quantidade)\b/i;
// E-mails e domínios ("...@gmail.com", "suaempresa.com") não são texto em português.
const ptLines = (text) => text.split('\n').map((l) => NAMES.reduce((s, n) => s.split(n).join(''), l).replace(/\S+@\S+|\S+\.com(\.br)?\b/g, '').trim()).filter((l) => l && PT.test(l));

const ROUTES = [
  ['/en/', '/', 'h1'],
  ...['prime-imoveis', 'gestao360', 'nova-servicos', 'arena-store', 'orcafacil'].map((s) => [`/en/projects/${s}/`, `/projetos/${s}/`]),
  ['/en/demos/imoveis', '/demos/imoveis'],
  ['/en/demos/imoveis/PI-101', '/demos/imoveis/PI-101'],
  ['/en/demos/gestao360', '/demos/gestao360'],
  ['/en/demos/nova-servicos', '/demos/nova-servicos'],
  ['/en/demos/arena-store', '/demos/arena-store'],
  ['/en/demos/arena-store/product/AR-03', '/demos/arena-store/produto/AR-03'],
  ['/en/demos/arena-store/cart', '/demos/arena-store/carrinho'],
  ['/en/demos/orcafacil', '/demos/orcafacil'],
];

const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
const p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
for (const [en, pt] of ROUTES) {
  await p.goto(BASE + en); await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? '',
    alt: Object.fromEntries([...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')])),
    text: document.body.innerText,
    h1: document.querySelectorAll('h1').length,
  }));
  ok(r.lang === 'en', `${en}: html lang="en" (${r.lang})`);
  ok(r.h1 === 1, `${en}: um h1 (${r.h1})`);
  const path = (u) => u.replace(/^https?:\/\/[^/]+/, '');
  ok(path(r.canonical).replace(/\/$/, '') === en.replace(/\/$/, ''), `${en}: canonical da própria página (${r.canonical})`);
  ok(path(r.alt.en ?? '').replace(/\/$/, '') === en.replace(/\/$/, '') && path(r.alt['pt-BR'] ?? '').replace(/\/$/, '') === pt.replace(/\/$/, '') && !!r.alt['x-default'], `${en}: hreflang en, pt-BR e x-default ${JSON.stringify(r.alt)}`);
  ok(!PT.test(NAMES.reduce((s, n) => s.split(n).join(''), r.title)), `${en}: título em inglês (${r.title})`);
  const lines = ptLines(r.text);
  ok(lines.length === 0, `${en}: sem texto em português na tela: ${JSON.stringify(lines.slice(0, 6))}`);
  // Imagens da página: nenhuma quebrada, e as capturas em inglês vêm da pasta /en/
  const imgs = await p.evaluate(async () => {
    const list = [...document.querySelectorAll('main img')];
    for (const i of list) { i.loading = 'eager'; }
    await Promise.all(list.map((i) => (i.complete ? null : new Promise((res) => { i.onload = i.onerror = res; }))));
    return list.map((i) => [i.currentSrc || i.src, i.naturalWidth > 0]);
  });
  ok(imgs.every(([, okImg]) => okImg), `${en}: imagens carregadas ${JSON.stringify(imgs.filter(([, o]) => !o).slice(0, 3))}`);
  const captures = imgs.map(([s]) => s).filter((s) => /\/projetos\/[^/]+\/(tela|celular)/.test(s));
  ok(captures.every((s) => /\/projetos\/[^/]+\/en\//.test(s)), `${en}: capturas da versão em inglês ${JSON.stringify(captures.filter((s) => !/\/en\//.test(s)).slice(0, 2))}`);
}

// Seletor PT/EN: mesma página, mantendo busca e âncora; Voltar retorna ao idioma anterior
await p.goto(BASE + '/projetos/gestao360'); await p.waitForTimeout(600);
const sw = p.locator('header nav[aria-label="Idioma"] a').first();
ok((await sw.evaluate((a) => a.textContent.trim())).startsWith('EN'), 'seletor: nome acessível começa por "EN" (texto visível)');
await sw.click(); await p.waitForTimeout(600);
ok(new URL(p.url()).pathname.replace(/\/$/, '') === '/en/projects/gestao360' && (await p.textContent('h1')).trim() === 'Gestão360', `PT → EN mantém o estudo de caso (${p.url()})`);
ok((await p.getAttribute('html', 'lang')) === 'en', 'lang muda para en ao trocar');
await p.goBack(); await p.waitForTimeout(600);
ok(new URL(p.url()).pathname.replace(/\/$/, '') === '/projetos/gestao360' && (await p.getAttribute('html', 'lang')) === 'pt-BR', 'Voltar retorna à página em português');

await p.goto(BASE + '/demos/imoveis?finalidade=aluguel'); await p.waitForTimeout(600);
const before = await p.textContent('main');
await p.click('nav[aria-label="Idioma"] a'); await p.waitForTimeout(600);
const u = new URL(p.url());
ok(u.pathname === '/en/demos/imoveis' && u.search === '?finalidade=aluguel', `demonstração: troca mantém os filtros (${u.pathname}${u.search})`);
ok(before !== (await p.textContent('main')) && (await p.getAttribute('html', 'lang')) === 'en', 'demonstração: conteúdo passa para inglês');

await p.goto(BASE + '/en/?projeto=orcafacil#contato'); await p.waitForTimeout(900);
ok((await p.textContent('#contato')).includes('OrçaFácil'), 'formulário em inglês recebe o projeto de referência');
await p.click('nav[aria-label="Language"] a >> nth=0'); await p.waitForTimeout(700);
const back = new URL(p.url());
ok(back.pathname === '/' && back.search === '?projeto=orcafacil' && back.hash === '#contato', `EN → PT mantém busca e âncora (${back.pathname}${back.search}${back.hash})`);

// Página inexistente em inglês: 404 em inglês
await p.goto(BASE + '/en/does-not-exist'); await p.waitForTimeout(600);
ok((await p.getAttribute('html', 'lang')) === 'en' && ptLines(await p.evaluate(() => document.body.innerText)).length === 0, '404 em inglês');
await ctx.close();

// Navegador em inglês NÃO é redirecionado: o português continua sendo a página principal
const ctx2 = await b.newContext({ locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
const p2 = await ctx2.newPage();
await p2.goto(BASE + '/'); await p2.waitForTimeout(700);
ok(new URL(p2.url()).pathname === '/' && (await p2.getAttribute('html', 'lang')) === 'pt-BR', 'sem redirecionamento automático pelo idioma do navegador');
await ctx2.close();

ok(errs.length === 0, 'sem erros de JavaScript ' + errs.slice(0, 3).join(' | '));
console.log(`\n${pass} passaram, ${fail} falharam`);
await b.close();
process.exit(fail ? 1 : 0);
