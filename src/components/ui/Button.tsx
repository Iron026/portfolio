import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'onDarkOutline';
type Size = 'md' | 'lg' | 'hero';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[-0.005em] transition-[background-color,color,box-shadow,border-color,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg.arrow]:translate-x-0.5';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-2 active:bg-night',
  secondary: 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]',
  ghost: 'text-tide-deep hover:text-ink underline-offset-4 hover:underline px-0!',
  onDark: 'bg-tide text-ink hover:bg-tide-bright',
  onDarkOutline: 'text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.28)] hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7)]',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-12 px-6 text-base',
  /** Botões do topo: mais estreitos no celular para caberem lado a lado. */
  hero: 'h-12 px-4 text-[0.95rem] sm:px-6 sm:text-base',
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

export function Button({
  variant,
  size,
  className,
  ...props
}: StyleProps & ComponentPropsWithoutRef<'button'>) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

/** Link interno (React Router) com aparência de botão. */
export function ButtonLink({ variant, size, className, ...props }: StyleProps & LinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/** Link externo com aparência de botão. Abre em nova aba. */
export function ButtonAnchor({
  variant,
  size,
  className,
  ...props
}: StyleProps & ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass(variant, size, className)}
      {...props}
    />
  );
}
