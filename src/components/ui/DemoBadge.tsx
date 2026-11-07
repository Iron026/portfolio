import { cn } from '@/utils/cn';

/** Selo que identifica honestamente um projeto como demonstrativo. */
export function DemoBadge({
  kind = 'demo',
  tone = 'light',
  className,
}: {
  kind?: 'demo' | 'cliente';
  /** 'dark' quando o selo fica sobre o fundo escuro. */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'type-tag inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5',
        kind === 'cliente'
          ? 'bg-ink text-white'
          : tone === 'dark'
            ? 'text-tide shadow-[inset_0_0_0_1px_rgb(34_195_176/0.45)]'
            : 'bg-tide-wash text-tide-deep',
        className,
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-current" />
      {kind === 'demo' ? 'Projeto demonstrativo' : 'Projeto para cliente'}
    </span>
  );
}
