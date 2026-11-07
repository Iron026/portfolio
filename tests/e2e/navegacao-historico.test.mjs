// Navegação pelo histórico do navegador (Voltar/Avançar) entre o portfólio e as
// demonstrações, no computador e no celular. Regressão da "tela branca": depois de
// cada passo, a página precisa ter conteúdo visível e nenhum erro de JavaScript.
//
// Parte 2 simula o que acontece numa aba aberta antes de um novo deploy: os
// arquivos das demonstrações deixam de existir no servidor (404). O site deve
// recarregar uma vez para buscar a versão nova e, se ainda assim não conseguir,
// mostrar a tela de recuperação. Nunca uma página vazia.
//
// A Parte 1 roda também com a rolagem do Chrome 150+ (scrollTo, scrollBy e
// scrollIntoView devolvem uma Promise). Foi isso que derrubava Nova Serviços e
// Gestão360 ao voltar: um efeito devolvia essa Promise e o React tentava chamá-la
// como limpeza ("TypeError: d is not a function"). A emulação só é aplicada se o
// navegador do teste ainda devolver undefined.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);

const demos = [
  ['prime-imoveis', '/demos/imoveis'],
  ['gestao360', '/demos/gestao360'],
  ['nova-servicos', '/demos/nova-servicos'],
  ['arena-store', '/demos/arena-store'],
  ['orcafacil', '/demos/orcafacil'],
];
const ROUNDS = 3;
const ignorable = (t) => /fonts\.g|TUNNEL|ERR_NAME|ERR_PROXY|ERR_INTERNET/.test(t);

/** Estado visível da página: #root com conteúdo, texto na tela, cabeçalho do portfólio. */
const state = (p) => p.evaluate(() => {
  const root = document.getElementById('root');
  const header = document.querySelector('header');
  const r = header?.getBoundingClientRect();
  return {
    path: location.pathname,
    rootKids: root ? root.childElementCount : 0,
    text: document.body.innerText.trim().length,
    loading: /Carregando demonstração/.test(document.body.innerText),
    headerVisible: !!(r && r.height > 0 && getComputedStyle(header).visibility !== 'hidden' && +getComputedStyle(header).opacity > 0),
    projetos: !!document.getElementById('projetos'),
    mainText: (document.getElementById('conteudo')?.innerText || '').trim().length,
    alert: !!document.querySelector('[role="alert"] h1'),
  };
});

async function waitPortfolio(p, path) {
  await p.waitForFunction((want) => location.pathname === want && document.querySelector('header') && (document.getElementById('conteudo')?.innerText || '').trim().length > 100, path, { timeout: 10000 }).catch(() => {});
  return state(p);
}
async function waitDemo(p, path) {
  await p.waitForFunction((want) => location.pathname.startsWith(want) && document.body.innerText.trim().length > 100 && !/Carregando demonstração/.test(document.body.innerText), path, { timeout: 10000 }).catch(() => {});
  return state(p);
}
const portfolioOk = (s, path) => s.path === path && s.rootKids > 0 && s.headerVisible && s.mainText > 100 && !s.alert;
const demoOk = (s, path) => s.path.startsWith(path) && s.rootKids > 0 && s.text > 100 && !s.loading && !s.alert;

/** Rolagem como no Chrome 150+ ("Programmatic Scroll Promises"). */
const scrollPromises = () => {
  if (window.scrollTo({ top: 0 }) instanceof Promise) return; // o navegador já faz isso
  for (const [obj, names] of [[window, ['scrollTo', 'scroll', 'scrollBy']], [Element.prototype, ['scrollTo', 'scroll', 'scrollBy', 'scrollIntoView']]]) {
    for (const n of names) { const orig = obj[n]; obj[n] = function (...a) { orig.apply(this, a); return Promise.resolve(); }; }
  }
};

