// Acabamento (celular e computador, PT e EN):
// 1. botões dos projetos sem cortes, com respiro interno, empilhados quando não cabem lado a lado;
// 2. linha do Processo do centro do marcador 01 ao centro do 05, também com textos mais altos;
// 3. perguntas frequentes abrindo e fechando suavemente, pelo mouse e pelo teclado, sem movimento
//    quando o sistema pede movimento reduzido ou o visitante pausa as animações;
// 4. Hero: descrição nova, etiqueta da bancada inteira, planilha sem rolagem lateral.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const WIDTHS = [320, 360, 390, 430, 520, 600, 768, 1440];
const SUBTITLE = {
  pt: 'Apresente melhor seus serviços, organize informações e reduza tarefas repetitivas com soluções feitas para sua rotina. Do orçamento à entrega, você fala diretamente comigo.',
  en: 'Present your services better, keep information organized and cut down on repetitive tasks with solutions built around your routine. From quote to delivery, you talk directly with me.',
};

/** Rola a lista do Processo inteira para acender todas as etapas. */
const lightProcess = () => (async () => {
  const el = document.querySelector('#como-trabalho ol'); const r = el.getBoundingClientRect();
  for (let y = r.top + scrollY - innerHeight; y < r.bottom + scrollY; y += 160) { scrollTo(0, y); await new Promise((f) => setTimeout(f, 50)); }
  el.scrollIntoView({ block: 'center' });
})();

/** Linha do Processo: diferença (px) entre as pontas da linha/preenchimento e os centros dos marcadores. */
const readProcess = () => {
  const wrap = document.querySelector('#como-trabalho ol').parentElement;
  const marks = [...wrap.querySelectorAll('[data-step-mark]')];
  const line = wrap.querySelector('[data-process-track]'); if (!line) return null;
  const c = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const v = line.dataset.processTrack === 'vertical'; const L = line.getBoundingClientRect(); const F = line.firstElementChild.getBoundingClientRect();
  const first = c(marks[0]), last = c(marks[marks.length - 1]);
  const reached = wrap.querySelectorAll('li[data-reached]').length;
  const target = c(marks[Math.max(0, reached - 1)]);
  return {
    vertical: v, reached,
    start: v ? L.top - first[1] : L.left - first[0],
    end: v ? L.bottom - last[1] : L.right - last[0],
    cross: v ? L.left + L.width / 2 - first[0] : L.top + L.height / 2 - first[1],
    fillEnd: v ? F.bottom - target[1] : F.right - target[0],
  };
};

