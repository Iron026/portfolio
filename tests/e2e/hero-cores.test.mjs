// Quatro cores próprias nas abas da bancada do Início (Site, Sistema, Planilha, Automação):
// cada aba aplica a sua cor na palavra do título, na moldura, na etiqueta, no indicador da aba,
// no painel de inspeção e na luz de fundo; as quatro são diferentes entre si (Planilha ≠ Sistema),
// e as variantes passam o contraste AA nas superfícies escura (noite) e clara (bancada branca).
// Vale em PT e EN, no computador e no celular, com e sem movimento reduzido.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);

const EXPECT = {
  site: { fill: '#22c3b0', onDark: '#3fd5c1', onLight: '#0a7568' },
  sistema: { fill: '#5b84ff', onDark: '#8aa8ff', onLight: '#2b4fb8' },
  planilha: { fill: '#a78bfa', onDark: '#c4b5fd', onLight: '#6d4ad6' },
  automacao: { fill: '#f2a93b', onDark: '#f2b45a', onLight: '#8c5a07' },
};
// Ordem das abas na bancada (a mesma em PT e EN)
const ORDER = { site: 0, planilha: 1, automacao: 2, sistema: 3 };

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const hue = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
const same = (a, b) => a.length === 3 && a.every((v, i) => Math.abs(v - b[i]) <= 1);

// Contraste das variantes (independe do navegador)
const NIGHT = hex('#060e1d'), WHITE = [255, 255, 255], INK = hex('#071425');
for (const [id, c] of Object.entries(EXPECT)) {
  ok(contrast(hex(c.fill), NIGHT) >= 4.5, `${id}: cor plena sobre a noite ≥ 4,5:1 (${contrast(hex(c.fill), NIGHT).toFixed(2)})`);
  ok(contrast(INK, hex(c.fill)) >= 4.5, `${id}: etiqueta escura sobre a cor plena ≥ 4,5:1 (${contrast(INK, hex(c.fill)).toFixed(2)})`);
  ok(contrast(hex(c.onDark), NIGHT) >= 4.5, `${id}: texto sobre escuro ≥ 4,5:1 (${contrast(hex(c.onDark), NIGHT).toFixed(2)})`);
  ok(contrast(hex(c.onLight), WHITE) >= 4.5, `${id}: texto sobre a bancada branca ≥ 4,5:1 (${contrast(hex(c.onLight), WHITE).toFixed(2)})`);
}
const fills = Object.values(EXPECT).map((c) => c.fill);
ok(new Set(fills).size === 4, 'quatro cores plenas diferentes');
const hs = Object.values(EXPECT).map((c) => hue(hex(c.fill)));
let minHue = 360; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const d = Math.abs(hs[i] - hs[j]); minHue = Math.min(minHue, Math.min(d, 360 - d)); }
ok(minHue >= 25, `matizes separados por pelo menos 25° (menor: ${minHue.toFixed(0)}°)`);

/** Lê as cores aplicadas pelos elementos do Início na aba ativa. */
const read = () => {
  const s = document.querySelector('#inicio'); const g = (sel, prop) => { const el = document.querySelector(sel); return el ? getComputedStyle(el)[prop] : ''; };
  const cs = getComputedStyle(s);
  return {
    tab: s.dataset.tab,
    vars: ['--cat', '--cat-dark', '--cat-light'].map((v) => cs.getPropertyValue(v).trim().toLowerCase()),
    word: g('.hero-word.is-active', 'color'),
    activeWord: document.querySelector('.hero-word.is-active')?.dataset.word,
    sel: g('.title-sel', 'borderTopColor'),
    label: g('.bench-canvas > .frame-label', 'backgroundColor'),
    labelText: g('.bench-canvas > .frame-label', 'color'),
    pill: g('.bench-pill', 'boxShadow'),
    dot: g('.inspector-dot', 'backgroundColor'),
    tag: g('.inspector .type-tag', 'color'),
    light: g('.hero-light', 'backgroundImage'),
    night: g('.inspector', 'backgroundColor'),
  };
};

