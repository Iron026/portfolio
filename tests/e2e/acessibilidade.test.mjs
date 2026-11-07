// Verificações automáticas de acessibilidade e metadados das páginas do portfólio.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const pages = ['/', '/projetos/prime-imoveis', '/projetos/gestao360', '/projetos/nova-servicos', '/projetos/arena-store', '/projetos/orcafacil', '/pagina-inexistente'];
for (const path of pages) {
  await p.goto(BASE + path); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const name = (e) => (e.getAttribute('aria-label') || e.textContent || e.querySelector('img')?.alt || '').trim();
    const ids = {}; document.querySelectorAll('[id]').forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; });
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
    const jumps = []; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) jumps.push(`h${hs[i - 1]}→h${hs[i]}`);
    const small = [];
    document.querySelectorAll('main a, main button, header a, header button').forEach((e) => {
      const rc = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      const hiddenSkip = e.classList.contains('sr-only') || cs.position === 'absolute' && rc.width <= 1;
      if (rc.width && rc.height && (rc.height < 24 || rc.width < 24) && cs.display !== 'inline' && !hiddenSkip && !e.matches('a[href="#conteudo"], a[href="#main"]')) small.push(`${Math.round(rc.width)}x${Math.round(rc.height)} ${name(e).slice(0, 30)}`);
    });
    return {
      lang: document.documentElement.lang, title: document.title,
      desc: document.querySelector('meta[name=description]')?.content || '',
      imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      unnamed: [...document.querySelectorAll('a,button')].filter((e) => !name(e)).map((e) => e.outerHTML.slice(0, 60)),
      dupIds: Object.entries(ids).filter(([, n]) => n > 1).map(([id]) => id),
      h1: hs.filter((x) => x === 1).length, jumps, small,
      badLabelledby: [...document.querySelectorAll('[aria-labelledby]')].flatMap((e) => e.getAttribute('aria-labelledby').split(' ')).filter((id) => !document.getElementById(id)),
      unlabeledFields: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter((f) => !(f.labels?.length || f.getAttribute('aria-label') || f.getAttribute('aria-labelledby'))).map((f) => f.name || f.id),
    };
  });
  ok(r.lang === 'pt-BR', `${path}: lang ${r.lang}`);
  ok(r.title.includes('Alto Code'), `${path}: título "${r.title}"`);
  ok(r.desc.length > 50, `${path}: meta description`);
  ok(r.imgsNoAlt === 0, `${path}: imagens sem alt (${r.imgsNoAlt})`);
  ok(r.unnamed.length === 0, `${path}: controles sem nome ${r.unnamed}`);
  ok(r.dupIds.length === 0, `${path}: ids duplicados ${r.dupIds}`);
  ok(r.h1 === 1, `${path}: um único h1 (${r.h1})`);
  ok(r.jumps.length === 0, `${path}: saltos de título ${r.jumps}`);
  ok(r.badLabelledby.length === 0, `${path}: aria-labelledby inválido ${r.badLabelledby}`);
  ok(r.unlabeledFields.length === 0, `${path}: campos sem rótulo ${r.unlabeledFields}`);
  ok(r.small.length === 0, `${path}: alvos menores que 24 px ${r.small}`);
}
// link "Pular para o conteúdo": aparece ao receber foco e tem tamanho de toque adequado
await p.goto(BASE + '/'); await p.waitForTimeout(300); await p.keyboard.press('Tab');
const skip = await p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { text: e.textContent.trim(), w: r.width, h: r.height }; });
ok(/pular/i.test(skip.text) && skip.w >= 24 && skip.h >= 24, `link de pular conteúdo visível ao focar ${JSON.stringify(skip)}`);
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
