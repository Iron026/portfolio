import { lazy, type ComponentType } from 'react';

/**
 * Carregamento das demonstrações (cada uma num arquivo separado do build).
 *
 * Por que existe: os arquivos de /assets têm o hash do conteúdo no nome e são
 * trocados a cada publicação. Uma aba aberta antes de um novo deploy continua
 * com a lista antiga de arquivos; ao abrir uma demonstração, ela pede um
 * arquivo que não existe mais e a importação falha. Sem tratamento, o React
 * desmonta a aplicação inteira e sobra só o fundo da página (tela branca),
 * inclusive depois de "Voltar".
 *
 * O que faz:
 * 1. falha de rede passageira: tenta de novo uma vez, após um instante;
 * 2. arquivo de outra versão do site: recarrega a página uma única vez no
 *    mesmo endereço, para buscar a versão publicada (os arquivos antigos não
 *    existem mais, então não há como resolver sem o index.html novo);
 * 3. se ainda assim falhar, entrega o erro ao AppErrorBoundary, que mostra
 *    uma tela de recuperação em vez de uma página vazia.
 */
const RELOAD_KEY = 'alto:recarregado-por-versao';
const RELOAD_WINDOW_MS = 30_000;

/** Mensagens de falha de importação dinâmica (Chrome, Firefox, Safari e o pré-carregamento do Vite). */
export function isChunkLoadError(error: unknown): boolean {
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /dynamically imported module|Importing a module script failed|error loading dynamically|Unable to preload CSS|ChunkLoadError|Loading chunk .* failed|module script/i.test(msg);
}

function readReload(): number {
  try {
    return Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Recarrega uma vez; devolve false se já recarregou há pouco (evita repetição). */
export function reloadOnceForNewVersion(): boolean {
  if (Date.now() - readReload() < RELOAD_WINDOW_MS) return false;
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false; // sem sessionStorage não há como evitar repetição: não recarrega
  }
  window.location.reload();
  return true;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function lazyPage<T extends ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await load();
    } catch (first) {
      if (!isChunkLoadError(first)) throw first;
      await wait(400);
      try {
        return await load();
      } catch (second) {
        // a página vai recarregar: mantém o aviso "Carregando…" até lá
        if (isChunkLoadError(second) && reloadOnceForNewVersion()) return new Promise<never>(() => {});
        throw second;
      }
    }
  });
}
