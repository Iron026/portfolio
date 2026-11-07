import * as D from '../../src/pages/nova-servicos/ns-data';
let pass = 0, fail = 0;
const ok = (c: boolean, m: string) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} -> ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
const valid: D.QuoteForm = { name: 'Ana Souza', method: 'whatsapp', contact: '(71) 98888-7777', service: 'eletrica', area: 'Jardim das Flores', urgency: 'esta-semana', description: 'Trocar o chuveiro que desarma o disjuntor do banheiro.', consent: true };
const v = (patch: Partial<D.QuoteForm>) => D.validate({ ...valid, ...patch });

eq(D.validate(valid), {}, 'formulário válido sem erros');
eq(Object.keys(D.validate(D.EMPTY_FORM)), ['name', 'contact', 'service', 'area', 'description', 'consent'], 'vazio: todos os obrigatórios');
eq(D.firstError(D.validate(D.EMPTY_FORM)), 'name', 'primeiro erro = nome');
eq(D.firstError(v({ contact: '', service: '' })), 'service', 'ordem da tela: serviço antes do contato');
eq(D.firstError(v({ area: '', consent: false })), 'area', 'primeiro erro segue a ordem da tela');
// nome
ok(!!v({ name: ' ' }).name, 'nome só espaços');
ok(!!v({ name: 'A' }).name, 'nome curto');
ok(!!v({ name: 'Ana 123' }).name, 'nome com números');
ok(!!v({ name: '<script>' }).name, 'nome com símbolos');
ok(!v({ name: "Maria D'Ávila-Neto" }).name, 'nome com acento, apóstrofo e hífen');
ok(!!v({ name: 'a'.repeat(81) }).name, 'nome longo');
// telefone
for (const t of ['(71) 98888-7777', '71988887777', '+55 71 98888-7777', '5571988887777', '(11) 3333-4444']) ok(!v({ contact: t }).contact, 'telefone válido ' + t);
for (const t of ['98888-7777', '(71) 8888-77777', '(01) 98888-7777', '(71) 08888-7777', '(71) 88888-7777', 'abc', '71 9888a7777', '123']) ok(!!v({ contact: t }).contact, 'telefone inválido ' + t);
eq(D.normalizePhone('+55 (71) 98888-7777'), '71988887777', 'normaliza +55');
eq(D.formatPhone('71988887777'), '(71) 98888-7777', 'formata celular');
eq(D.formatPhone('1133334444'), '(11) 3333-4444', 'formata fixo');
// e-mail
ok(!v({ method: 'email', contact: 'ana@exemplo.com.br' }).contact, 'e-mail válido');
for (const t of ['ana@', 'ana@exemplo', 'ana exemplo.com', '@exemplo.com', 'ana@ex.c']) ok(!!v({ method: 'email', contact: t }).contact, 'e-mail inválido ' + t);
ok(v({ method: 'email', contact: '(71) 98888-7777' }).contact?.includes('E-mail inválido') === true, 'telefone no campo de e-mail');
ok(v({ method: 'email', contact: '' }).contact === 'Informe seu e-mail.', 'mensagem de e-mail vazio');
// outros
ok(!!v({ service: '' }).service, 'serviço obrigatório');
ok(!!v({ area: 'ab' }).area && !!v({ area: 'x'.repeat(61) }).area, 'bairro curto/longo');
ok(!!v({ description: 'curto demais' }).description && !!v({ description: 'x'.repeat(801) }).description, 'descrição curta/longa');
ok(!v({ description: 'x'.repeat(800) }).description && !v({ description: 'x'.repeat(20) }).description, 'descrição nos limites');
ok(!!v({ consent: false }).consent, 'consentimento obrigatório');
// mensagem
const msg = D.quoteMessage({ ...valid, name: '  Ana   Souza ', contact: '71988887777' });
eq(msg, 'Olá, Nova Serviços! Gostaria de um orçamento.\n\nNome: Ana Souza\nWhatsApp: (71) 98888-7777\nServiço: Elétrica\nBairro ou região: Jardim das Flores\nUrgência: Nesta semana\n\nO que precisa ser feito:\nTrocar o chuveiro que desarma o disjuntor do banheiro.', 'mensagem montada');
ok(D.quoteMessage({ ...valid, method: 'email', contact: 'ana@exemplo.com' }).includes('E-mail: ana@exemplo.com'), 'mensagem com e-mail');
eq(D.mailtoLink(valid), '', 'sem destinatário configurado, sem link de e-mail');
eq(D.QUOTE_EMAIL, '', 'nenhum e-mail fictício configurado');
// conteúdo
eq(D.SERVICES.map(s => s.name), ['Elétrica', 'Hidráulica', 'Pintura', 'Montagem'], 'quatro serviços');
ok(D.FAQS.length >= 4 && D.STEPS.length === 4 && D.BENEFITS.length === 4, 'seções com conteúdo');
const all = JSON.stringify([D.SERVICES, D.BENEFITS, D.STEPS, D.FAQS]);
ok(!/\d+\s*(clientes|avalia|estrelas|%)|depoimento|★/i.test(all), 'sem métricas, avaliações ou depoimentos inventados');
console.log(`\n${pass} passaram, ${fail} falharam`); if (fail) process.exit(1);
