// Inovações visuais e correções da versão "criativa":
// A) Início: a moldura do título acompanha a aba da bancada e o painel de inspeção mostra o serviço.
// B) Vitrine: índice com os cinco projetos, que acompanha a rolagem e leva ao palco certo.
// C) Projeto em detalhes: tour de funcionalidades que troca a captura e enquadra a área certa.
// Correções: contraste da descrição da prévia, legendas sem rotas técnicas, linguagem "Projetos em detalhes",
// prévia em vídeo das páginas de projeto só depois do clique (nada baixado antes).
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
const SLUGS = ['prime-imoveis', 'gestao360', 'nova-servicos', 'arena-store', 'orcafacil'];

// --- A) Início: bancada de criação
for (const [lang, words, services] of [
  ['', { site: 'Sites', planilha: 'planilhas', automacao: 'automações', sistema: 'sistemas' }, { site: 'Sites e landing pages', planilha: 'Planilhas inteligentes', automacao: 'Automação de processos', sistema: 'Sistemas web' }],
  ['/en', { site: 'websites', planilha: 'spreadsheets', automacao: 'automation', sistema: 'systems' }, { site: 'Websites and landing pages', planilha: 'Smart spreadsheets', automacao: 'Process automation', sistema: 'Web systems' }],
]) {
  for (const w of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + (lang || '') + '/'); await p.waitForTimeout(600);
    const tag = `${lang || 'pt'} ${w}px`;
    const ids = ['site', 'planilha', 'automacao', 'sistema'];
    for (let i = 0; i < 4; i++) {
      await p.locator('#inicio [role=tab]').nth(i).click(); await p.waitForTimeout(200);
      const r = await p.evaluate(() => {
        const word = document.querySelector('.hero-word.is-active');
        const sel = document.querySelector('.title-sel');
        const a = word.getBoundingClientRect(); const s = sel.getBoundingClientRect();
        return { id: word.dataset.word, text: word.textContent, overlap: Math.abs(a.left - s.left) < 20 && Math.abs(a.right - s.right) < 20 && Math.abs((a.top + a.bottom) / 2 - (s.top + s.bottom) / 2) < 16, inspector: document.querySelector('.inspector')?.innerText ?? '' };
      });
      ok(r.id === ids[i] && r.text === words[ids[i]], `${tag}: aba ${ids[i]} → palavra ${r.text}`);
      ok(r.overlap, `${tag}: moldura sobre "${r.text}"`);
      ok(r.inspector.includes(services[ids[i]]), `${tag}: painel mostra ${services[ids[i]]}`);
    }
    // teclado: seta para a direita volta ao primeiro
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => document.querySelector('.hero-word.is-active').dataset.word)) === 'site', `${tag}: seta do teclado move a moldura`);
    const dur = await p.evaluate(() => getComputedStyle(document.querySelector('.title-sel')).transitionDuration);
    ok(dur.split(',').every((d) => parseFloat(d) <= 0.01), `${tag}: sem transição perceptível com movimento reduzido (${dur})`);
    // link do painel leva ao formulário com o serviço
    const href = await p.locator('.inspector a[href*="servico="]').first().getAttribute('href');
    ok(/servico=sites#contato$/.test(href), `${tag}: painel → orçamento do serviço (${href})`);
    await p.close();
  }
}

