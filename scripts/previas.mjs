/**
 * Grava as prévias em vídeo dos projetos (public/projetos/<slug>/previa.webm e previa.mp4)
 * a partir das PRÓPRIAS demonstrações, executando interações reais:
 * filtros, buscas, carrinho, cálculo de orçamento e formulário.
 *
 * Uso (depois do build oficial, para as telas saírem com as fontes corretas):
 *   1. npm run test:setup                      (instala o Playwright e o Chromium)
 *   2. npm run build && npm run preview        (deixe rodando em um terminal)
 *   3. node scripts/previas.mjs http://localhost:4173
 *   Precisa do ffmpeg instalado (https://ffmpeg.org) para montar os vídeos.
 *   Para gravar só alguns: node scripts/previas.mjs http://localhost:4173 gestao360 orcafacil
 *
 * Como funciona: o Chromium envia os quadros da tela (CDP screencast) com o
 * horário de cada um; o ffmpeg monta um WebM (VP9) e um MP4 (H.264), sem áudio,
 * 960 × 600, com poucas centenas de KB cada.
 * Um cursor desenhado na página mostra onde cada clique acontece.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const B = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '');
const ONLY = process.argv.slice(3);
const OUT = fileURLToPath(new URL('../public/projetos/', import.meta.url));
const VIEW = { width: 1280, height: 800 };

const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: process.env.PW_ARGS ? process.env.PW_ARGS.split(' ') : [],
});

/** Cursor visível (o navegador sem janela não desenha o ponteiro). */
const CURSOR = () => {
  const c = document.createElement('div');
  c.id = 'previa-cursor';
  c.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2l15 8-6.5 1.6L9 18z" fill="#0d1a30" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none', transform: 'translate(-100px,-100px)', transition: 'transform 30ms linear' });
  const ring = document.createElement('div');
  Object.assign(ring.style, { position: 'fixed', width: '34px', height: '34px', marginLeft: '-14px', marginTop: '-14px', borderRadius: '50%', border: '2px solid #22c3b0', opacity: '0', zIndex: '2147483646', pointerEvents: 'none', transition: 'opacity 380ms, transform 380ms' });
  const add = () => { document.body.append(c, ring); };
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 2}px)`; }, true);
  addEventListener('mousedown', (e) => {
    Object.assign(ring.style, { left: e.clientX + 'px', top: e.clientY + 'px', transition: 'none', opacity: '0.9', transform: 'scale(0.4)' });
    requestAnimationFrame(() => requestAnimationFrame(() => Object.assign(ring.style, { transition: 'opacity 420ms, transform 420ms', opacity: '0', transform: 'scale(1.2)' })));
  }, true);
};
/** Data fixa: os painéis mostram sempre os mesmos números. */
const FIXED_DATE = () => { const T = new Date(2026, 9, 20, 10).getTime(); const O = Date; globalThis.Date = class extends O { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; };

function helpers(p) {
  const wait = (ms) => p.waitForTimeout(ms);
  const center = async (sel) => { const b = await p.locator(sel).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  /** Se o elemento estiver fora da tela, rola suavemente até ele antes de "mover o mouse". */
  const ensureVisible = async (sel) => {
    const b = await p.locator(sel).first().boundingBox();
    if (b && (b.y < 70 || b.y + b.height > VIEW.height - 40)) {
      await p.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), b.y - VIEW.height * 0.4);
      await wait(800);
    }
  };
  const moveTo = async (sel, steps = 24) => { await ensureVisible(sel); const c = await center(sel); await p.mouse.move(c.x, c.y, { steps }); };
  const click = async (sel) => { await moveTo(sel); await wait(120); const c = await center(sel); await p.mouse.down(); await p.mouse.up(); await wait(60); return c; };
  const type = async (sel, text, delay = 85) => { await click(sel); await p.keyboard.type(text, { delay }); };
  const clear = async (sel) => { await p.locator(sel).first().fill(''); };
  const select = async (sel, value) => { await moveTo(sel); await wait(180); await p.selectOption(sel, value); };
  const scrollTo = async (sel, offset = 0) => {
    await p.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - o, behavior: 'smooth' }); }, [sel, offset]);
    await wait(900);
  };
  const scrollBy = async (y) => { await p.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'smooth' }), y); await wait(800); };
  return { wait, moveTo, click, type, clear, select, scrollTo, scrollBy };
}

/** Roteiros: só funcionalidades que as demonstrações realmente têm. */
const FLOWS = {
  gestao360: {
    path: '/demos/gestao360',
    async run(p, h) {
      await h.scrollTo('#g360-period', 150); await h.wait(500);
      await h.select('#g360-period', '30d'); await h.wait(1500);
      await h.select('#g360-period', '365d'); await h.wait(1500);
      await h.select('#g360-kind', 'receita'); await h.wait(1500);
      await h.select('#g360-kind', 'todos'); await h.wait(300);
      await h.type('#g360-search', 'servicos', 110); await h.wait(1500);
      await h.clear('#g360-search'); await h.select('#g360-period', '90d'); await h.wait(1200);
    },
  },
  'prime-imoveis': {
    path: '/demos/imoveis',
    async run(p, h) {
      await h.scrollBy(230); await h.wait(300);
      await h.type('#pi-q', 'piscina', 110); await h.wait(1500);
      await h.clear('#pi-q'); await h.wait(500);
      await h.click('button[aria-pressed]:has-text("Alugar")'); await h.wait(1300);
      await h.select('#pi-bairro', 'Centro'); await h.wait(1500);
      await h.click('button[aria-pressed]:has-text("Comprar")'); await h.wait(400);
      await h.select('#pi-bairro', ''); await h.select('#pi-tipo', 'casa'); await h.wait(1500);
    },
  },
  'arena-store': {
    path: '/demos/arena-store',
    // abre produto e carrinho uma vez (navegação interna) para não gravar a tela de carregamento
    async prepare(p) {
      await p.click('[data-product="AR-03"]'); await p.waitForTimeout(600);
      await p.click('header a[aria-label^="Carrinho"]'); await p.waitForTimeout(600);
      await p.click('header a[aria-label="Arena Store: início da loja"]'); await p.waitForTimeout(600);
      await p.evaluate(() => window.scrollTo(0, 0));
    },
    async run(p, h) {
      await h.wait(500);
      await h.type('#as-q', 'camisa', 110); await h.wait(1300);
      await h.click('[data-product="AR-03"]'); await h.wait(1100);
      await h.click('label:has(input[value="M"])'); await h.wait(500);
      await h.click('button[aria-label="Aumentar quantidade de Camisa Dry Treino"]'); await h.wait(500);
      await h.click('text=Adicionar ao carrinho'); await h.wait(1300);
      await h.click('header a[aria-label^="Carrinho"]'); await h.wait(1400);
      await h.click('[data-line="AR-03|M"] button[aria-label^="Aumentar"]'); await h.wait(1500);
    },
  },
  orcafacil: {
    path: '/demos/orcafacil',
    async run(p, h) {
      await h.scrollTo('select[id$="-item"]', 160); await h.wait(300);
      await h.select('select[id$="-item"]', 'cartao'); await h.wait(400);
      await h.click('input[id$="-qtd"]'); await p.locator('input[id$="-qtd"]').fill(''); await p.keyboard.type('2', { delay: 120 }); await h.wait(500);
      await h.click('fieldset label:has-text("Premium")'); await h.wait(700);
      await h.click('button:has-text("Adicionar ao orçamento")'); await h.wait(900);
      await h.select('select[id$="-item"]', 'banner'); await h.click('input[id$="-qtd"]'); await p.locator('input[id$="-qtd"]').fill(''); await p.keyboard.type('2', { delay: 120 });
      await h.click('fieldset label:has-text("Rápido")'); await h.wait(600);
      await h.click('button:has-text("Adicionar ao orçamento")'); await h.wait(900);
      await h.type('input[id$="-desconto"]', '10', 160); await h.wait(1200);
      await h.type('input[id$="-cliente"]', 'Padaria Sol', 80); await h.wait(400);
      await h.scrollTo('.orca-doc', 90); await h.wait(1800);
    },
  },
  'nova-servicos': {
    path: '/demos/nova-servicos',
    async run(p, h) {
      await h.wait(700);
      await h.click('#ns-inicio button:has-text("Pintura")'); await h.wait(1300);
      await h.type('#ns-nome', 'Marina Souza', 70); await h.wait(300);
      await h.type('#ns-contato', '71 98888 7777', 60); await h.wait(300);
      await h.type('#ns-bairro', 'Pituba', 70); await h.wait(300);
      await h.type('#ns-descricao', 'Pintar a sala e um quarto.', 45); await h.wait(300);
      await h.click('#ns-consentimento'); await h.wait(400);
      await h.click('button:has-text("Preparar pedido")'); await h.wait(700);
      await h.scrollTo('#ns-orcamento', 80); await h.wait(2000);
    },
  },
};

async function record(slug, flow) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1, timezoneId: 'America/Sao_Paulo', reducedMotion: 'no-preference' });
  await ctx.addInitScript(FIXED_DATE);
  await ctx.addInitScript(CURSOR);
  const p = await ctx.newPage();
  await p.goto(B + flow.path, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  if (flow.prepare) await flow.prepare(p);
  await p.mouse.move(VIEW.width * 0.62, VIEW.height * 0.55);
  await p.waitForTimeout(600);

  const dir = mkdtempSync(join(tmpdir(), `previa-${slug}-`));
  const frames = [];
  const cdp = await ctx.newCDPSession(p);
  cdp.on('Page.screencastFrame', async (f) => {
    const file = join(dir, `${String(frames.length).padStart(5, '0')}.jpg`);
    writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: VIEW.width, maxHeight: VIEW.height, everyNthFrame: 1 });
  await p.waitForTimeout(700);
  await flow.run(p, helpers(p));
  await p.waitForTimeout(600);
  await cdp.send('Page.stopScreencast');
  await ctx.close();

  // Lista de quadros com a duração real de cada um (o screencast só manda quadros quando a tela muda)
  const list = frames.map((f, i) => `file '${f.file}'\nduration ${Math.max(0.02, ((frames[i + 1]?.t ?? f.t + 0.5) - f.t)).toFixed(3)}`).join('\n') + `\nfile '${frames.at(-1).file}'\n`;
  const listFile = join(dir, 'lista.txt');
  writeFileSync(listFile, list);
  mkdirSync(join(OUT, slug), { recursive: true });
  const out = join(OUT, slug, 'previa.mp4');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=25,scale=960:600:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
    '-profile:v', 'high', '-movflags', '+faststart', '-an', out]);
  // WebM (VP9): o site oferece este primeiro; o MP4 fica como alternativa
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=25,scale=960:600:flags=lanczos,format=yuv420p', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38',
    '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1', '-an', out.replace(/\.mp4$/, '.webm')]);
  rmSync(dir, { recursive: true, force: true });
  console.log('ok', slug, out, frames.length, 'quadros');
}

for (const [slug, flow] of Object.entries(FLOWS)) {
  if (ONLY.length && !ONLY.includes(slug)) continue;
  await record(slug, flow);
}
await browser.close();
