// Sem rolagem lateral no portfólio e nas cinco demonstrações, de 320 a 1440 px.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const routes = ['/', '/projetos/prime-imoveis', '/projetos/gestao360', '/projetos/nova-servicos', '/projetos/arena-store', '/projetos/orcafacil',
  '/demos/imoveis', '/demos/gestao360', '/demos/nova-servicos', '/demos/arena-store', '/demos/orcafacil', '/pagina-inexistente'];
for (const w of [320, 390, 768, 1024, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  for (const r of routes) {
    await p.goto(BASE + r); await p.waitForTimeout(500);
    const res = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(res.sw <= res.cw, `${w}px ${r}: rolagem lateral (${res.sw} > ${res.cw})`);
  }
  await p.close();
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
