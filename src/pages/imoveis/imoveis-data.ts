/**
 * Prime Imóveis — catálogo fictício e regras de busca da demonstração.
 * Empresa, endereços, preços e imóveis são inventados. Nada é enviado a servidor.
 * As funções são puras (sem React) para poderem ser testadas isoladamente.
 */

export type Purpose = 'venda' | 'aluguel';
export type PropertyType = 'apartamento' | 'casa' | 'sobrado' | 'cobertura' | 'studio' | 'comercial';
export type SceneKind = 'fachada-casa' | 'fachada-predio' | 'fachada-sobrado' | 'fachada-comercial' | 'sala' | 'cozinha' | 'quarto' | 'banheiro' | 'externa' | 'piscina';

export interface Property {
  /** Código estável, usado na URL: /demos/imoveis/PI-101 */
  id: string;
  title: string;
  purpose: Purpose;
  type: PropertyType;
  neighborhood: string;
  /** Venda: valor total. Aluguel: valor mensal. Em reais. */
  price: number;
  /** Valores mensais estimados (fictícios); 0 quando não se aplica. */
  condo: number;
  iptu: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  features: string[];
  description: string;
  /** Ilustrações locais (SVG) que compõem a galeria. `hue` varia as cores. */
  gallery: { scene: SceneKind; caption: string }[];
  hue: number;
}

export const CITY = 'Nova Aurora';

export const TYPE_LABELS: Record<PropertyType, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  sobrado: 'Sobrado',
  cobertura: 'Cobertura',
  studio: 'Studio',
  comercial: 'Sala comercial',
};

export const PURPOSE_LABELS: Record<Purpose, string> = { venda: 'Venda', aluguel: 'Aluguel' };

/* ------------------------------------------------------------ inglês
 * Textos de exibição em inglês. Códigos, finalidades, tipos, bairros e
 * parâmetros da URL são identificadores e não mudam. Bairros e a cidade
 * (Nova Aurora) são nomes próprios fictícios e ficam iguais.
 */
export type PiLocale = 'pt' | 'en';

const TYPE_LABELS_EN: Record<PropertyType, string> = {
  apartamento: 'Apartment',
  casa: 'House',
  sobrado: 'Townhouse',
  cobertura: 'Penthouse',
  studio: 'Studio',
  comercial: 'Commercial unit',
};
const PURPOSE_LABELS_EN: Record<Purpose, string> = { venda: 'For sale', aluguel: 'For rent' };

const FEATURE_EN: Record<string, string> = {
  '3 suítes': '3 en-suite bedrooms', Academia: 'Gym', 'Aceita pets': 'Pets allowed', Acessibilidade: 'Accessible', 'Ar-condicionado': 'Air conditioning',
  Churrasqueira: 'Barbecue grill', 'Condomínio fechado': 'Gated community', Edícula: 'Guest house', Elevador: 'Elevator', Escritório: 'Home office',
  Mobiliado: 'Furnished', Piscina: 'Pool', 'Portaria 24h': '24-hour doorman', Quintal: 'Backyard', Suíte: 'En-suite bedroom', Terraço: 'Terrace',
  Varanda: 'Balcony', Vitrine: 'Shop window',
};

const CAPTION_EN: Record<string, string> = {
  'Ambiente integrado': 'Open-plan space', Banheiro: 'Bathroom', 'Banheiro acessível': 'Accessible bathroom', Copa: 'Kitchenette', Cozinha: 'Kitchen',
  'Cozinha aberta': 'Open kitchen', 'Cozinha americana': 'Open-plan kitchen', 'Cozinha equipada': 'Equipped kitchen', Fachada: 'Front view',
  'Fachada com vitrine': 'Front with shop window', 'Fachada do condomínio': 'Community entrance', 'Fachada do edifício': 'Building front',
  'Fachada do prédio': 'Building front', 'Living com pé-direito duplo': 'Double-height living room', Piscina: 'Pool', 'Piscina do condomínio': 'Community pool',
  Quarto: 'Bedroom', 'Quarto principal': 'Main bedroom', Quintal: 'Backyard', 'Quintal com churrasqueira': 'Backyard with barbecue grill',
  'Quintal e edícula': 'Backyard and guest house', Sala: 'Living room', 'Sala com acesso à varanda': 'Living room opening to the balcony',
  'Sala de estar': 'Living room', 'Sala de estar integrada': 'Open-plan living room', 'Sala e varanda gourmet': 'Living room and covered balcony',
  'Salão principal': 'Main hall', Suíte: 'En-suite bedroom', 'Suíte com varanda': 'En-suite bedroom with balcony', 'Suíte principal': 'Main en-suite bedroom',
  'Terraço com piscina': 'Terrace with pool',
};

