// Roda todos os testes de navegador (tests/e2e/*.test.mjs) em sequência.
//
// Uso:  npm run build  →  npm run test:e2e
// Sem BASE_URL, este script sobe o "vite preview" (pasta dist/) em http://127.0.0.1:4173.
// Com BASE_URL, testa um endereço já no ar (ex.: um Deploy Preview do Netlify):
//   BASE_URL=https://deploy-preview-1--altocode.netlify.app npm run test:e2e
// Para rodar só alguns arquivos: npm run test:e2e -- portfolio fontes
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('./e2e/', import.meta.url));
const only = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).filter((f) => !only.length || only.some((o) => f.includes(o))).sort();

let server;
if (!process.env.BASE_URL) {
  if (!existsSync(fileURLToPath(new URL('../dist/index.html', import.meta.url)))) {
    console.error('Pasta dist/ não encontrada. Rode "npm run build" antes de "npm run test:e2e".');
    process.exit(1);
  }
  const { preview } = await import('vite');
  server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true }, logLevel: 'warn' });
  console.log('vite preview em http://127.0.0.1:4173');
}

const results = [];
for (const f of files) {
  process.stdout.write(`\n▶ ${f}\n`);
  const out = await new Promise((resolve) => {
    let text = '';
    const child = spawn(process.execPath, [dir + f], { env: process.env });
    child.stdout.on('data', (d) => { text += d; process.stdout.write(d); });
    child.stderr.on('data', (d) => { text += d; process.stderr.write(d); });
    child.on('close', (code) => resolve({ code, text }));
  });
  const m = out.text.match(/(\d+) passaram, (\d+) falharam/g)?.pop()?.match(/(\d+) passaram, (\d+) falharam/);
  results.push({ arquivo: f, passaram: m ? +m[1] : 0, falharam: m ? +m[2] : '?', ok: out.code === 0 && !!m && +m[2] === 0 });
}
if (server) await new Promise((r) => server.httpServer.close(r));

console.log('\nResumo');
console.table(results);
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `${bad.length} arquivo(s) com falha.` : 'Todos os testes de navegador passaram.');
process.exit(bad.length ? 1 : 0);
