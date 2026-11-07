/**
 * Nova Serviços — conteúdo e regras do formulário da demonstração.
 * Empresa fictícia: sem clientes, avaliações ou números reais.
 * As funções são puras (sem React) para serem testadas isoladamente.
 */

export const COMPANY = 'Nova Serviços';
export const REGION = 'Nova Aurora e região';

/**
 * E-mail que receberia os pedidos. Fica vazio porque a Nova Serviços é fictícia
 * e não há destinatário real autorizado. Se um dia houver, preencha aqui e o
 * formulário passa a oferecer "Abrir no e-mail" além de "Copiar mensagem".
 */
export const QUOTE_EMAIL = '';

export type ServiceId = 'eletrica' | 'hidraulica' | 'pintura' | 'montagem';

export interface Service {
  id: ServiceId;
  name: string;
  summary: string;
  examples: string[];
}

export const SERVICES: Service[] = [
  {
    id: 'eletrica',
    name: 'Elétrica',
    summary: 'Instalações e reparos com material adequado e teste de funcionamento ao final.',
    examples: ['Troca de tomadas, interruptores e disjuntores', 'Instalação de chuveiro e luminárias', 'Revisão de quadro de distribuição', 'Busca de curto-circuito'],
  },
  {
    id: 'hidraulica',
    name: 'Hidráulica',
    summary: 'Vazamentos, entupimentos e instalações, com cuidado para não quebrar além do necessário.',
    examples: ['Conserto de vazamentos', 'Troca de torneiras, registros e sifões', 'Desentupimento de pias e ralos', 'Instalação de caixa acoplada'],
  },
  {
    id: 'pintura',
    name: 'Pintura',
    summary: 'Preparação da superfície, proteção dos móveis e limpeza ao terminar.',
    examples: ['Pintura de cômodos e fachadas', 'Correção de trincas e massa corrida', 'Tratamento de mofo e umidade', 'Pintura de portas e grades'],
  },
  {
    id: 'montagem',
    name: 'Montagem',
    summary: 'Montagem e instalação de móveis e acessórios, nivelados e bem fixados.',
    examples: ['Montagem de guarda-roupas e cozinhas', 'Instalação de suportes de TV', 'Prateleiras, varões e cortineiros', 'Desmontagem para mudança'],
  },
];

export const serviceName = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? '';

export const BENEFITS = [
  { title: 'Orçamento antes de começar', text: 'Você aprova o valor e o que será feito antes de qualquer serviço. Sem surpresa na hora de pagar.' },
  { title: 'Horário marcado', text: 'A visita é agendada em uma faixa de horário combinada, para você não perder o dia esperando.' },
  { title: 'Material e limpeza', text: 'Indicamos o material necessário e deixamos o local limpo e organizado ao terminar.' },
  { title: 'Garantia do serviço', text: 'O serviço tem garantia combinada no orçamento. Se algo não funcionar, voltamos para corrigir.' },
];

export const STEPS = [
  { title: 'Conte o que precisa', text: 'Preencha o formulário com o serviço, o bairro e uma descrição do problema.' },
  { title: 'Receba o orçamento', text: 'Analisamos o pedido e enviamos o valor, o prazo e o que está incluído.' },
  { title: 'Agende a visita', text: 'Com o orçamento aprovado, escolhemos juntos o melhor dia e horário.' },
  { title: 'Serviço concluído', text: 'Fazemos o serviço, testamos com você e explicamos a garantia.' },
];

export const FAQS = [
  { q: 'O orçamento é cobrado?', a: 'Não. O orçamento a partir da descrição é gratuito. Se for preciso uma visita técnica para avaliar, isso é combinado antes.' },
  { q: 'Preciso informar meu endereço completo?', a: 'Não. Para o orçamento basta o bairro ou a região. O endereço completo só é combinado na hora de agendar a visita.' },
  { q: 'Vocês fornecem o material?', a: 'Pode ser das duas formas: você compra seguindo a nossa lista ou o material entra no orçamento, separado da mão de obra.' },
  { q: 'Em quais regiões vocês atendem?', a: `Atendemos ${REGION}. Se o seu bairro for mais distante, informe no formulário e verificamos a disponibilidade.` },
  { q: 'Como funciona a garantia?', a: 'O prazo de garantia aparece no orçamento e depende do tipo de serviço. Durante esse prazo, corrigimos sem custo qualquer falha do trabalho realizado.' },
];

/* ------------------------------------------------------------ formulário */

export type ContactMethod = 'whatsapp' | 'email';
export type Urgency = 'sem-pressa' | 'esta-semana' | 'urgente';

