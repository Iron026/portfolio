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
import type { Locale } from '@/i18n/locale';
import { projectsEn } from './projects.en';

export interface Decision {
  title: string;
  text: string;
}

/** Quem usa a solução e qual necessidade ela atende. */
export interface Need {
  who: string;
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
  /** Resumo curto do cartão na página inicial (até ~120 caracteres). */
  teaser: string;
  /** Resumo completo, usado no topo do estudo de caso. */
  summary: string;
  problem: string;
  features: string[];
  technologies: string[];
  preview: PreviewKind;
  /** Objetivo da solução, em uma ou duas frases. */
  goal: string;
  /** Decisões de implementação relevantes (o que foi feito e por quê). */
  decisions: Decision[];
  /** Quem usa a solução e o que ela resolve para cada um (estudo de caso). */
  needs: Need[];
  /** Roteiro curto para testar a demonstração, na ordem em que faz sentido. */
  tryIt: string[];
  /** O que pode ser adaptado para um cliente real (definido no orçamento, sem promessa de resultado). */
  adaptations: string[];
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
    teaser: 'Catálogo de imóveis com busca, filtros combinados e página de cada imóvel com galeria e consulta pronta.',
    summary:
      'Site para imobiliárias e corretores com catálogo de imóveis, busca, filtros combinados e uma página para cada imóvel, com galeria ilustrativa e mensagem de consulta pronta.',
    problem:
      'Imóveis divulgados em mensagens e redes sociais soltas são difíceis de comparar. Um catálogo reúne tudo em um só endereço, com filtros e consulta direta em cada anúncio.',
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
    needs: [
      { who: 'Quem procura um imóvel', text: 'Filtra por finalidade, bairro, tipo, preço e quartos pelo celular e pode compartilhar a busca com o mesmo resultado.' },
      { who: 'Corretor ou imobiliária', text: 'Reúne os anúncios em um só endereço e recebe consultas que já citam o código, o valor e o endereço do imóvel.' },
    ],
    tryIt: [
      'Abra o catálogo e escolha entre Comprar e Alugar.',
      'Combine bairro, tipo e quartos, ou busque uma característica como "mobiliado".',
      'Abra um imóvel e passe pelas imagens com toque, clique ou as setas do teclado.',
      'Copie a mensagem de consulta pronta do anúncio.',
    ],
    adaptations: [
      'Imóveis reais, com fotos próprias e os bairros em que você atua',
      'Consulta enviada direto para o seu WhatsApp ou e-mail',
      'Cadastro de imóveis por planilha ou painel simples, para atualizar sem mexer no código',
      'Domínio próprio, como suaimobiliaria.com.br',
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
    teaser: 'Painel financeiro com receitas, despesas e resultado, gráficos que seguem os filtros e exportação para o Excel.',
    summary:
      'Painel de gestão que calcula receitas, despesas, resultado e número de transações, com gráficos que acompanham os filtros e exportação em CSV para o Excel.',
    problem:
      'Muitos negócios anotam vendas e gastos, mas não enxergam o resultado do período com rapidez. O painel transforma a lista de transações em indicadores e gráficos que mudam conforme o período e os filtros.',
    features: [
      'Indicadores calculados a partir das transações filtradas',
      'Evolução de receitas e despesas por semana (30 e 90 dias) ou por mês (12 meses)',
      'Despesas por categoria',
      'Filtros de período (30 dias, 90 dias e 12 meses), tipo e categoria',
      'Busca e tabela de transações com paginação',
      'Exportação do filtro atual em CSV compatível com Excel',
    ],
    technologies: ['React', 'TypeScript', 'React Router', 'Gráficos em SVG', 'Exportação CSV'],
    preview: 'dashboard',
    service: 'dashboards',
    quoteCta: 'Quero um painel de gestão assim',
    goal:
      'Transformar uma lista de transações em respostas rápidas: quanto entrou, quanto saiu, qual foi o resultado e para onde foi o dinheiro no período escolhido.',
    decisions: [
      { title: 'Um único filtro para tudo', text: 'Indicadores, gráficos, tabela e exportação usam o mesmo recorte de dados, então os números da tela sempre batem com o arquivo exportado.' },
      { title: 'Eixo do tempo sem buracos', text: 'Os gráficos agrupam por semana (30 e 90 dias) ou por mês (12 meses) e mostram os períodos sem movimento, marcando quando a primeira ou a última semana está incompleta.' },
      { title: 'Gráficos próprios e acessíveis', text: 'Os gráficos foram desenhados no próprio código, sem biblioteca externa: a página fica mais leve e os pontos podem ser percorridos pelo teclado, com descrição para leitores de tela.' },
      { title: 'CSV no formato do Excel brasileiro', text: 'O arquivo exportado abre direto no Excel em português, com acentos, vírgula decimal e datas dd/mm/aaaa corretos, sem precisar converter nada.' },
    ],
    needs: [
      { who: 'Dono do negócio', text: 'Vê quanto entrou, quanto saiu e o resultado do período sem montar contas na mão.' },
      { who: 'Quem cuida do financeiro', text: 'Filtra por período, tipo e categoria, encontra transações pela busca e leva o mesmo recorte para o Excel.' },
    ],
    tryIt: [
      'Troque o período entre 30 dias, 90 dias e 12 meses e veja indicadores e gráficos recalcularem.',
      'Filtre só as despesas ou uma categoria para ver para onde foi o dinheiro.',
      'Procure uma transação pela busca da tabela.',
      'Exporte o filtro atual em CSV e abra no Excel.',
    ],
    adaptations: [
      'Seus dados, importados das planilhas ou do sistema que você já usa',
      'Categorias, indicadores e períodos do seu negócio',
      'Acesso com login para a sua equipe',
      'Versão em Excel ou Google Planilhas, quando um painel na web não for necessário',
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
    teaser: 'Página de serviços que conduz o visitante até um pedido de orçamento completo, com formulário validado.',
    summary:
      'Página de apresentação para uma empresa de serviços, organizada para levar o visitante até um pedido de orçamento com formulário validado.',
    problem:
      'Quem procura um prestador de serviço desiste quando não encontra rápido o que é oferecido e como pedir orçamento. A página apresenta as informações na ordem em que o cliente decide e deixa o pedido a um toque.',
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
    needs: [
      { who: 'Cliente que procura o serviço', text: 'Entende rápido o que é oferecido e como funciona o atendimento, e pede orçamento sem criar conta.' },
      { who: 'Prestador de serviço', text: 'Recebe pedidos mais completos, com serviço, contato e descrição organizados na mesma mensagem.' },
    ],
    tryIt: [
      'Escolha um serviço nos atalhos do topo ou nos cartões de serviço.',
      'Veja o formulário abrir com esse serviço já preenchido.',
      'Tente enviar com um campo vazio para ver a validação e o foco no primeiro erro.',
      'Preencha tudo e copie a mensagem do pedido pronta.',
    ],
    adaptations: [
      'Seus serviços, área de atendimento, fotos e textos',
      'Pedido enviado direto para o seu WhatsApp ou e-mail',
      'Botão de WhatsApp sempre à vista e links para mapa e redes sociais',
      'Domínio próprio e configuração básica para buscadores (SEO)',
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
    teaser: 'Loja virtual com busca, tamanhos e estoque, carrinho salvo no navegador e checkout simulado.',
    summary:
      'Loja de artigos esportivos com busca, filtros, escolha de tamanho e quantidade, carrinho salvo no navegador e checkout simulado, sem cobrança.',
    problem:
      'Em uma loja virtual, o cliente precisa saber exatamente o que está comprando, em qual tamanho e por quanto. A demonstração cobre o caminho completo, do produto ao carrinho, com o total calculado.',
    features: [
      'Catálogo com 8 produtos fictícios e estoque ilustrativo',
      'Busca, filtros por categoria e ordenação por preço',
      'Seleção de tamanho e quantidade limitada ao estoque',
      'Carrinho com ajuste, remoção, subtotal, frete fictício e total',
      'Carrinho salvo no navegador, com preços sempre do catálogo',
      'Checkout identificado como simulação, sem pagamento',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Armazenamento no navegador'],
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
    needs: [
      { who: 'Quem compra', text: 'Encontra o produto pela busca ou pela categoria, escolhe tamanho e quantidade e confere o total antes de finalizar.' },
      { who: 'Lojista', text: 'Mostra o estoque de cada tamanho e evita pedidos com quantidade maior do que a disponível.' },
    ],
    tryIt: [
      'Busque um produto ou filtre por categoria e ordene por preço.',
      'Abra um produto, escolha tamanho e quantidade e adicione ao carrinho.',
      'No carrinho, ajuste as quantidades e veja subtotal, frete fictício e total.',
      'Recarregue a página: o carrinho continua salvo. O checkout é uma simulação, sem pagamento.',
    ],
    adaptations: [
      'Seus produtos, fotos, tamanhos e estoque',
      'Pedido finalizado pelo WhatsApp, como um catálogo com carrinho',
      'Pagamento on-line e frete calculado, avaliados conforme o volume de vendas',
      'Painel ou planilha para atualizar preços e estoque',
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
    teaser: 'Calculadora de orçamentos com regras de preço fixas, desconto e proposta pronta para imprimir ou salvar em PDF.',
    summary:
      'Calculadora de orçamentos configurada para uma gráfica fictícia: aplica material, acabamento, prazo e desconto e gera a proposta para imprimir ou salvar em PDF.',
    problem:
      'Orçamentos montados de cabeça ou em planilhas diferentes fazem o mesmo serviço sair com preços diferentes. A calculadora aplica sempre as mesmas regras, mostra a conta de cada linha e prepara a proposta.',
    features: [
      'Catálogo editável com até 10 produtos ou serviços',
      'Três variáveis de cálculo: material, acabamento e prazo',
      'Subtotais, desconto e total calculados em centavos',
      'Cálculo detalhado de cada linha do orçamento',
      'Proposta para imprimir ou salvar em PDF pelo navegador',
      'Resumo pronto para copiar e catálogo salvo no navegador',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Impressão e PDF', 'Armazenamento no navegador'],
    preview: 'orcamento',
    service: 'ferramentas',
    quoteCta: 'Quero um gerador de orçamentos assim',
    goal:
      'Fazer com que o mesmo serviço tenha sempre o mesmo preço: regras fixas de cálculo, conta visível linha a linha e proposta pronta para enviar.',
    decisions: [
      { title: 'Contas sem diferença de centavos', text: 'Os valores são calculados em centavos inteiros, o que evita as diferenças de arredondamento comuns em contas com decimais e porcentagens.' },
      { title: 'Cálculo explicado', text: 'Cada linha do orçamento mostra a conta completa: preço base, multiplicador do material e acréscimos de acabamento e prazo.' },
      { title: 'PDF sem gerador externo', text: 'A proposta usa uma folha de estilo de impressão própria: o navegador imprime ou salva em PDF só o documento, em uma página A4.' },
      { title: 'Catálogo local validado', text: 'O catálogo editável fica salvo no navegador e é conferido ao abrir; dados inválidos voltam ao catálogo de exemplo.' },
    ],
    needs: [
      { who: 'Quem monta os orçamentos', text: 'Aplica as mesmas regras de preço a cada cliente, sem refazer contas nem consultar tabelas soltas.' },
      { who: 'Cliente que recebe a proposta', text: 'Recebe um documento organizado, com itens, valores e total, para imprimir ou guardar em PDF.' },
    ],
    tryIt: [
      'Adicione itens e escolha material, acabamento e prazo de cada um.',
      'Confira o cálculo detalhado de cada linha e aplique um desconto.',
      'Abra a proposta e imprima ou salve em PDF pelo navegador.',
      'Edite o catálogo de produtos e preços: ele fica salvo no navegador.',
    ],
    adaptations: [
      'Seus produtos, serviços e regras de preço',
      'Proposta com a sua marca, os dados da empresa e as suas condições comerciais',
      'Versão em planilha, se a equipe já trabalha no Excel ou no Google Planilhas',
      'Histórico de orçamentos e envio da proposta pelo WhatsApp ou e-mail',
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

/** Campos de texto de um projeto, traduzidos em src/data/projects.<idioma>.ts. */
export type ProjectText = Pick<
  Project,
  'category' | 'teaser' | 'summary' | 'problem' | 'features' | 'technologies' | 'quoteCta' | 'goal' | 'decisions' | 'needs' | 'tryIt' | 'adaptations'
> & {
  /** Texto alternativo e legenda de cada captura, na mesma ordem de `screens`. */
  screens: Array<{ alt: string; caption: string }>;
  /** Frase que descreve a prévia em vídeo. */
  videoShows?: string;
};

/**
 * Capturas e vídeos da versão em inglês ficam em /projetos/<slug>/en/,
 * gravados da própria demonstração em inglês (scripts/capturas.mjs e scripts/previas.mjs).
 */
export const englishMedia = (src: string) => src.replace(/^(\/projetos\/[^/]+)\//, '$1/en/');

/** Projeto com os textos, capturas e rotas do idioma pedido. Regras e identificadores não mudam. */
export function localizeProject(project: Project, locale: Locale): Project {
  if (locale === 'pt') return project;
  const t = projectsEn[project.slug];
  return {
    ...project,
    ...t,
    screens: project.screens.map((screen, i) => ({ ...screen, ...t.screens[i], src: englishMedia(screen.src) })),
    video: project.video && { src: englishMedia(project.video.src), shows: t.videoShows ?? project.video.shows },
  };
}

export function getProjects(locale: Locale) {
  return projects.map((p) => localizeProject(p, locale));
}

export function getLocalizedProject(slug: string | undefined, locale: Locale) {
  const project = getProject(slug);
  return project ? localizeProject(project, locale) : undefined;
}
