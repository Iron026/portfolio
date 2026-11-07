import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const B = BASE;
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errs.push(m.text()); });
const count = () => p.textContent('#pi-resultados-titulo');
const cards = () => p.$$eval('[data-property]', a => a.map(x => x.dataset.property));
const path = () => { const u = new URL(p.url()); return u.pathname + u.search; };

await p.goto(B + '/demos/imoveis'); await p.waitForTimeout(500);
ok((await p.textContent('h1')).includes('Encontre seu próximo endereço'), 'lista carrega por URL direta');
ok((await count()) === '12 imóveis encontrados' && (await cards()).length === 12, 'contador inicial 12');
ok((await p.title()).startsWith('Prime Imóveis'), 'título da aba');
ok(!(await p.$('header.fixed')), 'sem cabeçalho do portfólio');

// busca com e sem resultados
await p.fill('#pi-q', 'piscina'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-106","PI-109","PI-110"]' && (await count()) === '3 imóveis encontrados', 'busca "piscina"');
ok(path() === '/demos/imoveis?q=piscina', 'busca vai para a URL: ' + path());
await p.fill('#pi-q', 'Centro'); await p.waitForTimeout(150);
ok((await cards()).length === 4, 'busca por bairro "Centro"');
await p.fill('#pi-q', 'suites'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-103"]' && (await count()) === '1 imóvel encontrado', 'busca sem acento e contador no singular');
await p.fill('#pi-q', 'castelo medieval'); await p.waitForTimeout(150);
ok((await count()) === 'Nenhum imóvel encontrado' && (await p.textContent('main')).includes('Nenhum imóvel corresponde a esta busca'), 'busca sem resultados → mensagem');
await p.click('text=Limpar filtros e ver todos'); await p.waitForTimeout(150);
ok((await cards()).length === 12 && (await p.inputValue('#pi-q')) === '' && path() === '/demos/imoveis', 'limpar pelo estado vazio');

// faixa de preço depende da finalidade
ok(await p.isDisabled('#pi-preco'), 'preço desabilitado sem finalidade');
await p.click('button[aria-pressed]:has-text("Alugar")'); await p.waitForTimeout(150);
const aluguelOpts = await p.$$eval('#pi-preco option', o => o.map(x => x.textContent));
ok(aluguelOpts.join('|') === 'Qualquer valor|Até R$ 2.000/mês|R$ 2.000 a R$ 3.000/mês|R$ 3.000 a R$ 4.000/mês|Acima de R$ 4.000/mês', 'faixas de aluguel');
ok((await count()) === '6 imóveis encontrados', 'alugar: 6');
await p.selectOption('#pi-preco', 'a2'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-102","PI-111"]', 'aluguel R$ 2–3 mil');
await p.click('button[aria-pressed]:has-text("Comprar")'); await p.waitForTimeout(150);
const vendaOpts = await p.$$eval('#pi-preco option', o => o.map(x => x.textContent));
ok(vendaOpts[1] === 'Até R$ 400 mil' && !vendaOpts.some(o => o.includes('/mês')), 'faixas de venda sem valores de aluguel');
ok((await p.inputValue('#pi-preco')) === '' && (await cards()).length === 6, 'trocar finalidade descarta a faixa anterior');

// filtros combinados
await p.selectOption('#pi-tipo', 'casa'); await p.selectOption('#pi-preco', 'v3'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-110"]', 'venda + casa + 700 mil–1 mi');
await p.selectOption('#pi-tipo', ''); await p.selectOption('#pi-preco', 'v2');
await p.check('input[name="pi-quartos"][value="3"]', { force: true }); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-101"]', 'venda + 400–700 mil + 3+ quartos');
const chips = await p.$$eval('[aria-label="Filtros ativos"] button', b => b.map(x => x.textContent.replace('(remover filtro)', '').trim()));
ok(chips.join('|') === 'Venda|R$ 400 mil a R$ 700 mil|3+ quartos', 'chips de filtros ativos: ' + chips.join('|'));
await p.click('[aria-label="Filtros ativos"] button:has-text("3+ quartos")'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-101","PI-104"]', 'remover filtro pelo chip');
await p.click('button[aria-pressed]:has-text("Alugar")'); await p.selectOption('#pi-bairro', 'Centro');
await p.check('input[name="pi-quartos"][value="1"]', { force: true }); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-102","PI-107"]', 'aluguel + Centro + 1+ quartos (exclui sala comercial)');
await p.selectOption('#pi-tipo', 'cobertura'); await p.waitForTimeout(150);
ok((await count()) === 'Nenhum imóvel encontrado', 'combinação sem resultado');
await p.selectOption('#pi-tipo', '');
await p.fill('#pi-q', 'mobiliado'); await p.waitForTimeout(150);
ok(JSON.stringify(await cards()) === '["PI-107"]', 'busca + filtros combinados');
const listUrl = path(); console.log('URL da lista:', listUrl);

// detalhe 1 e voltar com filtros
await p.click('[data-property="PI-107"]'); await p.waitForTimeout(400);
ok(new URL(p.url()).pathname === '/demos/imoveis/PI-107' && (await p.textContent('h1')) === 'Studio mobiliado', 'detalhe PI-107');
ok((await p.evaluate(() => scrollY)) === 0, 'detalhe abre no topo');
const d1 = (await p.textContent('main')).replace(/\u00a0/g, ' ');
ok(d1.includes('R$ 1.650/mês') && d1.includes('Total mensal estimado') && d1.includes('R$ 2.075/mês'), 'detalhe 1: aluguel + total mensal (1.650+380+45)');
ok(d1.includes('Centro, Nova Aurora') && d1.includes('32 m²') && d1.includes('Mobiliado'), 'detalhe 1: atributos');
// galeria
ok((await p.textContent('figcaption')).includes('imagem 1 de 4'), 'galeria inicia na 1');
await p.click('button[aria-label="Próxima imagem"]'); ok((await p.textContent('figcaption')).includes('Ambiente integrado') && (await p.textContent('figcaption')).includes('2 de 4'), 'próxima imagem');
await p.click('button[aria-label="Imagem anterior"]'); await p.click('button[aria-label="Imagem anterior"]');
ok((await p.textContent('figcaption')).includes('4 de 4'), 'anterior volta ao fim (circular)');
await p.click('button[aria-label^="Ver imagem 3"]'); ok((await p.textContent('figcaption')).includes('Cozinha equipada') && await p.getAttribute('button[aria-label^="Ver imagem 3"]', 'aria-pressed') === 'true', 'miniatura 3');
await p.focus('button[aria-label^="Ver imagem 3"]'); await p.keyboard.press('ArrowRight');
ok((await p.textContent('figcaption')).includes('4 de 4'), 'seta → no teclado');
// consulta
ok(await p.isHidden('text=Mensagem de consulta'), 'painel fechado');
await p.click('text=Consultar imóvel'); await p.waitForTimeout(100);
ok(await p.evaluate(() => document.activeElement?.textContent) === 'Mensagem de consulta', 'foco vai para o painel');
await p.fill('input[autocomplete="name"]', 'Ana'); await p.check('input[value="proposta"]');
const msg = await p.inputValue('textarea');
ok(msg.startsWith('Olá! Meu nome é Ana.') && msg.includes('PI-107: Studio mobiliado') && msg.endsWith('Gostaria de conversar sobre uma proposta.'), 'mensagem gerada');
await p.click('text=Copiar mensagem'); await p.waitForTimeout(100);
const clip = await p.evaluate(() => navigator.clipboard.readText());
ok(clip === msg, 'mensagem copiada igual ao texto');
const st = await p.textContent('[role=status]');
ok(st.includes('nada foi enviado') && !/enviad[ao] com sucesso|foi enviada/i.test(st), 'status não alega envio: ' + st);
// voltar para resultados
ok((await p.textContent('main a:has-text("Voltar para os resultados")')) !== null, 'link Voltar para os resultados');
await p.click('text=Voltar para os resultados'); await p.waitForTimeout(400);
ok(path() === listUrl && JSON.stringify(await cards()) === '["PI-107"]', 'voltar mantém filtros: ' + path());
ok(await p.evaluate(() => document.activeElement?.dataset?.property) === 'PI-107', 'foco volta ao card visitado');
ok((await p.inputValue('#pi-q')) === 'mobiliado' && (await p.inputValue('#pi-bairro')) === 'Centro', 'campos restaurados');

// detalhe 2 (venda) pelo botão voltar do navegador
await p.click('text=Limpar filtros'); await p.waitForTimeout(150);
await p.click('[data-property="PI-101"]'); await p.waitForTimeout(400);
const d2 = (await p.textContent('main')).replace(/\u00a0/g, ' ');
ok((await p.textContent('h1')) === 'Casa com quintal' && d2.includes('R$ 680.000') && d2.includes('R$ 4.250') && !d2.includes('Total mensal estimado'), 'detalhe 2 (venda): preço e R$/m²');
ok(d2.includes('Condomínio') && d2.includes('Não há'), 'casa sem condomínio');
ok((await p.textContent('figcaption')).includes('imagem 1 de 4'), 'galeria reinicia em outro imóvel');
const sim = await p.$$eval('#pi-similares ~ ul [data-property]', a => a.map(x => x.dataset.property));
ok(sim.length === 3 && !sim.includes('PI-101'), 'similares sem o próprio imóvel: ' + sim);
await p.click(`#pi-similares ~ ul [data-property="${sim[0]}"]`); await p.waitForTimeout(400);
ok(new URL(p.url()).pathname === `/demos/imoveis/${sim[0]}`, 'abrir imóvel semelhante');
await p.goBack(); await p.waitForTimeout(300);
ok((await p.textContent('h1')) === 'Casa com quintal', 'voltar do navegador');
await p.goBack(); await p.waitForTimeout(300);
ok(new URL(p.url()).pathname === '/demos/imoveis', 'voltar do navegador até a lista');

// URLs diretas, atualização e erros
await p.goto(B + '/demos/imoveis?finalidade=aluguel&quartos=3'); await p.waitForTimeout(400);
ok(JSON.stringify(await cards()) === '["PI-105","PI-109","PI-112"]', 'URL com filtros direto');
await p.reload(); await p.waitForTimeout(400);
ok(JSON.stringify(await cards()) === '["PI-105","PI-109","PI-112"]', 'atualizar mantém filtros');
await p.goto(B + '/demos/imoveis?finalidade=aluguel&preco=v4'); await p.waitForTimeout(300);
ok((await cards()).length === 6 && (await p.inputValue('#pi-preco')) === '', 'faixa de venda na URL de aluguel é ignorada');
await p.goto(B + '/demos/imoveis/pi-106'); await p.waitForTimeout(300);
ok((await p.textContent('h1')) === 'Cobertura duplex com piscina', 'código em minúsculas');
await p.reload(); await p.waitForTimeout(300); ok((await p.textContent('h1')) === 'Cobertura duplex com piscina', 'atualizar detalhe');
await p.goto(B + '/demos/imoveis/PI-999'); await p.waitForTimeout(300);
ok((await p.textContent('h1')) === 'Imóvel não encontrado', 'código inexistente');
await p.click('text=Ver imóveis disponíveis'); await p.waitForTimeout(300);
ok(new URL(p.url()).pathname === '/demos/imoveis', 'sair do não encontrado');
await p.goto(B + '/demos/imoveis/PI-101/extra'); await p.waitForTimeout(300);
ok((await p.textContent('h1')) === 'Esta página não existe', 'caminho inválido → 404 do portfólio');
// navegação de volta ao Alto Code
await p.goto(B + '/demos/imoveis'); await p.waitForTimeout(300);
await p.click('nav[aria-label="Você está em"] >> text=Projetos'); await p.waitForTimeout(1500);
ok(new URL(p.url()).pathname === '/' && p.url().endsWith('#projetos'), 'breadcrumb → Alto Code / Projetos');
await p.goto(B + '/demos/imoveis'); await p.waitForTimeout(300);
await p.click('text=Ver detalhes do projeto'); await p.waitForTimeout(300);
ok(new URL(p.url()).pathname === '/projetos/prime-imoveis', 'Ver detalhes do projeto');
await p.goto(B + '/demos/imoveis/PI-102'); await p.waitForTimeout(300);
await p.click('header >> text=Comprar'); await p.waitForTimeout(300);
ok(path() === '/demos/imoveis?finalidade=venda' && (await cards()).length === 6, 'menu Comprar');
console.log('erros de console:', errs);
console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail || errs.length) process.exit(1);
