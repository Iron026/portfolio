// Confere a pasta dist/ gerada pelo "npm run build" antes de publicar:
// páginas dos 5 estudos de caso com metadados, sitemap, robots, regras do Netlify,
// fontes WOFF2, todas as imagens referenciadas pelos projetos e nenhum arquivo
// local citado por HTML, CSS ou JavaScript que não exista na pasta.
// Uso: npm run build && npm run verify:dist   (ou: node tests/verificar-dist.mjs caminho/da/pasta)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(process.argv[2] || join(root, 'dist'));
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)); };
const read = (p) => readFileSync(join(dist, p), 'utf8');
const has = (p) => existsSync(join(dist, p)) && statSync(join(dist, p)).size > 0;

if (!existsSync(join(dist, 'index.html'))) { console.error(`Não encontrei ${dist}/index.html. Rode "npm run build" antes.`); process.exit(1); }

// Dados do próprio projeto (sem depender do TypeScript): slugs, URL do site e imagens
const projectsSrc = readFileSync(join(root, 'src/data/projects.ts'), 'utf8');
const siteSrc = readFileSync(join(root, 'src/config/site.ts'), 'utf8');
const slugs = [...projectsSrc.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const siteUrl = (siteSrc.match(/url: '(https?:\/\/[^']+)'/) || [])[1]?.replace(/\/$/, '');
// Capturas: cada { src, device } vira <src>-800/-1600.webp (computador) ou <src>-390/-780.webp (celular)
const images = [...projectsSrc.matchAll(/src: '(\/projetos\/[^']+)', device: '(desktop|mobile)'/g)]
  .flatMap(([, src, device]) => (device === 'mobile' ? [390, 780] : [800, 1600]).map((w) => `${src}-${w}.webp`));
const fonts = ['space-grotesk-latin-wght-v1.woff2', 'dm-sans-latin-wght-v1.woff2', 'azeret-mono-latin-wght-v1.woff2'];

ok(slugs.length === 5, `5 projetos em src/data/projects.ts (${slugs})`);
ok(!!siteUrl, `URL do site definida em src/config/site.ts (${siteUrl})`);

// Página inicial
const index = read('index.html');
ok(/<html lang="pt-BR">/.test(index), 'index.html em pt-BR');
ok(!/%[A-Z_]+%/.test(index), 'index.html sem marcadores %...% sobrando');
ok(index.includes(`<link rel="canonical" href="${siteUrl}/"`), 'index.html com canonical');
ok(/<meta property="og:image" content="https?:\/\/[^"]+og-image\.png"/.test(index), 'index.html com og:image absoluto');
ok(/<script type="module"[^>]+src="\/assets\/[^"]+\.js"/.test(index), 'index.html aponta para o JavaScript do build em /assets');
ok(!/fonts\.googleapis|fonts\.gstatic/.test(index), 'sem Google Fonts');
for (const f of fonts) ok(index.includes(`href="/fonts/${f}"`), `preload de ${f}`);

// CSS do build usa as fontes locais
const cssFile = (index.match(/href="(\/assets\/[^"]+\.css)"/) || [])[1];
ok(!!cssFile && has(cssFile), `CSS do build presente (${cssFile})`);
if (cssFile) {
  const css = read(cssFile);
  for (const f of fonts) ok(css.includes(`/fonts/${f}`), `@font-face de ${f} no CSS do build`);
  ok(/Space Grotesk/.test(css) && /DM Sans/.test(css) && /Azeret Mono/.test(css), 'famílias da marca no CSS');
  ok(!/Sora|Onest/.test(css), 'fontes antigas (Sora, Onest) fora do CSS');
  ok(/\.woff2/.test(css), 'fontes das demonstrações (@fontsource) empacotadas no CSS');
}
for (const f of fonts) ok(has(`fonts/${f}`), `arquivo fonts/${f}`);
ok(has('fonts/licencas/Space_Grotesk-OFL.txt') && has('fonts/licencas/DM_Sans-OFL.txt') && has('fonts/licencas/Azeret_Mono-OFL.txt'), 'licenças OFL das fontes');
ok(!has('fonts/sora-latin-wght-v1.woff2') && !has('fonts/onest-latin-wght-v1.woff2'), 'arquivos das fontes antigas fora do pacote');

// Estudos de caso: HTML próprio com título, descrição, canonical e imagem de compartilhamento
for (const s of slugs) {
  const f = `projetos/${s}/index.html`;
  ok(has(f), `${f} existe`);
  if (!has(f)) continue;
  const h = read(f);
  ok(/<title>[^<]+projeto em detalhes \| Alto Code<\/title>/.test(h), `${s}: título próprio`);
  // com barra final: é a URL que o Netlify entrega com 200 para pasta/index.html (sem barra recebe 301)
  ok(h.includes(`<link rel="canonical" href="${siteUrl}/projetos/${s}/"`), `${s}: canonical na URL final, com barra`);
  ok(h.includes(`content="${siteUrl}/projetos/${s}/og.jpg"`), `${s}: og:image do projeto`);
  ok(has(`projetos/${s}/og.jpg`), `${s}: og.jpg presente`);
}

// Demonstrações: HTML próprio, para o canonical e a prévia de link não apontarem para a página inicial
const demoUrls = [...projectsSrc.matchAll(/demo: \{ status: 'disponivel', url: '(\/demos\/[^']+)' \}/g)].map((m) => m[1]);
ok(demoUrls.length === 5, `5 demonstrações internas declaradas (${demoUrls})`);
for (const d of demoUrls) {
  // arquivo plano: o Netlify entrega demos/<nome>.html em /demos/<nome> com 200, sem redirecionar
  const f = `${d.slice(1)}.html`;
  ok(!has(`${d.slice(1)}/index.html`), `${d}: sem pasta/index.html (evita o 301 para a barra final)`);
  ok(has(f), `${f} existe`);
  if (!has(f)) continue;
  const h = read(f);
  ok(/<title>[^<]+demonstração interativa \| Alto Code<\/title>/.test(h), `${d}: título próprio`);
  ok(h.includes(`<link rel="canonical" href="${siteUrl}${d}"`), `${d}: canonical da própria demonstração`);
}

// O GitHub não faz parte da apresentação comercial: nenhuma menção ou link no conteúdo publicado
// (o código de bibliotecas pode citar github.com em comentários de licença; por isso só os textos do site)
{
  const texts = ['src/config/site.ts', 'src/data/projects.ts', 'src/data/services.ts', 'src/data/content.ts'].map((p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/^\s*(\/\/|\*|\/\*).*$/gm, '')).join('\n');
  ok(!/github/i.test(texts), 'textos e contatos do site sem menção ao GitHub');
  const htmls = readdirSync(new URL('../dist/', import.meta.url), { recursive: true }).filter((p) => String(p).endsWith('.html'));
  ok(htmls.every((p) => !/github/i.test(read(String(p)))), `páginas HTML do build sem menção ao GitHub (${htmls.length} arquivos)`);
}

// Prévias em vídeo (WebM e MP4) de cada projeto que declara `video`
const videos = [...projectsSrc.matchAll(/video: \{ src: '(\/projetos\/[^']+)'/g)].map((m) => m[1]);
ok(videos.length === 5, `prévias em vídeo declaradas (${videos.length})`);
for (const v of videos) for (const ext of ['webm', 'mp4']) ok(has(`${v.slice(1)}.${ext}`), `vídeo ${v}.${ext}`);

// Imagens referenciadas pelos projetos
ok(images.length >= 20, `imagens referenciadas encontradas (${images.length})`);
for (const img of images) ok(has(img.slice(1)), `imagem ${img}`);
for (const f of ['og-image.png', 'favicon.svg', 'apple-touch-icon.png']) ok(has(f), f);

// Sitemap e robots
const sitemap = has('sitemap.xml') ? read('sitemap.xml') : '';
ok(sitemap.includes(`<loc>${siteUrl}/</loc>`), 'sitemap com a página inicial');
for (const s of slugs) ok(sitemap.includes(`<loc>${siteUrl}/projetos/${s}/</loc>`), `sitemap com /projetos/${s}/ (URL final)`);
for (const d of demoUrls) ok(sitemap.includes(`<loc>${siteUrl}${d}</loc>`), `sitemap com ${d}`);
// Versão em inglês: HTML próprio para cada página pública, com lang, canonical e hreflang
const en = (p) => p.replace(/^\/projetos\//, '/projects/').replace(/^\//, '/en/');
const enPages = [
  ['/', '/en/', 'en/index.html'],
  ...slugs.map((s) => [`/projetos/${s}/`, en(`/projetos/${s}/`), `en/projects/${s}/index.html`]),
  ...demoUrls.map((d) => [d, en(d), `en${d}.html`]),
];
for (const [pt, enPath, file] of enPages) {
  if (!has(file)) { ok(false, `${file} existe`); continue; }
  const h = read(file);
  ok(h.includes('<html lang="en">') && h.includes('<meta property="og:locale" content="en_US"'), `${enPath}: lang="en" e og:locale en_US`);
  ok(h.includes(`<link rel="canonical" href="${siteUrl}${enPath}"`), `${enPath}: canonical próprio`);
  ok(h.includes(`hreflang="pt-BR" href="${siteUrl}${pt}"`) && h.includes(`hreflang="en" href="${siteUrl}${enPath}"`) && h.includes(`hreflang="x-default" href="${siteUrl}${pt}"`), `${enPath}: hreflang pt-BR, en e x-default`);
  ok(!/estudo de caso|projeto em detalhes|demonstração interativa|Este site precisa/i.test((h.match(/<title>[\s\S]*?<\/title>|<meta name="description"[^>]*>|<noscript>[\s\S]*?<\/noscript>/g) || []).join(' ')), `${enPath}: título, descrição e aviso em inglês`);
  ok(sitemap.includes(`<loc>${siteUrl}${enPath}</loc>`), `sitemap com ${enPath}`);
  const ptHtml = read(pt === '/' ? 'index.html' : pt.endsWith('/') ? `${pt.slice(1)}index.html` : `${pt.slice(1)}.html`);
  ok(ptHtml.includes('<html lang="pt-BR">') && ptHtml.includes(`hreflang="en" href="${siteUrl}${enPath}"`), `${pt}: lang pt-BR e alternativa em inglês`);
}
ok(/^\/en\/\*\s+\/en\/index\.html\s+200$/m.test(has('_redirects') ? read('_redirects') : ''), '_redirects: rotas do app em inglês abrem o HTML em inglês');
ok(has('robots.txt') && read('robots.txt').includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt aponta para o sitemap');

// Regras do Netlify
ok(has('_redirects') && /^\/\*\s+\/index\.html\s+200$/m.test(read('_redirects')), '_redirects: rotas internas abrem o app (200)');
{
  const r = has('_redirects') ? read('_redirects') : '';
  const a = r.search(/^\/assets\/\*\s+\/404\.html\s+404$/m), spa = r.search(/^\/\*\s+\/index\.html\s+200$/m);
  ok(a >= 0 && a < spa && has('404.html'), '_redirects: arquivo ausente em /assets responde 404 (antes da regra do app)');
}
ok(has('_headers') && read('_headers').includes('/fonts/*.woff2') && read('_headers').includes('/assets/*'), '_headers: cache de /assets e /fonts');

// Todo arquivo local citado em HTML, CSS ou JavaScript precisa existir na pasta publicada
// (fontes, capturas, vídeos das prévias, arquivos da marca e do build).
{
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  const ref = /(?<=["'(`=\s])(\/(?:assets|fonts|demo-fonts|projetos|marca)\/[A-Za-z0-9_\-./%]+?\.(?:woff2?|css|js|png|jpe?g|webp|svg|mp4|webm|pdf)|\/[A-Za-z0-9_\-]+\.(?:png|svg|ico|webmanifest))(?=["')`\s?#])/g;
  const video = /["'`](\/projetos\/[a-z0-9-]+\/previa)["'`]/g;
  const refs = new Map();
  for (const f of walk(dist).filter((f) => /\.(html|css|js)$/.test(f))) {
    const text = readFileSync(f, 'utf8');
    const found = [...text.matchAll(ref)].map((m) => m[1]);
    for (const m of text.matchAll(video)) found.push(`${m[1]}.webm`, `${m[1]}.mp4`);
    for (const r of found) refs.set(r, refs.get(r) || relative(dist, f));
  }
  const missing = [...refs].filter(([r]) => !has(decodeURIComponent(r.slice(1))));
  ok(refs.size > 0 && missing.length === 0, `nenhum arquivo citado está ausente (${refs.size} referências; ausentes: ${missing.slice(0, 8).map(([r, f]) => `${r} em ${f}`).join(', ') || 'nenhum'})`);
}

console.log(`\n${pass} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
