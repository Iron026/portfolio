import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { cn } from '@/utils/cn';

interface LogoProps {
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Logotipo: monograma "AC" dentro da moldura de seleção da marca — a ideia
 * de enquadrar uma necessidade e ajustá-la sob medida. As versões em arquivo
 * (para perfis, capas e apresentações) ficam em public/marca/.
 */
export function LogoMark({ tone = 'dark', className }: LogoProps) {
  const fg = tone === 'dark' ? 'var(--color-ink)' : '#ffffff';
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn('h-9 w-9 shrink-0', className)}>
      {/* Moldura de seleção: linha fina e quatro alças */}
      <rect x="4.5" y="4.5" width="31" height="31" fill="none" stroke={fg} strokeWidth="1.5" />
      {[
        [4.5, 4.5],
        [35.5, 4.5],
        [4.5, 35.5],
        [35.5, 35.5],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" fill="var(--color-tide)" />
      ))}
      {/* Monograma "AC" desenhado em traços: não depende de fonte instalada */}
      <g fill="none" stroke={fg} strokeWidth="2.5" strokeLinejoin="miter">
        <path d="M10.2 27.2 L15.3 12.8 L20.4 27.2" />
        <path d="M12.3 22.4 H18.3" />
        <path d="M31.4 15.4 A5.4 6.9 0 1 0 31.4 24.6" />
      </g>
    </svg>
  );
}

export function Logo({ tone = 'dark', className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label={`${site.name}, página inicial`}
    >
      <LogoMark tone={tone} />
      <span
        className={cn(
          'font-title text-[1.2rem] font-semibold tracking-[-0.03em]',
          tone === 'dark' ? 'text-ink' : 'text-white',
        )}
      >
        {site.name}
      </span>
    </Link>
  );
}
