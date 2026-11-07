import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { site } from './src/config/site';
import { projects } from './src/data/projects';
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
 * Depois do build: HTML com metadados próprios para cada estudo de caso,
 * sitemap.xml e robots.txt. Detalhes em scripts/seo-pages.ts.
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
      for (const p of projects) {
        const html = withMeta(index, url, {
          path: `/projetos/${p.slug}`,
          title: `${p.name}: estudo de caso | ${site.name}`,
          description: `${p.summary} Projeto demonstrativo autoral da ${site.name}.`,
          image: p.screens.length ? `/projetos/${p.slug}/og.jpg` : '/og-image.png',
        });
        mkdirSync(join(outDir, 'projetos', p.slug), { recursive: true });
        writeFileSync(join(outDir, 'projetos', p.slug, 'index.html'), html);
      }
      // Demonstrações internas: sem este HTML, /demos/<nome> receberia o título e o
      // endereço canônico da página inicial (que contradiz o sitemap e as prévias de link).
      for (const p of projects) {
        if (p.demo.status !== 'disponivel' || !p.demo.url.startsWith('/')) continue;
        const html = withMeta(index, url, {
          path: p.demo.url,
          title: `${p.name}: demonstração interativa | ${site.name}`,
          description: `Teste a demonstração de ${p.name} (${p.category.toLowerCase()}), com empresa e dados fictícios. Projeto autoral da ${site.name}.`,
          image: p.screens.length ? `/projetos/${p.slug}/og.jpg` : '/og-image.png',
        });
        mkdirSync(join(outDir, p.demo.url.slice(1)), { recursive: true });
        writeFileSync(join(outDir, p.demo.url.slice(1), 'index.html'), html);
      }
      if (url) {
        const paths = ['/', ...projects.map((p) => `/projetos/${p.slug}`), ...projects.filter((p) => p.demo.status === 'disponivel' && p.demo.url.startsWith('/')).map((p) => p.demo.url)];
        writeFileSync(join(outDir, 'sitemap.xml'), sitemap(url, paths, new Date().toISOString().slice(0, 10)));
      }
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
