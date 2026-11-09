import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * Variantes de botão. As cores vêm do tom da seção (tokens em index.css):
 * - primary: ação principal (marinho sobre claro, verde-água sobre escuro);
 * - secondary: contorno, ação secundária;
 * - ghost: link com aparência de texto.
 * `onDark` e `onDarkOutline` são nomes antigos, equivalentes a primary e secondary.
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'onDarkOutline';
type Size = 'sm' | 'md' | 'lg' | 'hero';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[10px] text-center leading-snug font-semibold tracking-[-0.005em] [text-wrap:balance] transition-[background-color,color,box-shadow,border-color,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg.arrow]:translate-x-0.5';

const primary = 'bg-accent-fill text-on-accent shadow-[0_1px_0_rgb(255_255_255/0.18)_inset] hover:brightness-[1.12] hover:shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_10px_24px_-12px_var(--accent-fill)]';
const secondary = 'bg-surface text-fg shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:shadow-[inset_0_0_0_1px_var(--fg)]';

const variants: Record<Variant, string> = {
  primary,
  secondary,
  ghost: 'text-accent hover:text-fg underline-offset-4 hover:underline px-0!',
  onDark: primary,
  onDarkOutline: 'text-fg shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_var(--fg)]',
};

/**
 * Altura mínima (não fixa): em uma linha os botões têm 40, 44, 48 ou 52 px; se o texto
 * precisar de duas linhas, o botão cresce com respiro vertical, sem cortar nem encostar
 * o texto nas bordas.
 */
const sizes: Record<Size, string> = {
  sm: 'min-h-10 px-4 py-2 text-[0.9rem]',
  md: 'min-h-11 px-5 py-2.5 text-[0.95rem]',
  lg: 'min-h-12 px-6 py-2.5 text-base',
  /** Botões do topo: mais estreitos no celular para caberem lado a lado. */
  hero: 'min-h-12 px-4 py-2.5 text-[0.95rem] sm:min-h-[3.25rem] sm:px-6 sm:text-base',
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, ...props }: StyleProps & ComponentPropsWithoutRef<'button'>) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

/** Link interno (React Router) com aparência de botão. */
export function ButtonLink({ variant, size, className, ...props }: StyleProps & LinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/** Link externo com aparência de botão. Abre em nova aba. */
export function ButtonAnchor({ variant, size, className, ...props }: StyleProps & ComponentPropsWithoutRef<'a'>) {
  return <a target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...props} />;
}
