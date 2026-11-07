// Textos do site: sem travessões (— ou –) no conteúdo visível, nos títulos das
// páginas e nos rótulos de acessibilidade, no portfólio e nas demonstrações.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const pages = ['/', '/projetos/prime-imoveis', '/projetos/gestao360', '/projetos/nova-servicos', '/projetos/arena-store', '/projetos/orcafacil', '/pagina-inexistente',
  '/demos/imoveis', '/demos/imoveis/PI-101', '/demos/gestao360', '/demos/nova-servicos', '/demos/arena-store', '/demos/arena-store/produto/AR-03', '/demos/arena-store/carrinho', '/demos/orcafacil'];
for (const path of pages) {
  await p.goto(BASE + path); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const text = document.body.innerText;
    const attrs = [...document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')].map((e) => ['aria-label', 'title', 'alt', 'placeholder'].map((a) => e.getAttribute(a) || '').join(' ')).join(' ');
    const metas = [...document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]')].map((m) => m.content).join(' ');
    const hit = (s) => (s.match(/.{0,25}[—–].{0,25}/g) || []).slice(0, 3);
    return { title: document.title, text: hit(text), attrs: hit(attrs), metas: hit(metas) };
  });
  ok(!/[—–]/.test(r.title), `${path}: título sem travessão (${r.title})`);
  ok(r.text.length === 0, `${path}: texto visível sem travessão ${JSON.stringify(r.text)}`);
  ok(r.attrs.length === 0, `${path}: rótulos sem travessão ${JSON.stringify(r.attrs)}`);
  ok(r.metas.length === 0, `${path}: metadados sem travessão ${JSON.stringify(r.metas)}`);
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
