// Identidade visual: logo nova no cabeçalho (transparente e claro), no rodapé e no cartão Sobre,
// em PT e EN, de 320 a 1440 px; link para o início do idioma; cores por fundo; altura da barra
// preservada; favicon com versão para 16 px; imagens de compartilhamento da marca por idioma.
import { readFileSync } from 'node:fs';
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);

const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const same = (a, b) => a.length === 3 && a.every((v, i) => Math.abs(v - b[i]) <= 1);
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

/** Lê a logo do cabeçalho: link, nome acessível, cores das duas partes, caixa e vizinhos. */
const readHeader = () => {
  const a = document.querySelector('header .logo-link');
  const svg = a?.querySelector('svg');
  const paths = svg ? [...svg.querySelectorAll('path')] : [];
  const r = a.getBoundingClientRect();
  const bar = document.querySelector('header .container-site');
  const kids = [...bar.children].map((c) => c.getBoundingClientRect()).filter((x) => x.width);
  let overlap = false; for (let i = 1; i < kids.length; i++) if (kids[i].left < kids[i - 1].right - 0.5) overlap = true;
  const container = bar.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(bar).paddingLeft);
  return {
    href: a.getAttribute('href'), label: a.getAttribute('aria-label'), paths: paths.length,
    fg: paths[0] && getComputedStyle(paths[0]).fill, accent: paths[1] && getComputedStyle(paths[1]).fill,
    svgH: svg.getBoundingClientRect().height, w: r.width, top: r.top, bottom: r.bottom,
    barH: bar.getBoundingClientRect().height, overlap, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    leftEdge: svg.getBoundingClientRect().left - (container.left + pad),
    oldMark: !!document.querySelector('header svg rect[x="4.5"]'),
    headerBg: getComputedStyle(document.querySelector('header')).backgroundColor,
  };
};

for (const lang of ['pt', 'en']) {
  const home = lang === 'en' ? '/en/' : '/';
  for (const w of [320, 390, 768, 1024, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + home); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250);
    const tag = `${lang} ${w}px`;
    let r = await p.evaluate(readHeader);
    ok(r.href === (lang === 'en' ? '/en' : '/') || r.href === home, `${tag}: logo leva ao início do idioma (${r.href})`);
    ok(r.label === (lang === 'en' ? 'Alto Code, home page' : 'Alto Code, página inicial'), `${tag}: nome acessível ${r.label}`);
    ok(r.paths === 2 && !r.oldMark, `${tag}: logo nova (símbolo e nome em contornos), sem o monograma antigo`);
    // topo transparente sobre a noite: A e "Alto" claros, detalhes em #22C3B0
    ok(same(rgb(r.fg), hex('#f3f6fb')) && same(rgb(r.accent), hex('#22c3b0')), `${tag}: cores sobre o escuro ${r.fg} / ${r.accent}`);
    ok(r.barH === (w >= 640 ? 72 : 64), `${tag}: altura da barra preservada (${r.barH})`);
    ok(r.svgH >= 20 && r.svgH <= 26, `${tag}: logo compacta (${r.svgH.toFixed(1)} px de altura)`);
    ok(!r.overlap && r.sw <= r.cw, `${tag}: logo, menu e controles sem sobreposição nem rolagem lateral`);
    ok(Math.abs(r.leftEdge) <= 1, `${tag}: logo alinhada à borda do conteúdo (${r.leftEdge.toFixed(1)} px)`);
    ok(await p.locator(w >= 1024 ? 'header .container-site > nav' : 'header button[aria-controls="menu-movel"]').isVisible(), `${tag}: menu preservado`);
    ok(await p.locator('header').getByRole('button', { name: /anima|motion/i }).first().isVisible(), `${tag}: controle de movimento preservado`);
    if (w >= 640) ok(await p.locator('header').getByRole('link', { name: lang === 'en' ? /Português|PT/ : /English|EN/ }).first().isVisible(), `${tag}: seletor PT/EN preservado`);
    // cabeçalho claro depois de rolar: A e "Alto" marinho, detalhes em #0E9888 (3:1 ou mais contra o branco)
    await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(350);
    r = await p.evaluate(readHeader);
    ok(same(rgb(r.fg), hex('#0d1a30')) && same(rgb(r.accent), hex('#0e9888')), `${tag}: cores sobre o claro ${r.fg} / ${r.accent}`);
    ok(contrast(rgb(r.accent), [255, 255, 255]) >= 3, `${tag}: verde-água da logo com 3:1 ou mais sobre branco`);
    ok(r.barH === (w >= 640 ? 72 : 64), `${tag}: altura da barra igual depois de rolar`);
    // moldura de seleção ao passar o mouse e ao focar pelo teclado
    if (w === 1440 || w === 390) {
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
      const frame = () => p.evaluate(() => getComputedStyle(document.querySelector('header .logo-link .frame-sel'), '::after').opacity);
      ok((await frame()) === '0', `${tag}: moldura escondida em repouso`);
      await p.locator('header .logo-link').hover(); await p.waitForTimeout(250);
      ok((await frame()) === '1', `${tag}: moldura de seleção ao passar o mouse`);
      await p.mouse.move(w - 5, 700); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(250);
      const focused = await p.evaluate(() => document.activeElement?.classList.contains('logo-link'));
      ok(focused && (await frame()) === '1', `${tag}: moldura de seleção ao focar pelo teclado`);
      // clique leva ao início do idioma, mesmo vindo de uma página de projeto
      await p.goto(BASE + (lang === 'en' ? '/en/projects/orcafacil' : '/projetos/orcafacil')); await p.waitForTimeout(300);
      await p.locator('header .logo-link').click(); await p.waitForTimeout(300);
      ok(new URL(p.url()).pathname.replace(/\/$/, '') === (lang === 'en' ? '/en' : ''), `${tag}: clique na logo volta ao início (${p.url()})`);
      // rodapé escuro
      await p.evaluate(() => document.querySelector('footer').scrollIntoView()); await p.waitForTimeout(200);
      const f = await p.evaluate(() => { const a = document.querySelector('footer .logo-link'); const ps = a.querySelectorAll('svg path'); return { href: a.getAttribute('href'), fg: getComputedStyle(ps[0]).fill, accent: getComputedStyle(ps[1]).fill, label: a.getAttribute('aria-label') }; });
      ok(same(rgb(f.fg), hex('#f3f6fb')) && same(rgb(f.accent), hex('#22c3b0')) && f.label?.startsWith('Alto Code'), `${tag}: logo do rodapé ${JSON.stringify(f)}`);
      // cartão Sobre: símbolo na moldura de seleção
      const about = await p.evaluate(() => { const s = document.querySelector('#sobre .frame-sel svg path'); return s ? getComputedStyle(s).fill : null; });
      ok(about && same(rgb(about), hex('#f3f6fb')), `${tag}: símbolo no cartão Sobre (${about})`);
    }
    ok(errs.length === 0, `${tag}: sem erros ${errs}`);
    await p.close();
  }
}

