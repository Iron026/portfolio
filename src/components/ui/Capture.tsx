import type { Screen } from '@/data/projects';
import { cn } from '@/utils/cn';

/** Dimensões reais dos arquivos gerados para cada tipo de captura. */
const FORMAT = {
  desktop: { small: 800, large: 1600, width: 1600, height: 1000 },
  mobile: { small: 390, large: 780, width: 780, height: 1688 },
} as const;

interface CaptureProps {
  screen: Screen;
  /** Valor do atributo `sizes` (quanto da tela a imagem ocupa). */
  sizes: string;
  /** true para a imagem principal visível sem rolar (carrega antes e sem lazy loading). */
  priority?: boolean;
  className?: string;
}

/**
 * Captura real de uma demonstração, em WebP responsivo.
 * Os arquivos ficam em public/projetos/<slug>/ com o sufixo da largura
 * (ex.: tela-1-800.webp e tela-1-1600.webp).
 */
export function Capture({ screen, sizes, priority = false, className }: CaptureProps) {
  const f = FORMAT[screen.device];
  return (
    <img
      src={`${screen.src}-${f.small}.webp`}
      srcSet={`${screen.src}-${f.small}.webp ${f.small}w, ${screen.src}-${f.large}.webp ${f.large}w`}
      sizes={sizes}
      width={f.width}
      height={f.height}
      alt={screen.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      className={cn('block h-auto w-full bg-paper', className)}
    />
  );
}
