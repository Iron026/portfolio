import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { site } from '@/config/site';

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

/**
 * Metadados da página atual: título da aba, descrição, endereço canônico e
 * Open Graph/Twitter (usados ao compartilhar o link).
 * `image` é um caminho dentro de public/ (ex.: '/projetos/gestao360/og.jpg').
 *
 * Observação: robôs de redes sociais não executam JavaScript. Para eles,
 * o build gera um HTML próprio por estudo de caso (ver vite.config.ts).
 */
export function useDocumentTitle(title?: string, description?: string, image?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.headline}`;
    const desc = description ?? site.description;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc);
    if (baseUrl) {
      const url = `${baseUrl}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
      const img = `${baseUrl}${image ?? '/og-image.png'}`;
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = url;
      setMeta('meta[property="og:url"]', 'property', 'og:url', url);
      setMeta('meta[property="og:image"]', 'property', 'og:image', img);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', img);
    }
  }, [title, description, image, pathname]);
}
