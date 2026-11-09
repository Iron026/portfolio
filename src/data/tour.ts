/**
 * TOUR DE FUNCIONALIDADES (página de cada projeto)
 * ------------------------------------------------------------------
 * Cada parada aponta para uma captura real do projeto (`screen`, índice em
 * `screens` de projects.ts) e para a área da tela em que a funcionalidade
 * aparece (`focus`: x, y, largura e altura em % da captura). A moldura de
 * seleção destaca essa área. As capturas em inglês têm o mesmo layout, então
 * as áreas valem para os dois idiomas.
 *
 * Só descreva o que a demonstração realmente faz. Ao refazer as capturas
 * (scripts/capturas.mjs), confira se as áreas continuam no lugar.
 */
import type { Locale } from '@/i18n/locale';

export type Focus = [x: number, y: number, w: number, h: number];
export interface TourStop {
  screen: number;
  focus: Focus;
  title: string;
  text: string;
}

type Geometry = Array<{ screen: number; focus: Focus }>;
type Texts = Array<{ title: string; text: string }>;

const GEOMETRY: Record<string, Geometry> = {
  'prime-imoveis': [
    { screen: 0, focus: [24, 41, 72, 12] },
    { screen: 0, focus: [4, 41, 24, 59] },
    { screen: 0, focus: [28, 58, 68, 42] },
    { screen: 1, focus: [4.5, 23, 61, 77] },
    { screen: 1, focus: [66.5, 23, 29, 43] },
  ],
  gestao360: [
    { screen: 0, focus: [20.5, 37, 77, 23] },
    { screen: 0, focus: [20.5, 61, 77, 19] },
    { screen: 0, focus: [20.5, 82, 77, 18] },
    { screen: 0, focus: [75.5, 11.5, 22.5, 12.5] },
    { screen: 1, focus: [20.5, 28, 77, 72] },
  ],
  'nova-servicos': [
    { screen: 0, focus: [5.5, 22, 44, 50] },
    { screen: 0, focus: [54.5, 24.5, 39.5, 46] },
    { screen: 1, focus: [41, 9, 53.5, 91] },
    { screen: 1, focus: [41.5, 36, 50.5, 16] },
  ],
  'arena-store': [
    { screen: 0, focus: [4, 18, 92, 18] },
    { screen: 0, focus: [4, 44, 92, 46] },
    { screen: 1, focus: [53.5, 64, 42.5, 36] },
    { screen: 2, focus: [4.5, 24.5, 61, 20] },
    { screen: 2, focus: [66.5, 24.5, 29, 46] },
  ],
  orcafacil: [
    { screen: 0, focus: [6, 49.5, 46, 15.5] },
    { screen: 0, focus: [6, 64.5, 46, 35.5] },
    { screen: 0, focus: [55, 49.5, 40, 34.5] },
    { screen: 0, focus: [55, 84, 40, 16] },
    { screen: 1, focus: [7, 11, 86, 67] },
    { screen: 1, focus: [5, 82, 90, 18] },
  ],
};

