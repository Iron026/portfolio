// Desempenho das animações: carregamento inicial leve, estabilidade visual,
// thread principal livre e resposta rápida à digitação, no computador e num
// celular simulado (CPU 4× mais lenta). Os limites são folgados: servem para
// pegar regressões grandes, não para medir o aparelho de quem testa.
import { chromium, BASE, LAUNCH } from '../helpers.mjs';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const b = await chromium.launch(LAUNCH);
const report = [];

for (const [name, vp, cpu] of [['computador', { width: 1440, height: 900 }, 1], ['celular (CPU 4×)', { width: 390, height: 844 }, 4]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: vp.width < 600 ? 2 : 1, isMobile: vp.width < 600, hasTouch: vp.width < 600 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await p.addInitScript(() => {
    window.__perf = { cls: 0, long: [], events: [] };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__perf.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.long.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.events.push({ name: e.name, start: e.startTime, ms: Math.round(e.duration) }))).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  let bytes = 0, videoReqs = 0;
  p.on('response', async (r) => { const len = +(r.headers()['content-length'] || 0); bytes += len; if (/\.(mp4|webm)$/.test(r.url())) videoReqs++; });
  const t0 = Date.now();
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const loadMs = Date.now() - t0;
  await p.waitForTimeout(1500);
  const initialVideos = videoReqs;

  // thread principal parada no Hero, com as animações rodando
  await cdp.send('Performance.enable');
  const metric = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const busy = async (ms) => {
    const a = await metric(); await p.waitForTimeout(ms); const z = await metric();
    const work = (z.ScriptDuration - a.ScriptDuration) + (z.LayoutDuration - a.LayoutDuration) + (z.RecalcStyleDuration - a.RecalcStyleDuration);
    return { msPerSecond: Math.round((work * 1000) / (ms / 1000)), layouts: z.LayoutCount - a.LayoutCount };
  };
  const heroBusy = await busy(4000);

  // percorre a página toda (prévias, ilustrações, processo, sobre e contato)
  for (const id of ['projetos', 'servicos', 'como-trabalho', 'sobre', 'contato']) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: 'start' }), id); await p.waitForTimeout(1200);
  }
  await p.evaluate(() => document.getElementById('projetos').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(1500);
  const projBusy = await busy(4000);
  await p.evaluate(() => document.getElementById('servicos').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(800);
  const svcBusy = await busy(4000);

  // digitação no formulário com animações na tela
  await p.evaluate(() => document.getElementById('contato').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(500);
  // Mede só a partir daqui: antes, o mouse do Playwright pode gerar um "pointerover" durante a
  // inicialização do app (CPU 4×), que espera na fila e não tem relação com a digitação.
  const typingStart = await p.evaluate(() => performance.now());
  await p.click('#contato input[name="nome"]');
  await p.keyboard.type('Maria Oliveira Santos', { delay: 40 });
  await p.waitForTimeout(500);
  const perf = await p.evaluate(() => window.__perf);
  const typing = perf.events.filter((e) => e.start >= typingStart);
  const maxEvent = Math.max(0, ...typing.map((e) => e.ms));
  const slowest = typing.find((e) => e.ms === maxEvent)?.name ?? '-';

  report.push({ aparelho: name, 'carregamento (ms)': loadMs, 'KB baixados': Math.round(bytes / 1024), 'vídeos no início': initialVideos, CLS: +perf.cls.toFixed(3),
    'thread principal: Hero (ms/s)': heroBusy.msPerSecond, 'Projetos (ms/s)': projBusy.msPerSecond, 'Serviços (ms/s)': svcBusy.msPerSecond,
    'layouts parados no Hero': heroBusy.layouts, 'tarefas longas': perf.long.length, 'maior evento (ms)': maxEvent });

  ok(initialVideos === 0, `${name}: nenhum vídeo baixado antes de os projetos aparecerem`);
  ok(perf.cls < 0.05, `${name}: estabilidade visual (CLS ${perf.cls.toFixed(3)})`);
  ok(heroBusy.layouts === 0, `${name}: animações do Hero não recalculam layout (${heroBusy.layouts})`);
  ok(heroBusy.msPerSecond < 60, `${name}: Hero ocupa pouco a thread principal (${heroBusy.msPerSecond} ms/s)`);
  ok(svcBusy.msPerSecond < 120, `${name}: ilustrações dos serviços leves (${svcBusy.msPerSecond} ms/s)`);
  ok(maxEvent < 200, `${name}: digitação responde rápido (maior evento ${maxEvent} ms, ${slowest})`);
  await ctx.close();
}
console.table(report);
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail) process.exit(1);