const PROPERTY_EN: Record<string, { title: string; description: string }> = {
  'PI-101': { title: 'House with backyard', description: 'Single-story house on a quiet street, with a large living room open to the kitchen, an en-suite bedroom with wardrobes and a lawn backyard with a barbecue grill. Covered parking for two cars and a separate laundry area.' },
  'PI-102': { title: '2-bedroom apartment', description: 'Sixth-floor apartment a short walk from the shops downtown. Two bedrooms, a balcony overlooking the square and a kitchen with built-in cabinets. Building with an elevator and a 24-hour doorman.' },
  'PI-103': { title: 'New townhouse', description: 'Newly built townhouse with three en-suite bedrooms upstairs, a powder room and a double-height living room. Covered balcony with a barbecue grill and parking for two cars.' },
  'PI-104': { title: 'Apartment with covered balcony', description: 'Two-bedroom apartment, one en-suite, with a glassed-in covered balcony and a view of the valley. Building with a gym, party room and elevator.' },
  'PI-105': { title: 'House with guest house', description: 'Three-bedroom house with a separate guest house at the back, ideal as an office or for visitors. Backyard with fruit trees and parking for two cars. Pets allowed.' },
  'PI-106': { title: 'Duplex penthouse with pool', description: 'Duplex penthouse with four bedrooms, two en-suite, and a terrace with a private pool and outdoor kitchen. Three parking spaces and an open view of the park.' },
  'PI-107': { title: 'Furnished studio', description: 'Compact furnished studio with a bed, wardrobes, an equipped kitchen and a study area. New building with a 24-hour doorman and shared laundry room.' },
  'PI-108': { title: 'Compact apartment to invest in', description: 'Well-located one-bedroom apartment, close to the university and shops. A good option to live alone or to rent out.' },
  'PI-109': { title: '3-bedroom apartment with full amenities', description: 'Spacious apartment with three bedrooms, one en-suite, and two parking spaces. Resort-style building with a pool, gym, playground and sports court. Pets allowed.' },
  'PI-110': { title: 'House in a gated community', description: 'Four-bedroom house in a gated community with a 24-hour doorman. Home office on the ground floor, a pool in the backyard and parking for three cars.' },
  'PI-111': { title: 'Ground-floor commercial unit', description: 'Ground-floor commercial unit with a street-facing shop window, accessible flooring, a bathroom and a kitchenette. Suitable for a clinic, office or small shop.' },
  'PI-112': { title: 'Townhouse with home office', description: 'Townhouse with three bedrooms, one en-suite with a balcony, and a home office with its own entrance. Backyard at the back and parking for two cars.' },
};

export const typeLabels = (locale: PiLocale = 'pt') => (locale === 'en' ? TYPE_LABELS_EN : TYPE_LABELS);
export const purposeLabels = (locale: PiLocale = 'pt') => (locale === 'en' ? PURPOSE_LABELS_EN : PURPOSE_LABELS);

/** Imóvel com os textos do idioma pedido (código, preços e regras não mudam). */
export function localizeProperty(p: Property, locale: PiLocale = 'pt'): Property {
  if (locale === 'pt') return p;
  const t = PROPERTY_EN[p.id];
  return {
    ...p,
    title: t?.title ?? p.title,
    description: t?.description ?? p.description,
    features: p.features.map((f) => FEATURE_EN[f] ?? f),
    gallery: p.gallery.map((g) => ({ ...g, caption: CAPTION_EN[g.caption] ?? g.caption })),
  };
}

