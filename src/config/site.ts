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
      'Desenvolvo soluções para apresentar seus serviços, organizar informações e simplificar tarefas. Você acompanha o projeto diretamente comigo, da proposta à entrega.',
  },

  contact: {
    /** WhatsApp com DDI e DDD, só números. Ex.: '5511999998888'. */
    whatsapp: '5571992853309',
    /** E-mail profissional. */
    email: 'iron.comercial26@gmail.com',
    /**
     * Perfis profissionais e comerciais (99Freelas, LinkedIn...).
     * Adicione ou remova itens à vontade; links vazios não aparecem.
     * O GitHub não faz parte da apresentação comercial: não o inclua aqui.
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
      'Sou formado em Análise e Desenvolvimento de Software e atuo há dois anos na área de desenvolvimento. À frente da Alto Code, desenvolvo sites, sistemas web, planilhas e automações para as necessidades de pequenos negócios.',
      'Meu trabalho une conhecimento técnico, planejamento e atenção aos detalhes para criar soluções funcionais, organizadas e fáceis de usar.',
      'Os projetos deste portfólio são demonstrações autorais, com empresas e dados fictícios, criadas para mostrar na prática diferentes funcionalidades e possibilidades de aplicação.',
    ],
    /** Compromissos de trabalho exibidos em lista. */
    principles: [
      { title: 'Atendimento direto', text: 'Você fala com quem desenvolve, sem intermediários.' },
      { title: 'Entender antes de propor', text: 'A solução parte de como o seu negócio funciona hoje.' },
      { title: 'Combinado por escrito', text: 'Escopo, prazo e valor ficam claros antes do início, assim como o que não está incluído.' },
      { title: 'Revisado e testado', text: 'Uso inteligência artificial como apoio, mas todo código, texto e planilha é revisado e testado antes da entrega.' },
      { title: 'Fácil de manter', text: 'Soluções organizadas, com orientações por escrito para usar e atualizar.' },
      { title: 'Linguagem clara', text: 'Explicações sem termos técnicos desnecessários, para você decidir com segurança.' },
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
    'Controle de versões (Git)',
    'Netlify e Cloudflare Pages',
    'Ferramentas de IA',
  ],
} as const;

export type SiteConfig = typeof site;
