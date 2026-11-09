// Áreas do tour sobre as capturas: a moldura de cada parada contém o elemento real da demonstração.
// As capturas (scripts/capturas.mjs) são feitas em 1280 × 800; aqui a mesma tela é aberta na
// demonstração, no mesmo estado, e a caixa do elemento (em % da tela) tem de caber na moldura
// que a página do projeto desenha, em PT e EN. Também confere que a moldura não invade o vizinho.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const T = { pt: { addQuote: 'Adicionar ao orçamento', client: 'Padaria Sol', proj: '/projetos/' }, en: { addQuote: 'Add to quote', client: 'Sun Bakery', proj: '/en/projects/' } };

async function addOrca(p, lang) {
  const add = async (id, q, values) => {
    await p.selectOption('select[id$="-item"]', id); await p.fill('input[id$="-qtd"]', q);
    for (const v of values) await p.click(`fieldset label:has(input[value="${v}"])`);
    await p.click(`button:has-text("${T[lang].addQuote}")`); await p.waitForTimeout(80);
  };
  await add('cartao', '2', ['premium', 'nenhum', 'normal']);
  await add('banner', '2', ['padrao', 'especial', 'rapido']);
  await p.fill('input[id$="-cliente"]', T[lang].client);
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
}

/** Caixas (% de 1280 × 800) dos elementos que cada parada destaca. */
const CASES = {
  'prime-imoveis': {
    demo: '/demos/imoveis',
    stops: {
      0: () => [document.querySelector('input[placeholder]').parentElement],
      1: () => [document.querySelector('fieldset'), [...document.querySelectorAll('h2, p, span')].find((e) => /^(Filtros|Filters)$/.test(e.textContent.trim()))?.closest('aside, section, div[class*="rounded"]')],
    },
  },
  'nova-servicos': {
    demo: '/demos/nova-servicos',
    stops: { 0: () => [document.querySelector('h1').parentElement] },
  },
  orcafacil: {
    demo: '/demos/orcafacil', prep: addOrca,
    stops: {
      0: () => [document.querySelector('select[id$="-item"]').parentElement.parentElement, document.querySelector('input[id$="-qtd"]').parentElement.parentElement],
      1: () => [...document.querySelectorAll('fieldset')].slice(0, 2),
      2: () => [...document.querySelectorAll('li')].filter((l) => /R\$/.test(l.textContent) && l.getBoundingClientRect().left > 600),
      3: () => [document.querySelector('input[id*="desc"]').parentElement, document.querySelector('input[id*="valid"]').parentElement],
    },
    neighbors: { 3: () => [[...document.querySelectorAll('li')].filter((l) => /R\$/.test(l.textContent) && l.getBoundingClientRect().left > 600).pop()?.querySelector('button, summary, [aria-expanded]')].filter(Boolean) },
  },
};

/** Executa a função de seleção na página e devolve a caixa que une os elementos. */
const box = async (p, fn) => (await p.evaluateHandle(fn)).evaluate((list) => {
  const els = list.filter(Boolean);
  const rs = els.map((e) => e.getBoundingClientRect());
  const x = Math.min(...rs.map((r) => r.left)), y = Math.min(...rs.map((r) => r.top));
  const x2 = Math.max(...rs.map((r) => r.right)), y2 = Math.max(...rs.map((r) => r.bottom));
  return [(x / 1280) * 100, (y / 800) * 100, (x2 / 1280) * 100, (y2 / 800) * 100];
});

for (const lang of ['pt', 'en']) {
  for (const [slug, c] of Object.entries(CASES)) {
    // 1. áreas desenhadas pela página do projeto
    const pp = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await pp.goto(BASE + T[lang].proj + slug); await pp.waitForTimeout(400);
    await pp.locator('#caso-tour').scrollIntoViewIfNeeded(); await pp.waitForSelector('#caso-tour [role=tab]');
    const areas = {};
    for (const i of Object.keys(c.stops)) {
      await pp.locator('#caso-tour [role=tab]').nth(+i).click(); await pp.waitForTimeout(120);
      areas[i] = await pp.evaluate(() => { const s = document.querySelector('#caso-tour [role=tabpanel] .tour-focus').style; return [s.left, s.top, s.width, s.height].map(parseFloat); });
    }
    await pp.close();
    // 2. elementos reais na demonstração, no mesmo tamanho e estado da captura
    const p = await b.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', timezoneId: 'America/Sao_Paulo' });
    await p.goto(BASE + (lang === 'en' ? '/en' : '') + c.demo); await p.waitForTimeout(400); await p.evaluate(() => document.fonts.ready);
    if (c.prep) await c.prep(p, lang);
    await p.waitForTimeout(150);
    for (const [i, fn] of Object.entries(c.stops)) {
      const [x, y, w, h] = areas[i]; const [ex, ey, ex2, ey2] = await box(p, fn);
      const tol = 0.6;
      const inside = ex >= x - tol && ey >= y - tol && ex2 <= x + w + tol && Math.min(ey2, 100) <= y + h + tol;
      ok(inside, `${lang} ${slug} parada ${+i + 1}: elemento [${[ex, ey, ex2, ey2].map((v) => v.toFixed(1))}] dentro da moldura [${[x, y, x + w, y + h].map((v) => v.toFixed(1))}]`);
      // a moldura não fica folgada demais: o elemento ocupa boa parte dela
      const cover = ((Math.min(ex2, 100) - ex) * (Math.min(ey2, 100) - ey)) / (w * h);
      ok(cover >= 0.45, `${lang} ${slug} parada ${+i + 1}: moldura justa ao elemento (${(cover * 100).toFixed(0)}% ocupado)`);
      if (c.neighbors?.[i]) {
        const [nx, ny, nx2, ny2] = await box(p, c.neighbors[i]);
        const overlapY = Math.min(ny2, y + h) - Math.max(ny, y), overlapX = Math.min(nx2, x + w) - Math.max(nx, x);
        ok(!(overlapX > 1 && overlapY > 1.5), `${lang} ${slug} parada ${+i + 1}: moldura não cobre o elemento vizinho`);
      }
    }
    await p.close();
  }
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
