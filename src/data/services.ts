/**
 * SERVIÇOS
 * Organizados em categorias. Cada serviço apresenta o benefício principal
 * (`benefit`), como funciona (`description`) e, quando existir, aponta para o
 * projeto demonstrativo que mostra esse tipo de solução (`proof`, com o `slug`).
 *
 * O `id` é usado no formulário de contato (?servico=<id>): não altere os
 * ids existentes para não quebrar links já compartilhados.
 */

export interface Service {
  id: string;
  category: CategoryId;
  name: string;
  /** Benefício principal, em uma frase (destaque do cartão). */
  benefit: string;
  /** Como funciona ou o que inclui: complementa o benefício, sem repeti-lo. */
  description: string;
  applications: string[];
  /** Projetos demonstrativos relacionados (slugs de src/data/projects.ts). */
  proof: string[];
  /** Texto do link que leva ao formulário com este serviço já selecionado. */
  cta: string;
}

export type CategoryId = 'presenca' | 'gestao' | 'processos';

export const serviceCategories: Record<CategoryId, string> = {
  presenca: 'Presença online',
  gestao: 'Gestão e dados',
  processos: 'Processos',
};

export const services: Service[] = [
  {
    id: 'sites',
    category: 'presenca',
    name: 'Sites e landing pages',
    benefit: 'Sites que apresentam seu negócio com clareza, valorizam seus serviços e facilitam o contato com novos clientes.',
    description:
      'Pensados primeiro para o celular, com as informações na ordem certa e contato por WhatsApp ou formulário. Também atendo catálogos e lojas virtuais.',
    applications: [
      'Site institucional para empresas e profissionais',
      'Landing page para divulgar um serviço ou campanha',
      'Catálogo de produtos ou imóveis',
      'Página com botão de WhatsApp e formulário de orçamento',
    ],
    proof: ['nova-servicos', 'prime-imoveis', 'arena-store'],
    cta: 'Pedir orçamento de site',
  },
  {
    id: 'sistemas',
    category: 'gestao',
    name: 'Sistemas web',
    benefit: 'Organize cadastros, pedidos e controles em um sistema desenvolvido para a rotina do seu negócio.',
    description:
      'Acesso pelo navegador, no computador ou no celular, com o escopo definido junto com você.',
    applications: [
      'Painéis administrativos',
      'Catálogos digitais com busca e filtros',
      'Cadastros de clientes, pedidos e serviços',
      'Ferramentas internas de controle',
    ],
    proof: ['gestao360', 'prime-imoveis'],
    cta: 'Pedir orçamento de sistema',
  },
  {
    id: 'dashboards',
    category: 'gestao',
    name: 'Dashboards e análise de dados',
    benefit: 'Acompanhe receitas, despesas e resultados em painéis com indicadores e gráficos fáceis de consultar.',
    description:
      'Os dados podem vir das planilhas ou dos registros que você já usa, com filtros por período e exportação para o Excel.',
    applications: [
      'Indicadores de receitas, despesas e resultado',
      'Gráficos por período e por categoria',
      'Relatórios filtráveis e exportáveis',
      'Análise de dados de planilhas existentes',
    ],
    proof: ['gestao360'],
    cta: 'Pedir orçamento de dashboard',
  },
  {
    id: 'planilhas',
    category: 'gestao',
    name: 'Planilhas inteligentes',
    benefit: 'Simplifique seus controles com planilhas organizadas, cálculos automáticos e informações sempre à mão.',
    description:
      'Em Excel ou Google Planilhas, com listas para evitar erros de digitação e resumos que se atualizam a cada lançamento.',
    applications: [
      'Controle financeiro de entradas e saídas',
      'Controle de estoque e de vendas',
      'Indicadores e relatórios mensais',
      'Painéis gerenciais em Excel ou Google Planilhas',
    ],
    proof: [],
    cta: 'Pedir orçamento de planilha',
  },
  {
    id: 'automacoes',
    category: 'processos',
    name: 'Automação de processos',
    benefit: 'Reduza tarefas repetitivas e organize o fluxo de informações com soluções de automação.',
    description:
      'O trabalho começa pelo mapeamento da rotina atual, para automatizar só o que faz sentido no seu caso.',
    applications: [
      'Formulários que alimentam planilhas automaticamente',
      'Geração de relatórios e documentos padronizados',
      'Integrações simples entre ferramentas',
      'Revisão e simplificação de processos',
    ],
    proof: [],
    cta: 'Pedir orçamento de automação',
  },
  {
    id: 'ferramentas',
    category: 'processos',
    name: 'Ferramentas e calculadoras comerciais',
    benefit: 'Calcule preços, padronize orçamentos e prepare propostas com mais agilidade e consistência.',
    description:
      'As regras de preço do seu negócio ficam na ferramenta: cada orçamento mostra a conta e gera um documento pronto para enviar.',
    applications: [
      'Calculadora de orçamento com variáveis de preço',
      'Gerador de propostas para imprimir ou salvar em PDF',
      'Simuladores de preço e prazo',
      'Tabelas de preços com regras de desconto',
    ],
    proof: ['orcafacil'],
    cta: 'Pedir orçamento de ferramenta',
  },
];
