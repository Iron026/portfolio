/**
 * SERVIÇOS
 * Organizados em categorias. Cada serviço parte de um problema comum do
 * cliente e, quando existir, aponta para o projeto demonstrativo que mostra
 * esse tipo de solução funcionando (`proof`, com o `slug` do projeto).
 *
 * O `id` é usado no formulário de contato (?servico=<id>): não altere os
 * ids existentes para não quebrar links já compartilhados.
 */

export interface Service {
  id: string;
  category: CategoryId;
  name: string;
  /** Frase curta usada no topo da página. */
  short: string;
  /** O problema do cliente, em uma frase. */
  problem: string;
  /** Como a solução resolve. */
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
    short: 'Presença profissional, pronta para o celular',
    problem: 'O cliente procura pelo celular e não entende rápido o que você oferece nem como pedir um orçamento.',
    description:
      'Sites, landing pages, catálogos e lojas responsivos, com a informação na ordem em que o visitante decide e o contato a um toque de distância.',
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
    short: 'Ferramentas de gestão no navegador',
    problem: 'Cadastros, pedidos e controles espalhados em cadernos, mensagens e arquivos diferentes.',
    description:
      'Ferramentas acessadas pelo navegador, com escopo definido junto com você para atender exatamente ao que o negócio precisa.',
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
    short: 'Os números do negócio em um só lugar',
    problem: 'Você registra vendas e gastos, mas não consegue ver com rapidez o resultado do período.',
    description:
      'Painéis que transformam listas de lançamentos em indicadores e gráficos filtráveis, com exportação para o Excel.',
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
    short: 'Controles com fórmulas e números à vista',
    problem: 'Planilhas com contas manuais, que quebram com facilidade e que só uma pessoa sabe usar.',
    description:
      'Planilhas de controle com fórmulas, validações e relatórios que se atualizam sozinhos, em Excel ou Google Planilhas.',
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
    short: 'Menos tarefas repetitivas e cópia manual',
    problem: 'Horas por semana copiando dados de um lugar para outro e refazendo os mesmos documentos.',
    description:
      'Rotinas que passam a acontecer com menos cliques: dados que vão de um lugar para outro e documentos gerados em um padrão.',
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
    short: 'Preço certo, do mesmo jeito, toda vez',
    problem: 'Orçamentos montados de cabeça, com preços diferentes para o mesmo serviço.',
    description:
      'Calculadoras e geradores de propostas com as regras do seu negócio, a conta explicada e o documento pronto para enviar.',
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