for (const lang of ['pt', 'en']) {
  for (const [vp, motion] of [[{ width: 1440, height: 900 }, 'reduce'], [{ width: 390, height: 844 }, 'reduce'], [{ width: 1440, height: 900 }, 'no-preference'], [{ width: 320, height: 640 }, 'no-preference']]) {
    const p = await b.newPage({ viewport: vp, reducedMotion: motion }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + (lang === 'en' ? '/en/' : '/')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    const tag = `${lang} ${vp.width}px ${motion}`;
    const seen = {};
    for (const id of ['site', 'sistema', 'planilha', 'automacao']) {
      await p.locator('#inicio [role=tab]').nth(ORDER[id]).click();
      await p.waitForTimeout(motion === 'reduce' ? 120 : 700);
      const r = await p.evaluate(read); const e = EXPECT[id]; const fill = hex(e.fill);
      ok(r.tab === id, `${tag} ${id}: data-tab ${r.tab}`);
      ok(r.vars[0] === e.fill && r.vars[1] === e.onDark && r.vars[2] === e.onLight, `${tag} ${id}: variáveis da aba ${r.vars}`);
      ok(r.activeWord === id, `${tag} ${id}: moldura na palavra da aba (${r.activeWord})`);
      ok(same(rgb(r.word), fill), `${tag} ${id}: palavra do título na cor da aba ${r.word}`);
      ok(same(rgb(r.sel), fill), `${tag} ${id}: moldura do título na cor da aba ${r.sel}`);
      ok(same(rgb(r.label), fill) && same(rgb(r.labelText), INK), `${tag} ${id}: etiqueta da bancada ${r.label} / ${r.labelText}`);
      ok(r.pill.includes(`rgb(${fill.join(', ')})`), `${tag} ${id}: indicador da aba ativa ${r.pill}`);
      ok(same(rgb(r.dot), fill), `${tag} ${id}: ponto do painel de inspeção ${r.dot}`);
      ok(same(rgb(r.tag), hex(e.onDark)), `${tag} ${id}: categoria no painel em texto sobre escuro ${r.tag}`);
      ok(r.light.includes(`rgba(${fill.join(', ')}, 0.16)`) || r.light.includes(`color(srgb`) || r.light.includes(`rgb(${fill.join(', ')}`), `${tag} ${id}: luz de fundo tingida ${r.light.slice(0, 80)}`);
      ok(contrast(rgb(r.tag), rgb(r.night)) >= 4.5, `${tag} ${id}: contraste do texto no painel ${contrast(rgb(r.tag), rgb(r.night)).toFixed(2)}`);
      seen[id] = r.word;
    }
    ok(new Set(Object.values(seen)).size === 4, `${tag}: quatro cores diferentes na tela ${JSON.stringify(seen)}`);
    ok(seen.planilha !== seen.sistema, `${tag}: Planilha e Sistema com cores diferentes`);
    // a bancada clara usa a variante escura da cor (texto e detalhes sobre branco)
    await p.locator('#inicio [role=tab]').nth(ORDER.planilha).click(); await p.waitForTimeout(150);
    const margin = await p.evaluate(() => { const el = document.querySelector('#inicio [role=tabpanel] [class*="cat-light"]'); return el ? [getComputedStyle(el).color, getComputedStyle(el).outlineColor] : null; });
    ok(margin && margin.some((c) => same(rgb(c), hex(EXPECT.planilha.onLight))), `${tag}: detalhe da bancada branca na variante clara ${margin}`);
    ok(errs.length === 0, `${tag}: sem erros de página ${errs}`);
    await p.close();
  }
}

// Com "Pausar animações", a cor muda na hora e a moldura não anima
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + '/'); await p.waitForTimeout(300);
  await p.evaluate(() => document.documentElement.setAttribute('data-motion', 'paused'));
  const tr = await p.evaluate(() => [getComputedStyle(document.querySelector('.title-sel')).transitionDuration, getComputedStyle(document.querySelector('.hero-word')).transitionDuration]);
  ok(tr.every((d) => /^0s(, 0s)*$/.test(d)), `pausado: sem transição na moldura e nas palavras ${tr}`);
  await p.locator('#inicio [role=tab]').nth(ORDER.automacao).click(); await p.waitForTimeout(30);
  ok(same(rgb(await p.evaluate(() => getComputedStyle(document.querySelector('.hero-word.is-active')).color)), hex(EXPECT.automacao.fill)), 'pausado: cor aplicada imediatamente');
  await p.close();
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
