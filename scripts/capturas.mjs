/**
 * Refaz as capturas reais das demonstrações (public/projetos/<slug>/*.webp).
 *
 * Use depois do build oficial, para que as telas saiam com as fontes da marca:
 *   1. npm run test:setup          (instala o Playwright e o Chromium sem alterar o package.json)
 *   2. npm run build && npm run preview      (deixe rodando em um terminal)
 *   3. node scripts/capturas.mjs http://localhost:4173
 *      node scripts/capturas.mjs http://localhost:4173 en   (versão em inglês)
 *    Opções: --og (só as imagens de compartilhamento, a partir das capturas já salvas)
 *            --so=gestao360,orcafacil (só as telas desses projetos; as og.jpg de todos)
 *
 * Em inglês, as telas são gravadas da própria demonstração em inglês (/en/...) e
 * salvas em public/projetos/<slug>/en/, junto com a imagem de compartilhamento
 * (og.jpg, 1200 × 630) montada com a captura em inglês. Em português, a og.jpg é
 * gerada do mesmo jeito em public/projetos/<slug>/.
 *
 * O script abre cada demonstração com data fixa, executa os passos abaixo e
 * salva cada tela em WebP nas larguras usadas pelo site (1600/800 para telas
 * grandes, 780/390 para celular). Nenhuma dependência é adicionada ao projeto.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const B = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '');
const EN = process.argv[3] === 'en';
const ONLY_OG = process.argv.includes('--og');
const ONLY = process.argv.find((a) => a.startsWith('--so='))?.slice(5).split(',') ?? null;
const OUT = new URL('../public/projetos/', import.meta.url).pathname;
/** Endereço no idioma escolhido (mesma regra de src/i18n/locale.ts). */
const L = (path) => (EN ? '/en' + path.replace(/\/projetos\//, '/projects/').replace(/\/produto\//, '/product/').replace(/\/carrinho$/, '/cart') : path);
/** Textos usados nos passos, nos dois idiomas. */
const T = EN
  ? { add: 'Add to cart', more: 'Increase quantity of Dry Training Shirt', addQuote: 'Add to quote', client: 'Sun Bakery', job: 'Kitchen faucet dripping and a leaking valve in the bathroom.' }
  : { add: 'Adicionar ao carrinho', more: 'Aumentar quantidade de Camisa Dry Treino', addQuote: 'Adicionar ao orçamento', client: 'Padaria Sol', job: 'Torneira da cozinha pingando e registro do banheiro com vazamento.' };
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
    await p.fill('textarea[name="description"]', T.job);
    await top('#ns-orcamento', 0)(p);
  }],
  ['nova-servicos-m', M, '/demos/nova-servicos'],
  ['arena-store-1', D, '/demos/arena-store'],
  ['arena-store-2', D, '/demos/arena-store/produto/AR-03', async (p) => { await p.click('label:has(input[value="M"])'); }],
  ['arena-store-3', D, '/demos/arena-store/produto/AR-03', async (p) => {
    await p.click('label:has(input[value="M"])'); await p.click(`button[aria-label="${T.more}"]`); await p.click(`text=${T.add}`); await p.waitForTimeout(150);
    await p.goto(B + L('/demos/arena-store/carrinho')); await p.waitForTimeout(500);
  }],
  ['arena-store-m', M, '/demos/arena-store'],
  ['orcafacil-1', D, '/demos/orcafacil', async (p) => { await addOrca(p); await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); }],
  ['orcafacil-2', D, '/demos/orcafacil', async (p) => { await addOrca(p); await top('.orca-doc', 100)(p); }],
  ['orcafacil-m', M, '/demos/orcafacil'],
];
async function addOrca(p) {
  // Opções escolhidas pelo valor (material, acabamento, prazo): o mesmo nos dois idiomas.
  const add = async (id, q, values) => {
    await p.selectOption('select[id$="-item"]', id); await p.fill('input[id$="-qtd"]', q);
    for (const v of values) await p.click(`fieldset label:has(input[value="${v}"])`);
    await p.click(`button:has-text("${T.addQuote}")`); await p.waitForTimeout(80);
  };
  await add('cartao', '2', ['premium', 'nenhum', 'normal']);
  await add('banner', '2', ['padrao', 'especial', 'rapido']);
  await p.fill('input[id$="-cliente"]', T.client);
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
  if (ONLY_OG || (ONLY && !ONLY.some((slug) => name.startsWith(slug)))) continue;
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.scale, timezoneId: 'America/Sao_Paulo' });
  await ctx.addInitScript(() => { const T = new Date(2026, 9, 20, 10).getTime(); const O = Date; globalThis.Date = class extends O { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; });
  const p = await ctx.newPage();
  await p.goto(B + L(path)); await p.waitForTimeout(700);
  if (fn) await fn(p);
  await p.waitForTimeout(400);
  const png = await p.screenshot();
  const slug = name.slice(0, name.lastIndexOf('-'));
  const idx = name.slice(name.lastIndexOf('-') + 1);
  const dir = `${OUT}${slug}/${EN ? 'en/' : ''}`;
  mkdirSync(dir, { recursive: true });
  const file = idx === 'm' ? `${dir}celular` : `${dir}tela-${idx}`;
  await saveWebp(p, png, file, idx === 'm' ? [780, 390] : [1600, 800]);
  await ctx.close();
  console.log('ok', name);
}