export const properties: Property[] = [
  {
    id: 'PI-101', title: 'Casa com quintal', purpose: 'venda', type: 'casa', neighborhood: 'Jardim das Flores',
    price: 680000, condo: 0, iptu: 190, bedrooms: 3, bathrooms: 2, parking: 2, area: 160, hue: 0,
    features: ['Quintal', 'Churrasqueira', 'Suíte', 'Aceita pets'],
    description: 'Casa térrea em rua tranquila, com sala ampla integrada à cozinha, suíte com armários e quintal gramado com churrasqueira. Garagem coberta para dois carros e área de serviço separada.',
    gallery: [
      { scene: 'fachada-casa', caption: 'Fachada' },
      { scene: 'sala', caption: 'Sala de estar integrada' },
      { scene: 'cozinha', caption: 'Cozinha' },
      { scene: 'externa', caption: 'Quintal com churrasqueira' },
    ],
  },
  {
    id: 'PI-102', title: 'Apartamento 2 quartos', purpose: 'aluguel', type: 'apartamento', neighborhood: 'Centro',
    price: 2400, condo: 520, iptu: 85, bedrooms: 2, bathrooms: 1, parking: 1, area: 64, hue: 1,
    features: ['Elevador', 'Portaria 24h', 'Varanda'],
    description: 'Apartamento no 6º andar, a poucos passos do comércio do Centro. Dois quartos, varanda com vista para a praça e cozinha com armários planejados. Prédio com elevador e portaria 24 horas.',
    gallery: [
      { scene: 'fachada-predio', caption: 'Fachada do prédio' },
      { scene: 'sala', caption: 'Sala com acesso à varanda' },
      { scene: 'quarto', caption: 'Quarto principal' },
      { scene: 'banheiro', caption: 'Banheiro' },
    ],
  },
  {
    id: 'PI-103', title: 'Sobrado novo', purpose: 'venda', type: 'sobrado', neighborhood: 'Vila Nova',
    price: 845000, condo: 0, iptu: 240, bedrooms: 3, bathrooms: 3, parking: 2, area: 190, hue: 2,
    features: ['3 suítes', 'Suíte', 'Varanda', 'Churrasqueira'],
    description: 'Sobrado recém-construído com três suítes no andar de cima, lavabo e living com pé-direito duplo. Varanda gourmet com churrasqueira e garagem para dois carros.',
    gallery: [
      { scene: 'fachada-sobrado', caption: 'Fachada' },
      { scene: 'sala', caption: 'Living com pé-direito duplo' },
      { scene: 'quarto', caption: 'Suíte' },
      { scene: 'cozinha', caption: 'Cozinha aberta' },
    ],
  },
  {
    id: 'PI-104', title: 'Apartamento com varanda gourmet', purpose: 'venda', type: 'apartamento', neighborhood: 'Alto da Colina',
    price: 520000, condo: 640, iptu: 150, bedrooms: 2, bathrooms: 2, parking: 1, area: 78, hue: 3,
    features: ['Varanda', 'Suíte', 'Elevador', 'Academia'],
    description: 'Apartamento de dois quartos, sendo uma suíte, com varanda gourmet envidraçada e vista para o vale. Condomínio com academia, salão de festas e elevador.',
    gallery: [
      { scene: 'fachada-predio', caption: 'Fachada do prédio' },
      { scene: 'sala', caption: 'Sala e varanda gourmet' },
      { scene: 'cozinha', caption: 'Cozinha' },
      { scene: 'quarto', caption: 'Suíte' },
    ],
  },
  {
    id: 'PI-105', title: 'Casa com edícula', purpose: 'aluguel', type: 'casa', neighborhood: 'Recanto Verde',
    price: 3200, condo: 0, iptu: 120, bedrooms: 3, bathrooms: 2, parking: 2, area: 140, hue: 4,
    features: ['Quintal', 'Edícula', 'Aceita pets'],
    description: 'Casa com três quartos e edícula independente nos fundos, ideal para escritório ou hóspedes. Quintal com árvores frutíferas e garagem para dois carros. Aceita animais de estimação.',
    gallery: [
      { scene: 'fachada-casa', caption: 'Fachada' },
      { scene: 'sala', caption: 'Sala' },
      { scene: 'externa', caption: 'Quintal e edícula' },
      { scene: 'quarto', caption: 'Quarto' },
    ],
  },
  {
    id: 'PI-106', title: 'Cobertura duplex com piscina', purpose: 'venda', type: 'cobertura', neighborhood: 'Parque das Águas',
    price: 1390000, condo: 1450, iptu: 410, bedrooms: 4, bathrooms: 4, parking: 3, area: 260, hue: 5,
    features: ['Piscina', 'Terraço', 'Suíte', 'Elevador', 'Portaria 24h'],
    description: 'Cobertura duplex com quatro quartos, sendo duas suítes, e terraço com piscina privativa e área gourmet. Três vagas de garagem e vista aberta para o parque.',
    gallery: [
      { scene: 'fachada-predio', caption: 'Fachada do edifício' },
      { scene: 'piscina', caption: 'Terraço com piscina' },
      { scene: 'sala', caption: 'Sala de estar' },
      { scene: 'quarto', caption: 'Suíte principal' },
    ],
  },
  {
    id: 'PI-107', title: 'Studio mobiliado', purpose: 'aluguel', type: 'studio', neighborhood: 'Centro',
    price: 1650, condo: 380, iptu: 45, bedrooms: 1, bathrooms: 1, parking: 0, area: 32, hue: 6,
    features: ['Mobiliado', 'Elevador', 'Portaria 24h'],
    description: 'Studio compacto e mobiliado, com cama, armários, cozinha equipada e área de estudo. Prédio novo com portaria 24 horas e lavanderia coletiva.',
    gallery: [
      { scene: 'fachada-predio', caption: 'Fachada do prédio' },
      { scene: 'quarto', caption: 'Ambiente integrado' },
      { scene: 'cozinha', caption: 'Cozinha equipada' },
      { scene: 'banheiro', caption: 'Banheiro' },
    ],
  },
  {
    id: 'PI-108', title: 'Apartamento compacto para investir', purpose: 'venda', type: 'apartamento', neighborhood: 'Centro',
    price: 285000, condo: 410, iptu: 70, bedrooms: 1, bathrooms: 1, parking: 0, area: 42, hue: 7,
    features: ['Elevador', 'Portaria 24h'],
    description: 'Apartamento de um quarto bem localizado, próximo à universidade e ao comércio. Boa opção para morar sozinho ou para renda com aluguel.',
    gallery: [
      { scene: 'fachada-predio', caption: 'Fachada do prédio' },
      { scene: 'sala', caption: 'Sala' },
      { scene: 'quarto', caption: 'Quarto' },
      { scene: 'cozinha', caption: 'Cozinha americana' },
    ],
  },
  {
    id: 'PI-109', title: 'Apartamento 3 quartos com lazer completo', purpose: 'aluguel', type: 'apartamento', neighborhood: 'Parque das Águas',
    price: 4300, condo: 890, iptu: 160, bedrooms: 3, bathrooms: 2, parking: 2, area: 96, hue: 8,
    features: ['Piscina', 'Academia', 'Suíte', 'Elevador', 'Aceita pets'],
    description: 'Apartamento amplo com três quartos, uma suíte e duas vagas. Condomínio-clube com piscina, academia, playground e quadra. Aceita animais de estimação.',
    gallery: [
      { scene: 'fachada-predio', caption: 'Fachada do condomínio' },
      { scene: 'piscina', caption: 'Piscina do condomínio' },
      { scene: 'sala', caption: 'Sala' },
      { scene: 'quarto', caption: 'Suíte' },
    ],
  },
  {
    id: 'PI-110', title: 'Casa em condomínio fechado', purpose: 'venda', type: 'casa', neighborhood: 'Recanto Verde',
    price: 980000, condo: 690, iptu: 310, bedrooms: 4, bathrooms: 3, parking: 3, area: 230, hue: 9,
    features: ['Condomínio fechado', 'Piscina', 'Suíte', 'Portaria 24h', 'Escritório'],
    description: 'Casa de quatro quartos em condomínio fechado com portaria 24 horas. Escritório no térreo, piscina no quintal e garagem para três carros.',
    gallery: [
      { scene: 'fachada-casa', caption: 'Fachada' },
      { scene: 'piscina', caption: 'Piscina' },
      { scene: 'sala', caption: 'Sala de estar' },
      { scene: 'cozinha', caption: 'Cozinha' },
    ],
  },
  {
    id: 'PI-111', title: 'Sala comercial no térreo', purpose: 'aluguel', type: 'comercial', neighborhood: 'Centro',
    price: 2900, condo: 450, iptu: 130, bedrooms: 0, bathrooms: 1, parking: 1, area: 55, hue: 10,
    features: ['Vitrine', 'Acessibilidade', 'Ar-condicionado'],
    description: 'Sala comercial no térreo com vitrine para a rua, piso acessível, banheiro e copa. Indicada para consultório, escritório ou pequena loja.',
    gallery: [
      { scene: 'fachada-comercial', caption: 'Fachada com vitrine' },
      { scene: 'sala', caption: 'Salão principal' },
      { scene: 'cozinha', caption: 'Copa' },
      { scene: 'banheiro', caption: 'Banheiro acessível' },
    ],
  },
  {
    id: 'PI-112', title: 'Sobrado com escritório', purpose: 'aluguel', type: 'sobrado', neighborhood: 'Alto da Colina',
    price: 3800, condo: 0, iptu: 180, bedrooms: 3, bathrooms: 3, parking: 2, area: 175, hue: 11,
    features: ['Escritório', 'Suíte', 'Varanda', 'Quintal'],
    description: 'Sobrado com três quartos, sendo uma suíte com varanda, e escritório com entrada independente. Quintal nos fundos e garagem para dois carros.',
    gallery: [
      { scene: 'fachada-sobrado', caption: 'Fachada' },
      { scene: 'sala', caption: 'Sala' },
      { scene: 'quarto', caption: 'Suíte com varanda' },
      { scene: 'externa', caption: 'Quintal' },
    ],
  },
];