// --- B) Vitrine com índice
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE + '/'); await p.waitForTimeout(600);
  const index = p.locator('nav[aria-label="Índice dos projetos"]:visible');
  ok((await index.locator('a').count()) === 5, 'vitrine: índice com os cinco projetos');
  for (const slug of SLUGS) {
    await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' }); }, `projetos-${slug}`);
    await p.waitForTimeout(500);
    const cur = await index.locator('a[aria-current="true"]').getAttribute('href');
    ok(cur === `#projetos-${slug}`, `vitrine: índice marca ${slug} ao rolar (${cur})`);
    const sel = await p.evaluate(() => { const s = document.querySelector('.index-sel').getBoundingClientRect(); const a = document.querySelector('.index-item[aria-current="true"]').getBoundingClientRect(); return Math.abs(s.top - a.top) < 3 && Math.abs(s.height - a.height) < 3; });
    ok(sel, `vitrine: moldura do índice sobre ${slug}`);
  }
  await p.evaluate(() => window.scrollTo({ top: document.getElementById('projetos').offsetTop, behavior: 'instant' })); await p.waitForTimeout(300);
  await index.locator('a[href="#projetos-arena-store"]').click(); await p.waitForTimeout(1200);
  const top = await p.evaluate(() => document.getElementById('projetos-arena-store').getBoundingClientRect().top);
  ok(top > 0 && top < 200, `vitrine: item do índice leva ao palco (topo ${Math.round(top)})`);
  for (const slug of SLUGS) {
    const art = p.locator(`#projetos-${slug}`);
    const links = await art.locator('a').evaluateAll((as) => as.map((a) => a.textContent.trim()));
    ok(links.some((t) => t.startsWith('Testar demonstração')) && links.some((t) => t.startsWith('Conheça o projeto')) && links.some((t) => t.startsWith('Quero')), `vitrine: ${slug} com testar, conhecer e orçamento`);
    ok((await art.locator('.phone img').count()) === 1 && (await art.locator('.browser img').count()) >= 1, `vitrine: ${slug} com computador e celular`);
  }
  await p.close();
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(BASE + '/'); await m.waitForTimeout(600);
  const jump = m.locator('nav[aria-label="Índice dos projetos"]:visible a');
  ok((await jump.count()) === 5, 'celular: atalhos para os cinco projetos');
  const sizes = await jump.evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height));
  ok(sizes.every((h) => h >= 44), 'celular: atalhos com 44 px de altura');
  await m.close();
}

// --- C) Tour de funcionalidades e correções nas páginas de projeto
const EXPECT = { 'prime-imoveis': [1, 1, 1, 2, 2, 'celular'], gestao360: [1, 1, 1, 1, 2, 'celular'], 'nova-servicos': [1, 1, 2, 2, 'celular'], 'arena-store': [1, 1, 2, 3, 3, 'celular'], orcafacil: [1, 1, 1, 1, 2, 2, 'celular'] };
for (const lang of ['', '/en']) {
  for (const w of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    p.on('pageerror', (e) => errs.push(e.message));
    for (const slug of SLUGS) {
      const tag = `${lang || 'pt'} ${w}px ${slug}`;
      await p.goto(`${BASE}${lang}${lang ? '/projects/' : '/projetos/'}${slug}`); await p.waitForTimeout(600);
      const tabs = p.locator('#caso-tour [role=tab]');
      const n = await tabs.count();
      ok(n === EXPECT[slug].length, `${tag}: ${n} paradas no tour`);
      for (let i = 0; i < n; i++) {
        await tabs.nth(i).click(); await p.waitForTimeout(150);
        const r = await p.evaluate(() => {
          const panel = document.querySelector('#caso-tour [role=tabpanel]');
          const img = panel.querySelector('img'); const focus = panel.querySelector('.tour-focus');
          const ib = img.getBoundingClientRect(); const fb = focus?.getBoundingClientRect();
          return {
            src: img.getAttribute('src'), selected: document.querySelector('#caso-tour [role=tab][aria-selected=true]')?.id === panel.getAttribute('aria-labelledby'),
            inside: !fb || (fb.left >= ib.left - 1 && fb.right <= ib.right + 1 && fb.top >= ib.top - 1 && fb.bottom <= ib.bottom + 1 && fb.width > 20 && fb.height > 10),
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          };
        });
        const want = EXPECT[slug][i] === 'celular' ? '/celular-' : `/tela-${EXPECT[slug][i]}-`;
        ok(r.src.includes(want) && (!lang || r.src.includes('/en/')), `${tag}: parada ${i + 1} mostra ${want} (${r.src})`);
        ok(r.selected && r.inside && !r.overflow, `${tag}: parada ${i + 1} com aba ligada e moldura dentro da captura`);
      }
      if (w === 1440) {
        await tabs.first().focus(); await p.keyboard.press('End'); await p.waitForTimeout(100);
        ok((await p.evaluate(() => document.activeElement.getAttribute('aria-selected'))) === 'true' && (await tabs.last().getAttribute('aria-selected')) === 'true', `${tag}: End vai para a última parada`);
      }
      // correções: sem rotas técnicas nas legendas; descrição da prévia fora da moldura e com contraste
      const text = await p.evaluate(() => document.querySelector('main').innerText);
      ok(!/\/demos\/|Captura ·|Captura real|Screenshot ·/.test(text), `${tag}: sem legenda técnica com rota`);
      ok(!/estudo de caso|case study/i.test(text), `${tag}: sem "estudo de caso"`);
      const cap = await p.evaluate(() => {
        const el = document.querySelector('.cover-caption > span');
        if (!el) return null;
        const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        let bg = 'rgb(255,255,255)'; for (let n = el; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = c; break; } }
        const a = lum(getComputedStyle(el).color), z = lum(bg);
        return { inFrame: !!el.closest('.browser'), ratio: (Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05) };
      });
      ok(cap && !cap.inFrame && cap.ratio >= 4.5, `${tag}: descrição da prévia fora da moldura, contraste ${cap?.ratio.toFixed(2)}:1`);
    }
    await p.close();
  }
}