export const URGENCY_LABELS: Record<Urgency, string> = {
  'sem-pressa': 'Sem pressa',
  'esta-semana': 'Nesta semana',
  urgente: 'Urgente (o quanto antes)',
};

export interface QuoteForm {
  name: string;
  method: ContactMethod;
  contact: string;
  service: ServiceId | '';
  area: string;
  urgency: Urgency;
  description: string;
  consent: boolean;
}

export const EMPTY_FORM: QuoteForm = {
  name: '', method: 'whatsapp', contact: '', service: '', area: '', urgency: 'sem-pressa', description: '', consent: false,
};

export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 800;

export type FieldName = 'name' | 'contact' | 'service' | 'area' | 'description' | 'consent';
export type Errors = Partial<Record<FieldName, string>>;

/** Ordem dos campos na tela: usada para focar o primeiro erro. */
export const FIELD_ORDER: FieldName[] = ['name', 'service', 'contact', 'area', 'description', 'consent'];

const onlyDigits = (v: string) => v.replace(/\D/g, '');

/** Celular ou fixo brasileiro com DDD (10 ou 11 dígitos, aceita +55). */
export function normalizePhone(value: string): string | null {
  if (!/^[\d\s()+.-]+$/.test(value.trim())) return null;
  let digits = onlyDigits(value);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  if (digits.length !== 10 && digits.length !== 11) return null;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99 || digits[2] === '0') return null;
  if (digits.length === 11 && digits[2] !== '9') return null; // celular começa com 9
  return digits;
}

export function formatPhone(digits: string) {
  return digits.length === 11
    ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());

export function validate(form: QuoteForm): Errors {
  const e: Errors = {};
  const name = form.name.trim();
  if (!name) e.name = 'Informe seu nome.';
  else if (name.length < 2) e.name = 'O nome precisa ter pelo menos 2 letras.';
  else if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(name)) e.name = 'Use apenas letras no nome, sem números ou símbolos.';
  else if (name.length > 80) e.name = 'Use no máximo 80 caracteres no nome.';

  const contact = form.contact.trim();
  if (form.method === 'whatsapp') {
    if (!contact) e.contact = 'Informe seu WhatsApp com DDD.';
    else if (!normalizePhone(contact)) e.contact = 'Número inválido. Use o DDD e o número, por exemplo (71) 98888-7777.';
  } else if (!contact) e.contact = 'Informe seu e-mail.';
  else if (!isEmail(contact)) e.contact = 'E-mail inválido. Confira o formato, por exemplo nome@email.com.';

  if (!form.service) e.service = 'Escolha o tipo de serviço.';

  const area = form.area.trim();
  if (!area) e.area = 'Informe o bairro ou a região.';
  else if (area.length < 3) e.area = 'O bairro precisa ter pelo menos 3 letras.';
  else if (area.length > 60) e.area = 'Use no máximo 60 caracteres. Basta o bairro, sem o endereço completo.';

  const description = form.description.trim();
  if (!description) e.description = 'Descreva o que precisa ser feito.';
  else if (description.length < DESCRIPTION_MIN) e.description = `Descreva com um pouco mais de detalhe (mínimo de ${DESCRIPTION_MIN} caracteres).`;
  else if (description.length > DESCRIPTION_MAX) e.description = `Use no máximo ${DESCRIPTION_MAX} caracteres.`;

  if (!form.consent) e.consent = 'Marque a autorização para usarmos estes dados no orçamento.';
  return e;
}

export const firstError = (errors: Errors) => FIELD_ORDER.find((f) => errors[f]);

/** Texto do pedido, pronto para copiar. Não é enviado a ninguém. */
export function quoteMessage(form: QuoteForm): string {
  const phone = form.method === 'whatsapp' ? normalizePhone(form.contact) : null;
  return [
    `Olá, ${COMPANY}! Gostaria de um orçamento.`,
    '',
    `Nome: ${form.name.trim().replace(/\s+/g, ' ')}`,
    form.method === 'whatsapp' ? `WhatsApp: ${phone ? formatPhone(phone) : form.contact.trim()}` : `E-mail: ${form.contact.trim()}`,
    `Serviço: ${serviceName(form.service)}`,
    `Bairro ou região: ${form.area.trim()}`,
    `Urgência: ${URGENCY_LABELS[form.urgency]}`,
    '',
    'O que precisa ser feito:',
    form.description.trim(),
  ].join('\n');
}

export function mailtoLink(form: QuoteForm) {
  if (!QUOTE_EMAIL) return '';
  const subject = `Pedido de orçamento: ${serviceName(form.service)}, ${form.name.trim()}`;
  return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(quoteMessage(form))}`;
}
