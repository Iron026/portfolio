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

export const serviceName = (id: string, locale: 'pt' | 'en' = 'pt') => (locale === 'en' ? nsContent('en').services : SERVICES).find((s) => s.id === id)?.name ?? '';

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

export type NsLocale = 'pt' | 'en';

/** Mensagens de validação por idioma (as regras são as mesmas). */
const ERRORS = {
  pt: {
    nameEmpty: 'Informe seu nome.',
    nameShort: 'O nome precisa ter pelo menos 2 letras.',
    nameChars: 'Use apenas letras no nome, sem números ou símbolos.',
    nameLong: 'Use no máximo 80 caracteres no nome.',
    phoneEmpty: 'Informe seu WhatsApp com DDD.',
    phoneInvalid: 'Número inválido. Use o DDD e o número, por exemplo (71) 98888-7777.',
    emailEmpty: 'Informe seu e-mail.',
    emailInvalid: 'E-mail inválido. Confira o formato, por exemplo nome@email.com.',
    service: 'Escolha o tipo de serviço.',
    areaEmpty: 'Informe o bairro ou a região.',
    areaShort: 'O bairro precisa ter pelo menos 3 letras.',
    areaLong: 'Use no máximo 60 caracteres. Basta o bairro, sem o endereço completo.',
    descEmpty: 'Descreva o que precisa ser feito.',
    descShort: (n: number) => `Descreva com um pouco mais de detalhe (mínimo de ${n} caracteres).`,
    descLong: (n: number) => `Use no máximo ${n} caracteres.`,
    consent: 'Marque a autorização para usarmos estes dados no orçamento.',
  },
  en: {
    nameEmpty: 'Enter your name.',
    nameShort: 'The name needs at least 2 letters.',
    nameChars: 'Use only letters in the name, no numbers or symbols.',
    nameLong: 'Use at most 80 characters for the name.',
    phoneEmpty: 'Enter your WhatsApp number with the area code.',
    phoneInvalid: 'Invalid number. Use the area code and number, e.g. (71) 98888-7777.',
    emailEmpty: 'Enter your email.',
    emailInvalid: 'Invalid email. Check the format, e.g. name@email.com.',
    service: 'Choose the type of service.',
    areaEmpty: 'Enter your neighborhood or area.',
    areaShort: 'The neighborhood needs at least 3 letters.',
    areaLong: 'Use at most 60 characters. The neighborhood is enough, no full address.',
    descEmpty: 'Describe what needs to be done.',
    descShort: (n: number) => `Add a bit more detail (at least ${n} characters).`,
    descLong: (n: number) => `Use at most ${n} characters.`,
    consent: 'Check the box to let us use this information for the quote.',
  },
};

export function validate(form: QuoteForm, locale: NsLocale = 'pt'): Errors {
  const m = ERRORS[locale];
  const e: Errors = {};
  const name = form.name.trim();
  if (!name) e.name = m.nameEmpty;
  else if (name.length < 2) e.name = m.nameShort;
  else if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(name)) e.name = m.nameChars;
  else if (name.length > 80) e.name = m.nameLong;

  const contact = form.contact.trim();
  if (form.method === 'whatsapp') {
    if (!contact) e.contact = m.phoneEmpty;
    else if (!normalizePhone(contact)) e.contact = m.phoneInvalid;
  } else if (!contact) e.contact = m.emailEmpty;
  else if (!isEmail(contact)) e.contact = m.emailInvalid;

  if (!form.service) e.service = m.service;

  const area = form.area.trim();
  if (!area) e.area = m.areaEmpty;
  else if (area.length < 3) e.area = m.areaShort;
  else if (area.length > 60) e.area = m.areaLong;

  const description = form.description.trim();
  if (!description) e.description = m.descEmpty;
  else if (description.length < DESCRIPTION_MIN) e.description = m.descShort(DESCRIPTION_MIN);
  else if (description.length > DESCRIPTION_MAX) e.description = m.descLong(DESCRIPTION_MAX);

  if (!form.consent) e.consent = m.consent;
  return e;
}

export const firstError = (errors: Errors) => FIELD_ORDER.find((f) => errors[f]);

const MESSAGE = {
  pt: { hello: `Olá, ${COMPANY}! Gostaria de um orçamento.`, name: 'Nome', email: 'E-mail', service: 'Serviço', area: 'Bairro ou região', urgency: 'Urgência', what: 'O que precisa ser feito:', subject: 'Pedido de orçamento' },
  en: { hello: `Hello, ${COMPANY}! I would like a quote.`, name: 'Name', email: 'Email', service: 'Service', area: 'Neighborhood or area', urgency: 'Urgency', what: 'What needs to be done:', subject: 'Quote request' },
};

