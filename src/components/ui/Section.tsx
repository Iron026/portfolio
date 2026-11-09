import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
  /** Tom da superfície: define cores de fundo, texto, bordas e destaque (veja .tone-* em index.css). */
  tone?: 'light' | 'dark';
  /** Camada decorativa atrás do conteúdo (ex.: <AmbientBackground variant="process" />). */
  background?: ReactNode;
}

export function Section({ id, className, children, labelledBy, tone = 'light', background }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative py-16 sm:py-28', tone === 'dark' ? 'tone-dark on-dark' : 'tone-light on-light', background ? 'isolate overflow-hidden' : undefined, className)}
    >
      {background}
      <div className="container-site relative">{children}</div>
    </section>
  );
}

interface HeadingProps {
  id: string;
  /** Número da seção, ex.: "01". */
  index: string;
  /** Total de seções numeradas, exibido à direita da linha de índice. */
  total?: string;
  /** Nome curto da seção, exibido na linha de índice (ex.: "Serviços"). */
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Conteúdo extra na coluna da direita, abaixo do texto de apoio. */
  aside?: ReactNode;
  className?: string;
  /** Título e texto empilhados (para cabeçalhos dentro de colunas estreitas). */
  stacked?: boolean;
}

/**
 * Cabeçalho editorial de seção: linha de índice (número + nome em fonte mono
 * + contador), título grande à esquerda e texto de apoio à direita.
 * As cores vêm do tom da seção.
 */
export function SectionHeading({ id, index, total = '06', label, title, intro, aside, className, stacked = false }: HeadingProps) {
  return (
    <div className={className}>
      <p className="section-index border-edge-strong text-fg">
        <b className="text-accent">{index}</b>
        <span>{label}</span>
        <span aria-hidden="true" className="ml-auto text-fg-muted">
          {index} / {total}
        </span>
      </p>
      <div className={cn('mt-8 grid gap-6', !stacked && 'lg:grid-cols-12 lg:items-end lg:gap-10')}>
        <h2 id={id} className={cn('type-h2 text-fg', !stacked && 'lg:col-span-7')}>
          {title}
        </h2>
        {(intro || aside) && (
          <div className={stacked ? undefined : 'lg:col-span-5'}>
            {intro && <p className="type-body text-fg-muted">{intro}</p>}
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}
