import { Pause, Play } from 'lucide-react';
import { useMotion } from '@/hooks/useMotion';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';

/**
 * Botão do cabeçalho para pausar e retomar as animações decorativas (WCAG 2.2.2).
 * Fica sempre à mão (o cabeçalho é fixo) sem cobrir o conteúdo.
 */
export function MotionToggle({ className }: { tone?: 'light' | 'dark'; className?: string }) {
  const { paused, toggle } = useMotion();
  const ui = useUi();
  const label = paused ? ui.motion.resume : ui.motion.pause;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-motion-toggle
      className={cn('grid h-11 w-11 place-items-center rounded-[10px] text-fg-muted transition-[background-color,color,transform] hover:bg-surface-2 hover:text-fg active:scale-[0.96]', className)}
    >
      {paused ? <Play aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" /> : <Pause aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" />}
    </button>
  );
}
