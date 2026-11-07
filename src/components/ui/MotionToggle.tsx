import { Pause, Play } from 'lucide-react';
import { useMotion } from '@/hooks/useMotion';
import { cn } from '@/utils/cn';

/**
 * Botão do cabeçalho para pausar e retomar as animações decorativas (WCAG 2.2.2).
 * Fica sempre à mão (o cabeçalho é fixo) sem cobrir o conteúdo.
 */
export function MotionToggle({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  const { paused, toggle } = useMotion();
  const label = paused ? 'Retomar animações' : 'Pausar animações';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-motion-toggle
      className={cn(
        'grid h-11 w-11 place-items-center rounded-lg transition-[background-color,color,transform] active:scale-[0.96]',
        tone === 'light' ? 'text-mist hover:bg-white/[0.08] hover:text-white' : 'text-slate hover:bg-paper hover:text-ink',
      )}
    >
      {paused ? <Play aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" /> : <Pause aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" />}
    </button>
  );
}
