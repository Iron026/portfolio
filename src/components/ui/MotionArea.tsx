import type { HTMLAttributes, ReactNode } from 'react';
import { useMotionRegion } from '@/hooks/useMotion';
import { cn } from '@/utils/cn';

/**
 * Envolve uma área com animação decorativa contínua. Fora da tela, com a aba em
 * segundo plano ou com as animações pausadas, o atributo `data-motion-off` faz o
 * CSS congelar tudo o que está dentro (animation-play-state: paused).
 * Componentes filhos que usam temporizador recebem `active` pela render prop.
 */
export function MotionArea({
  children,
  className,
  rootMargin,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { children: ReactNode | ((active: boolean) => ReactNode); rootMargin?: string }) {
  const { ref, active } = useMotionRegion<HTMLDivElement>(rootMargin);
  return (
    <div ref={ref} data-motion-off={active ? undefined : ''} className={cn('motion', className)} {...rest}>
      {typeof children === 'function' ? children(active) : children}
    </div>
  );
}
