import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';
import { LOCKUP_ACCENT, LOCKUP_FG, LOCKUP_VIEWBOX, SYMBOL_A, SYMBOL_ACCENT, SYMBOL_VIEWBOX } from './logo-paths';

/**
 * Identidade visual da Alto Code: um A geométrico entre os sinais de código "<" e ">",
 * com a barra central em verde-água. A geometria e os contornos do texto vêm de
 * scripts/marca.py (o mesmo gerador do kit da marca em marca/), então o site e os
 * arquivos da marca são idênticos.
 *
 * Cores: o A e "Alto" usam a cor do texto do tom da seção (currentColor); os detalhes
 * e "Code" usam --logo-accent (verde-água #22C3B0 sobre escuro e #0E9888 sobre claro,
 * 3,6:1 contra o branco, acima do mínimo de 3:1 para elementos gráficos).
 */
const ACCENT = 'var(--logo-accent, #22c3b0)';

interface MarkProps {
  className?: string;
  /** Verde-água fixo, para usos fora dos tons do site (ex.: tela de erro sobre fundo claro). */
  accent?: string;
}

/** Símbolo isolado (sem o nome). Decorativo: quem usa dá o nome acessível ao redor. */
export function LogoMark({ className, accent }: MarkProps) {
  return (
    <svg viewBox={SYMBOL_VIEWBOX} aria-hidden="true" focusable="false" className={cn('h-auto w-12 shrink-0', className)}>
      <path fill="currentColor" d={SYMBOL_A} />
      <path fill={accent ?? ACCENT} d={SYMBOL_ACCENT} />
    </svg>
  );
}

/** Logo horizontal: símbolo e "Alto Code" (texto em contornos, Space Grotesk 650). */
export function LogoLockup({ className, accent }: MarkProps) {
  return (
    <svg viewBox={LOCKUP_VIEWBOX} aria-hidden="true" focusable="false" className={cn('block h-6 w-auto shrink-0', className)}>
      <path fill="currentColor" d={LOCKUP_FG} />
      <path fill={accent ?? ACCENT} d={LOCKUP_ACCENT} />
    </svg>
  );
}

/**
 * Logo com link para o início do idioma atual (cabeçalho e rodapé).
 * Mais compacta no celular. A moldura de seleção da marca aparece ao passar o mouse
 * ou ao focar pelo teclado; a margem negativa compensa o respiro da moldura, e a logo
 * fica alinhada à borda do conteúdo.
 */
export function Logo({ className }: { className?: string }) {
  const { lp } = useLocale();
  const ui = useUi();
  return (
    <Link
      to={lp('/')}
      className={cn('logo-link group -mx-1.5 inline-flex shrink-0 items-center rounded-md text-fg', className)}
      aria-label={ui.common.homeLabel(site.name)}
    >
      <span className="frame-sel frame-sel-hover block px-1.5 py-1.5 [--frame-color:var(--logo-accent)]">
        <LogoLockup className="h-[1.3rem] min-[360px]:h-[1.4rem] sm:h-[1.55rem]" />
      </span>
    </Link>
  );
}
