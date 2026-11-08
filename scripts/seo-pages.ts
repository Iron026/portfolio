/**
 * Páginas estáticas de SEO geradas no build.
 *
 * O site é uma aplicação React (SPA): o HTML inicial é o mesmo para todas as
 * rotas. O Google executa JavaScript, mas os robôs de WhatsApp, LinkedIn e
 * Facebook não — eles leriam sempre o título e a imagem da página inicial.
 *
 * Por isso, depois do build, criamos uma cópia do index.html para cada
 * página pública nos dois idiomas (início, estudos de caso e demonstrações,
 * em português e em /en/) com idioma, título, descrição, endereço canônico,
 * hreflang e imagem de compartilhamento próprios. A aplicação React
 * continua a mesma; só os metadados mudam. Também geramos sitemap.xml e
 * robots.txt com o endereço do sitemap.
 */

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  image: string;
  /** Idioma da página e endereços equivalentes nos dois idiomas (hreflang). */
  lang?: 'pt' | 'en';
  alternates?: { pt: string; en: string };
  /** Tipo Open Graph (padrão: article). */
  type?: 'website' | 'article';
}

const HTML_LANG = { pt: 'pt-BR', en: 'en' } as const;
const OG_LOCALE = { pt: 'pt_BR', en: 'en_US' } as const;
const NOSCRIPT = {
  pt: 'Este site precisa de JavaScript ativado para funcionar.',
  en: 'This site needs JavaScript enabled to work.',
} as const;

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setAttr(html: string, pattern: RegExp, value: string) {
  return html.replace(pattern, (_m, before: string, after: string) => `${before}${esc(value)}${after}`);
}

/** Troca idioma, título, descrição, canonical, hreflang e Open Graph/Twitter de um index.html já gerado. */
export function withMeta(html: string, baseUrl: string, page: PageMeta) {
  const lang = page.lang ?? 'pt';
  const url = `${baseUrl}${page.path}`;
  const image = `${baseUrl}${page.image}`;
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  const metas: Array<[RegExp, string]> = [
    [/(<meta name="description" content=")[^"]*(")/, page.description],
    [/(<link rel="canonical" href=")[^"]*(")/, url],
    [/(<meta property="og:url" content=")[^"]*(")/, url],
    [/(<meta property="og:title" content=")[^"]*(")/, page.title],
    [/(<meta property="og:description" content=")[^"]*(")/, page.description],
    [/(<meta property="og:image" content=")[^"]*(")/, image],
    [/(<meta name="twitter:title" content=")[^"]*(")/, page.title],
    [/(<meta name="twitter:description" content=")[^"]*(")/, page.description],
    [/(<meta name="twitter:image" content=")[^"]*(")/, image],
    [/(<meta property="og:image:alt" content=")[^"]*(")/, page.title],
    [/(<meta property="og:locale" content=")[^"]*(")/, OG_LOCALE[lang]],
  ];
  for (const [re, value] of metas) out = setAttr(out, re, value);
  out = out.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${page.type ?? 'article'}$2`);
  out = out.replace(/<html lang="[^"]*">/, `<html lang="${HTML_LANG[lang]}">`);
  out = out.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${NOSCRIPT[lang]}</noscript>`);
  // Remove alternativas anteriores (o index.html de base pode já tê-las) e grava as desta página.
  out = out.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, '').replace(/\s*<meta property="og:locale:alternate"[^>]*>/g, '');
  if (page.alternates && baseUrl) {
    const other = lang === 'pt' ? 'en' : 'pt';
    const links = [
      `<link rel="alternate" hreflang="pt-BR" href="${esc(baseUrl + page.alternates.pt)}" />`,
      `<link rel="alternate" hreflang="en" href="${esc(baseUrl + page.alternates.en)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${esc(baseUrl + page.alternates.pt)}" />`,
      `<meta property="og:locale:alternate" content="${OG_LOCALE[other]}" />`,
    ];
    out = out.replace(/(\s*)(<link rel="canonical"[^>]*>)/, (_m, ws: string, tag: string) => `${ws}${tag}${links.map((l) => ws + l).join('')}`);
  }
  return out;
}

/** Sitemap com as duas versões de cada página ligadas por hreflang. */
export function sitemap(baseUrl: string, pages: Array<{ pt: string; en: string }>, lastmod: string) {
  const alt = (p: { pt: string; en: string }) =>
    [
      `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${esc(baseUrl + p.pt)}" />`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${esc(baseUrl + p.en)}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(baseUrl + p.pt)}" />`,
    ].join('\n');
  const urls = pages
    .flatMap((p) => [p.pt, p.en].map((loc) => `  <url>\n    <loc>${esc(baseUrl + loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alt(p)}\n  </url>`))
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function robots(baseUrl: string) {
  return `User-agent: *\nAllow: /\n${baseUrl ? `\nSitemap: ${baseUrl}/sitemap.xml\n` : ''}`;
}
