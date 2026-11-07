import { chromium, BASE, OUT, LAUNCH } from '../helpers.mjs';
const B = BASE;
const b = await chromium.launch(LAUNCH);
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const errs = [];
const FALSE_CLAIM = /enviad[oa] com sucesso|pedido (foi )?recebido|recebemos (o )?seu|entraremos em contato|mensagem enviada|obrigad[oa] pelo (seu )?(pedido|contato)/i;
// Espera a rolagem suave terminar (a duração varia com a distância e a versão do Chrome) antes de medir.
async function settle(p) { await p.waitForTimeout(300); let last = -1; for (let i = 0; i < 30; i++) { const y = await p.evaluate(() => scrollY); if (y === last) return; last = y; await p.waitForTimeout(150); } }
async function topOf(p, id) { await settle(p); return p.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id); }
const headerH = (p) => p.evaluate(() => Math.round(document.querySelector('header.sticky').getBoundingClientRect().height));
const activeId = (p) => p.evaluate(() => document.activeElement?.id || document.activeElement?.textContent?.trim().slice(0, 30));

// ================= desktop
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/ERR_|fonts/.test(m.text()) && errs.push(m.text()));
  await p.goto(B + '/demos/nova-servicos'); await p.waitForTimeout(500);
  ok((await p.title()) === 'Nova Serviços: manutenção residencial com orçamento antes do serviço | Alto Code', 'título SEO: ' + await p.title());
  ok((await p.getAttribute('meta[name=description]', 'content')).includes('empresa fictícia'), 'meta description');
  ok((await p.$$('h1')).length === 1 && (await p.textContent('h1')) === 'Manutenção residencial sem dor de cabeça', 'um único h1');
  ok(!(await p.$('header.fixed')), 'sem cabeçalho do portfólio');
  const hh = await headerH(p);
  // âncoras do menu
  for (const [label, id] of [['Serviços', 'ns-servicos'], ['Vantagens', 'ns-vantagens'], ['Como funciona', 'ns-como-funciona'], ['Dúvidas', 'ns-duvidas'], ['Contato', 'ns-orcamento']]) {
    await p.click(`nav[aria-label="Seções da página"] >> text="${label}"`);
    const t = await topOf(p, id);
    ok(t >= hh - 2 && t <= hh + 100, `menu "${label}" rola até #${id} (top=${t}, cabeçalho=${hh})`);
    ok((await activeId(p)) === `${id === 'ns-orcamento' ? 'ns-orcamento-titulo' : id === 'ns-como-funciona' ? 'ns-etapas-titulo' : id + '-titulo'}`, `foco no título de ${label}: ${await activeId(p)}`);
  }
  ok(new URL(p.url()).hash === '' && new URL(p.url()).pathname === '/demos/nova-servicos', 'âncoras não mudam o endereço');
  // CTAs
  await p.click('header >> text=Pedir orçamento'); let t = await topOf(p, 'ns-orcamento');
  ok(t >= hh - 2 && t <= hh + 100 && (await activeId(p)) === 'ns-nome', 'CTA do cabeçalho → formulário, foco no nome');
  await p.click('header a[href="#ns-inicio"]'); t = await topOf(p, 'ns-inicio');
  ok((await p.evaluate(() => scrollY)) === 0 && (await activeId(p)) === 'ns-hero-titulo', 'logo → topo');
  await p.click('#ns-inicio >> a:has-text("Ver serviços")'); t = await topOf(p, 'ns-servicos');
  ok(t >= hh - 2 && t <= hh + 100, 'hero "Ver serviços"');
  await p.click('header a[href="#ns-inicio"]'); await p.waitForTimeout(800);
  await p.click('#ns-inicio >> a:has-text("Pedir orçamento")'); t = await topOf(p, 'ns-orcamento');
  ok(t >= hh - 2 && t <= hh + 100 && (await activeId(p)) === 'ns-nome', 'hero "Pedir orçamento"');
  // atalhos de serviço
  await p.click('header a[href="#ns-inicio"]'); await p.waitForTimeout(800);
  await p.click('#ns-inicio button:has-text("Pintura")'); t = await topOf(p, 'ns-orcamento');
  ok((await p.inputValue('#ns-servico')) === 'pintura' && t <= hh + 100, 'atalho "Pintura" pré-seleciona e rola');
  await p.click('#ns-servicos button:has-text("Pedir orçamento de hidráulica")'); t = await topOf(p, 'ns-orcamento');
  ok((await p.inputValue('#ns-servico')) === 'hidraulica' && (await activeId(p)) === 'ns-nome', 'botão do card de hidráulica');
  await p.click('#ns-como-funciona >> text=Começar meu pedido'); t = await topOf(p, 'ns-orcamento');
  ok(t <= hh + 100, 'CTA "Começar meu pedido"');
  // FAQ
  const faqBtns = p.locator('#ns-duvidas button[aria-expanded]');
  ok((await faqBtns.count()) === 5, '5 perguntas');
  ok((await faqBtns.nth(0).getAttribute('aria-expanded')) === 'true', 'primeira aberta');
  await faqBtns.nth(2).click();
  ok((await faqBtns.nth(2).getAttribute('aria-expanded')) === 'true' && (await faqBtns.nth(0).getAttribute('aria-expanded')) === 'false', 'abrir outra fecha a anterior');
  ok(await p.isVisible('text=Pode ser das duas formas'), 'resposta visível');
  await faqBtns.nth(2).click(); ok(await p.isHidden('text=Pode ser das duas formas'), 'fechar resposta');
  await faqBtns.nth(1).focus(); await p.keyboard.press('Enter'); ok((await faqBtns.nth(1).getAttribute('aria-expanded')) === 'true', 'FAQ com Enter');
  await p.keyboard.press('Space'); ok((await faqBtns.nth(1).getAttribute('aria-expanded')) === 'false', 'FAQ com Espaço');

  // ---------- formulário: rejeita inválidos
  await p.goto(B + '/demos/nova-servicos'); await p.waitForTimeout(400);
  await p.click('button[type=submit]'); await p.waitForTimeout(150);
  ok((await activeId(p)) === 'ns-nome', 'vazio: foco no primeiro erro (nome)');
  ok((await p.textContent('form')).includes('Corrija 6 campos'), 'resumo com 6 erros');
  ok(await p.getAttribute('#ns-nome', 'aria-invalid') === 'true' && (await p.getAttribute('#ns-nome', 'aria-describedby')).includes('ns-nome-erro'), 'erro ligado ao campo (aria)');
  ok(!(await p.isVisible('text=Seu pedido está pronto')), 'não avança com erros');
  await p.fill('#ns-nome', 'Ana 2'); await p.waitForTimeout(80);
  ok((await p.textContent('#ns-nome-erro')).includes('apenas letras'), 'validação ao digitar após a 1ª tentativa');
  await p.fill('#ns-nome', 'Ana Souza');
  ok(!(await p.$('#ns-nome-erro')), 'erro some ao corrigir');
  await p.click('button[type=submit]'); await p.waitForTimeout(100);
  ok((await activeId(p)) === 'ns-servico', 'foco vai para o próximo erro (serviço)');
  await p.selectOption('#ns-servico', 'eletrica');
  await p.fill('#ns-contato', '98888-7777'); await p.click('button[type=submit]'); await p.waitForTimeout(100);
  ok((await activeId(p)) === 'ns-contato' && (await p.textContent('#ns-contato-erro')).includes('Número inválido'), 'telefone sem DDD rejeitado');
  await p.click('label:has-text("E-mail") >> nth=0');
  ok((await p.getAttribute('#ns-contato', 'type')) === 'email' && (await p.getAttribute('#ns-contato', 'placeholder')) === 'nome@email.com', 'trocar para e-mail muda o campo');
  await p.fill('#ns-contato', 'ana@exemplo'); await p.waitForTimeout(80);
  ok((await p.textContent('#ns-contato-erro')).includes('E-mail inválido'), 'e-mail inválido rejeitado');
  await p.fill('#ns-contato', 'ana@exemplo.com.br');
  await p.fill('#ns-bairro', 'Ce'); await p.fill('#ns-descricao', 'curto'); await p.click('button[type=submit]'); await p.waitForTimeout(100);
  ok((await activeId(p)) === 'ns-bairro', 'bairro curto rejeitado');
  ok((await p.textContent('#ns-descricao-erro')).includes('mínimo de 20'), 'descrição curta rejeitada');
  ok((await p.textContent('#ns-descricao-contador')) === '5/800 caracteres', 'contador de caracteres');
  await p.fill('#ns-bairro', 'Jardim das Flores');
  await p.fill('#ns-descricao', 'Instalar um chuveiro novo de 7500 W no banheiro social e trocar o disjuntor.');
  await p.click('button[type=submit]'); await p.waitForTimeout(100);
  ok((await activeId(p)) === 'ns-consentimento', 'sem consentimento rejeitado (foco no checkbox)');
  await p.click('a:has-text("Autorização:")'); ok((await activeId(p)) === 'ns-consentimento', 'link do resumo leva ao campo');
  await p.check('#ns-consentimento');
  await p.click('label:has-text("Urgente")');
  // ---------- aceita válido sem envio falso
  await p.click('button[type=submit]'); await p.waitForTimeout(150);
  ok((await activeId(p)) === 'Seu pedido está pronto, mas ai', 'sucesso: foco no título');
  const success = await p.textContent('#ns-orcamento');
  ok(success.includes('ainda não foi enviado') && success.includes('sem servidor'), 'sucesso deixa claro que não foi enviado');
  ok(!FALSE_CLAIM.test(success), 'nenhuma frase de envio falso');
  const msg = await p.inputValue('#ns-mensagem');
  ok(msg === 'Olá, Nova Serviços! Gostaria de um orçamento.\n\nNome: Ana Souza\nE-mail: ana@exemplo.com.br\nServiço: Elétrica\nBairro ou região: Jardim das Flores\nUrgência: Urgente (o quanto antes)\n\nO que precisa ser feito:\nInstalar um chuveiro novo de 7500 W no banheiro social e trocar o disjuntor.', 'mensagem preparada');
  ok(!(await p.$('a[href^="mailto:"]')), 'sem botão de e-mail (sem destinatário real)');
  await p.click('text=Copiar mensagem'); await p.waitForTimeout(100);
  ok((await p.evaluate(() => navigator.clipboard.readText())) === msg, 'copiar mensagem');
  const st = await p.textContent('[role=status]');
  ok(st.includes('não foi enviada') && !FALSE_CLAIM.test(st), 'status da cópia: ' + st);
  await p.click('text=Editar pedido'); await p.waitForTimeout(100);
  ok((await p.inputValue('#ns-nome')) === 'Ana Souza' && (await p.inputValue('#ns-servico')) === 'eletrica' && (await activeId(p)) === 'ns-nome', 'editar mantém os dados');
  await p.fill('#ns-contato', '+55 (71) 98888-7777'); await p.click('label:has-text("WhatsApp") >> nth=0');
  await p.fill('#ns-contato', '+55 (71) 98888-7777');
  await p.click('button[type=submit]'); await p.waitForTimeout(100);
  ok((await p.inputValue('#ns-mensagem')).includes('WhatsApp: (71) 98888-7777'), 'telefone com +55 aceito e formatado');
  await p.click('text=Começar outro pedido'); await p.waitForTimeout(100);
  ok((await p.inputValue('#ns-nome')) === '' && !(await p.isChecked('#ns-consentimento')) && !(await p.$('#ns-nome-erro')), 'novo pedido limpa tudo sem erros');
  // navegação de volta
  await p.click('nav[aria-label="Você está em"] >> text=Projetos'); await p.waitForTimeout(1500);
  ok(new URL(p.url()).pathname === '/' && p.url().endsWith('#projetos'), 'breadcrumb → Alto Code / Projetos');
  await p.goto(B + '/demos/nova-servicos'); await p.waitForTimeout(300);
  await p.click('text=Ver detalhes do projeto'); await p.waitForTimeout(300);
  ok(new URL(p.url()).pathname === '/projetos/nova-servicos', 'Ver detalhes do projeto');
  await p.goto(B + '/demos/nova-servicos'); await p.waitForTimeout(300);
  await p.click('footer >> text=Ver outros projetos'); await p.waitForTimeout(1500);
  ok(new URL(p.url()).pathname === '/' && p.url().endsWith('#projetos'), 'rodapé → projetos');
  await p.goto(B + '/demos/nova-servicos'); await p.reload(); await p.waitForTimeout(300);
  ok((await p.textContent('h1')) === 'Manutenção residencial sem dor de cabeça', 'URL direta e atualizar');
  await ctx.close();
}
// ================= celular
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(B + '/demos/nova-servicos'); await p.waitForTimeout(400);
  for (const w of [320, 360, 390, 430]) {
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(150);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, `sem rolagem horizontal em ${w}px (${sw})`);
  }
  await p.setViewportSize({ width: 390, height: 844 });
  const hdr = await p.evaluate(() => { const h = document.querySelector('header.sticky'); return Math.round(h.getBoundingClientRect().height); });
  ok(hdr <= 66, 'cabeçalho em uma linha no celular: ' + hdr);
  ok(await p.isHidden('nav[aria-label="Seções da página"]'), 'menu de desktop escondido');
  await p.tap('#ns-menu-botao'); ok(await p.isVisible('#ns-menu') && (await p.getAttribute('#ns-menu-botao', 'aria-expanded')) === 'true', 'abrir menu');
  await p.tap('#ns-menu >> text=Dúvidas'); let t = await topOf(p, 'ns-duvidas');
  ok(await p.isHidden('#ns-menu') && t >= hdr - 2 && t <= hdr + 100, 'menu móvel rola até Dúvidas e fecha: ' + t);
  ok((await p.evaluate(() => getComputedStyle(document.querySelector('header.sticky')).position)) === 'sticky' && (await p.evaluate(() => Math.round(document.querySelector('header.sticky').getBoundingClientRect().top))) === 0, 'cabeçalho fixo no topo ao rolar');
  await p.tap('#ns-menu-botao'); await p.keyboard.press('Escape');
  ok(await p.isHidden('#ns-menu') && (await activeId(p)) === 'ns-menu-botao', 'Esc fecha e devolve foco');
  await p.tap('header >> text=Orçamento'); t = await topOf(p, 'ns-orcamento');
  ok(t <= hdr + 100 && (await activeId(p)) === 'ns-nome', 'CTA móvel → formulário');
  await p.tap('button[type=submit]'); await p.waitForTimeout(400);
  const nameTop = await p.evaluate(() => Math.round(document.getElementById('ns-nome').getBoundingClientRect().top));
  ok((await activeId(p)) === 'ns-nome' && nameTop > hdr - 10 && nameTop < 844, 'erro no celular: campo focado visível abaixo do cabeçalho: ' + nameTop);
  await p.screenshot({ path: OUT + '/ns-m-final.png' });
  await ctx.close();
}
console.log('erros:', errs); console.log(`${pass} passaram, ${fail} falharam`); await b.close(); if (fail || errs.length) process.exit(1);
