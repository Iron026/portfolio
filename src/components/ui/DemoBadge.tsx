import { cn } from '@/utils/cn';
import { useUi } from '@/i18n/ui';

/** Selo que identifica honestamente um projeto como demonstrativo. Cores do tom da seção. */
export function DemoBadge({ kind = 'demo', className }: { kind?: 'demo' | 'cliente'; tone?: 'light' | 'dark'; className?: string }) {
  const ui = useUi();
  return (
    <span className={cn('chip text-accent [--dot:var(--accent)]', className)}>
      <span aria-hidden="true" className="chip-dot rounded-none!" />
      {kind === 'demo' ? ui.common.demoBadge : ui.common.clientBadge}
    </span>
  );
}
