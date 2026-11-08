// Fontes da marca: todo texto do portfólio usa Space Grotesk, DM Sans ou Azeret Mono,
// os três arquivos WOFF2 carregam (uma vez, com status 200) e cobrem todos os caracteres usados.
import { readFileSync } from 'node:fs';
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const BRAND = ['Space Grotesk', 'DM Sans', 'Azeret Mono'];
const FILES = ['space-grotesk-latin-wght-v1.woff2', 'dm-sans-latin-wght-v1.woff2', 'azeret-mono-latin-wght-v1.woff2'];

// Os preloads do index.html e o fonts.css apontam para os mesmos arquivos
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../src/styles/fonts.css', import.meta.url), 'utf8');
for (const f of FILES) {
  ok(html.includes(`href="/fonts/${f}"`), `preload de ${f} no index.html`);
  ok(css.includes(`url('/fonts/${f}')`), `@font-face de ${f} no fonts.css`);
}

for (const w of [320, 390, 768, 1024, 1440]) {
  for (const route of ['/', '/projetos/gestao360', '/projetos/orcafacil', '/pagina-inexistente']) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const reqs = [];
    p.on('response', (r) => { if (r.url().endsWith('.woff2') && r.url().includes('/fonts/')) reqs.push([r.url().split('/').pop(), r.status()]); });
    await p.goto(BASE + route, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const r = await p.evaluate((BRAND) => {
      const bad = []; const chars = {};
      const walker = document.createTreeWalker(document.querySelector('.brand'), NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode; if (!n.data.trim()) continue; const el = n.parentElement;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        if (!BRAND.includes(fam)) bad.push(`${fam}: "${n.data.trim().slice(0, 30)}"`);
        chars[fam] = (chars[fam] || '') + n.data;
      }
      const status = [...document.fonts].filter((f) => BRAND.includes(f.family)).map((f) => [f.family, f.status]);
      for (const k in chars) chars[k] = [...new Set(chars[k])].join('');
      return { bad, status, chars };
    }, BRAND);
    const tag = `${w}px ${route}`;
    ok(r.bad.length === 0, `${tag}: texto fora das fontes da marca ${r.bad.slice(0, 3)}`);
    ok(BRAND.every((f) => r.status.some(([fam, st]) => fam === f && st === 'loaded')), `${tag}: fontes carregadas ${JSON.stringify(r.status)}`);
    ok(FILES.every((f) => reqs.filter(([n, s]) => n === f && s < 400).length === 1), `${tag}: cada WOFF2 baixado uma vez ${JSON.stringify(reqs)}`);
    // cobertura: mede cada caractere com duas fontes de reserva bem diferentes;
    // se a largura muda, o caractere não existe no arquivo da marca e cairia na reserva
    const missing = await p.evaluate(({ chars, BRAND }) => {
      const ctx2 = document.createElement('canvas').getContext('2d'); const out = [];
      for (const fam of Object.keys(chars)) for (const c of chars[fam]) {
        if (!c.trim()) continue;
        ctx2.font = `40px "${fam}", monospace`; const w1 = ctx2.measureText(c).width;
        ctx2.font = `40px "${fam}", serif`; const w2 = ctx2.measureText(c).width;
        if (Math.abs(w1 - w2) > 0.01) out.push(fam + ':' + c);
      }
      return out;
    }, { chars: r.chars, BRAND });
    ok(missing.length === 0, `${tag}: caracteres sem glifo ${missing.slice(0, 5)}`);
    await ctx.close();
  }
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
