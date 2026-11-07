import { chromium, BASE, LAUNCH } from '../helpers.mjs';
// Apresentação comercial: sem GitHub, seção Sobre, estudos de caso (quem usa, roteiro de teste,
// adaptações, como pedir orçamento), percurso até o formulário no celular, validação do WhatsApp,
// alternativa ao aplicativo de e-mail e HTML próprio das demonstrações.
const B = BASE;
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
const SLUGS = ['prime-imoveis', 'gestao360', 'nova-servicos', 'arena-store', 'orcafacil'];
const DEMOS = { 'prime-imoveis': '/demos/imoveis', gestao360: '/demos/gestao360', 'nova-servicos': '/demos/nova-servicos', 'arena-store': '/demos/arena-store', orcafacil: '/demos/orcafacil' };
const watch = (p) => { p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/ERR_|fonts/.test(m.text()) && errs.push(m.text())); };
const settle = async (p) => { await p.waitForTimeout(300); let last = -1; for (let i = 0; i < 30; i++) { const y = await p.evaluate(() => scrollY); if (y === last) return; last = y; await p.waitForTimeout(150); } };

// 1. Nenhuma menção ou link para o GitHub (página inicial e estudos de caso)
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); watch(p);
  for (const path of ['/', ...SLUGS.map((s) => `/projetos/${s}`)]) {
    await p.goto(B + path); await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({ text: /github/i.test(document.body.innerText), links: [...document.querySelectorAll('a[href]')].filter((a) => /github/i.test(a.href)).length }));
    ok(!r.text && r.links === 0, `${path}: sem GitHub no texto ou nos links`);
  }
  await p.goto(B + '/'); await p.waitForTimeout(500);
  const tools = await p.$$eval('#sobre li', (els) => els.map((e) => e.textContent.trim()));
  ok(tools.includes('Controle de versões (Git)'), 'ferramentas: versionamento citado sem o GitHub');
  const principles = await p.$$eval('#sobre ol > li p.type-h4', (els) => els.map((e) => e.textContent.trim()));
  ok(principles.length === 6 && principles.includes('Atendimento direto') && principles.includes('Transparência') && principles.includes('Proposta por escrito'), 'Sobre: seis compromissos de trabalho ' + principles);
  ok((await p.$$('#sobre aside, #projetos aside')).length === 0, 'Sobre: sem landmark complementar aninhado');
  await p.close();
}

// 2. Estudos de caso: quem usa, roteiro de teste, adaptações e como pedir orçamento
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); watch(p);
  for (const s of SLUGS) {
    await p.goto(B + `/projetos/${s}`); await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const byText = (sel, t) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim() === t);
      const needs = byText('h2', 'Quem usa e o que resolve')?.nextElementSibling?.querySelectorAll('li').length ?? 0;
      const roteiro = document.querySelector('ol[aria-labelledby="caso-roteiro"]')?.querySelectorAll('li').length ?? 0;
      const roteiroBox = document.getElementById('caso-roteiro')?.closest('div.rounded-xl');
      const demoLink = roteiroBox?.querySelector('a[href^="/demos/"]')?.getAttribute('href');
      const passos = document.querySelector('ol[aria-labelledby="caso-orcamento"]')?.querySelectorAll('li').length ?? 0;
      const adapt = document.querySelector('section[aria-labelledby="caso-cta"] ul')?.querySelectorAll('li').length ?? 0;
      const quote = [...document.querySelectorAll('section[aria-labelledby="caso-cta"] a')].map((a) => a.getAttribute('href')).find((h) => h.includes('projeto='));
      const ficticio = /projeto demonstrativo autoral/i.test(document.querySelector('section[aria-labelledby="caso-cta"]').innerText);
      return { needs, roteiro, demoLink, passos, adapt, quote, ficticio, h1: document.querySelectorAll('h1').length };
    });
    ok(r.needs === 2, `${s}: "Quem usa e o que resolve" com 2 perfis (${r.needs})`);
    ok(r.roteiro === 4 && r.demoLink === DEMOS[s], `${s}: roteiro de 4 passos com botão da demonstração (${r.roteiro}, ${r.demoLink})`);
    ok(r.adapt === 4, `${s}: 4 possibilidades de adaptação (${r.adapt})`);
    ok(r.passos === 3 && r.quote === `/?projeto=${s}#contato`, `${s}: 3 passos para pedir orçamento e link com o projeto (${r.quote})`);
    ok(r.ficticio && r.h1 === 1, `${s}: transparência sobre o projeto demonstrativo e um único h1`);
  }
  await p.close();
}

// 3. Celular: o formulário aparece logo abaixo do título do contato, com o serviço ou o projeto já escolhido
for (const w of [320, 390, 768]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 768, hasTouch: true });
  const p = await ctx.newPage(); watch(p);
  await p.goto(B + '/'); await p.waitForTimeout(400);
  await p.click('#servicos a[href="/?servico=sites#contato"]'); await settle(p);
  const r = await p.evaluate(() => { const f = document.querySelector('#contato form'); return { top: Math.round(f.getBoundingClientRect().top), sel: f.querySelector('select').value }; });
  ok(r.sel === 'sites' && r.top > 0 && r.top < 800 - 120, `${w}px: "Pedir orçamento de site" mostra o formulário na tela (topo em ${r.top}px)`);
  await p.goto(B + '/projetos/gestao360'); await p.waitForTimeout(400);
  await p.click('section[aria-labelledby="caso-cta"] a[href="/?projeto=gestao360#contato"]'); await settle(p);
  const r2 = await p.evaluate(() => { const f = document.querySelector('#contato form'); return { top: Math.round(f.getBoundingClientRect().top), sel: f.querySelector('select').value, ref: f.innerText.includes('Projeto de referência: Gestão360') }; });
  ok(r2.sel === 'dashboards' && r2.ref && r2.top < 800 - 120, `${w}px: estudo de caso → formulário com serviço e projeto de referência (topo em ${r2.top}px)`);
  if (w < 1024) {
    const quick = await p.$$eval('#contato a', (as) => as.filter((a) => a.offsetParent && /Chamar no WhatsApp|enviar e-mail/.test(a.textContent)).map((a) => a.getAttribute('href')));
    ok(quick.length === 2 && quick[0].startsWith('https://wa.me/') && quick[1].startsWith('mailto:'), `${w}px: atalhos de WhatsApp e e-mail antes do formulário`);
    const order = await p.evaluate(() => { const f = document.querySelector('#contato form').getBoundingClientRect().top; const c = [...document.querySelectorAll('#contato a')].find((a) => a.textContent.includes('Ver perfil profissional')).getBoundingClientRect().top; return c > f; });
    ok(order, `${w}px: lista completa de canais depois do formulário`);
  }
  await ctx.close();
}