// Favicon e ícones
{
  const p = await b.newPage();
  await p.goto(BASE + '/');
  const links = await p.evaluate(() => [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((l) => [l.rel, l.getAttribute('href')]));
  ok(links.some(([r, h]) => r === 'icon' && h === '/favicon.svg') && links.some(([r, h]) => r === 'apple-touch-icon' && h === '/apple-touch-icon.png'), `favicon e ícone do celular declarados ${JSON.stringify(links)}`);
  const fav = await (await p.request.get(BASE + '/favicon.svg')).text();
  ok(fav.includes('@media (max-width:24px)') && fav.includes('#22c3b0'), 'favicon.svg com o símbolo novo e versão para 16 px');
  // o navegador desenha versões diferentes em 16 e 48 px (16 px: só o A com a barra)
  const data = 'data:image/svg+xml;base64,' + Buffer.from(fav).toString('base64');
  await p.setContent(`<body style="margin:0;background:#fff"><img id="a" src="${data}" width="16" height="16"><img id="b" src="${data}" width="48" height="48"></body>`);
  await p.waitForTimeout(200);
  const teal = await p.evaluate(async () => {
    const count = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0, img.width, img.height); const d = x.getImageData(0, 0, img.width, img.height).data; let t = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 1] > 150 && d[i] < 120 && d[i + 2] > 120) t++; return t / (img.width * img.height); };
    return [count(document.getElementById('a')), count(document.getElementById('b'))];
  });
  ok(teal[0] > 0 && teal[1] > teal[0] * 1.5, `favicon: 16 px mais simples (menos verde-água) que 48 px ${teal.map((v) => v.toFixed(3))}`);
  const icon = await p.request.get(BASE + '/apple-touch-icon.png');
  ok(icon.status() === 200 && (await icon.body()).length > 1000, 'apple-touch-icon.png publicado');
  await p.close();
}

// Imagens de compartilhamento da marca por idioma (metadados atualizados no navegador)
for (const [path, img] of [['/', 'og-image.png'], ['/en/', 'og-image-en.png']]) {
  const p = await b.newPage();
  await p.goto(BASE + path); await p.waitForTimeout(300);
  const og = await p.evaluate(() => document.querySelector('meta[property="og:image"]')?.content || '');
  ok(og.endsWith('/' + img), `${path}: og:image ${og}`);
  const r = await p.request.get(BASE + '/' + img);
  ok(r.status() === 200 && r.headers()['content-type']?.includes('png'), `${img} publicado`);
  await p.close();
}
// Arquivos da marca: textos de compartilhamento em cada idioma (o kit fica fora do site publicado)
const kit = readFileSync(new URL('../../marca/svg/alto-code-vertical-escuro-en.svg', import.meta.url), 'utf8');
ok(kit.includes('Digital Development') && kit.includes('#22c3b0'), 'kit da marca com versão em inglês');
const res = await (await b.newPage()).request.get(BASE + '/marca/svg/alto-code-simbolo-escuro.svg');
ok(res.status() === 404 || !(res.headers()['content-type'] || '').includes('svg'), 'kit da marca não publicado no site');

console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
