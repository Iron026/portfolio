import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { projects, type Project } from '@/data/projects';
import { Section, SectionHeading } from '@/components/ui/Section';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ButtonLink } from '@/components/ui/Button';
import { Capture } from '@/components/ui/Capture';
import { ProjectCover } from './ProjectCover';
import { DemoButton, QuoteLink } from './ProjectActions';
import { PreviewVideoButton, PreviewVideoLayer, usePreviewVideo } from '@/components/ui/PreviewVideo';
import type { CSSProperties } from 'react';
import { cn } from '@/utils/cn';

const num = (n: number) => String(n).padStart(2, '0');

/**
 * Composição editorial da grade (12 colunas no desktop). Cada posição define
 * a largura do cartão e se ele é horizontal ("wide") ou vertical ("tall").
 * Com mais ou menos projetos, os extras usam o formato vertical em meia largura.
 */
const LAYOUT: Array<{ span: string; shape: 'wide' | 'tall'; flip?: boolean; phone?: boolean }> = [
  { span: 'lg:col-span-12', shape: 'wide' },
  { span: 'lg:col-span-7', shape: 'tall' },
  { span: 'lg:col-span-5', shape: 'tall' },
  { span: 'lg:col-span-12', shape: 'wide', flip: true, phone: true },
  { span: 'lg:col-span-7', shape: 'tall' },
];

export function Projects() {
  return (
    <Section id="projetos" labelledBy="projetos-title" className="bg-ice">
      <SectionHeading
        id="projetos-title"
        index="01"
        label="Projetos"
        title="Trabalhos para explorar e testar"
        intro={`${projects.length} projetos demonstrativos autorais, com empresas e dados fictícios e funcionalidades reais. As prévias em movimento são gravações das próprias demonstrações.`}
      />

      <div className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-12 lg:gap-6">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} total={projects.length} layout={LAYOUT[i] ?? { span: 'lg:col-span-6', shape: 'tall' }} />
        ))}
        <QuoteCard />
      </div>
    </Section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  layout,
}: {
  project: Project;
  index: number;
  total: number;
  layout: (typeof LAYOUT)[number];
}) {
  const titleId = `projeto-${project.slug}`;
  const wide = layout.shape === 'wide';
  const phone = layout.phone ? project.screens.find((s) => s.device === 'mobile') : undefined;
  const cover = project.screens[0];

  const preview = usePreviewVideo(project.video?.src);
  const accent = { '--accent': project.accent.base, '--accent-2': project.accent.detail } as CSSProperties;

  return (
    <article
      id={`projetos-${project.slug}`}
      aria-labelledby={titleId}
      style={accent}
      className={cn(
        'grid scroll-mt-24 overflow-hidden rounded-xl bg-card shadow-[inset_0_0_0_1px_var(--color-ice-2)] [&>*]:min-w-0',
        layout.span,
        wide && 'lg:grid-cols-12',
      )}
    >
      {/* Mídia: captura real por baixo e a prévia gravada da demonstração por cima */}
      <div
        className={cn(
          'project-media relative p-4 sm:p-6',
          wide && 'lg:col-span-7 lg:p-10',
          wide && layout.flip && 'lg:order-2',
        )}
      >
        {/* faixa com a cor de destaque da identidade do projeto */}
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-(--accent-2)" />
        <Link to={`/projetos/${project.slug}`} aria-label={`Ver o estudo de caso de ${project.name}`} className="group relative block">
          <div className="frame-sel frame-sel-hover">
            <div ref={preview.boxRef} className="relative overflow-hidden rounded-lg shadow-soft">
              <ProjectCover
                project={project}
                sizes={wide ? '(min-width: 1024px) 55vw, 100vw' : '(min-width: 1024px) 45vw, 100vw'}
              />
              {project.video && <PreviewVideoLayer preview={preview} label={`Prévia de ${project.name}: ${project.video.shows}`} />}
            </div>
          </div>
          {phone && (
            <div className="absolute right-2 -bottom-2 hidden w-[22%] max-w-[9.5rem] overflow-hidden rounded-lg shadow-lift ring-4 ring-(--accent-ring) lg:block">
              <Capture screen={phone} sizes="10rem" />
            </div>
          )}
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {cover && (
            <p className="type-tag text-slate">
              {project.video ? 'Gravação da demonstração' : 'Captura'} <span aria-hidden="true">·</span> {cover.route}
            </p>
          )}
          {project.video && <PreviewVideoButton preview={preview} name={project.name} />}
        </div>
        {project.video && <p className="type-small mt-2 max-w-[60ch] text-slate">{project.video.shows}</p>}
      </div>

      <div className={cn('flex flex-col p-6 sm:p-8', wide && 'lg:col-span-5 lg:justify-center lg:p-10')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span aria-hidden="true" className="type-label text-tide-deep">
            {num(index + 1)} / {num(total)}
          </span>
          <span className="type-small inline-flex items-center gap-2 text-slate">
            {/* as duas cores da identidade do projeto */}
            <span aria-hidden="true" className="inline-flex">
              <i className="h-2.5 w-2.5 rounded-full bg-(--accent) ring-2 ring-card" />
              <i className="-ml-1 h-2.5 w-2.5 rounded-full bg-(--accent-2) ring-2 ring-card" />
            </span>
            {project.category}
          </span>
          <DemoBadge kind={project.kind} />
        </div>
        <h3 id={titleId} className="type-h3 mt-3">
          {project.name}
        </h3>
        <p className="type-body mt-3 text-slate">{project.summary}</p>

        <h4 className="sr-only">Tecnologias</h4>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1" aria-label="Tecnologias utilizadas">
          {project.technologies.map((tech) => (
            <li key={tech} className="type-tag text-slate">
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <div className="grid gap-2.5 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
            <DemoButton project={project} />
            <ButtonLink to={`/projetos/${project.slug}`} variant="secondary">
              Ver detalhes
              <ArrowRight aria-hidden="true" className="arrow h-4 w-4" />
            </ButtonLink>
          </div>
          <QuoteLink project={project} className="type-small mt-3" />
        </div>
      </div>
    </article>
  );
}

/** Cartão final da grade: chamada real para o formulário de orçamento. */
function QuoteCard() {
  return (
    <div className="on-dark flex flex-col justify-between rounded-xl bg-night p-6 text-white sm:p-8 lg:col-span-5">
      <div>
        <p className="type-label text-tide">Seu projeto</p>
        <p className="type-h3 mt-4 text-white">Precisa de algo parecido ou de uma solução diferente?</p>
        <p className="type-body mt-3 text-mist">Conte o problema que você quer resolver ou veja as seis frentes de trabalho.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to={{ pathname: '/', hash: '#contato' }} variant="onDark">
          Solicitar orçamento
          <ArrowRight aria-hidden="true" className="arrow h-4 w-4" />
        </ButtonLink>
        <ButtonLink to={{ pathname: '/', hash: '#servicos' }} variant="onDarkOutline">
          Ver serviços
        </ButtonLink>
      </div>
    </div>
  );
}