// 4. Desktop: formulário à direita, título e canais à esquerda (layout preservado)
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); watch(p);
  await p.goto(B + '/#contato'); await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const box = (el) => el.getBoundingClientRect();
    const t = box(document.getElementById('contato-title')); const f = box(document.querySelector('#contato form'));
    const c = box([...document.querySelectorAll('#contato a')].find((a) => a.textContent.includes('Ver perfil profissional')));
    const quick = [...document.querySelectorAll('#contato a')].some((a) => a.offsetParent && a.textContent.includes('Chamar no WhatsApp'));
    return { right: f.left > t.right, top: Math.abs(f.top - t.top) < 120, chan: c.top > t.bottom && c.right < f.left, quick };
  });
  ok(r.right && r.top && r.chan && !r.quick, 'desktop: formulário na coluna da direita, canais abaixo do título e sem atalho duplicado ' + JSON.stringify(r));
  await p.close();
}

// 5. Validação do WhatsApp (DDD e celular) e alternativa ao aplicativo de e-mail
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage(); watch(p);
  await p.goto(B + '/#contato'); await p.waitForTimeout(700);
  await p.fill('input[name="nome"]', 'Ana Souza');
  await p.selectOption('select[name="servico"]', 'planilhas');
  await p.fill('textarea[name="mensagem"]', 'Quero organizar o controle financeiro da loja.');
  const err = async () => (await p.$('[id$="-retorno-erro"]')) ? p.textContent('[id$="-retorno-erro"]') : '';
  await p.fill('input[name="retorno"]', '0198888777'); await p.click('text=Copiar mensagem'); await p.waitForTimeout(150);
  ok((await err()).includes('DDD'), 'DDD com zero é recusado: ' + await err());
  await p.fill('input[name="retorno"]', '71388887777'); await p.click('text=Copiar mensagem'); await p.waitForTimeout(150);
  ok((await err()).includes('começa com 9'), 'celular de 11 dígitos sem o 9 é recusado: ' + await err());
  await p.fill('input[name="retorno"]', '7133334444'); await p.click('text=Copiar mensagem'); await p.waitForTimeout(150);
  ok((await err()) === '', 'telefone fixo com DDD é aceito');
  await p.fill('input[name="retorno"]', '71988887777'); await p.click('text=Copiar mensagem'); await p.waitForTimeout(150);
  ok((await err()) === '', 'celular válido é aceito');
  ok(!(await p.isVisible('text=O aplicativo de e-mail não abriu?')), 'alternativa ao e-mail só aparece depois de tentar');
  await p.click('button:has-text("Enviar por e-mail")'); await p.waitForTimeout(300);
  ok(await p.isVisible('text=O aplicativo de e-mail não abriu?'), 'alternativa ao aplicativo de e-mail aparece');
  const mail = await p.getAttribute('form a[href^="mailto:"]', 'href');
  ok(mail === 'mailto:iron.comercial26@gmail.com', 'alternativa mostra o endereço de e-mail: ' + mail);
  await ctx.close();
}

// 6. Gestão360: a tabela que rola para o lado recebe foco pelo teclado no celular
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); watch(p);
  await p.goto(B + '/demos/gestao360'); await p.waitForTimeout(800);
  const r = await p.$eval('.g360-table-scroll', (el) => ({ tab: el.tabIndex, role: el.getAttribute('role'), label: document.getElementById(el.getAttribute('aria-labelledby'))?.textContent, scroll: el.scrollWidth > el.clientWidth }));
  ok(r.tab === 0 && r.role === 'region' && r.label === 'Transações' && r.scroll, 'tabela rolável com foco e nome acessível ' + JSON.stringify(r));
  await p.focus('.g360-table-scroll'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
  ok((await p.$eval('.g360-table-scroll', (el) => el.scrollLeft)) > 0, 'setas do teclado rolam a tabela');
  await p.close();
}

// 7. HTML das demonstrações: título e canonical próprios antes do JavaScript (robôs de prévia de link)
for (const [s, d] of Object.entries(DEMOS)) {
  // barra final: o "vite preview" só entrega pasta/index.html assim (o Netlify entrega com e sem a barra)
  const res = await fetch(B + d + (process.env.BASE_URL ? '' : '/'));
  const html = await res.text();
  ok(res.status === 200 && /<title>[^<]+demonstração interativa \| Alto Code<\/title>/.test(html) && html.includes(`/projetos/${s}/og.jpg`), `${d}: HTML com título e imagem próprios`);
}

console.log('erros:', errs);
console.log(`${pass} passaram, ${fail} falharam`);
await b.close(); if (fail || errs.length) process.exit(1);
