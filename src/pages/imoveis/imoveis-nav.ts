/**
 * Memória da navegação entre a lista e o detalhe.
 * Guarda a última busca da lista (ex.: "?finalidade=venda&quartos=3") e o
 * último imóvel aberto, para o botão "Voltar para os resultados" recuperar
 * os mesmos filtros e devolver o foco ao card visitado.
 * Usa sessionStorage quando disponível e uma variável como reserva.
 */
const KEY_SEARCH = 'prime-imoveis:busca';
const KEY_LAST = 'prime-imoveis:ultimo';
const memory: Record<string, string> = {};

function read(key: string) {
  try {
    return window.sessionStorage.getItem(key) ?? memory[key] ?? '';
  } catch {
    return memory[key] ?? '';
  }
}
function write(key: string, value: string) {
  memory[key] = value;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* navegação privada ou armazenamento bloqueado: fica só na memória */
  }
}

export const LIST_PATH = '/demos/imoveis';

export const rememberSearch = (search: string) => write(KEY_SEARCH, search);
export const savedSearch = () => read(KEY_SEARCH);
export const rememberLastViewed = (id: string) => write(KEY_LAST, id);
export function takeLastViewed() {
  const id = read(KEY_LAST);
  write(KEY_LAST, '');
  return id;
}
