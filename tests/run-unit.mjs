// Testes de unidade das regras das demonstrações (cálculos, filtros, validações).
// Compila cada tests/unidade/*.test.ts com o esbuild (instalado junto com o Vite) e executa.
// Uso: npm run test:unit
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('./unidade/', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'altocode-unidade-'));
let failed = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.test.ts')).sort()) {
  const outfile = join(tmp, f.replace(/\.ts$/, '.cjs'));
  await build({ entryPoints: [join(dir, f)], bundle: true, platform: 'node', format: 'cjs', outfile, logLevel: 'error' });
  const r = spawnSync(process.execPath, [outfile], { encoding: 'utf8' });
  const last = (r.stdout.trim().split('\n').pop() || '') + (r.stderr ? '\n' + r.stderr : '');
  console.log(`${r.status === 0 ? '✔' : '✘'} ${f}: ${last}`);
  if (r.status !== 0) { failed++; console.log(r.stdout); }
}
rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `${failed} arquivo(s) com falha.` : 'Todos os testes de unidade passaram.');
process.exit(failed ? 1 : 0);
