import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Project } from '@/data/projects';
import { Section, SectionHeading } from '@/components/ui/Section';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ButtonLink } from '@/components/ui/Button';
import { Capture } from '@/components/ui/Capture';
import { ProjectCover } from './ProjectCover';
import { DemoButton, QuoteLink } from './ProjectActions';
import { PreviewVideoButton, PreviewVideoLayer, usePreviewVideo } from '@/components/ui/PreviewVideo';
import { useProjects } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { getDirection } from '@/design/direction';
import { cn } from '@/utils/cn';

const num = (n: number) => String(n).padStart(2, '0');

/**
 * Vitrine em grade assimétrica (12 colunas no desktop):
 * - o primeiro projeto é o destaque (7 colunas, captura do computador e do celular);
 * - o segundo divide a linha com ele (5 colunas);
 * - os três seguintes ocupam 4 colunas cada.
 * A mídia de cada cartão usa a cor da identidade da própria demonstração.
 */
const LAYOUT: Array<{ span: string; feature?: boolean }> = [
  { span: 'lg:col-span-7', feature: true },
  { span: 'lg:col-span-5' },
  { span: 'md:col-span-1 lg:col-span-4' },
  { span: 'md:col-span-1 lg:col-span-4' },
  { span: 'md:col-span-2 lg:col-span-4' },
];

export function Projects() {
  const projects = useProjects();
  const ui = useUi();
  const { lp } = useLocale();
  const uniform = getDirection() === 'a';
  const home = lp('/');

  return (
    <Section id="projetos" labelledBy="projetos-title" className="bg-surface-2!">
      <SectionHeading id="projetos-title" index="01" label={ui.sections.projects.label} title={ui.sections.projects.title} intro={ui.sections.projects.intro(projects.length)} />

      <div className={cn('mt-14 grid gap-5 sm:mt-16 lg:gap-6', uniform ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-12')}>
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} total={projects.length} span={uniform ? '' : (LAYOUT[i]?.span ?? 'lg:col-span-6')} feature={!uniform && !!LAYOUT[i]?.feature} />
        ))}

        {/* Faixa final: chamada real para o formulário */}
        <div className={cn('tone-dark on-dark relative flex flex-col justify-between gap-6 overflow-hidden rounded-[14px] p-6 sm:flex-row sm:items-center sm:p-8', uniform ? 'md:col-span-2' : 'md:col-span-2 lg:col-span-12')}>
          <div className="max-w-2xl">
            <p className="type-h3 text-fg">{ui.projects.quoteBandTitle}</p>
            <p className="type-body mt-2 text-fg-muted">{ui.projects.quoteBandText}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink to={{ pathname: home, hash: '#contato' }}>
              {ui.common.requestQuote}
              <ArrowRight aria-hidden="true" className="arrow h-4 w-4" />
            </ButtonLink>
            <ButtonLink to={{ pathname: home, hash: '#servicos' }} variant="onDarkOutline">
              {ui.projects.seeServices}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ProjectCard({ project, index, total, span, feature }: { project: Project; index: number; total: number; span: string; feature: boolean }) {
  const ui = useUi();
  const { lp } = useLocale();
  const titleId = `projeto-${project.slug}`;
  const phone = feature ? project.screens.find((s) => s.device === 'mobile') : undefined;
  const preview = usePreviewVideo(project.video?.src);
  const accent = { '--accent-base': project.accent.base, '--accent-detail': project.accent.detail, '--dot': project.accent.detail } as CSSProperties;
  const caseUrl = lp(`/projetos/${project.slug}`);

  return (
    <article id={`projetos-${project.slug}`} aria-labelledby={titleId} style={accent} className={cn('pcard group/card flex scroll-mt-24 flex-col overflow-hidden', span)}>
      {/* Mídia: captura real por baixo e a prévia gravada da demonstração por cima */}
      <div className={cn('pcard-media relative', feature ? 'px-5 pt-10 pb-6 sm:px-9 sm:pt-12 sm:pb-9' : 'px-5 pt-9 pb-5 sm:px-6 sm:pt-10')}>
        <span aria-hidden="true" className="pcard-route">{project.demo.url.replace(/^\/demos\//, '')}</span>
        <Link to={caseUrl} aria-label={ui.common.seeCaseStudy(project.name)} className="group relative block">
          <div className="browser frame-sel frame-sel-hover transition-transform duration-300 ease-out group-hover/card:-translate-y-1">
            <div className="browser-bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div ref={preview.boxRef} className="relative overflow-hidden">
              <ProjectCover project={project} className="rounded-none" sizes={feature ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'} />
              {project.video && <PreviewVideoLayer preview={preview} label={ui.video.layer(project.name, project.video.shows)} />}
            </div>
          </div>
          {phone && (
            <div className="phone absolute right-3 -bottom-4 hidden w-[23%] max-w-[10rem] transition-transform duration-300 ease-out group-hover/card:-translate-y-2 sm:block">
              <div>
                <Capture screen={phone} sizes="10rem" />
              </div>
            </div>
          )}
        </Link>
        {project.video && <PreviewVideoButton preview={preview} name={project.name} className="absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4" />}
      </div>

      <div className={cn('flex flex-1 flex-col', feature ? 'p-6 sm:p-8' : 'p-6')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span aria-hidden="true" className="type-label text-accent">
            {num(index + 1)} / {num(total)}
          </span>
          <span className="chip">
            <span aria-hidden="true" className="chip-dot" />
            {project.category}
          </span>
          <DemoBadge kind={project.kind} />
        </div>
        <h3 id={titleId} className={cn('mt-4 text-fg', feature ? 'type-h2' : 'type-h3')}>
          <Link to={caseUrl} className="hover:text-accent">
            {project.name}
          </Link>
        </h3>
        <p className="type-body mt-3 max-w-[56ch] text-fg-muted">{project.teaser}</p>

        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1" aria-label={ui.projects.tech}>
          {project.technologies.map((tech) => (
            <li key={tech} className="type-tag text-fg-muted">
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <div className="grid gap-2.5 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
            <DemoButton project={project} />
            <ButtonLink to={caseUrl} variant="secondary">
              {ui.common.caseStudy}
              <ArrowUpRight aria-hidden="true" className="arrow h-4 w-4" />
            </ButtonLink>
          </div>
          <QuoteLink project={project} className="type-small mt-3" />
        </div>
      </div>
    </article>
  );
}
