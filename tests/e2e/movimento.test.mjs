// Sistema de animações: botão de pausa, preferência do sistema, pausa fora da tela,
// prévias em vídeo (uma por vez) e ausência de impacto nas funcionalidades.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const errs = [];

// só animações CSS contínuas (transições curtas de hover/cor não contam)
const states = (p, sel) => p.evaluate((s) => [...document.querySelectorAll(s)].flatMap((el) => el.getAnimations()).filter((a) => a instanceof CSSAnimation).map((a) => a.playState), sel);
const scrollToId = (p, id) => p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: 'start', behavior: 'instant' }), id);
const playingVideos = (p) => p.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused && v.currentTime > 0).map((v) => v.closest('article')?.id || 'detalhe'));

for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const tag = `${vp.width}px`;
  const ctx = await b.newContext({ viewport: vp, reducedMotion: 'no-preference' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(`${tag}: ${e.message}`));
  await p.goto(BASE + '/'); await p.waitForTimeout(800);

  // 1. estado inicial: animações rodando no Hero
  ok((await p.getAttribute('html', 'data-motion')) === 'on', `${tag}: começa com animações ativas`);
  const hero = await states(p, '#inicio .ambient *');
  ok(hero.length > 0 && hero.every((s) => s === 'running'), `${tag}: fundo do Hero animado (${hero.length} animações)`);

  // 2. pausa fora da tela: ao rolar até o rodapé, o Hero congela
  await scrollToId(p, 'contato'); await p.waitForTimeout(500);
  ok((await p.getAttribute('#inicio .ambient', 'data-motion-off')) !== null, `${tag}: Hero fora da tela recebe data-motion-off`);
  const heroOff = await states(p, '#inicio .ambient *');
  ok(heroOff.every((s) => s === 'paused'), `${tag}: animações do Hero pausadas fora da tela`);
  // no celular o diagrama fica abaixo do formulário: rola até ele para conferir que anima quando visível
  await p.evaluate(() => document.querySelector('.contact-flow').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(500);
  const contact = await states(p, '.contact-flow *');
  ok(contact.length > 0 && contact.every((s) => s === 'running'), `${tag}: diagrama do contato animado quando visível`);

  // 3. serviços: cada cartão tem uma ilustração, e os temporizadores mudam o conteúdo
  await scrollToId(p, 'servicos'); await p.waitForTimeout(400);
  ok((await p.$$('#servicos .svc-art')).length === 6, `${tag}: seis ilustrações de serviço`);
  const sistemas = '#servico-sistemas .svc-art';
  await p.locator(sistemas).scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const before = await p.textContent(sistemas); await p.waitForTimeout(2800);
  ok((await p.textContent(sistemas)) !== before, `${tag}: painel de sistemas recebe novo registro`);

  // 4. prévias: no máximo uma tocando, e só quando o cartão está visível
  await scrollToId(p, 'projetos-prime-imoveis'); await p.waitForTimeout(2500);
  let playing = await playingVideos(p);
  ok(playing.length === 1 && playing[0] === 'projetos-prime-imoveis', `${tag}: só a prévia visível toca (${playing})`);
  await scrollToId(p, 'projetos-arena-store'); await p.waitForTimeout(2500);
  playing = await playingVideos(p);
  ok(playing.length === 1 && playing[0] === 'projetos-arena-store', `${tag}: ao rolar, a prévia muda para o cartão visível (${playing})`);
  const loaded = await p.evaluate(() => [...document.querySelectorAll('video')].filter((v) => v.currentSrc).length);
  ok(loaded <= 3, `${tag}: vídeos baixados só quando chegam perto da tela (${loaded} de 5)`);

  // 5. botão de pausa do cartão
  await p.click('#projetos-arena-store [data-preview-toggle]'); await p.waitForTimeout(400);
  ok((await playingVideos(p)).length === 0, `${tag}: botão pausa a prévia do cartão`);
  ok((await p.getAttribute('#projetos-arena-store [data-preview-toggle]', 'aria-label')).startsWith('Reproduzir'), `${tag}: rótulo do botão muda para Reproduzir`);
  await p.click('#projetos-arena-store [data-preview-toggle]'); await p.waitForTimeout(800);
  ok((await playingVideos(p))[0] === 'projetos-arena-store', `${tag}: botão retoma a prévia`);

  // 6. botão global "Pausar animações"
  await p.click('header [data-motion-toggle]'); await p.waitForTimeout(400);
  ok((await p.getAttribute('html', 'data-motion')) === 'paused', `${tag}: botão global pausa`);
  ok((await playingVideos(p)).length === 0, `${tag}: pausa global também para as prévias`);
  await scrollToId(p, 'como-trabalho'); await p.waitForTimeout(300);
  const proc = await states(p, '#como-trabalho .motion *');
  ok(proc.length > 0 && proc.every((s) => s === 'paused'), `${tag}: processo pausado`);
  ok((await p.getAttribute('header [data-motion-toggle]', 'aria-label')) === 'Retomar animações', `${tag}: rótulo vira Retomar animações`);
  await p.reload(); await p.waitForTimeout(600);
  ok((await p.getAttribute('html', 'data-motion')) === 'paused', `${tag}: escolha lembrada ao recarregar`);
  await p.click('header [data-motion-toggle]'); await p.waitForTimeout(300);
  ok((await p.getAttribute('html', 'data-motion')) === 'on', `${tag}: botão global retoma`);

  // 7. animações não atrapalham o formulário: foco e digitação normais
  await scrollToId(p, 'contato'); await p.waitForTimeout(300);
  await p.click('#contato input[name="nome"]'); await p.keyboard.type('Teste de digitação', { delay: 10 });
  ok((await p.inputValue('#contato input[name="nome"]')) === 'Teste de digitação', `${tag}: digitação no formulário intacta`);
  ok(await p.evaluate(() => document.activeElement?.getAttribute('name') === 'nome'), `${tag}: foco permanece no campo`);
  await ctx.close();
}

// 8. "reduzir movimento": tudo parado por padrão, prévias não tocam sozinhas
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); await p.goto(BASE + '/'); await p.waitForTimeout(600);
  ok((await p.getAttribute('html', 'data-motion')) === 'paused', 'reduzir movimento: começa pausado');
  const hero = await states(p, '#inicio .ambient *');
  ok(hero.every((s) => s !== 'running'), `reduzir movimento: fundo parado (${[...new Set(hero)]})`);
  await scrollToId(p, 'projetos-prime-imoveis'); await p.waitForTimeout(2000);
  ok((await playingVideos(p)).length === 0, 'reduzir movimento: prévias não tocam sozinhas');
  ok((await p.evaluate(() => [...document.querySelectorAll('video')].filter((v) => v.currentSrc).length)) === 0, 'reduzir movimento: nenhum vídeo baixado');
  await p.click('#projetos-prime-imoveis [data-preview-toggle]'); await p.waitForTimeout(1500);
  ok((await playingVideos(p))[0] === 'projetos-prime-imoveis', 'reduzir movimento: a pessoa ainda pode reproduzir a prévia');
  await p.click('header [data-motion-toggle]'); await p.waitForTimeout(300);
  ok((await p.getAttribute('html', 'data-motion')) === 'on', 'reduzir movimento: botão permite retomar as animações');
  await ctx.close();
}

// 9. demonstrações não são afetadas pelo controle do portfólio
{
  const p = await b.newPage(); await p.goto(BASE + '/'); await p.waitForTimeout(400);
  ok((await p.getAttribute('html', 'data-motion')) === 'on', 'portfólio marca o estado das animações');
  await p.click('#projetos-gestao360 a:has-text("Testar demonstração")'); await p.waitForTimeout(800);
  ok((await p.getAttribute('html', 'data-motion')) === null, 'nas demonstrações o atributo do portfólio sai');
  await p.close();
}

console.log('erros:', errs);
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail || errs.length) process.exit(1);
