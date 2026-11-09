import { lazy, Suspense } from 'react';
import type { Project } from '@/data/projects';
import { Capture } from '@/components/ui/Capture';
import { cn } from '@/utils/cn';

/**
 * Prévia desenhada em código: só para projetos ainda sem capturas. Carregada à parte
 * porque usa os dados das demonstrações, que não devem pesar no carregamento da página inicial.
 */
const ProjectPreview = lazy(() => import('@/components/previews/ProjectPreview').then((m) => ({ default: m.ProjectPreview })));

/**
 * Imagem principal do projeto: a primeira captura real (`screens[0]`).
 * Sem capturas cadastradas, usa a prévia desenhada em código.
 */
export function ProjectCover({
  project,
  className,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
}: {
  project: Project;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const screen = project.screens[0];
  return (
    <div className={cn('overflow-hidden rounded-lg', className)}>
      {screen ? (
        <Capture screen={screen} sizes={sizes} priority={priority} />
      ) : (
        <Suspense fallback={<div className="aspect-[16/10] bg-surface-2" />}>
          <ProjectPreview kind={project.preview} />
        </Suspense>
      )}
    </div>
  );
}
