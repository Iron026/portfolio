/**
 * Páginas estáticas de SEO geradas no build.
 *
 * O site é uma aplicação React (SPA): o HTML inicial é o mesmo para todas as
 * rotas. O Google executa JavaScript, mas os robôs de WhatsApp, LinkedIn e
 * Facebook não — eles leriam sempre o título e a imagem da página inicial.
 *
 * Por isso, depois do build, criamos uma cópia do index.html para cada
 * estudo de caso (dist/projetos/<slug>/index.html) com título, descrição,
 * endereço canônico e imagem de compartilhamento próprios. A aplicação React
 * continua a mesma; só os metadados mudam. Também geramos sitemap.xml e
 * robots.txt com o endereço do sitemap.
 */

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  image: string;
}

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setAttr(html: string, pattern: RegExp, value: string) {
  return html.replace(pattern, (_m, before: string, after: string) => `${before}${esc(value)}${after}`);
}

/** Troca título, descrição, canonical e Open Graph/Twitter de um index.html já gerado. */
export function withMeta(html: string, baseUrl: string, page: PageMeta) {
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
  ];
  for (const [re, value] of metas) out = setAttr(out, re, value);
  out = out.replace(/(<meta property="og:type" content=")[^"]*(")/, '$1article$2');
  return out;
}

export function sitemap(baseUrl: string, paths: string[], lastmod: string) {
  const urls = paths
    .map((p) => `  <url>\n    <loc>${esc(baseUrl + p)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robots(baseUrl: string) {
  return `User-agent: *\nAllow: /\n${baseUrl ? `\nSitemap: ${baseUrl}/sitemap.xml\n` : ''}`;
}
