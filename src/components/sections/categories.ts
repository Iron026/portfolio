/**
 * Cores das três categorias de serviço (presença, gestão, processos).
 * Usadas no índice de serviços. A bancada do Início usa TAB_COLORS (abaixo).
 * - fill: cor de detalhe (linhas, faixas, pontos), sobre claro ou escuro
 * - text: texto sobre fundo claro (AA)
 * - onDark: texto e linhas sobre fundo escuro (AA)
 */
import type { CSSProperties } from 'react';
import type { CategoryId } from '@/data/services';
import type { TabId } from './HeroWorkbench';

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

/**
 * Cores das quatro abas da bancada do Início (Site, Sistema, Planilha, Automação).
 * Separadas das categorias dos serviços: Planilha e Sistema pertencem à mesma
 * categoria comercial ("gestao"), mas na bancada cada aba tem a sua cor.
 * - fill: cor plena (moldura, palavra do título, aba ativa, luz de fundo)
 *   — 5,7:1 ou mais sobre o fundo noite (#060E1D)
 * - onDark: texto pequeno sobre o fundo noite (painel de inspeção) — 8,4:1 ou mais
 * - onLight: texto e detalhes sobre a bancada branca — 5,6:1 ou mais
 * Texto escuro (#071425) sobre o fill (etiqueta da moldura): 5,4:1 ou mais.
 */
export const TAB_COLORS: Record<TabId, { fill: string; onDark: string; onLight: string }> = {
  site: { fill: '#22c3b0', onDark: '#3fd5c1', onLight: '#0a7568' },
  sistema: { fill: '#5b84ff', onDark: '#8aa8ff', onLight: '#2b4fb8' },
  planilha: { fill: '#a78bfa', onDark: '#c4b5fd', onLight: '#6d4ad6' },
  automacao: { fill: '#f2a93b', onDark: '#f2b45a', onLight: '#8c5a07' },
};

/** Variáveis CSS da aba: --cat (cor plena), --cat-dark (texto sobre escuro), --cat-light (sobre a bancada clara). */
export function tabStyle(tab: TabId): CSSProperties {
  const c = TAB_COLORS[tab];
  return { ['--cat' as string]: c.fill, ['--cat-dark' as string]: c.onDark, ['--cat-light' as string]: c.onLight };
}
