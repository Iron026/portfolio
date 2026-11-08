import { lazy, Suspense } from 'react';
import type { Project } from '@/data/projects';
import { Capture } from '@/components/ui/Capture';
import { cn } from '@/utils/cn';
import { PreviewVideoButton, PreviewVideoLayer, usePreviewVideo } from '@/components/ui/PreviewVideo';
import { useUi } from '@/i18n/ui';

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

/** Imagem principal com a prévia em vídeo por cima (página do estudo de caso). */
export function ProjectCoverWithPreview({ project, sizes, priority }: { project: Project; sizes?: string; priority?: boolean }) {
  const preview = usePreviewVideo(project.video?.src);
  const ui = useUi();
  return (
    <>
      <div ref={preview.boxRef} className="relative overflow-hidden rounded-lg">
        <ProjectCover project={project} sizes={sizes} priority={priority} />
        {project.video && <PreviewVideoLayer preview={preview} label={ui.video.layer(project.name, project.video.shows)} />}
      </div>
      {project.video && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PreviewVideoButton preview={preview} name={project.name} />
          <span className="type-small text-fg-muted">{project.video.shows}</span>
        </div>
      )}
    </>
  );
}