const desktop = { width: 1440, height: 900 }, phone = { width: 390, height: 844 };
for (const [name, vp, promises] of [['computador', desktop, false], ['computador, rolagem do Chrome 150+', desktop, true], ['celular, rolagem do Chrome 150+', phone, true]]) {
  const mobile = vp.width < 600;
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  if (promises) await ctx.addInitScript(scrollPromises);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !ignorable(m.text())) errs.push(`console: ${m.text()}`); });

  // Parte 1a: início → Projetos → Testar demonstração → Voltar/Avançar
  for (const [slug, url] of demos) {
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'center' }), `projetos-${slug}`);
    await p.waitForTimeout(400);
    await p.click(`#projetos-${slug} a[href="${url}"]`);
    let s = await waitDemo(p, url);
    ok(demoOk(s, url), `${name}: ${slug} abre a demonstração a partir do início (${JSON.stringify(s)})`);
    for (let i = 1; i <= ROUNDS; i++) {
      await p.waitForTimeout(600); // tempo para vídeos, observadores e animações reagirem
      await p.goBack();
      s = await waitPortfolio(p, '/');
      ok(portfolioOk(s, '/') && s.projetos, `${name}: ${slug} Voltar ${i} mostra o portfólio (${JSON.stringify(s)})`);
      await p.waitForTimeout(400);
      await p.goForward();
      s = await waitDemo(p, url);
      ok(demoOk(s, url), `${name}: ${slug} Avançar ${i} mostra a demonstração (${JSON.stringify(s)})`);
    }
    await p.goBack();
    s = await waitPortfolio(p, '/');
    ok(portfolioOk(s, '/'), `${name}: ${slug} Voltar final mostra o portfólio`);
  }

  // Parte 1b: estudo de caso → Testar demonstração → Voltar/Avançar → Voltar até o início
  for (const [slug, url] of demos) {
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.goto(BASE + `/projetos/${slug}`, { waitUntil: 'load' });
    await p.click(`#conteudo a[href="${url}"]`);
    let s = await waitDemo(p, url);
    ok(demoOk(s, url), `${name}: ${slug} abre a demonstração a partir do estudo de caso`);
    for (let i = 1; i <= ROUNDS; i++) {
      await p.waitForTimeout(500);
      await p.goBack();
      s = await waitPortfolio(p, `/projetos/${slug}`);
      ok(portfolioOk(s, `/projetos/${slug}`), `${name}: ${slug} Voltar ${i} mostra o estudo de caso (${JSON.stringify(s)})`);
      await p.goForward();
      s = await waitDemo(p, url);
      ok(demoOk(s, url), `${name}: ${slug} Avançar ${i} (estudo de caso) mostra a demonstração`);
    }
    await p.goBack(); await p.goBack();
    s = await waitPortfolio(p, '/');
    ok(portfolioOk(s, '/'), `${name}: ${slug} dois Voltar chegam ao início com conteúdo (${JSON.stringify(s)})`);
  }

  // Parte 1c: atualizar a página numa demonstração e voltar
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.goto(BASE + '/demos/gestao360', { waitUntil: 'load' });
  await p.reload({ waitUntil: 'load' });
  ok(demoOk(await waitDemo(p, '/demos/gestao360'), '/demos/gestao360'), `${name}: demonstração abre depois de atualizar a página`);
  await p.goBack();
  ok(portfolioOk(await waitPortfolio(p, '/'), '/'), `${name}: Voltar depois de atualizar mostra o portfólio`);

  ok(errs.length === 0, `${name}: nenhum erro de JavaScript na navegação (${errs.slice(0, 3).join(' | ')})`);
  await ctx.close();
}

// Parte 2: arquivos de uma versão anterior (deploy novo com a aba aberta)
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const loaded = new Set();
  let reloads = 0;
  p.on('response', (r) => { if (/\/assets\/[^?]+\.(js|css)$/.test(r.url()) && r.status() === 200) loaded.add(r.url()); });
  p.on('load', () => reloads++); // só carregamentos completos (não conta pushState)
  await p.goto(BASE + '/', { waitUntil: 'load' });
  const split = await p.evaluate(() => !!document.querySelector('script[type="module"][src*="/assets/"]'));
  if (!split) {
    console.log('(parte 2 ignorada: este endereço não divide o código em arquivos; rode contra o build do Vite)');
  } else {
    await p.waitForTimeout(500);
    // a partir daqui, qualquer arquivo de /assets ainda não baixado "deixou de existir"
    await p.route(/\/assets\/.+\.(js|css)$/, (r) => (loaded.has(r.request().url()) ? r.continue() : r.fulfill({ status: 404, contentType: 'text/html', body: 'Not Found' })));
    const before = reloads;
    await p.evaluate(() => document.getElementById('projetos-gestao360')?.scrollIntoView({ block: 'center' }));
    await p.click('#projetos-gestao360 a[href="/demos/gestao360"]');
    await p.waitForSelector('[role="alert"] h1', { timeout: 15000 }).catch(() => {});
    const s = await state(p);
    ok(s.rootKids > 0 && s.alert, `versão anterior: mostra a tela de recuperação, não uma página vazia (${JSON.stringify(s)})`);
    ok(reloads - before === 1, `versão anterior: recarrega uma única vez (${reloads - before})`);
    ok(await p.getByRole('link', { name: 'Voltar para o início' }).isVisible(), 'versão anterior: tela de recuperação tem caminho de volta');
    await p.goBack();
    const back = await waitPortfolio(p, '/');
    ok(portfolioOk(back, '/'), `versão anterior: Voltar mostra o portfólio (${JSON.stringify(back)})`);
    // com a versão nova disponível de novo, a demonstração abre normalmente
    await p.unroute(/\/assets\/.+\.(js|css)$/);
    await p.goForward();
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: 'Tentar novamente' }).click().catch(() => {});
    ok(demoOk(await waitDemo(p, '/demos/gestao360'), '/demos/gestao360'), 'versão anterior: "Tentar novamente" abre a demonstração');
  }
  await ctx.close();
}

console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
