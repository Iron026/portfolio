/**
 * IDIOMAS DO SITE
 * ------------------------------------------------------------------
 * Português é o idioma principal e fica na raiz (/, /projetos/..., /demos/...).
 * Inglês fica sob /en (/en/, /en/projects/..., /en/demos/...).
 *
 * Os endereços são escritos no código sempre na forma portuguesa
 * ("caminho canônico") e convertidos com `localizePath`. Só os segmentos
 * da tabela SEGMENTS mudam de idioma; slugs de projetos, códigos de
 * imóveis e produtos, nomes de demonstrações e parâmetros de busca são
 * identificadores e continuam iguais nos dois idiomas.
 *
 * Não há redirecionamento automático pelo idioma do navegador: o visitante
 * escolhe no seletor PT/EN, e o endereço guarda a escolha.
 */
export type Locale = 'pt' | 'en';
export const LOCALES: Locale[] = ['pt', 'en'];
export const DEFAULT_LOCALE: Locale = 'pt';

/** Valor de <html lang> e de hreflang. */
export const HTML_LANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };
/** Valor de og:locale. */
export const OG_LOCALE: Record<Locale, string> = { pt: 'pt_BR', en: 'en_US' };
/** Formatação de números, datas e moedas (as demonstrações continuam em reais). */
export const INTL_LOCALE: Record<Locale, string> = { pt: 'pt-BR', en: 'en-US' };

/** Segmentos de rota traduzidos: português → inglês. */
const SEGMENTS: Record<string, string> = {
  projetos: 'projects',
  produto: 'product',
  carrinho: 'cart',
};
const SEGMENTS_BACK = Object.fromEntries(Object.entries(SEGMENTS).map(([pt, en]) => [en, pt]));

/** Prefixo de cada idioma na URL. */
export const PREFIX: Record<Locale, string> = { pt: '', en: '/en' };

export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt';
}

/** Remove o prefixo de idioma e devolve o caminho na forma portuguesa (canônica). */
export function canonicalPath(pathname: string): string {
  const locale = localeFromPath(pathname);
  const rest = locale === 'en' ? pathname.slice(3) || '/' : pathname;
  if (locale === 'pt') return rest;
  return rest
    .split('/')
    .map((seg) => SEGMENTS_BACK[seg] ?? seg)
    .join('/');
}

/**
 * Converte um caminho canônico (português) para o idioma pedido.
 * A página inicial em inglês é "/en/".
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === 'pt') return path;
  if (path === '/' || path === '') return '/en/';
  return (
    PREFIX.en +
    path
      .split('/')
      .map((seg) => SEGMENTS[seg] ?? seg)
      .join('/')
  );
}

/** Mesmo endereço em outro idioma (usado pelo seletor PT/EN e pelo hreflang). */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localizePath(canonicalPath(pathname), target);
}