// Prévia em vídeo nas páginas de projeto: só toca (e só é baixada) depois do clique
for (const lang of ['', '/en']) {
  for (const slug of SLUGS) {
    const tag = `${lang || 'pt'} vídeo ${slug}`;
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', (e) => errs.push(e.message));
    const videos = [];
    p.on('request', (r) => /previa\.(webm|mp4)/.test(r.url()) && videos.push(r.url()));
    await p.goto(`${BASE}${lang}${lang ? '/projects/' : '/projetos/'}${slug}`); await p.waitForTimeout(1500);
    const before = await p.evaluate(() => {
      const fig = document.querySelector('figure'); const v = fig.querySelector('video'); const r = fig.querySelector('.browser').getBoundingClientRect();
      return { sources: v.querySelectorAll('source').length, paused: v.paused, preload: v.getAttribute('preload'), autoplay: v.hasAttribute('autoplay'), overlay: !!fig.querySelector('.preview-play'), h: Math.round(r.height) };
    });
    ok(videos.length === 0 && before.sources === 0 && before.paused && before.preload === 'none' && !before.autoplay, `${tag}: nada baixado nem tocando antes do clique (${videos.length} pedidos)`);
    ok(before.overlay, `${tag}: botão de reprodução sobre a imagem`);
    if (slug === 'prime-imoveis' || slug === 'arena-store') {
      await p.click('figure [data-preview-toggle]'); await p.waitForTimeout(2500);
      const after = await p.evaluate(() => { const fig = document.querySelector('figure'); const v = fig.querySelector('video'); return { paused: v.paused, h: Math.round(fig.querySelector('.browser').getBoundingClientRect().height), label: fig.querySelector('[data-preview-toggle]').textContent.trim() }; });
      ok(videos.length >= 1 && videos.every((u) => (lang ? u.includes('/en/previa') : !u.includes('/en/'))) && !after.paused, `${tag}: o clique baixa a prévia do idioma e reproduz (${videos.map((u) => u.replace(/^.*\/projetos/, '')).join(', ')})`);
      ok(after.h === before.h, `${tag}: sem deslocamento da moldura (${before.h} → ${after.h} px)`);
      ok(/^(Pausar|Pause)/.test(after.label), `${tag}: botão passa a pausar (${after.label})`);
      await p.click('figure [data-preview-toggle]'); await p.waitForTimeout(400);
      ok(await p.evaluate(() => document.querySelector('figure video').paused), `${tag}: botão pausa a prévia`);
    }
    await p.close();
  }
}

// Linguagem "Projetos em detalhes" no início
for (const [lang, word] of [['/', 'Conheça o projeto'], ['/en/', 'Explore project']]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(BASE + lang); await p.waitForTimeout(500);
  const t = await p.evaluate(() => document.querySelector('main').innerText);
  ok(t.includes(word) && !/estudo de caso|case study/i.test(t), `início ${lang}: "${word}" e nenhum "estudo de caso"`);
  await p.close();
}

ok(errs.length === 0, 'sem erros de JavaScript ' + errs.slice(0, 3).join(' | '));
console.log(`\n${pass} passaram, ${fail} falharam`);
await b.close();
process.exit(fail ? 1 : 0);
