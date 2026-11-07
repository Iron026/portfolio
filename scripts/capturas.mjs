/**
 * Refaz as capturas reais das demonstrações (public/projetos/<slug>/*.webp).
 *
 * Use depois do build oficial, para que as telas saiam com as fontes da marca:
 *   1. npm run test:setup          (instala o Playwright e o Chromium sem alterar o package.json)
 *   2. npm run build && npm run preview      (deixe rodando em um terminal)
 *   3. node scripts/capturas.mjs http://localhost:4173
 *
 * O script abre cada demonstração com data fixa, executa os passos abaixo e
 * salva cada tela em WebP nas larguras usadas pelo site (1600/800 para telas
 * grandes, 780/390 para celular). Nenhuma dependência é adicionada ao projeto.
 */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const B = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '');
const OUT = new URL('../public/projetos/', import.meta.url).pathname;
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: process.env.PW_ARGS ? process.env.PW_ARGS.split(' ') : [] });
const D = { width: 1280, height: 800, scale: 1.5 }, M = { width: 390, height: 844, scale: 2 };
const top = (sel, off = 0) => async (p) => p.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - o, behavior: 'instant' }); }, [sel, off]);
const shots = [
  ['prime-imoveis-1', D, '/demos/imoveis'],
  ['prime-imoveis-2', D, '/demos/imoveis/PI-101'],
  ['prime-imoveis-m', M, '/demos/imoveis'],
  ['gestao360-1', D, '/demos/gestao360'],
  ['gestao360-2', D, '/demos/gestao360', async (p) => { await p.selectOption('#g360-period', '30d'); await p.waitForTimeout(200); await top('table', 140)(p); }],
  ['gestao360-m', M, '/demos/gestao360'],
  ['nova-servicos-1', D, '/demos/nova-servicos'],
  ['nova-servicos-2', D, '/demos/nova-servicos', async (p) => {
    await top('#ns-orcamento', 0)(p); await p.waitForTimeout(200);
    await p.fill('input[name="name"]', 'Marina Souza');
    await p.selectOption('select[name="service"]', { index: 2 });
    await p.fill('input[name="area"]', 'Pituba');
    await p.fill('textarea[name="description"]', 'Torneira da cozinha pingando e registro do banheiro com vazamento.');
    await top('#ns-orcamento', 0)(p);
  }],
  ['nova-servicos-m', M, '/demos/nova-servicos'],
  ['arena-store-1', D, '/demos/arena-store'],
  ['arena-store-2', D, '/demos/arena-store/produto/AR-03', async (p) => { await p.click('label:has(input[value="M"])'); }],
  ['arena-store-3', D, '/demos/arena-store/produto/AR-03', async (p) => {
    await p.click('label:has(input[value="M"])'); await p.click('button[aria-label="Aumentar quantidade de Camisa Dry Treino"]'); await p.click('text=Adicionar ao carrinho'); await p.waitForTimeout(150);
    await p.goto(B + '/demos/arena-store/carrinho'); await p.waitForTimeout(500);
  }],
  ['arena-store-m', M, '/demos/arena-store'],
  ['orcafacil-1', D, '/demos/orcafacil', async (p) => { await addOrca(p); await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); }],
  ['orcafacil-2', D, '/demos/orcafacil', async (p) => { await addOrca(p); await top('.orca-doc', 100)(p); }],
  ['orcafacil-m', M, '/demos/orcafacil'],
];
async function addOrca(p) {
  const add = async (id, q, labels) => {
    await p.selectOption('select[id$="-item"]', id); await p.fill('input[id$="-qtd"]', q);
    for (const l of labels) await p.click(`fieldset label:has-text("${l}")`);
    await p.click('button:has-text("Adicionar ao orçamento")'); await p.waitForTimeout(80);
  };
  await add('cartao', '2', ['Premium', 'Sem acabamento', 'Normal']);
  await add('banner', '2', ['Padrão', 'Especial', 'Rápido']);
  await p.fill('input[id$="-cliente"]', 'Padaria Sol');
}

/** Converte o PNG em WebP no próprio navegador (canvas), nas larguras pedidas. */
async function saveWebp(page, png, file, widths) {
  const data = 'data:image/png;base64,' + png.toString('base64');
  for (const w of widths) {
    const webp = await page.evaluate(async ([src, width]) => {
      const img = new Image(); img.src = src; await img.decode();
      const c = document.createElement('canvas'); c.width = width; c.height = Math.round(img.height * width / img.width);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.8).split(',')[1];
    }, [data, w]);
    writeFileSync(`${file}-${w}.webp`, Buffer.from(webp, 'base64'));
  }
}

for (const [name, vp, path, fn] of shots) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.scale, timezoneId: 'America/Sao_Paulo' });
  await ctx.addInitScript(() => { const T = new Date(2026, 9, 20, 10).getTime(); const O = Date; globalThis.Date = class extends O { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; });
  const p = await ctx.newPage();
  await p.goto(B + path); await p.waitForTimeout(700);
  if (fn) await fn(p);
  await p.waitForTimeout(400);
  const png = await p.screenshot();
  const slug = name.slice(0, name.lastIndexOf('-'));
  const idx = name.slice(name.lastIndexOf('-') + 1);
  const file = idx === 'm' ? `${OUT}${slug}/celular` : `${OUT}${slug}/tela-${idx}`;
  await saveWebp(p, png, file, idx === 'm' ? [780, 390] : [1600, 800]);
  await ctx.close();
  console.log('ok', name);
}
await b.close();
