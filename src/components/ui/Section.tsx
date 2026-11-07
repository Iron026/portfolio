import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
  /** Camada decorativa atrás do conteúdo (ex.: <AmbientBackground variant="subtle" />). */
  background?: ReactNode;
}

export function Section({ id, className, children, labelledBy, background }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('relative py-20 sm:py-28', background ? 'isolate overflow-hidden' : undefined, className)}>
      {background}
      <div className="container-site relative">{children}</div>
    </section>
  );
}

interface HeadingProps {
  id: string;
  /** Número da seção, ex.: "01". */
  index: string;
  /** Nome curto da seção, exibido na linha de índice (ex.: "Serviços"). */
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Conteúdo extra na coluna da direita, abaixo do texto de apoio. */
  aside?: ReactNode;
  className?: string;
  tone?: 'dark' | 'light';
  /** Título e texto empilhados (para cabeçalhos dentro de colunas estreitas). */
  stacked?: boolean;
}

/**
 * Cabeçalho editorial de seção: linha de índice (número + nome em fonte mono),
 * título grande à esquerda e texto de apoio à direita.
 */
export function SectionHeading({ id, index, label, title, intro, aside, className, tone = 'dark', stacked = false }: HeadingProps) {
  const dark = tone === 'dark';
  return (
    <div className={className}>
      <p className={cn('section-index', dark ? 'border-ink text-ink' : 'border-white/25 text-white')}>
        <b className={dark ? 'text-tide-deep' : 'text-tide'}>{index}</b>
        <span>{label}</span>
      </p>
      <div className={cn('mt-8 grid gap-6', !stacked && 'lg:grid-cols-12 lg:items-end lg:gap-10')}>
        <h2 id={id} className={cn('type-h2', !stacked && 'lg:col-span-7', dark ? 'text-ink' : 'text-white')}>
          {title}
        </h2>
        {(intro || aside) && (
          <div className={stacked ? undefined : 'lg:col-span-5'}>
            {intro && <p className={cn('type-body', dark ? 'text-slate' : 'text-mist')}>{intro}</p>}
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}