const TEXTS: Record<Locale, Record<string, Texts>> = {
  pt: {
    'prime-imoveis': [
      { title: 'Busca por palavra-chave', text: 'Encontre imóveis pelo nome, bairro ou característica, como piscina ou varanda.' },
      { title: 'Filtros combinados', text: 'Finalidade, tipo, bairro, faixa de preço e quartos se combinam. A lista atualiza na hora e o endereço guarda a busca.' },
      { title: 'Resultados claros', text: 'Cada imóvel mostra finalidade, valor e as características principais, com imagens ilustrativas identificadas.' },
      { title: 'Galeria do imóvel', text: 'Fotos com setas, miniaturas e teclado. O leitor de tela é avisado de qual imagem está sendo exibida.' },
      { title: 'Valores e consulta', text: 'Valor, condomínio, IPTU e preço por m², com uma mensagem de consulta pronta para copiar.' },
    ],
    gestao360: [
      { title: 'Filtros que valem para tudo', text: 'Período, tipo, categoria e busca. Indicadores, gráficos, tabela e exportação usam o mesmo recorte.' },
      { title: 'Indicadores calculados', text: 'Receitas, despesas, resultado e número de transações, calculados a partir das transações filtradas.' },
      { title: 'Gráficos', text: 'Evolução de receitas e despesas por semana ou por mês e a divisão das despesas por categoria.' },
      { title: 'Exportação para o Excel', text: 'Exporta o filtro atual em CSV, pronto para abrir no Excel.' },
      { title: 'Tabela de transações', text: 'Os mesmos dados dos indicadores, com tipo, categoria e valor, e paginação.' },
    ],
    'nova-servicos': [
      { title: 'Proposta na primeira tela', text: 'O que a empresa faz, a região atendida e o botão de orçamento logo de início.' },
      { title: 'Atalhos de serviço', text: 'Escolher um serviço leva direto ao formulário com ele já selecionado.' },
      { title: 'Formulário com validação', text: 'Campos obrigatórios indicados e erros explicados junto de cada campo, antes de montar o pedido.' },
      { title: 'Contato do jeito do cliente', text: 'WhatsApp ou e-mail: o campo de contato muda conforme o canal escolhido.' },
    ],
    'arena-store': [
      { title: 'Busca, categorias e ordem', text: 'Busca, filtros por categoria e ordenação por preço funcionam juntos e ficam guardados no endereço.' },
      { title: 'Catálogo com estoque', text: 'Cada produto mostra preço, situação do estoque e quantos tamanhos existem.' },
      { title: 'Tamanho e quantidade', text: 'Tamanhos esgotados aparecem riscados e a quantidade fica limitada ao estoque disponível.' },
      { title: 'Carrinho', text: 'Ajuste de quantidade e remoção de itens. O carrinho fica salvo neste navegador.' },
      { title: 'Resumo e checkout simulado', text: 'Subtotal, frete fictício, aviso de frete grátis e um checkout identificado como simulação, sem pagamento.' },
    ],
    orcafacil: [
      { title: 'Item e quantidade', text: 'Escolha o produto ou serviço do catálogo e a quantidade. Itens vendidos por m² aceitam decimais.' },
      { title: 'Três variáveis de cálculo', text: 'O material multiplica o preço da unidade; acabamento e prazo somam percentuais definidos.' },
      { title: 'Linhas com cálculo detalhado', text: 'Cada linha mostra o valor e, em "Ver cálculo", todas as etapas da conta.' },
      { title: 'Desconto e validade', text: 'Desconto com aviso acima de 30% e validade da proposta em dias.' },
      { title: 'Proposta comercial', text: 'Documento pronto para imprimir ou salvar em PDF pelo navegador.' },
      { title: 'Catálogo editável', text: 'Até 10 produtos ou serviços com preço base e unidade, salvos neste navegador.' },
    ],
  },
  en: {
    'prime-imoveis': [
      { title: 'Keyword search', text: 'Find properties by name, neighborhood or feature, such as pool or balcony.' },
      { title: 'Combined filters', text: 'Purpose, type, neighborhood, price range and bedrooms work together. The list updates instantly and the address keeps the search.' },
      { title: 'Clear results', text: 'Each property shows its purpose, price and main features, with illustrative images labeled as such.' },
      { title: 'Property gallery', text: 'Images with arrows, thumbnails and keyboard support. Screen readers are told which image is shown.' },
      { title: 'Prices and inquiry', text: 'Price, HOA fee, property tax and price per m², with an inquiry message ready to copy.' },
    ],
    gestao360: [
      { title: 'Filters that apply everywhere', text: 'Period, type, category and search. Indicators, charts, table and export all use the same selection.' },
      { title: 'Calculated indicators', text: 'Revenue, expenses, net result and number of transactions, calculated from the filtered transactions.' },
      { title: 'Charts', text: 'Revenue and expenses by week or month, and expenses split by category.' },
      { title: 'Export to Excel', text: 'Exports the current filter as a CSV file, ready to open in Excel.' },
      { title: 'Transactions table', text: 'The same data as the indicators, with type, category and amount, and pagination.' },
    ],
    'nova-servicos': [
      { title: 'Offer on the first screen', text: 'What the company does, the area it serves and the quote button right away.' },
      { title: 'Service shortcuts', text: 'Choosing a service goes straight to the form with that service selected.' },
      { title: 'Validated form', text: 'Required fields are marked and errors are explained next to each field before the request is built.' },
      { title: 'Contact the customer’s way', text: 'WhatsApp or email: the contact field changes with the chosen channel.' },
    ],
    'arena-store': [
      { title: 'Search, categories and sorting', text: 'Search, category filters and price sorting work together and are kept in the address.' },
      { title: 'Catalog with stock', text: 'Each product shows its price, stock status and how many sizes are available.' },
      { title: 'Size and quantity', text: 'Sold-out sizes are crossed out and the quantity is limited to the available stock.' },
      { title: 'Cart', text: 'Change quantities and remove items. The cart is saved in this browser.' },
      { title: 'Summary and simulated checkout', text: 'Subtotal, fictional shipping, a free-shipping notice and a checkout clearly labeled as a simulation, with no payment.' },
    ],
    orcafacil: [
      { title: 'Item and quantity', text: 'Pick a product or service from the catalog and the quantity. Items sold by m² accept decimals.' },
      { title: 'Three pricing variables', text: 'Material multiplies the unit price; finishing and turnaround add set percentages.' },
      { title: 'Lines with a detailed calculation', text: 'Each line shows its amount and, under "See calculation", every step of the math.' },
      { title: 'Discount and validity', text: 'Discount with a warning above 30% and the number of days the proposal is valid.' },
      { title: 'Sales proposal', text: 'A document ready to print or save as PDF from the browser.' },
      { title: 'Editable catalog', text: 'Up to 10 products or services with base price and unit, saved in this browser.' },
    ],
  },
};

/** Paradas do tour de um projeto, no idioma pedido (vazio se o projeto não tiver tour). */
export function getTour(slug: string, locale: Locale): TourStop[] {
  const geometry = GEOMETRY[slug] ?? [];
  const texts = TEXTS[locale][slug] ?? TEXTS.pt[slug] ?? [];
  return geometry.map((g, i) => ({ ...g, ...(texts[i] ?? { title: '', text: '' }) }));
}

/** Para os testes: mesma quantidade de paradas e textos nos dois idiomas. */
export const TOUR_SLUGS = Object.keys(GEOMETRY);
export const tourTexts = TEXTS;