// Imagem de compartilhamento (1200 × 630) no idioma escolhido, montada com a captura desse idioma.
{
  const OG = EN
    ? { kicker: 'Project details', note: 'Original demo project', url: (slug) => `altocode.netlify.app/en/projects/${slug}`, dir: 'en/', lang: 'en' }
    : { kicker: 'Projeto em detalhes', note: 'Projeto demonstrativo autoral', url: (slug) => `altocode.netlify.app/projetos/${slug}`, dir: '', lang: 'pt-BR' };
  const CASES = EN
    ? [
        ['prime-imoveis', '01', 'Real estate portal', 'Prime Imóveis'],
        ['gestao360', '02', 'Financial and sales dashboard', 'Gestão360'],
        ['nova-servicos', '03', 'Service landing page', 'Nova Serviços'],
        ['arena-store', '04', 'Demo online store', 'Arena Store'],
        ['orcafacil', '05', 'Business calculator', 'OrçaFácil'],
      ]
    : [
        ['prime-imoveis', '01', 'Portal imobiliário', 'Prime Imóveis'],
        ['gestao360', '02', 'Dashboard financeiro e comercial', 'Gestão360'],
        ['nova-servicos', '03', 'Landing page de serviços', 'Nova Serviços'],
        ['arena-store', '04', 'Loja virtual demonstrativa', 'Arena Store'],
        ['orcafacil', '05', 'Calculadora comercial', 'OrçaFácil'],
      ];
  const font = (f) => `url(data:font/woff2;base64,${readFileSync(new URL(`../public/fonts/${f}`, import.meta.url)).toString('base64')})`;
  // Logo horizontal da marca para fundo escuro (kit gerado por scripts/marca.py)
  const mark = readFileSync(new URL('../marca/svg/alto-code-horizontal-escuro.svg', import.meta.url), 'utf8');
  const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  for (const [slug, n, category, name] of CASES) {
    const shot = 'data:image/webp;base64,' + readFileSync(`${OUT}${slug}/${OG.dir}tela-1-1600.webp`).toString('base64');
    await p.setContent(`<!doctype html><html lang="${OG.lang}"><style>
      @font-face { font-family: T; src: ${font('space-grotesk-latin-wght-v1.woff2')}; font-weight: 300 700; }
      @font-face { font-family: B; src: ${font('dm-sans-latin-wght-v1.woff2')}; font-weight: 100 1000; }
      @font-face { font-family: M; src: ${font('azeret-mono-latin-wght-v1.woff2')}; font-weight: 100 900; }
      * { margin: 0; box-sizing: border-box; }
      body { width: 1200px; height: 630px; overflow: hidden; background: #060e1d; color: #fff; font-family: B;
        background-image: linear-gradient(rgb(255 255 255 / .035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .035) 1px, transparent 1px); background-size: 48px 48px; }
      .brand { position: absolute; left: 66px; top: 64px; }
      .brand svg { display: block; height: 44px; width: auto; }
      .kicker { position: absolute; left: 72px; top: 208px; font: 500 19px M; letter-spacing: .12em; text-transform: uppercase; color: #2ed3bd; }
      .cat { position: absolute; left: 72px; top: 240px; font: 400 19px M; letter-spacing: .12em; text-transform: uppercase; color: rgb(214 224 238 / .85); max-width: 520px; }
      h1 { position: absolute; left: 70px; top: 282px; font: 600 88px T; letter-spacing: -.045em; line-height: 1.05; max-width: 540px; }
      .note { position: absolute; left: 72px; top: 396px; font: 400 21px B; color: rgb(214 224 238 / .85); }
      .url { position: absolute; left: 72px; top: 552px; font: 400 19px M; color: rgb(214 224 238 / .85); }
      .shot { position: absolute; left: 640px; top: 150px; width: 640px; height: 456px; border: 2px solid #2ed3bd; overflow: hidden; background: #fff; }
      .shot img { width: 960px; transform-origin: 0 0; transform: scale(.6667); display: block; }
      .h { position: absolute; width: 12px; height: 12px; background: #2ed3bd; }
    </style><body>
      <div class="brand">${mark}</div>
      <p class="kicker">${OG.kicker} ${n}</p><p class="cat">${category}</p>
      <h1>${name}</h1><p class="note">${OG.note}</p>
      <p class="url">${OG.url(slug)}</p>
      <div class="shot"><img src="${shot}" alt=""></div>
      <i class="h" style="left:634px;top:144px"></i><i class="h" style="left:634px;top:599px"></i>
    </body></html>`);
    await p.evaluate(() => Promise.all([document.fonts.ready, document.querySelector('img').decode()]));
    writeFileSync(`${OUT}${slug}/${OG.dir}og.jpg`, await p.screenshot({ type: 'jpeg', quality: 86 }));
    console.log('ok og', slug);
  }
  await ctx.close();
}
await b.close();
