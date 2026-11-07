/**
 * CONFIGURAÇÃO CENTRAL DO PORTFÓLIO
 * ------------------------------------------------------------------
 * Altere aqui o nome, os textos principais e os seus contatos.
 * Nenhum outro arquivo precisa ser editado para essas informações.
 *
 * Contatos vazios ('') NÃO aparecem no site. Preencha apenas com
 * dados reais — o site nunca exibe contatos fictícios.
 */

export const site = {
  /** Nome do portfólio. As iniciais do logotipo são geradas a partir dele. */
  name: 'Alto Code',

  /** Seu nome (opcional). Se preenchido, aparece na seção "Sobre". */
  ownerName: '',
  /** Sua função, exibida junto do nome (opcional). */
  ownerRole: 'Desenvolvedor independente',
  /** Foto (opcional): coloque o arquivo em public/ e informe o caminho, ex.: '/foto.webp'. */
  ownerPhoto: '',

  /** Frase curta usada no título da aba e no compartilhamento. */
  headline: 'Sites, sistemas e planilhas sob medida',

  /** Descrição usada no Google e nas prévias de compartilhamento (até ~160 caracteres). */
  description:
    'Sites, sistemas web, dashboards, planilhas e automações sob medida para pequenos negócios. Veja cinco projetos demonstrativos que você pode testar.',

  /**
   * Endereço público do site, sem barra no final.
   * Preencha depois de publicar (ex.: 'https://studiodigital.netlify.app').
   */
  url: 'https://altocode.netlify.app',

  hero: {
    /** Título principal. O trecho em `titleAccent` recebe a moldura de seleção da marca. */
    title: 'Sites, sistemas e planilhas sob medida para pequenos negócios.',
    titleAccent: 'sob medida',
    subtitle:
      'Estúdio de desenvolvimento de um profissional independente: cada solução começa pelo seu problema e é entregue testada.',
  },

  contact: {
    /** WhatsApp com DDI e DDD, só números. Ex.: '5511999998888'. */
    whatsapp: '5571992853309',
    /** E-mail profissional. */
    email: 'iron.comercial26@gmail.com',
    /**
     * Perfis profissionais (99Freelas, LinkedIn, GitHub...).
     * Adicione ou remova itens à vontade; links vazios não aparecem.
     */
    profiles: [
      { label: '99Freelas', url: 'https://www.99freelas.com.br/user/Iron26' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/iron-cruz-de-jesus-7008ab314' },
    ],
    /** Texto inicial da mensagem de WhatsApp. */
    whatsappGreeting: 'Olá! Vi seu portfólio e gostaria de solicitar um orçamento.',
  },

  about: {
    title: 'Quem está por trás da Alto Code',
    /** Texto em primeira pessoa. O primeiro parágrafo aparece em destaque. */
    paragraphs: [
      'Sou desenvolvedor independente e respondo pessoalmente por cada projeto da Alto Code, da primeira conversa à entrega. Crio sites, sistemas web, dashboards, planilhas e automações para pequenos negócios.',
      'Estou construindo meu histórico como freelancer. Por isso, os cinco projetos deste portfólio são demonstrativos autorais: criei cada um, com empresas e dados fictícios, para mostrar na prática o que consigo entregar.',
    ],
    /** Compromissos de trabalho exibidos em lista. */
    principles: [
      { title: 'Entender antes de propor', text: 'O ponto de partida é como o seu negócio funciona no dia a dia.' },
      { title: 'Revisado e testado', text: 'Uso inteligência artificial como apoio, mas todo código, texto e planilha é revisado e testado antes da entrega.' },
      { title: 'Fácil de manter', text: 'Soluções organizadas, com orientações para você atualizar depois.' },
    ],
  },

  /** Ferramentas exibidas na seção "Sobre". */
  tools: [
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Vite',
    'Excel e Google Planilhas',
    'Python',
    'Git e GitHub',
    'Netlify e Cloudflare Pages',
    'Ferramentas de IA',
  ],
} as const;

export type SiteConfig = typeof site;
