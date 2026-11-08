import { useLocation } from 'react-router-dom';
import { localeFromPath, localizePath, INTL_LOCALE, type Locale } from './locale';

/**
 * Idioma da página atual (lido do endereço) e um atalho para montar links
 * internos no mesmo idioma: `lp('/projetos/gestao360')`.
 */
export function useLocale() {
  const { pathname } = useLocation();
  const locale: Locale = localeFromPath(pathname);
  return {
    locale,
    intl: INTL_LOCALE[locale],
    lp: (path: string) => localizePath(path, locale),
  };
}

/**
 * Escolhe o texto do idioma atual em um dicionário { pt, en } definido junto do
 * componente ou da demonstração. O tipo garante que os dois idiomas existam.
 */
export function pick<T>(dict: Record<Locale, T>, locale: Locale): T {
  return dict[locale];
}
