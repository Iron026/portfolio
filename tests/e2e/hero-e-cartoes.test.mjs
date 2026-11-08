import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const B = BASE;
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(e.message));
await p.goto(B + '/'); await p.waitForTimeout(600);
// ordem da página, numeração e menu
const order = await p.$$eval('main > section[id]', ss => ss.map(s => s.id));
ok(JSON.stringify(order) === JSON.stringify(['inicio', 'projetos', 'servicos', 'como-trabalho', 'sobre', 'perguntas', 'contato']), 'projetos antes de serviços ' + order.join(','));
const idx = await p.$$eval('.section-index', ps => ps.map(x => x.textContent.trim()));
ok(idx.join('|') === ['Projetos', 'Serviços', 'Processo', 'Sobre', 'Dúvidas', 'Contato'].map((n, i) => `0${i + 1}${n}0${i + 1} / 06`).join('|'), 'numeração ' + idx.join('|'));
const nav = await p.$$eval('nav[aria-label="Principal"] a', as => as.map(a => a.getAttribute('href')));
ok(nav.join(',') === '/#projetos,/#servicos,/#como-trabalho,/#sobre,/#contato', 'menu na nova ordem ' + nav.join(','));
ok(await p.isVisible('role=tab[name="Planilha"]'), 'bancada preservada');
for (const [label, id] of [['Projetos', 'projetos'], ['Serviços', 'servicos'], ['Sobre', 'sobre'], ['Contato', 'contato']]) {
  // espera a rolagem suave terminar: a duração varia com a distância e a versão do Chrome
  await p.click(`nav[aria-label="Principal"] >> text=${label}`); await p.waitForTimeout(300);
  for (let i = 0, last = -1; i < 30; i++) { const y = await p.evaluate(() => scrollY); if (y === last) break; last = y; await p.waitForTimeout(150); }
  const t = await p.evaluate((i) => document.getElementById(i).getBoundingClientRect().top, id);
  ok(Math.abs(t - 88) < 20, `menu → ${label} (top ${Math.round(t)})`);
}
// altura da seção de serviços (antes: ~2.400 px no desktop)
const h = await p.evaluate(() => document.getElementById('servicos').getBoundingClientRect().height);
// limite revisto: cada cartão ganhou uma ilustração animada de 128 px (outubro de 2026)
ok(h < 1800, 'serviços compactos (' + Math.round(h) + ' px)');
// CTA de serviço leva ao formulário com o serviço escolhido
await p.click('text=Pedir orçamento de dashboard'); await p.waitForTimeout(900);
ok(await p.inputValue('select[name="servico"]') === 'dashboards', 'orçamento de dashboard pré-selecionado');
// aplicações abrem e fecham
await p.goto(B + '/'); await p.waitForTimeout(500);
await p.click('#servico-planilhas summary'); await p.waitForTimeout(150);
ok(await p.isVisible('#servico-planilhas >> text=Controle de estoque e de vendas'), 'aplicações visíveis ao abrir');
// cada serviço com demonstração aponta para o estudo de caso
await p.goto(B + '/'); await p.waitForTimeout(500);
const proofs = await p.$$eval('#servicos article', as => as.map(a => [a.id, [...a.querySelectorAll('a[href^="/projetos/"]')].map(x => x.getAttribute('href'))]));
ok(proofs.length === 6 && proofs.find(([id]) => id === 'servico-dashboards')[1].includes('/projetos/gestao360') && proofs.find(([id]) => id === 'servico-ferramentas')[1].includes('/projetos/orcafacil'), 'serviços ligados às demonstrações ' + JSON.stringify(proofs));
// CTA contextual
const q = await p.$$eval('#projetos article', as => as.map(a => { const l = [...a.querySelectorAll('a')].find(x => x.textContent.startsWith('Quero')); return l && [l.textContent.trim(), l.getAttribute('href')]; }));
ok(q.every(x => x && /\?projeto=[a-z0-9-]+#contato$/.test(x[1])), 'cada projeto tem CTA contextual ' + JSON.stringify(q));
await p.click('text=Quero um painel de gestão assim'); await p.waitForTimeout(900);
ok(new URL(p.url()).search === '?projeto=gestao360', 'URL com projeto');
ok(await p.inputValue('select[name="servico"]') === 'dashboards', 'serviço pré-selecionado pelo projeto');
ok(await p.isVisible('text=Projeto de referência:'), 'selo de referência visível');
await p.fill('[name="nome"]', 'Ana'); await p.click('label:has(input[name="canal"][value="email"])'); await p.fill('[name="retorno"]', 'ana@exemplo.com'); await p.fill('[name="mensagem"]', 'Quero um painel parecido para minha loja de bairro.');
await p.click('text=Copiar mensagem'); await p.waitForTimeout(300);
let clip = await p.evaluate(() => navigator.clipboard.readText());
ok(clip.includes('Projeto de referência: Gestão360 (demonstração do portfólio)') && clip.includes('Tipo de projeto: Dashboards e análise de dados'), 'mensagem cita o projeto');
await p.click('button[aria-label^="Remover a referência"]'); await p.waitForTimeout(200);
await p.click('text=Copiar mensagem'); await p.waitForTimeout(300);
clip = await p.evaluate(() => navigator.clipboard.readText());
ok(!clip.includes('referência') && clip.includes('Tipo de projeto: Dashboards e análise de dados'), 'remover a referência tira a linha e mantém o serviço');
// servico tem prioridade; servico=outro; projeto inválido
await p.goto(B + '/?projeto=arena-store&servico=planilhas#contato'); await p.waitForTimeout(700);
ok(await p.inputValue('select[name="servico"]') === 'planilhas' && await p.isVisible('text=Arena Store'), 'servico explícito tem prioridade');
await p.goto(B + '/?servico=outro#contato'); await p.waitForTimeout(700);
ok(await p.inputValue('select[name="servico"]') === 'outro', '"Descreva o problema" pré-seleciona Outro');
await p.goto(B + '/?projeto=nao-existe#contato'); await p.waitForTimeout(700);
ok(!(await p.isVisible('text=Projeto de referência:')) && await p.inputValue('select[name="servico"]') === '', 'projeto inválido é ignorado');
// página de detalhes
await p.goto(B + '/projetos/orcafacil'); await p.waitForTimeout(600);
const dq = await p.$$eval('a[href*="projeto="]', as => as.map(a => [a.textContent.trim(), a.getAttribute('href')]));
ok(dq.length === 2 && dq.every(([, h]) => h === '/?projeto=orcafacil#contato') && dq.some(([t]) => t === 'Quero um gerador de orçamentos assim'), 'detalhes: CTA contextual na abertura e no fim ' + JSON.stringify(dq));
// mobile: botões com área de toque e sem estouro
const m = await b.newPage({ viewport: { width: 320, height: 700 } });
await m.goto(B + '/'); await m.waitForTimeout(600);
const btns = await m.$$eval('#projetos article', as => as.map(a => [...a.querySelectorAll('a')].filter(x => /Testar demonstração|Estudo de caso/.test(x.textContent)).map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(x.parentElement.getBoundingClientRect().width)]; })));
ok(btns.every(bs => bs.length === 2 && bs.every(([w, h, pw]) => h >= 44 && w >= pw - 1)), '320px: dois botões na largura toda e altos ' + JSON.stringify(btns[0]));
ok(await m.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), '320px: sem rolagem horizontal');
const m2 = await b.newPage({ viewport: { width: 390, height: 844 } });
await m2.goto(B + '/'); await m2.waitForTimeout(600);
const tabTop = await m2.evaluate(() => document.querySelector('[role=tablist]').getBoundingClientRect().top);
ok(tabTop < 844, 'celular: abas da bancada na primeira tela (top ' + Math.round(tabTop) + ')');
const sh = await m2.evaluate(() => document.getElementById('servicos').getBoundingClientRect().height);
ok(sh < 3600, 'celular: serviços compactos (' + Math.round(sh) + ' px)');
console.log('erros:', errs);
console.log(`${pass} passaram, ${fail} falharam`);
await b.close(); if (fail || errs.length) process.exit(1);
