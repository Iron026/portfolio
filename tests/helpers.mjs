// Configuração comum dos testes de navegador (Playwright).
// Variáveis opcionais:
//   BASE_URL     endereço do site em teste (padrão: http://127.0.0.1:4173, o "npm run preview")
//   TEST_OUT     pasta das capturas e arquivos gerados (padrão: tests/saida)
//   PW_CHROMIUM  caminho de um Chromium já instalado (padrão: o do "npx playwright install chromium")
//   PW_ARGS      argumentos extras do navegador, separados por espaço
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export { chromium };
export const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
export const OUT = process.env.TEST_OUT || fileURLToPath(new URL('./saida', import.meta.url));
mkdirSync(OUT, { recursive: true });
export const LAUNCH = {
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: process.env.PW_ARGS ? process.env.PW_ARGS.split(' ') : [],
};
