/**
 * Direção visual em comparação (temporário, só para a avaliação das propostas).
 * `?dir=a` no endereço ativa a Direção A (Premium Tech); sem o parâmetro, vale a B.
 */
export type Direction = 'a' | 'b';

export function initDirection() {
  if (typeof window === 'undefined') return;
  const dir = new URLSearchParams(window.location.search).get('dir');
  if (dir === 'a') document.documentElement.dataset.dir = 'a';
}

export function getDirection(): Direction {
  return typeof document !== 'undefined' && document.documentElement.dataset.dir === 'a' ? 'a' : 'b';
}
