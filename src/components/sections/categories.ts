/**
 * Cores das três categorias de serviço (presença, gestão, processos).
 * Usadas nos cartões de serviço, na bancada do Início e no painel de inspeção.
 * - fill: cor de detalhe (linhas, faixas, pontos), sobre claro ou escuro
 * - text: texto sobre fundo claro (AA)
 * - onDark: texto e linhas sobre fundo escuro (AA)
 */
import type { CSSProperties } from 'react';
import type { CategoryId } from '@/data/services';

export const CATEGORY_COLORS: Record<CategoryId, { fill: string; text: string; onDark: string }> = {
  presenca: { fill: '#22c3b0', text: '#0a7568', onDark: '#3fd5c1' },
  gestao: { fill: '#5b84ff', text: '#2b4fb8', onDark: '#8aa8ff' },
  processos: { fill: '#f2a93b', text: '#8c5a07', onDark: '#f2b45a' },
};

/** Variáveis CSS da categoria: --cat (detalhe), --cat-text (texto sobre claro), --cat-dark (sobre escuro). */
export function categoryStyle(category: CategoryId): CSSProperties {
  const c = CATEGORY_COLORS[category];
  return { ['--cat' as string]: c.fill, ['--cat-text' as string]: c.text, ['--cat-dark' as string]: c.onDark };
}