export const NEIGHBORHOODS = Array.from(new Set(properties.map((p) => p.neighborhood))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
export const TYPES = Object.keys(TYPE_LABELS) as PropertyType[];

export function getProperty(id: string | undefined) {
  if (!id) return undefined;
  return properties.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

/* ------------------------------------------------------------ faixas de preço */

export interface PriceRange {
  value: string;
  label: string;
  min: number;
  /** Exclusivo; `Infinity` para a última faixa. */
  max: number;
}

/** Faixas próprias de cada finalidade: valores de venda e de aluguel nunca se misturam. */
export const PRICE_RANGES: Record<Purpose, PriceRange[]> = {
  venda: [
    { value: 'v1', label: 'Até R$ 400 mil', min: 0, max: 400_000 },
    { value: 'v2', label: 'R$ 400 mil a R$ 700 mil', min: 400_000, max: 700_000 },
    { value: 'v3', label: 'R$ 700 mil a R$ 1 milhão', min: 700_000, max: 1_000_000 },
    { value: 'v4', label: 'Acima de R$ 1 milhão', min: 1_000_000, max: Infinity },
  ],
  aluguel: [
    { value: 'a1', label: 'Até R$ 2.000/mês', min: 0, max: 2_000 },
    { value: 'a2', label: 'R$ 2.000 a R$ 3.000/mês', min: 2_000, max: 3_000 },
    { value: 'a3', label: 'R$ 3.000 a R$ 4.000/mês', min: 3_000, max: 4_000 },
    { value: 'a4', label: 'Acima de R$ 4.000/mês', min: 4_000, max: Infinity },
  ],
};

export function findRange(purpose: Purpose | '', value: string): PriceRange | undefined {
  if (!purpose || !value) return undefined;
  return PRICE_RANGES[purpose].find((r) => r.value === value);
}

/* ------------------------------------------------------------ filtros */

export interface Filters {
  q: string;
  purpose: Purpose | '';
  type: PropertyType | '';
  neighborhood: string;
  price: string;
  bedrooms: number; // mínimo; 0 = qualquer
}

export const EMPTY_FILTERS: Filters = { q: '', purpose: '', type: '', neighborhood: '', price: '', bedrooms: 0 };

export const BEDROOM_OPTIONS = [1, 2, 3, 4];

const normalize = (value: string) =>
  value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/** Texto pesquisável no idioma exibido: nome, código, tipo, bairro, cidade e características. */
function haystack(p: Property, locale: PiLocale) {
  const shown = localizeProperty(p, locale);
  return normalize([shown.title, p.id, typeLabels(locale)[p.type], p.neighborhood, CITY, ...shown.features].join(' '));
}

/**
 * Cada palavra da busca precisa aparecer no imóvel (busca "E"),
 * então "casa piscina" encontra apenas casas com piscina.
 */
export function matchesSearch(p: Property, q: string, locale: PiLocale = 'pt') {
  const words = normalize(q).split(' ').filter(Boolean);
  if (!words.length) return true;
  const text = haystack(p, locale);
  return words.every((w) => text.includes(w));
}

export function filterProperties(list: Property[], f: Filters, locale: PiLocale = 'pt'): Property[] {
  const range = findRange(f.purpose, f.price);
  return list.filter(
    (p) =>
      matchesSearch(p, f.q, locale) &&
      (!f.purpose || p.purpose === f.purpose) &&
      (!f.type || p.type === f.type) &&
      (!f.neighborhood || p.neighborhood === f.neighborhood) &&
      (!range || (p.price >= range.min && p.price < range.max)) &&
      (!f.bedrooms || p.bedrooms >= f.bedrooms),
  );
}

export function activeFilterCount(f: Filters) {
  return [f.q.trim(), f.purpose, f.type, f.neighborhood, findRange(f.purpose, f.price) ? f.price : '', f.bedrooms ? 'x' : ''].filter(Boolean).length;
}

/* ------------------------------------------------------------ filtros na URL */

/**
 * Os filtros ficam no endereço (?finalidade=venda&tipo=casa...), então
 * atualizar a página, voltar do detalhe ou compartilhar o link mantém a busca.
 * Valores inválidos são ignorados, e uma faixa de preço só vale com a
 * finalidade correspondente.
 */
export function filtersFromParams(params: URLSearchParams): Filters {
  const purpose = params.get('finalidade');
  const type = params.get('tipo');
  const neighborhood = params.get('bairro') ?? '';
  const bedrooms = Number(params.get('quartos'));
  const validPurpose: Filters['purpose'] = purpose === 'venda' || purpose === 'aluguel' ? purpose : '';
  const price = params.get('preco') ?? '';
  return {
    q: (params.get('q') ?? '').slice(0, 80),
    purpose: validPurpose,
    type: TYPES.includes(type as PropertyType) ? (type as PropertyType) : '',
    neighborhood: NEIGHBORHOODS.includes(neighborhood) ? neighborhood : '',
    price: findRange(validPurpose, price) ? price : '',
    bedrooms: BEDROOM_OPTIONS.includes(bedrooms) ? bedrooms : 0,
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set('q', f.q);
  if (f.purpose) params.set('finalidade', f.purpose);
  if (f.type) params.set('tipo', f.type);
  if (f.neighborhood) params.set('bairro', f.neighborhood);
  if (findRange(f.purpose, f.price)) params.set('preco', f.price);
  if (f.bedrooms) params.set('quartos', String(f.bedrooms));
  return params;
}

/* ------------------------------------------------------------ formatação */

/** Valores sempre em reais (imobiliária fictícia brasileira); o formato acompanha o idioma. */
const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brl0En = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function formatPrice(p: Pick<Property, 'price' | 'purpose'>, locale: PiLocale = 'pt') {
  const f = locale === 'en' ? brl0En : brl0;
  return p.purpose === 'aluguel' ? `${f.format(p.price)}/${locale === 'en' ? 'month' : 'mês'}` : f.format(p.price);
}

export const formatMoney = (value: number, locale: PiLocale = 'pt') => (locale === 'en' ? brl0En : brl0).format(value);

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

const UNITS = {
  pt: { bed: ['quarto', 'quartos'], bath: ['banheiro', 'banheiros'] },
  en: { bed: ['bedroom', 'bedrooms'], bath: ['bathroom', 'bathrooms'] },
} as const;

/** Resumo curto: "3 quartos · 2 banheiros · 160 m²" */
export function summary(p: Property, locale: PiLocale = 'pt') {
  const u = UNITS[locale];
  const parts = [p.bedrooms ? plural(p.bedrooms, u.bed[0], u.bed[1]) : null, plural(p.bathrooms, u.bath[0], u.bath[1]), `${p.area} m²`];
  return parts.filter(Boolean).join(' · ');
}

/** Rótulo de uma faixa de preço no idioma pedido (os valores das faixas não mudam). */
export function rangeLabel(r: PriceRange, purpose: Purpose, locale: PiLocale = 'pt') {
  if (locale === 'pt') return r.label;
  const k = (v: number) => (v >= 1_000_000 ? `R$${v / 1_000_000} million` : v >= 1000 && purpose === 'venda' ? `R$${v / 1000}k` : `R$${v.toLocaleString('en-US')}`);
  const per = purpose === 'aluguel' ? '/month' : '';
  if (r.min === 0) return `Up to ${k(r.max)}${per}`;
  if (r.max === Infinity) return `Over ${k(r.min)}${per}`;
  return `${k(r.min)} to ${k(r.max)}${per}`;
}

/** Valor do m² (somente venda), arredondado. */
export function pricePerSquareMeter(p: Property) {
  return p.purpose === 'venda' ? Math.round(p.price / p.area) : null;
}

/** Custo mensal estimado no aluguel: aluguel + condomínio + IPTU. */
export function monthlyTotal(p: Property) {
  return p.purpose === 'aluguel' ? p.price + p.condo + p.iptu : null;
}

/* ------------------------------------------------------------ consulta */

export type Interest = 'visita' | 'informacoes' | 'proposta';
export const INTEREST_LABELS: Record<Interest, string> = {
  visita: 'Agendar uma visita',
  informacoes: 'Receber mais informações',
  proposta: 'Fazer uma proposta',
};
export const interestLabels = (locale: PiLocale = 'pt'): Record<Interest, string> =>
  locale === 'en' ? { visita: 'Schedule a visit', informacoes: 'Get more information', proposta: 'Make an offer' } : INTEREST_LABELS;

/** Mensagem de exemplo que o visitante pode copiar. Não é enviada a ninguém. */
export function consultMessage(p: Property, name: string, interest: Interest, locale: PiLocale = 'pt') {
  const shown = localizeProperty(p, locale);
  if (locale === 'en') {
    const wish: Record<Interest, string> = {
      visita: 'I would like to schedule a visit.',
      informacoes: 'I would like more information.',
      proposta: 'I would like to discuss an offer.',
    };
    return [
      name.trim() ? `Hello! My name is ${name.trim()}.` : 'Hello!',
      `I am interested in property ${p.id}: ${shown.title}, in ${p.neighborhood} (${CITY}).`,
      `${purposeLabels('en')[p.purpose]} at ${formatPrice(p, 'en')}. ${summary(p, 'en')}.`,
      wish[interest],
    ].join('\n');
  }
  const greeting = name.trim() ? `Olá! Meu nome é ${name.trim()}.` : 'Olá!';
  const wish: Record<Interest, string> = {
    visita: 'Gostaria de agendar uma visita.',
    informacoes: 'Gostaria de receber mais informações.',
    proposta: 'Gostaria de conversar sobre uma proposta.',
  };
  return [
    greeting,
    `Tenho interesse no imóvel ${p.id}: ${p.title}, em ${p.neighborhood} (${CITY}).`,
    `${PURPOSE_LABELS[p.purpose]} por ${formatPrice(p)}. ${summary(p)}.`,
    wish[interest],
  ].join('\n');
}
