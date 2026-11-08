// Bancada interativa do hero: abas (mouse e teclado), painéis e fórmulas da planilha.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
  const b = await chromium.launch(LAUNCH);
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    const p = await b.newPage({ viewport: vp }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + '/'); await p.waitForTimeout(500);
    const tabs = p.locator('[role=tablist][aria-label="Exemplos de trabalho"] [role=tab]');
    ok((await tabs.count()) === 4, `${vp.width}: 4 abas`);
    const names = await tabs.allTextContents();
    ok(JSON.stringify(names.map((s) => s.trim())) === JSON.stringify(['Site', 'Planilha', 'Automação', 'Sistema']), `${vp.width}: nomes ${names}`);
    ok((await p.getAttribute('[role=tab][aria-selected=true]', 'id')) && (await p.textContent('[role=tab][aria-selected=true]')).trim() === 'Planilha', `${vp.width}: Planilha inicial`);
    // fórmulas
    for (const [lbl, f] of [['receita', '=SOMA(B2:B5)'], ['despesas', '=SOMA(C2:C5)'], ['lucro', '=SOMA(D2:D5)']]) {
      // O nome acessível começa pelo valor visível e termina com "ver fórmula do total de …".
      const btn = p.getByRole('button', { name: new RegExp(`ver fórmula do total de ${lbl}$`) });
      await btn.click();
      ok((await btn.getAttribute('aria-pressed')) === 'true', `${vp.width}: total ${lbl} pressionado`);
      ok(/^R\$/.test((await btn.textContent()).trim()), `${vp.width}: nome do total ${lbl} começa pelo valor visível`);
      ok((await p.locator('[role=tabpanel]').textContent()).includes(f), `${vp.width}: fórmula ${f}`);
    }
    // mouse em cada aba: painel ligado à aba e visível
    for (const n of ['Site', 'Automação', 'Sistema', 'Planilha']) {
      await p.click(`[role=tab]:has-text("${n}")`);
      const sel = p.locator('[role=tab][aria-selected=true]'); ok((await sel.textContent()).trim() === n, `${vp.width}: clique ${n}`);
      const lab = await p.getAttribute('[role=tabpanel]', 'aria-labelledby'); ok(lab === (await sel.getAttribute('id')), `${vp.width}: painel ligado a ${n}`);
      ok(await p.isVisible('[role=tabpanel]'), `${vp.width}: painel ${n} visível`);
      const box = await p.locator('[role=tabpanel]').boundingBox(); ok(box.x >= 0 && box.x + box.width <= vp.width + 1, `${vp.width}: painel ${n} dentro da tela`);
    }
    // teclado: setas, Home, End e tabindex móvel
    await p.focus('[role=tab][aria-selected=true]');
    await p.keyboard.press('ArrowRight'); ok((await p.evaluate(() => document.activeElement.textContent.trim())) === 'Automação', `${vp.width}: seta direita`);
    await p.keyboard.press('End'); ok((await p.textContent('[role=tab][aria-selected=true]')).trim() === 'Sistema', `${vp.width}: End`);
    await p.keyboard.press('ArrowRight'); ok((await p.textContent('[role=tab][aria-selected=true]')).trim() === 'Site', `${vp.width}: volta ao início`);
    await p.keyboard.press('ArrowLeft'); ok((await p.textContent('[role=tab][aria-selected=true]')).trim() === 'Sistema', `${vp.width}: seta esquerda circular`);
    await p.keyboard.press('Home'); ok((await p.textContent('[role=tab][aria-selected=true]')).trim() === 'Site', `${vp.width}: Home`);
    const tabindex = await tabs.evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')));
    ok(tabindex.filter((t) => t === '0').length === 1, `${vp.width}: só a aba ativa entra no Tab (${tabindex})`);
    ok(errs.length === 0, `${vp.width}: sem erros JS ${errs}`);
    await p.close();
  }
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
