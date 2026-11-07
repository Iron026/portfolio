/**
 * PROJETOS
 * ------------------------------------------------------------------
 * Para cadastrar um novo trabalho, copie um dos objetos abaixo,
 * altere os campos e salve. Ele aparece automaticamente na página
 * inicial e ganha uma página de detalhes em /projetos/<slug>.
 *
 * - `kind: 'demo'` identifica o projeto como demonstrativo autoral.
 *   Use `kind: 'cliente'` somente para trabalhos reais feitos para clientes.
 * - `screens`: capturas reais da interface, em /public/projetos/<slug>/.
 *   Informe o caminho SEM o final "-1600.webp"/"-800.webp": o site monta
 *   as duas versões (tela grande e celular) automaticamente. A primeira
 *   captura vira a imagem principal. Sem capturas, o site exibe a prévia
 *   desenhada em código (`preview`).
 * - `demo.status`: 'disponivel' mostra o botão de demonstração;
 *   'em-breve' mostra um aviso e não cria link quebrado.
 * - `demo.url`: rota interna (ex.: '/demos/imoveis') ou link externo.
 */
import type { PreviewKind } from '@/components/previews/ProjectPreview';

export interface Decision {
  title: string;
  text: string;
}

export interface Screen {
  /** Caminho base, ex.: '/projetos/gestao360/tela-1' (arquivos -1600.webp e -800.webp). */
  src: string;
  /** Larguras disponíveis: telas grandes usam 1600/800; celular usa 780/390. */
  device: 'desktop' | 'mobile';
  alt: string;
  caption: string;
  /** Rota da demonstração em que a captura foi feita. */
  route: string;
}

export interface Project {
  slug: string;
  kind: 'demo' | 'cliente';
  name: string;
  category: string;
  summary: string;
  problem: string;
  features: string[];
  technologies: string[];
  preview: PreviewKind;
  /** Objetivo da solução, em uma ou duas frases. */
  goal: string;
  /** Decisões de implementação relevantes (o que foi feito e por quê). */
  decisions: Decision[];
  /** Capturas reais da interface; a primeira é a imagem principal. */
  screens: Screen[];
  demo: { status: 'disponivel' | 'em-breve'; url: string };
  /** Serviço pré-selecionado no formulário quando o visitante pede algo parecido. */
  service: string;
  /** Texto do botão de orçamento contextual (ex.: "Quero um painel de gestão assim"). */
  quoteCta: string;
  /** Material extra opcional, como uma planilha para download. */
  extra?: { label: string; url: string };
  /**
   * Prévia em vídeo gravada da própria demonstração (scripts/previas.mjs), sem som.
   * `src` é o caminho sem extensão: o site usa `<src>.webm` (VP9) e `<src>.mp4` (H.264).
   * `shows` descreve em uma frase o que acontece no vídeo (legenda e leitores de tela).
   */
  video?: { src: string; shows: string };
  /** Cores da identidade da demonstração, usadas como detalhe no cartão do portfólio. */
  accent: { base: string; detail: string };
}

