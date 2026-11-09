// Fontes nas cinco demonstrações (PT e EN): todo texto visível usa Space Grotesk, DM Sans ou Azeret Mono,
// nenhuma fonte antiga (Bricolage, IBM Plex) é pedida, todos os caracteres têm glifo na fonte da marca,
// títulos de exibição usam Space Grotesk e números técnicos Azeret Mono, sem rolagem lateral de 320 a 1440 px.
// Também confere a proposta impressa do OrçaFácil (mídia de impressão) nas mesmas fontes.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const BRAND = ['Space Grotesk', 'DM Sans', 'Azeret Mono'];
const OLD = /bricolage|plex/i;
const CART = JSON.stringify([{ productId: 'AR-03', size: 'M', qty: 2 }, { productId: 'AR-06', size: null, qty: 1 }]);

const ROUTES = {
  pt: ['/demos/imoveis', '/demos/imoveis/PI-101', '/demos/gestao360', '/demos/nova-servicos', '/demos/arena-store', '/demos/arena-store/produto/AR-03', '/demos/arena-store/carrinho', '/demos/arena-store/checkout', '/demos/orcafacil'],
  en: ['/en/demos/imoveis', '/en/demos/imoveis/PI-101', '/en/demos/gestao360', '/en/demos/nova-servicos', '/en/demos/arena-store', '/en/demos/arena-store/product/AR-03', '/en/demos/arena-store/cart', '/en/demos/arena-store/checkout', '/en/demos/orcafacil'],
};

