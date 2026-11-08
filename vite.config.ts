import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { site } from './src/config/site';
import { siteEn } from './src/config/site.en';
import { englishMedia, getProjects, type Project } from './src/data/projects';
import { localizePath, type Locale } from './src/i18n/locale';
import { robots, sitemap, withMeta } from './scripts/seo-pages';

/**
 * Preenche os metadados do index.html (título, descrição, Open Graph)
 * a partir de src/config/site.ts — assim o nome e a descrição ficam
 * em um único lugar.
 */
function siteMetaPlugin(): Plugin {
  const url = site.url.replace(/\/$/, '');
  const values: Record<string, string> = {
    SITE_NAME: site.name,
    SITE_TITLE: `${site.name} | ${site.headline}`,
    SITE_DESCRIPTION: site.description,
    SITE_URL: url,
    OG_IMAGE: url ? `${url}/og-image.png` : '/og-image.png',
  };
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      let out = html.replace(/%(\w+)%/g, (match, key: string) =>
        key in values ? escapeHtml(values[key]) : match,
      );
      // Sem URL configurada, remove a tag canonical para não publicar um endereço inválido.
      if (!url) out = out.replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, '');
      return out;
    },
  };
}

/**
 * Depois do build: HTML com idioma e metadados próprios para o início, cada estudo
 * de caso e cada demonstração, em português e em inglês (/en/), além de
 * sitemap.xml (com hreflang) e robots.txt. Detalhes em scripts/seo-pages.ts.
 */
function seoPagesPlugin(): Plugin {
  const url = site.url.replace(/\/$/, '');
  let outDir = 'dist';
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const index = readFileSync(join(outDir, 'index.html'), 'utf8');
      const write = (path: string, html: string) => {
        mkdirSync(dirname(join(outDir, path)), { recursive: true });
        writeFileSync(join(outDir, path), html);
      };
      // Imagem de compartilhamento: a versão em inglês, quando existir, mostra a demonstração em inglês.
      const ogImage = (p: Project, locale: Locale) => {
        if (!p.screens.length) return '/og-image.png';
        const pt = `/projetos/${p.slug}/og.jpg`;
        const en = englishMedia(pt);
        return locale === 'en' && existsSync(join(outDir, en.slice(1))) ? en : pt;
      };
      const TEXT = {
        pt: {
          site,
          caseTitle: (name: string) => `${name}: estudo de caso | ${site.name}`,
          caseDescription: (p: Project) => `${p.teaser} Projeto demonstrativo da ${site.name}.`,
          demoTitle: (name: string) => `${name}: demonstração interativa | ${site.name}`,
          demoDescription: (p: Project) => `Teste a demonstração de ${p.name} (${p.category.toLowerCase()}), com empresa e dados fictícios. Projeto autoral da ${site.name}.`,
        },
        en: {
          site: { ...site, ...siteEn },
          caseTitle: (name: string) => `${name}: case study | ${site.name}`,
          caseDescription: (p: Project) => `${p.teaser} A demo project by ${site.name}.`,
          demoTitle: (name: string) => `${name}: interactive demo | ${site.name}`,
          demoDescription: (p: Project) => `Try the ${p.name} demo (${p.category.toLowerCase()}), with a fictional business and data. An original project by ${site.name}.`,
        },
      };
      const pages: Array<{ pt: string; en: string }> = [];

      for (const locale of ['pt', 'en'] as const) {
        const t = TEXT[locale];
        // Início. Em português é o próprio index.html (também usado como resposta das rotas do app).
        const home = { pt: '/', en: localizePath('/', 'en') };
        const homeHtml = withMeta(index, url, {
          path: home[locale],
          title: `${site.name} | ${t.site.headline}`,
          description: t.site.description,
          image: '/og-image.png',
          lang: locale,
          alternates: home,
          type: 'website',
        });
        write(locale === 'pt' ? 'index.html' : 'en/index.html', homeHtml);
        if (locale === 'pt') pages.push(home);

        for (const p of getProjects(locale)) {
          // O Netlify entrega pasta/index.html em /projetos/<slug>/ (o endereço sem barra recebe 301).
          // O canonical aponta para a URL final, que responde 200.
          const casePaths = { pt: `/projetos/${p.slug}/`, en: localizePath(`/projetos/${p.slug}/`, 'en') };
          write(`${casePaths[locale].slice(1)}index.html`, withMeta(index, url, {
            path: casePaths[locale],
            title: t.caseTitle(p.name),
            description: t.caseDescription(p),
            image: ogImage(p, locale),
            lang: locale,
            alternates: casePaths,
          }));
          if (locale === 'pt') pages.push(casePaths);

          // Demonstrações internas: sem este HTML, /demos/<nome> receberia o título e o
          // endereço canônico da página inicial (que contradiz o sitemap e as prévias de link).
          // Arquivo "demos/<nome>.html" (e não pasta/index.html): o Netlify o entrega em /demos/<nome>
          // com 200, sem redirecionar para a barra final; as rotas internas (/demos/imoveis/PI-101)
          // continuam caindo na regra do app em _redirects.
          if (p.demo.status !== 'disponivel' || !p.demo.url.startsWith('/')) continue;
          const demoPaths = { pt: p.demo.url, en: localizePath(p.demo.url, 'en') };
          write(`${demoPaths[locale].slice(1)}.html`, withMeta(index, url, {
            path: demoPaths[locale],
            title: t.demoTitle(p.name),
            description: t.demoDescription(p),
            image: ogImage(p, locale),
            lang: locale,
            alternates: demoPaths,
          }));
          if (locale === 'pt') pages.push(demoPaths);
        }
      }
      if (url) writeFileSync(join(outDir, 'sitemap.xml'), sitemap(url, pages, new Date().toISOString().slice(0, 10)));
      writeFileSync(join(outDir, 'robots.txt'), robots(url));
    },
  };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMetaPlugin(), seoPagesPlugin()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
