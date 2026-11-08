/** Nova Serviços — textos de interface nos dois idiomas (conteúdo e regras em ns-data.ts). */
import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/locale';
import { nsContent } from './ns-data';

const pt = {
  docTitle: 'Nova Serviços: manutenção residencial com orçamento antes do serviço',
  docDescription: 'Landing page demonstrativa de uma empresa fictícia de elétrica, hidráulica, pintura e montagem, com formulário de orçamento validado.',
  bar: { region: 'Sobre esta demonstração', youAreHere: 'Você está em', projects: 'Projetos', note: 'Empresa fictícia, página demonstrativa', details: 'Ver detalhes do projeto' },
  nav: { 'ns-servicos': 'Serviços', 'ns-vantagens': 'Vantagens', 'ns-como-funciona': 'Como funciona', 'ns-duvidas': 'Dúvidas', 'ns-orcamento': 'Contato' } as Record<string, string>,
  sections: 'Seções da página',
  sectionsMenu: 'Seções da página (menu)',
  quoteShort: 'Orçamento',
  quote: 'Pedir orçamento',
  openMenu: 'Abrir menu',
  closeMenu: 'Fechar menu',
  serving: (region: string) => `Atendimento em ${region}`,
  heroTitle: 'Manutenção residencial sem dor de cabeça',
  heroText: 'Elétrica, hidráulica, pintura e montagem com horário marcado e orçamento aprovado por você antes do serviço.',
  seeServices: 'Ver serviços',
  pickTitle: 'Do que você precisa?',
  pickText: 'Escolha um serviço para começar o pedido.',
  servicesTitle: 'Serviços',
  servicesIntro: 'Quatro especialidades para resolver o dia a dia da casa ou do pequeno comércio.',
  quoteFor: (name: string) => `Pedir orçamento de ${name.toLowerCase()}`,
  whyTitle: 'Por que pedir para a Nova Serviços',
  howTitle: 'Como funciona',
  howIntro: 'Do pedido ao serviço concluído, em quatro passos.',
  step: 'Passo',
  start: 'Começar meu pedido',
  faqTitle: 'Perguntas frequentes',
  faqIntro: 'Se a sua dúvida não estiver aqui, escreva no campo de descrição do pedido.',
  contactTitle: 'Contato e orçamento',
  contactIntro: 'Conte o que precisa e receba o valor antes de qualquer serviço.',
  areaLabel: 'Região de atendimento',
  hoursLabel: 'Horário',
  hours: 'Segunda a sábado, das 8h às 18h',
  phoneLabel: 'Telefone e WhatsApp',
  phone: 'Não divulgados: a empresa é fictícia e esta página é uma demonstração.',
  footerNote: 'A Nova Serviços é uma empresa fictícia. Serviços, textos e região de atendimento foram criados para esta demonstração; não há atendimento real.',
  footerBy: (name: string) => `Projeto demonstrativo de ${name}.`,
  otherProjects: 'Ver outros projetos',
};

export type NsText = typeof pt;

const en: NsText = {
  docTitle: 'Nova Serviços: home maintenance with a quote before the job',
  docDescription: 'Demo landing page for a fictional electrical, plumbing, painting and assembly company, with a validated quote form.',
  bar: { region: 'About this demo', youAreHere: 'You are here', projects: 'Projects', note: 'Fictional company, demo page', details: 'See project details' },
  nav: { 'ns-servicos': 'Services', 'ns-vantagens': 'Why us', 'ns-como-funciona': 'How it works', 'ns-duvidas': 'FAQ', 'ns-orcamento': 'Contact' },
  sections: 'Page sections',
  sectionsMenu: 'Page sections (menu)',
  quoteShort: 'Quote',
  quote: 'Request a quote',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  serving: (region: string) => `Serving ${region}`,
  heroTitle: 'Home maintenance without the headache',
  heroText: 'Electrical, plumbing, painting and assembly, with a scheduled time and a quote you approve before the job.',
  seeServices: 'See services',
  pickTitle: 'What do you need?',
  pickText: 'Pick a service to start your request.',
  servicesTitle: 'Services',
  servicesIntro: 'Four specialties for everyday needs at home or in a small shop.',
  quoteFor: (name: string) => `Request a ${name.toLowerCase()} quote`,
  whyTitle: 'Why choose Nova Serviços',
  howTitle: 'How it works',
  howIntro: 'From request to finished job, in four steps.',
  step: 'Step',
  start: 'Start my request',
  faqTitle: 'Frequently asked questions',
  faqIntro: 'If your question is not here, write it in the request description field.',
  contactTitle: 'Contact and quote',
  contactIntro: 'Tell us what you need and get the price before any work.',
  areaLabel: 'Service area',
  hoursLabel: 'Hours',
  hours: 'Monday to Saturday, 8 a.m. to 6 p.m.',
  phoneLabel: 'Phone and WhatsApp',
  phone: 'Not published: the company is fictional and this page is a demo.',
  footerNote: 'Nova Serviços is a fictional company. Services, copy and service area were created for this demo; there is no real service.',
  footerBy: (name: string) => `Demo project by ${name}.`,
  otherProjects: 'See other projects',
};

const TEXT: Record<Locale, NsText> = { pt, en };

export function useNs() {
  const { locale, lp } = useLocale();
  return { locale, lp, t: TEXT[locale], content: nsContent(locale) };
}
