import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const p = await b.newPage();
const go = async (u) => { await p.goto('about:blank'); await p.goto(u); await p.waitForTimeout(700); return { url: p.url().replace(BASE, ''), h1: (await p.textContent('h1')).slice(0, 30) }; };
// versão com URLs limpas (a que vai para o Netlify)
let r = await go(BASE + '/#/demos/gestao360'); console.log('limpa, link antigo #/demos', r); ok(r.url === '/demos/gestao360' && r.h1.startsWith('Gestão360'), 'link antigo /#/demos/gestao360 → /demos/gestao360');
r = await go(BASE + '/#/projetos/gestao360'); ok(r.url === '/projetos/gestao360' && r.h1 === 'Gestão360', 'link antigo /#/projetos/... → /projetos/...');
r = await go(BASE + '/#projetos'); ok(r.url === '/#projetos' && r.h1.startsWith('Sites'), '/#projetos continua na seção');
r = await go(BASE + '/#/#projetos'); ok(r.url === '/#projetos', '/#/#projetos → /#projetos');
// versão com "#" (opcional): rode com HASH_URL apontando para um build feito com VITE_HASH_ROUTER=true
if (process.env.HASH_URL) {
  const H = process.env.HASH_URL.replace(/\/$/, '');
  const goH = async (u) => { await p.goto('about:blank'); await p.goto(u); await p.waitForTimeout(700); return { url: p.url().replace(H, ''), h1: (await p.textContent('h1')).slice(0, 30) }; };
  r = await goH(H + '/demos/gestao360'); ok(r.url === '/#/demos/gestao360' && r.h1.startsWith('Gestão360'), 'modo #: /demos/gestao360 → /#/demos/gestao360');
  r = await goH(H + '/projetos/gestao360'); ok(r.url === '/#/projetos/gestao360' && r.h1 === 'Gestão360', 'modo #: /projetos/... → /#/projetos/...');
  r = await goH(H + '/#projetos'); ok(r.url === '/#/#projetos', 'modo #: /#projetos');
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
