/**
 * PNGs da marca, a partir dos SVGs de marca/svg/ (gerados por scripts/marca.py).
 *
 *   node scripts/marca-png.mjs
 *
 * - marca/png/: cada SVG em PNG com fundo transparente (logos em 1600 px de largura,
 *   símbolos em 1024 px), para perfis, documentos e apresentações;
 * - public/apple-touch-icon.png (180 px) e marca/png/alto-code-icone-{192,512}.png;
 * - marca/png/favicon-{16,32,48}.png: o favicon como o navegador o desenha.
 * A pasta marca/ fica fora de public/: o kit não vai para o site publicado.
 * Usa o Chromium do Playwright, sem dependências novas.
 */
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ROOT = new URL('../public/', import.meta.url);
const MARCA = new URL('../marca/svg/', import.meta.url);
const PNG = new URL('../marca/png/', import.meta.url);
mkdirSync(PNG, { recursive: true });

const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
const p = await b.newPage({ deviceScaleFactor: 1 });

async function render(svgUrl, out, width, height) {
  const svg = readFileSync(svgUrl, 'utf8');
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const w = width;
  const h = height ?? Math.round((width * +vb[2]) / +vb[1]);
  await p.setViewportSize({ width: w, height: h });
  await p.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${w}px;height:${h}px}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`);
  await p.locator('img').evaluate((img) => img.decode());
  await p.screenshot({ path: new URL(out, PNG).pathname, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}

let n = 0;
for (const f of readdirSync(MARCA).filter((f) => f.endsWith('.svg')).sort()) {
  const width = /simbolo|icone/.test(f) ? 1024 : 1600;
  await render(new URL(f, MARCA), f.replace(/\.svg$/, '.png'), width);
  n++;
}
for (const s of [192, 512]) await render(new URL('alto-code-icone.svg', MARCA), `alto-code-icone-${s}.png`, s, s);
for (const s of [16, 32, 48]) await render(new URL('favicon.svg', ROOT), `favicon-${s}.png`, s, s);
await render(new URL('alto-code-icone.svg', MARCA), new URL('apple-touch-icon.png', ROOT).pathname, 180, 180);
await b.close();
console.log(`${n} logos + ícones 192/512, favicon 16/32/48 e apple-touch-icon em PNG`);