for (const lang of ['pt', 'en']) {
  const home = lang === 'en' ? '/en/' : '/';
  for (const w of WIDTHS) {
    const p = await b.newPage({ viewport: { width: w, height: 860 }, reducedMotion: 'reduce' }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + home); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const tag = `${lang} ${w}px`;

    // ---- Hero
    const hero = await p.evaluate(() => {
      const label = document.querySelector('#inicio .bench-canvas > .frame-label');
      const sc = document.querySelector('#inicio table').parentElement;
      return { sub: document.querySelector('#inicio .type-lead').textContent.trim(), labelCut: label.scrollWidth > label.clientWidth + 1, table: sc.scrollWidth - sc.clientWidth, words: [...document.querySelectorAll('#hero-title [data-word]')].map((s) => s.dataset.word) };
    });
    ok(hero.sub === SUBTITLE[lang], `${tag}: descrição nova do Hero`);
    ok(!hero.labelCut, `${tag}: etiqueta da bancada sem corte`);
    ok(hero.table <= 0, `${tag}: planilha da bancada sem rolagem lateral (${hero.table} px a mais)`);
    ok(['site', 'sistema', 'planilha', 'automacao', 'accent'].every((x) => hero.words.includes(x)), `${tag}: palavras da moldura no título (${hero.words})`);
    // moldura do título sobre a palavra ativa já na carga (também depois da troca de fonte)
    const sel = await p.evaluate(() => { const a = document.querySelector('.title-sel').getBoundingClientRect(), w = document.querySelector('.hero-word.is-active').getBoundingClientRect(); const pad = parseFloat(getComputedStyle(document.querySelector('#hero-title')).fontSize) * 0.1; return [w.left - a.left - pad, a.right - w.right - pad]; });
    ok(sel.every((v) => Math.abs(v) < 1.5), `${tag}: moldura alinhada à palavra na carga (${sel.map((v) => v.toFixed(1))})`);

    // ---- Botões dos cinco projetos
    const stages = await p.evaluate(() => [...document.querySelectorAll('#projetos article.stage')].map((st) => {
      const btns = [...st.querySelectorAll(':scope > div:nth-child(2) a[class*="rounded-[10px]"]')];
      return btns.map((a) => {
        const r = a.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(a); const t = range.getBoundingClientRect();
        const icon = a.querySelector('svg')?.getBoundingClientRect();
        return { w: r.width, h: r.height, top: r.top, left: r.left, padX: Math.min(t.left - r.left, r.right - t.right), padY: Math.min(t.top - r.top, r.bottom - t.bottom), clipped: a.scrollWidth > a.clientWidth + 1 || a.scrollHeight > a.clientHeight + 1, align: getComputedStyle(a).textAlign, iconIn: !icon || (icon.left >= r.left && icon.right <= r.right && icon.top >= r.top && icon.bottom <= r.bottom) };
      });
    }));
    ok(stages.length === 5 && stages.every((s) => s.length === 2), `${tag}: dois botões em cada um dos 5 projetos`);
    const all = stages.flat();
    ok(all.every((x) => !x.clipped), `${tag}: textos dos botões sem corte`);
    ok(all.every((x) => x.padX >= 16), `${tag}: respiro lateral de 16 px ou mais (${Math.min(...all.map((x) => Math.round(x.padX)))})`);
    ok(all.every((x) => x.padY >= 9), `${tag}: respiro vertical de 9 px ou mais (${Math.min(...all.map((x) => Math.round(x.padY)))})`);
    ok(all.every((x) => x.h >= 44 && x.align === 'center' && x.iconIn), `${tag}: altura mínima, texto centralizado e ícone dentro do botão`);
    const sideBySide = stages.every(([a, c]) => Math.abs(a.top - c.top) < 1);
    const stacked = stages.every(([a, c]) => Math.abs(a.left - c.left) < 1);
    if (w < 520) ok(stacked, `${tag}: botões empilhados quando não cabem lado a lado`);
    else if (w < 768) ok(sideBySide && all.every((x) => x.h === 44), `${tag}: lado a lado em uma linha só`);
    ok(stages.every(([a, c]) => !sideBySide || Math.abs(a.h - c.h) < 1), `${tag}: botões lado a lado com a mesma altura`);

    // ---- Linha do Processo
    await p.evaluate(lightProcess); await p.waitForTimeout(400);
    let pr = await p.evaluate(readProcess);
    ok(pr && pr.vertical === (w < 1024), `${tag}: linha ${w < 1024 ? 'vertical' : 'horizontal'}`);
    ok(pr && Math.abs(pr.start) <= 1 && Math.abs(pr.end) <= 1 && Math.abs(pr.cross) <= 1, `${tag}: linha do centro do 01 ao centro do 05 (${pr && [pr.start, pr.end, pr.cross].map((v) => v.toFixed(1))})`);
    ok(pr && pr.reached === 5 && Math.abs(pr.fillEnd) <= 1, `${tag}: preenchimento termina no marcador 05 (${pr && pr.fillEnd.toFixed(1)})`);
    // texto bem mais alto numa etapa do meio (como uma tradução mais longa): a linha continua certa
    await p.evaluate(() => { const d = document.querySelectorAll('#como-trabalho ol li p')[2]; d.textContent = d.textContent + ' ' + d.textContent + ' ' + d.textContent; });
    await p.waitForTimeout(300);
    pr = await p.evaluate(readProcess);
    ok(pr && Math.abs(pr.start) <= 1 && Math.abs(pr.end) <= 1 && Math.abs(pr.fillEnd) <= 1, `${tag}: linha certa com texto mais alto (${pr && [pr.start, pr.end, pr.fillEnd].map((v) => v.toFixed(1))})`);

    ok((await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, `${tag}: sem rolagem lateral`);
    ok(errs.length === 0, `${tag}: sem erros ${errs}`);
    await p.close();
  }

  // ---- Linha parcial: o preenchimento para no centro da última etapa alcançada
  {
    const p = await b.newPage({ viewport: { width: 390, height: 700 }, reducedMotion: 'reduce' });
    await p.goto(BASE + home); await p.waitForTimeout(300);
    await p.evaluate(() => { const li = document.querySelectorAll('#como-trabalho ol li')[1]; li.scrollIntoView({ block: 'end' }); }); await p.waitForTimeout(600);
    const pr = await p.evaluate(readProcess);
    ok(pr && pr.reached >= 1 && pr.reached < 5 && Math.abs(pr.fillEnd) <= 1, `${lang}: preenchimento parcial no centro da etapa ${pr?.reached} (${pr?.fillEnd.toFixed(1)})`);
    await p.close();
  }

  // ---- FAQ com animação (movimento normal)
  {
    const p = await b.newPage({ viewport: { width: 390, height: 860 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + home); await p.locator('#perguntas').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    const first = p.locator('#perguntas details').first();
    const sample = () => p.evaluate(async () => {
      const d = document.querySelector('#perguntas details'); const body = d.querySelector('.faq-body'); const out = []; const t0 = performance.now();
      while (performance.now() - t0 < 420) { out.push({ t: performance.now() - t0, h: body.getBoundingClientRect().height, o: +getComputedStyle(body).opacity, open: d.open, state: d.dataset.state }); await new Promise(requestAnimationFrame); }
      return { out, final: { h: body.getBoundingClientRect().height, scroll: body.scrollHeight, client: body.clientHeight, inline: body.getAttribute('style') || '', overflow: getComputedStyle(body).overflow } };
    });
    await first.locator('summary').click();
    let s = await sample();
    const finalH = s.final.h;
    const mid = s.out.filter((x) => x.t > 40 && x.t < 160);
    ok(mid.length > 0 && mid.every((x) => x.h > 1 && x.h < finalH - 1), `${lang}: resposta abre aos poucos (${mid.map((x) => Math.round(x.h)).join(',')} → ${Math.round(finalH)})`);
    ok(s.out[0].state === 'open' && s.out[0].o < 0.9, `${lang}: ícone gira junto e o texto aparece aos poucos (opacidade ${s.out[0].o.toFixed(2)})`);
    const done = s.out.find((x) => Math.abs(x.h - finalH) < 0.5);
    ok(done && done.t >= 150 && done.t <= 330, `${lang}: abertura em cerca de 240 ms (${done && Math.round(done.t)} ms)`);
    ok(s.final.scroll <= s.final.client + 1 && !/height/.test(s.final.inline) && s.final.overflow === 'visible', `${lang}: resposta inteira depois de aberta (altura automática, nada cortado)`);
    const rot = await first.locator('.faq-icon').evaluate((el) => ({ rotate: getComputedStyle(el).rotate, tr: getComputedStyle(el).transitionProperty }));
    ok(rot.rotate === '45deg' && rot.tr.includes('rotate'), `${lang}: ícone girado com a resposta aberta, com transição (${JSON.stringify(rot)})`);
    await first.locator('summary').click();
    s = await sample();
    const midClose = s.out.filter((x) => x.t > 40 && x.t < 130);
    ok(s.out[0].state === 'closed' && midClose.length > 0 && midClose.every((x) => x.h > 1 && x.h < finalH - 1), `${lang}: resposta fecha aos poucos (${midClose.map((x) => Math.round(x.h)).join(',')})`);
    ok((await first.evaluate((d) => d.open)) === false && (await first.evaluate((d) => Math.round(d.getBoundingClientRect().height))) < 90, `${lang}: fechada ao fim da animação`);
    // clique duplo rápido: reabre a partir da altura atual, sem salto
    await first.locator('summary').click(); await p.waitForTimeout(90); await first.locator('summary').click(); await p.waitForTimeout(350);
    ok((await first.evaluate((d) => d.open)) === false && (await first.getAttribute('data-state')) === 'closed', `${lang}: interromper a abertura fecha sem travar`);
    // teclado: Enter e espaço no <summary>
    await first.locator('summary').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(350);
    ok((await first.evaluate((d) => d.open)) && (await first.getAttribute('data-state')) === 'open', `${lang}: Enter abre`);
    await p.keyboard.press('Space'); await p.waitForTimeout(350);
    ok(!(await first.evaluate((d) => d.open)), `${lang}: espaço fecha`);
    ok(await first.locator('summary').evaluate((el) => document.activeElement === el), `${lang}: foco continua na pergunta`);
    // as outras perguntas também
    const n = await p.locator('#perguntas details').count();
    for (let i = 1; i < n; i++) { await p.locator('#perguntas summary').nth(i).click(); }
    await p.waitForTimeout(400);
    const allOpen = await p.evaluate(() => [...document.querySelectorAll('#perguntas details')].slice(1).every((d) => d.open && d.querySelector('.faq-body').scrollHeight <= d.querySelector('.faq-body').clientHeight + 1));
    ok(allOpen, `${lang}: todas as ${n} perguntas abrem por inteiro`);
    // "Pausar animações": abre na hora
    await p.evaluate(() => document.documentElement.setAttribute('data-motion', 'paused'));
    const second = p.locator('#perguntas details').nth(1);
    await second.locator('summary').click();
    const still = await p.evaluate(() => { const d = document.querySelectorAll('#perguntas details')[1]; return { open: d.open, anims: d.querySelector('.faq-body').getAnimations().length, icon: getComputedStyle(d.querySelector('.faq-icon')).transitionDuration }; });
    ok(!still.open && still.anims === 0 && still.icon === '0s', `${lang}: com animações pausadas, fecha sem animação (${JSON.stringify(still)})`);
    ok(errs.length === 0, `${lang}: FAQ sem erros ${errs}`);
    await p.close();
  }
  // ---- FAQ com movimento reduzido
  {
    const p = await b.newPage({ viewport: { width: 390, height: 860 }, reducedMotion: 'reduce' });
    await p.goto(BASE + home); await p.locator('#perguntas').scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    const first = p.locator('#perguntas details').first();
    await first.locator('summary').click();
    const r = await first.evaluate((d) => ({ open: d.open, anims: d.querySelector('.faq-body').getAnimations().length, h: d.querySelector('.faq-body').getBoundingClientRect().height }));
    ok(r.open && r.anims === 0 && r.h > 20, `${lang}: movimento reduzido abre na hora (${JSON.stringify(r)})`);
    await first.locator('summary').click();
    ok(!(await first.evaluate((d) => d.open)), `${lang}: movimento reduzido fecha na hora`);
    await p.close();
  }
}
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
