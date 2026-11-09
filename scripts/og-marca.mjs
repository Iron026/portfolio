/**
 * Imagens de compartilhamento da marca (1200 × 630), em português e inglês:
 *   public/og-image.png     (início em português)
 *   public/og-image-en.png  (início em inglês, /en/)
 *
 *   node scripts/og-marca.mjs
 *
 * Usa a logo horizontal do kit (marca/svg, gerado por scripts/marca.py), as fontes
 * locais da marca e a moldura de seleção. As imagens dos projetos (og.jpg de cada
 * projeto) são feitas por scripts/capturas.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const root = (p) => new URL(`../${p}`, import.meta.url);
const font = (f) => `url(data:font/woff2;base64,${readFileSync(root(`public/fonts/${f}`)).toString('base64')})`;
const logo = readFileSync(root('marca/svg/alto-code-horizontal-escuro.svg'), 'utf8');
const symbol = readFileSync(root('marca/svg/alto-code-simbolo-escuro.svg'), 'utf8');

const VERSIONS = [
  {
    file: 'public/og-image.png',
    lang: 'pt-BR',
    kicker: 'Desenvolvimento digital',
    title: ['Sites, sistemas e planilhas ', 'sob medida', ' para pequenos negócios.'],
    size: 66,
    foot: 'altocode.netlify.app · 5 projetos demonstrativos para testar',
  },
  {
    file: 'public/og-image-en.png',
    lang: 'en',
    kicker: 'Digital development',
    title: ['', 'Custom', ' websites, systems and spreadsheets for small businesses.'],
    size: 58,
    foot: 'altocode.netlify.app/en · 5 working demos you can try',
  },
];

const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const v of VERSIONS) {
  await p.setContent(`<!doctype html><html lang="${v.lang}"><style>
    @font-face { font-family: T; src: ${font('space-grotesk-latin-wght-v1.woff2')}; font-weight: 300 700; }
    @font-face { font-family: M; src: ${font('azeret-mono-latin-wght-v1.woff2')}; font-weight: 100 900; }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; overflow: hidden; position: relative; background: #060e1d; color: #fff;
      background-image: linear-gradient(rgb(255 255 255 / .035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .035) 1px, transparent 1px); background-size: 48px 48px; }
    .glow { position: absolute; right: -160px; top: -40px; width: 720px; height: 720px; border-radius: 50%;
      background: radial-gradient(closest-side, rgb(34 195 176 / .16), transparent); }
    .logo { position: absolute; left: 66px; top: 62px; }
    .logo svg { display: block; height: 46px; width: auto; }
    .sym { position: absolute; right: 70px; top: 128px; width: 300px; opacity: .95; }
    .sym svg { display: block; width: 100%; height: auto; }
    .kicker { position: absolute; left: 72px; top: 200px; font: 500 19px M; letter-spacing: .14em; text-transform: uppercase; color: #2ed3bd; }
    h1 { position: absolute; left: 70px; top: 238px; width: 760px; font: 600 ${v.size}px/1.08 T; letter-spacing: -.04em; }
    .w { position: relative; color: #2ed3bd; padding: 0 6px; margin: 0 -6px; }
    .w::before { content: ''; position: absolute; inset: 4px 0 -2px; border: 2px solid #2ed3bd; }
    .w i { position: absolute; width: 11px; height: 11px; background: #2ed3bd; }
    .foot { position: absolute; left: 72px; top: 552px; font: 400 19px M; color: rgb(214 224 238 / .85); }
  </style><body>
    <div class="glow"></div>
    <div class="logo">${logo}</div>
    <div class="sym">${symbol}</div>
    <p class="kicker">${v.kicker}</p>
    <h1>${v.title[0]}<span class="w">${v.title[1]}<i style="left:-5px;top:-1px"></i><i style="right:-5px;top:-1px"></i><i style="left:-5px;bottom:-7px"></i><i style="right:-5px;bottom:-7px"></i></span>${v.title[2]}</h1>
    <p class="foot">${v.foot}</p>
  </body></html>`);
  await p.evaluate(() => document.fonts.ready);
  // o título não pode encostar no símbolo nem passar da área segura
  const box = await p.locator('h1').boundingBox();
  if (box.y + box.height > 540) throw new Error(`${v.file}: título alto demais (${Math.round(box.y + box.height)} px)`);
  writeFileSync(root(v.file), await p.screenshot({ type: 'png' }));
  console.log('ok', v.file);
}
await b.close();