export const projects: Project[] = [
  {
    slug: 'prime-imoveis',
    kind: 'demo',
    name: 'Prime Imóveis',
    category: 'Portal imobiliário',
    summary:
      'Site para imobiliárias e corretores com catálogo de imóveis, busca por palavras-chave, filtros combinados e página individual com galeria de imagens ilustrativas.',
    problem:
      'Corretores costumam divulgar imóveis em mensagens e redes sociais soltas, o que dificulta para o cliente comparar opções. Um catálogo organizado reúne tudo em um endereço só, com filtros e uma mensagem de consulta pronta em cada anúncio.',
    features: [
      'Catálogo com 12 imóveis fictícios',
      'Filtros por finalidade, localização, tipo, faixa de preço e quartos',
      'Busca por nome, bairro ou característica',
      'Página individual com galeria de imagens ilustrativas',
      'Quartos, banheiros, vagas e área em destaque',
      'Mensagem de consulta pronta para copiar em cada imóvel',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'React Router'],
    preview: 'imoveis',
    service: 'sites',
    quoteCta: 'Quero um catálogo de imóveis assim',
    goal:
      'Reunir os imóveis em um catálogo único, fácil de filtrar no celular, em que cada anúncio já leve o visitante a uma consulta com as informações certas.',
    decisions: [
      { title: 'Filtros guardados no endereço', text: 'Finalidade, bairro, tipo, faixa de preço e quartos ficam na URL. A busca pode ser compartilhada e o botão voltar do navegador funciona como o visitante espera.' },
      { title: 'Imagens leves e honestas', text: 'A galeria usa ilustrações em SVG geradas no próprio código, identificadas como ilustrativas, em vez de fotos de banco que poderiam ser confundidas com imóveis reais.' },
      { title: 'Galeria acessível', text: 'A troca de imagens funciona por toque, por clique e pelas setas do teclado, e o leitor de tela é avisado da imagem exibida.' },
      { title: 'Consulta sem servidor', text: 'Cada imóvel gera uma mensagem de consulta com código, valor e endereço, pronta para copiar: nenhum dado é enviado sem a ação do visitante.' },
    ],
    video: { src: '/projetos/prime-imoveis/previa', shows: 'Busca por palavra-chave e filtros de finalidade, bairro e tipo atualizando a lista de imóveis.' },
    accent: { base: '#1f3d33', detail: '#c9a24a' },
    screens: [
      { src: '/projetos/prime-imoveis/tela-1', device: 'desktop', alt: 'Catálogo da Prime Imóveis com busca, filtros e cartões de imóveis', caption: 'Catálogo com busca por palavra-chave e filtros combinados', route: '/demos/imoveis' },
      { src: '/projetos/prime-imoveis/tela-2', device: 'desktop', alt: 'Página do imóvel com galeria ilustrativa, valor e botão de consulta', caption: 'Página do imóvel: galeria, valores e consulta', route: '/demos/imoveis/PI-101' },
      { src: '/projetos/prime-imoveis/celular', device: 'mobile', alt: 'Catálogo da Prime Imóveis no celular', caption: 'O mesmo catálogo no celular', route: '/demos/imoveis' },
    ],
    demo: { status: 'disponivel', url: '/demos/imoveis' },
  },
  {
    slug: 'gestao360',
    kind: 'demo',
    name: 'Gestão360',
    category: 'Dashboard financeiro e comercial',
    summary:
      'Painel de gestão com receitas, despesas, resultado e número de transações calculados a partir dos dados, gráficos que reagem aos filtros e exportação em CSV para o Excel.',
    problem:
      'Muitos pequenos negócios anotam vendas e gastos, mas não conseguem enxergar o resultado do período com rapidez. O painel transforma a lista de transações em indicadores e gráficos que se atualizam conforme o período e os filtros escolhidos.',
    features: [
      'Indicadores calculados a partir das transações filtradas',
      'Evolução de receitas e despesas por semana (30 e 90 dias) ou por mês (12 meses)',
      'Despesas por categoria',
      'Filtros de período (30 dias, 90 dias e 12 meses), tipo e categoria',
      'Busca e tabela de transações com paginação',
      'Exportação do filtro atual em CSV compatível com Excel',
    ],
    technologies: ['React', 'TypeScript', 'React Router', 'Gráficos em SVG', 'CSV'],
    preview: 'dashboard',
    service: 'dashboards',
    quoteCta: 'Quero um painel de gestão assim',
    goal:
      'Transformar uma lista de transações em respostas rápidas: quanto entrou, quanto saiu, qual foi o resultado e para onde foi o dinheiro no período escolhido.',
    decisions: [
      { title: 'Um único filtro para tudo', text: 'Indicadores, gráficos, tabela e exportação usam o mesmo recorte de dados, então os números da tela sempre batem com o arquivo exportado.' },
      { title: 'Eixo do tempo sem buracos', text: 'Os gráficos agrupam por semana (30 e 90 dias) ou por mês (12 meses) e mostram os períodos sem movimento, marcando quando a primeira ou a última semana está incompleta.' },
      { title: 'Gráficos em SVG próprio', text: 'Os gráficos foram desenhados em SVG, sem biblioteca de gráficos: a página fica mais leve e os pontos podem ser percorridos pelo teclado, com descrição para leitores de tela.' },
      { title: 'CSV no formato do Excel brasileiro', text: 'A exportação usa UTF-8 com BOM, ponto e vírgula, vírgula decimal e datas dd/mm/aaaa, para abrir no Excel com acentos e valores corretos.' },
    ],
    video: { src: '/projetos/gestao360/previa', shows: 'Filtros de período, tipo e busca aplicados: indicadores e gráficos recalculam na hora.' },
    accent: { base: '#101f33', detail: '#22c3b0' },
    screens: [
      { src: '/projetos/gestao360/tela-1', device: 'desktop', alt: 'Painel Gestão360 com filtros e indicadores de receitas, despesas, resultado e transações', caption: 'Painel com filtros e indicadores calculados', route: '/demos/gestao360' },
      { src: '/projetos/gestao360/tela-2', device: 'desktop', alt: 'Gráfico e tabela de transações do Gestão360 filtrados para 30 dias', caption: 'Recorte de 30 dias: gráfico semanal e tabela de transações', route: '/demos/gestao360' },
      { src: '/projetos/gestao360/celular', device: 'mobile', alt: 'Painel Gestão360 no celular', caption: 'O painel no celular', route: '/demos/gestao360' },
    ],
    demo: { status: 'disponivel', url: '/demos/gestao360' },
  },
  {
    slug: 'nova-servicos',
    kind: 'demo',
    name: 'Nova Serviços',
    category: 'Landing page de serviços',
    summary:
      'Página de apresentação para uma empresa de serviços, com seções que conduzem o visitante até um formulário de orçamento validado.',
    problem:
      'Prestadores de serviço perdem contatos quando o visitante não encontra rápido o que é oferecido e como pedir um orçamento. A página organiza a informação na ordem em que o cliente decide e deixa o pedido a um toque de distância.',
    features: [
      'Estrutura pensada para conversão',
      'Seções de serviços, vantagens e etapas',
      'Perguntas frequentes',
      'Formulário de orçamento com validação',
      'Mensagem do pedido pronta para copiar, sem servidor',
      'Layout desenhado primeiro para o celular',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    preview: 'landing',
    service: 'sites',
    quoteCta: 'Quero uma landing page assim',
    goal:
      'Levar o visitante, na ordem em que ele decide, de "o que vocês fazem?" até um pedido de orçamento completo, sem exigir cadastro.',
    decisions: [
      { title: 'Página guiada por âncoras', text: 'O menu e os botões levam a cada seção com rolagem compensada pelo cabeçalho fixo, inclusive no menu do celular.' },
      { title: 'Atalhos de serviço', text: 'Escolher um serviço no topo ou nos cartões já leva ao formulário com o serviço preenchido.' },
      { title: 'Validação na ordem dos campos', text: 'Os erros aparecem ao lado de cada campo, e o foco vai para o primeiro campo com problema, seguindo a mesma ordem da tela.' },
      { title: 'Nenhum envio simulado', text: 'Sem um destinatário real, a página não finge enviar: ela monta a mensagem do pedido para o visitante copiar.' },
    ],
    video: { src: '/projetos/nova-servicos/previa', shows: 'Atalho de serviço levando ao formulário, preenchimento e o pedido pronto para enviar.' },
    accent: { base: '#0b5563', detail: '#f2c230' },
    screens: [
      { src: '/projetos/nova-servicos/tela-1', device: 'desktop', alt: 'Topo da landing page Nova Serviços com chamada principal e atalhos de serviço', caption: 'Primeira dobra com proposta clara e atalhos de serviço', route: '/demos/nova-servicos' },
      { src: '/projetos/nova-servicos/tela-2', device: 'desktop', alt: 'Formulário de orçamento da Nova Serviços sendo preenchido', caption: 'Formulário de orçamento com validação', route: '/demos/nova-servicos' },
      { src: '/projetos/nova-servicos/celular', device: 'mobile', alt: 'Landing page Nova Serviços no celular', caption: 'Layout pensado primeiro para o celular', route: '/demos/nova-servicos' },
    ],
    demo: { status: 'disponivel', url: '/demos/nova-servicos' },
  },
  {
    slug: 'arena-store',
    kind: 'demo',
    name: 'Arena Store',
    category: 'Loja virtual demonstrativa',
    summary:
      'Loja de artigos esportivos com busca, filtros, escolha de tamanho e quantidade, carrinho que fica salvo no navegador e checkout simulado.',
    problem:
      'Uma loja virtual precisa deixar claro o que está sendo comprado, em qual tamanho e por quanto. A demonstração cobre o caminho completo do produto ao carrinho, com cálculo de subtotal e sem cobrança real.',
    features: [
      'Catálogo com 8 produtos fictícios e estoque ilustrativo',
      'Busca, filtros por categoria e ordenação por preço',
      'Seleção de tamanho e quantidade limitada ao estoque',
      'Carrinho com ajuste, remoção, subtotal, frete fictício e total',
      'Carrinho salvo no navegador, com preços sempre do catálogo',
      'Checkout identificado como simulação, sem pagamento',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'localStorage'],
    preview: 'loja',
    service: 'sites',
    quoteCta: 'Quero uma loja virtual assim',
    goal:
      'Mostrar o caminho completo de uma compra, do catálogo ao checkout, deixando claro em cada etapa o produto, o tamanho, a quantidade e o valor.',
    decisions: [
      { title: 'Preço sempre do catálogo', text: 'O carrinho salva apenas produto, tamanho e quantidade. Os preços vêm do catálogo a cada carregamento, então um valor alterado no navegador não muda o total.' },
      { title: 'Carrinho salvo com verificação', text: 'Ao abrir a loja, os dados salvos são conferidos: itens inexistentes são descartados e quantidades acima do estoque são ajustadas, com aviso ao visitante.' },
      { title: 'Estoque respeitado', text: 'Os botões de quantidade e o carrinho não deixam passar do estoque ilustrativo de cada tamanho.' },
      { title: 'Simulação identificada', text: 'O checkout pede a confirmação de que se trata de uma simulação, e um aviso fixo lembra em todas as telas que nenhuma compra é processada e nenhum pagamento é realizado.' },
    ],
    video: { src: '/projetos/arena-store/previa', shows: 'Busca de produto, escolha de tamanho e quantidade, item no carrinho e total atualizado.' },
    accent: { base: '#15191c', detail: '#ff6b2c' },
    screens: [
      { src: '/projetos/arena-store/tela-1', device: 'desktop', alt: 'Catálogo da Arena Store com busca, categorias e ordenação', caption: 'Catálogo com busca, categorias e ordenação', route: '/demos/arena-store' },
      { src: '/projetos/arena-store/tela-2', device: 'desktop', alt: 'Página de produto da Arena Store com escolha de tamanho e quantidade', caption: 'Produto com tamanho, quantidade e estoque', route: '/demos/arena-store/produto/AR-03' },
      { src: '/projetos/arena-store/tela-3', device: 'desktop', alt: 'Carrinho da Arena Store com subtotal, frete fictício e total', caption: 'Carrinho com subtotal, frete fictício e total', route: '/demos/arena-store/carrinho' },
      { src: '/projetos/arena-store/celular', device: 'mobile', alt: 'Catálogo da Arena Store no celular', caption: 'A loja no celular', route: '/demos/arena-store' },
    ],
    demo: { status: 'disponivel', url: '/demos/arena-store' },
  },
  {
    slug: 'orcafacil',
    kind: 'demo',
    name: 'OrçaFácil',
    category: 'Calculadora comercial',
    summary:
      'Calculadora de orçamentos para pequenas empresas, configurada para uma gráfica fictícia: monta o preço com material, acabamento e prazo, aplica desconto e gera a proposta para imprimir ou salvar em PDF.',
    problem:
      'Muitos pequenos negócios montam orçamentos de cabeça ou em planilhas diferentes a cada cliente, e o mesmo serviço sai com preços diferentes. A calculadora aplica sempre as mesmas regras, mostra o cálculo de cada linha e entrega a proposta pronta em poucos minutos.',
    features: [
      'Catálogo editável com até 10 produtos ou serviços',
      'Três variáveis de cálculo: material, acabamento e prazo',
      'Subtotais, desconto e total calculados em centavos',
      'Cálculo detalhado de cada linha do orçamento',
      'Proposta para imprimir ou salvar em PDF pelo navegador',
      'Resumo pronto para copiar e catálogo salvo no navegador',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'CSS de impressão', 'localStorage'],
    preview: 'orcamento',
    service: 'ferramentas',
    quoteCta: 'Quero um gerador de orçamentos assim',
    goal:
      'Fazer com que o mesmo serviço tenha sempre o mesmo preço: regras fixas de cálculo, conta visível linha a linha e proposta pronta para enviar.',
    decisions: [
      { title: 'Dinheiro em centavos', text: 'Todos os valores são calculados em centavos inteiros e os percentuais em pontos-base, evitando os erros de arredondamento comuns em contas com decimais.' },
      { title: 'Cálculo explicado', text: 'Cada linha do orçamento mostra a conta completa: preço base, multiplicador do material e acréscimos de acabamento e prazo.' },
      { title: 'PDF sem gerador externo', text: 'A proposta usa uma folha de estilo de impressão própria: o navegador imprime ou salva em PDF só o documento, em uma página A4.' },
      { title: 'Catálogo local validado', text: 'O catálogo editável fica salvo no navegador e é conferido ao abrir; dados inválidos voltam ao catálogo de exemplo.' },
    ],
    video: { src: '/projetos/orcafacil/previa', shows: 'Itens com material e prazo, desconto aplicado e a proposta montada com os valores calculados.' },
    accent: { base: '#172033', detail: '#2844c7' },
    screens: [
      { src: '/projetos/orcafacil/tela-1', device: 'desktop', alt: 'OrçaFácil com itens sendo adicionados e escolha de material, acabamento e prazo', caption: 'Montagem do orçamento com as três variáveis de cálculo', route: '/demos/orcafacil' },
      { src: '/projetos/orcafacil/tela-2', device: 'desktop', alt: 'Pré-visualização da proposta comercial gerada pelo OrçaFácil', caption: 'Proposta pronta para imprimir ou salvar em PDF', route: '/demos/orcafacil' },
      { src: '/projetos/orcafacil/celular', device: 'mobile', alt: 'OrçaFácil no celular', caption: 'A calculadora no celular', route: '/demos/orcafacil' },
    ],
    demo: { status: 'disponivel', url: '/demos/orcafacil' },
  },
];

export function getProject(slug: string | undefined) {
  return projects.find((project) => project.slug === slug);
}