/** Percorre o texto visível da página: família usada por elemento, caracteres por família e famílias dos títulos. */
const scan = (BRAND) => {
  const bad = []; const chars = {}; const heads = new Set(); const monoNums = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode; if (!n.data.trim()) continue; const el = n.parentElement;
    if (el.closest('script,style,noscript,[aria-hidden="true"] svg')) continue;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue;
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (!BRAND.includes(fam)) bad.push(`${fam}: "${n.data.trim().slice(0, 30)}"`);
    chars[fam] = (chars[fam] || '') + n.data;
    // Títulos de exibição (20 px ou mais) usam Space Grotesk; títulos pequenos de cartão e de lista
    // (nome do produto, pergunta do FAQ) podem usar DM Sans em peso 500 ou mais, como no portfólio.
    const h = el.closest('h1,h2,h3');
    if (h) { const hs = getComputedStyle(h); const f = hs.fontFamily.split(',')[0].replace(/["']/g, '').trim(); heads.add(parseFloat(hs.fontSize) >= 20 || f === 'Space Grotesk' ? f : f === 'DM Sans' && +hs.fontWeight >= 500 ? 'Space Grotesk' : `${f} ${hs.fontWeight}`); }
    if (fam === 'Azeret Mono') monoNums.push(n.data.trim());
  }
  for (const k in chars) chars[k] = [...new Set(chars[k])].join('');
  return { bad, chars, heads: [...heads], monoNums: monoNums.length, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
};

/** Mede cada caractere com duas reservas diferentes: se a largura muda, falta o glifo na fonte da marca. */
const coverage = ({ chars }) => {
  const c2 = document.createElement('canvas').getContext('2d'); const out = [];
  for (const fam of Object.keys(chars)) for (const c of chars[fam]) {
    if (!c.trim()) continue;
    c2.font = `40px "${fam}", monospace`; const w1 = c2.measureText(c).width;
    c2.font = `40px "${fam}", serif`; const w2 = c2.measureText(c).width;
    if (Math.abs(w1 - w2) > 0.01) out.push(fam + ':' + c);
  }
  return out;
};

for (const [lang, routes] of Object.entries(ROUTES)) {
  for (const w of [320, 390, 768, 1024, 1440]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript((cart) => { try { if (!localStorage.getItem('arena-store:carrinho:v1')) localStorage.setItem('arena-store:carrinho:v1', cart); } catch {} }, CART);
    const p = await ctx.newPage(); const fontReqs = []; const errs = [];
    p.on('request', (r) => { if (/\.(woff2?|ttf|otf)(\?|$)/.test(r.url()) || /fonts\.(googleapis|gstatic)/.test(r.url())) fontReqs.push(r.url()); });
    p.on('pageerror', (e) => errs.push(e.message));
    for (const route of routes) {
      await p.goto(BASE + route, { waitUntil: 'load' });
      // as demonstrações carregam sob demanda: espera o conteúdo (títulos) antes de medir
      await p.waitForSelector('h1, h2', { state: 'visible', timeout: 8000 }).catch(() => {});
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250);
      const r = await p.evaluate(scan, BRAND);
      const tag = `${lang} ${w}px ${route}`;
      ok(r.bad.length === 0, `${tag}: texto fora das fontes da marca ${r.bad.slice(0, 3)}`);
      ok(r.heads.length > 0 && r.heads.every((f) => f === 'Space Grotesk'), `${tag}: títulos grandes em Space Grotesk, pequenos em DM Sans forte ${r.heads}`);
      ok(r.sw <= r.cw, `${tag}: sem rolagem lateral (${r.sw} > ${r.cw})`);
      if (w === 1440 || w === 320) {
        const missing = await p.evaluate(coverage, { chars: r.chars });
        ok(missing.length === 0, `${tag}: caracteres sem glifo ${missing.slice(0, 5)}`);
      }
      if (w === 1440 && /gestao360|orcafacil|carrinho|cart/.test(route)) ok(r.monoNums > 0, `${tag}: números técnicos em Azeret Mono`);
    }
    const loaded = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
    ok(!loaded.some((f) => OLD.test(f)), `${lang} ${w}px: nenhuma fonte antiga carregada ${loaded}`);
    ok(fontReqs.length > 0 && fontReqs.every((u) => /\/fonts\/(space-grotesk|dm-sans|azeret-mono)-latin-wght-v1\.woff2$/.test(u)), `${lang} ${w}px: só os WOFF2 da marca são pedidos ${fontReqs.filter((u) => !/(space-grotesk|dm-sans|azeret-mono)/.test(u))}`);
    ok(!fontReqs.some((u) => OLD.test(u)), `${lang} ${w}px: nenhum pedido de Bricolage ou IBM Plex`);
    ok(errs.length === 0, `${lang} ${w}px: sem erros de página ${errs}`);
    await ctx.close();
  }
}

// Proposta impressa do OrçaFácil: em mídia de impressão, o texto continua nas fontes da marca
for (const [lang, route] of [['pt', '/demos/orcafacil'], ['en', '/en/demos/orcafacil']]) {
  const p = await b.newPage({ viewport: { width: 1024, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(BASE + route); await p.waitForSelector('select[id$="-item"]'); await p.evaluate(() => document.fonts.ready);
  await p.selectOption('select[id$="-item"]', 'cartao'); await p.fill('input[id$="-qtd"]', '2');
  await p.click('main section button:has(svg.lucide-plus)'); await p.waitForTimeout(150);
  await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(200);
  const r = await p.evaluate(scan, BRAND);
  ok(r.bad.length === 0, `${lang} impressão OrçaFácil: texto fora das fontes da marca ${r.bad.slice(0, 3)}`);
  ok(r.heads.every((f) => f === 'Space Grotesk'), `${lang} impressão OrçaFácil: títulos em Space Grotesk ${r.heads}`);
  ok(r.monoNums > 0, `${lang} impressão OrçaFácil: valores em Azeret Mono`);
  const pdf = await p.pdf({ format: 'A4', printBackground: true });
  const s = pdf.toString('latin1');
  ok(/SpaceGrotesk|Space-Grotesk/.test(s) && /DMSans|DM-Sans/.test(s) && /AzeretMono|Azeret-Mono/.test(s), `${lang} PDF do OrçaFácil incorpora as três fontes da marca`);
  ok(!/Bricolage|IBMPlex|IBM-Plex/.test(s), `${lang} PDF do OrçaFácil sem fontes antigas`);
  await p.close();
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