/** Texto do pedido, pronto para copiar. Não é enviado a ninguém. */
export function quoteMessage(form: QuoteForm, locale: NsLocale = 'pt'): string {
  const m = MESSAGE[locale];
  const phone = form.method === 'whatsapp' ? normalizePhone(form.contact) : null;
  return [
    m.hello,
    '',
    `${m.name}: ${form.name.trim().replace(/\s+/g, ' ')}`,
    form.method === 'whatsapp' ? `WhatsApp: ${phone ? formatPhone(phone) : form.contact.trim()}` : `${m.email}: ${form.contact.trim()}`,
    `${m.service}: ${serviceName(form.service, locale)}`,
    `${m.area}: ${form.area.trim()}`,
    `${m.urgency}: ${nsContent(locale).urgency[form.urgency]}`,
    '',
    m.what,
    form.description.trim(),
  ].join('\n');
}

export function mailtoLink(form: QuoteForm, locale: NsLocale = 'pt') {
  if (!QUOTE_EMAIL) return '';
  const subject = `${MESSAGE[locale].subject}: ${serviceName(form.service, locale)}, ${form.name.trim()}`;
  return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(quoteMessage(form, locale))}`;
}

/* ------------------------------------------------------------ inglês */

const SERVICES_EN: Service[] = [
  { id: 'eletrica', name: 'Electrical', summary: 'Installations and repairs with the right materials and a working test at the end.', examples: ['Replacing outlets, switches and breakers', 'Installing showers and light fixtures', 'Breaker panel inspection', 'Tracking down short circuits'] },
  { id: 'hidraulica', name: 'Plumbing', summary: 'Leaks, clogs and installations, taking care not to break more than needed.', examples: ['Fixing leaks', 'Replacing faucets, valves and traps', 'Unclogging sinks and drains', 'Installing toilet tanks'] },
  { id: 'pintura', name: 'Painting', summary: 'Surface preparation, furniture protection and cleanup when done.', examples: ['Painting rooms and facades', 'Crack repair and wall filler', 'Mold and damp treatment', 'Painting doors and railings'] },
  { id: 'montagem', name: 'Assembly', summary: 'Furniture and fixture assembly and installation, level and securely fastened.', examples: ['Wardrobe and kitchen assembly', 'TV wall mounts', 'Shelves, rods and curtain rails', 'Disassembly for moving'] },
];

const REGION_EN = 'Nova Aurora and nearby areas';

/** Conteúdo da página no idioma pedido (o português é o conteúdo original deste arquivo). */
export function nsContent(locale: NsLocale) {
  if (locale === 'pt') return { region: REGION, services: SERVICES, benefits: BENEFITS, steps: STEPS, faqs: FAQS, urgency: URGENCY_LABELS };
  return {
    region: REGION_EN,
    services: SERVICES_EN,
    benefits: [
      { title: 'Quote before we start', text: 'You approve the price and the work before anything begins. No surprises when it is time to pay.' },
      { title: 'Scheduled time', text: 'The visit is booked for an agreed time window, so you do not lose the day waiting.' },
      { title: 'Materials and cleanup', text: 'We tell you what materials are needed and leave the place clean and tidy when we finish.' },
      { title: 'Work guarantee', text: 'The work comes with a guarantee agreed in the quote. If something does not work, we come back to fix it.' },
    ],
    steps: [
      { title: 'Tell us what you need', text: 'Fill in the form with the service, your neighborhood and a description of the problem.' },
      { title: 'Get the quote', text: 'We review the request and send the price, the timeline and what is included.' },
      { title: 'Book the visit', text: 'Once the quote is approved, we pick the best day and time together.' },
      { title: 'Job done', text: 'We do the work, test it with you and explain the guarantee.' },
    ],
    faqs: [
      { q: 'Is there a charge for the quote?', a: 'No. A quote based on your description is free. If a technical visit is needed to assess the job, that is agreed beforehand.' },
      { q: 'Do I need to give my full address?', a: 'No. For the quote, your neighborhood or area is enough. The full address is only arranged when booking the visit.' },
      { q: 'Do you supply the materials?', a: 'Either way works: you buy them from our list, or materials are included in the quote, separate from labor.' },
      { q: 'Which areas do you serve?', a: `We serve ${REGION_EN}. If your neighborhood is farther away, mention it in the form and we will check availability.` },
      { q: 'How does the guarantee work?', a: 'The guarantee period is stated in the quote and depends on the type of service. During that period, we fix any fault in the work at no cost.' },
    ],
    urgency: { 'sem-pressa': 'No rush', 'esta-semana': 'This week', urgente: 'Urgent (as soon as possible)' } as Record<Urgency, string>,
  };
}
