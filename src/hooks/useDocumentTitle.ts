import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { site } from '@/config/site';
import { siteText } from '@/i18n/content';
import { HTML_LANG, LOCALES, OG_LOCALE, canonicalPath, localeFromPath, switchLocalePath } from '@/i18n/locale';

const baseUrl = site.url.replace(/\/$/, '');

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setLink(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/**
 * Endereço público de uma rota. Estudos de caso são entregues pelo Netlify com
 * barra final (pasta/index.html); as demais páginas, sem barra.
 */
export function publicUrl(pathname: string) {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  if (clean === '/en') return `${baseUrl}/en/`;
  const isCase = /^\/projetos\/[^/]+$/.test(canonicalPath(clean));
  return `${baseUrl}${isCase ? `${clean}/` : clean}`;
}

/**
 * Metadados da página atual: título da aba, descrição, endereço canônico,
 * versões em outros idiomas (hreflang) e Open Graph/Twitter.
 * `image` é um caminho dentro de public/ (ex.: '/projetos/gestao360/og.jpg').
 *
 * Observação: robôs de redes sociais não executam JavaScript. Para eles,
 * o build gera um HTML próprio por página e idioma (ver vite.config.ts).
 */
export function useDocumentTitle(title?: string, description?: string, image?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const locale = localeFromPath(pathname);
    const text = siteText(locale);
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${text.headline}`;
    const desc = description ?? text.description;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', OG_LOCALE[locale]);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc);
    if (baseUrl) {
      const url = publicUrl(pathname);
      const img = `${baseUrl}${image ?? '/og-image.png'}`;
      setLink('link[rel="canonical"]', { rel: 'canonical', href: url });
      for (const l of LOCALES) {
        setLink(`link[rel="alternate"][hreflang="${HTML_LANG[l]}"]`, { rel: 'alternate', hreflang: HTML_LANG[l], href: publicUrl(switchLocalePath(pathname, l)) });
      }
      setLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: publicUrl(switchLocalePath(pathname, 'pt')) });
      setMeta('meta[property="og:url"]', 'property', 'og:url', url);
      setMeta('meta[property="og:image"]', 'property', 'og:image', img);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', img);
    }
  }, [title, description, image, pathname]);
}
