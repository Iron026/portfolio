/**
 * Vitrine de projetos — "índice selecionador + palcos".
 *
 * - Os cinco projetos ficam sempre visíveis: nada de carrossel.
 * - No computador, um índice fixo à esquerda lista os cinco; a moldura de seleção
 *   da marca acompanha o projeto que está no centro da tela, e cada item leva direto
 *   ao palco correspondente.
 * - Cada palco mostra capturas reais grandes (computador em moldura de navegador e
 *   celular sobreposto, alternando o lado), na cor da identidade da demonstração,
 *   com a prévia gravada por cima e as ações comerciais abaixo.
 * - No celular, o índice vira uma lista de atalhos numerados no topo da seção.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
import { cn } from '@/utils/cn';

const num = (n: number) => String(n).padStart(2, '0');
const stageId = (slug: string) => `projetos-${slug}`;

/** Projeto cujo palco cruza a faixa central da tela (para o índice). */
function useActiveStage(slugs: string[]) {
  const [active, setActive] = useState(slugs[0]);
  useEffect(() => {
    const els = slugs.map((s) => document.getElementById(stageId(s))).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id.replace(/^projetos-/, ''));
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.01] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slugs]);
  return active;
}

function ProjectIndex({ projects, active }: { projects: Project[]; active: string }) {
  const ui = useUi();
  const list = useRef<HTMLOListElement>(null);
  const [box, setBox] = useState<{ y: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = list.current?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
      if (el) setBox({ y: el.offsetTop, h: el.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (list.current) ro.observe(list.current);
    return () => ro.disconnect();
  }, [active]);

  return (
    <nav aria-label={ui.projects.index} className="max-lg:hidden">
      <div className="sticky top-28">
        <p className="type-label text-fg-muted">{ui.projects.indexTitle(projects.length)}</p>
        <ol ref={list} className="relative mt-4 border-l border-edge">
          {box && <span aria-hidden="true" className="index-sel" style={{ transform: `translateY(${box.y}px)`, height: box.h }} />}
          {projects.map((p, i) => {
            const on = p.slug === active;
            return (
              <li key={p.slug} data-slug={p.slug}>
                <a
                  href={`#${stageId(p.slug)}`}
                  aria-current={on ? 'true' : undefined}
                  style={{ ['--dot' as string]: p.accent.detail }}
                  className={cn('index-item group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-1 py-3 pr-3 pl-4 transition-colors', on ? 'text-fg' : 'text-fg-muted hover:text-fg')}
                >
                  <span className="type-label pt-1 text-accent">{num(i + 1)}</span>
                  <span>
                    <span className="block font-title text-[1.1rem] leading-tight font-semibold tracking-[-0.02em]">{p.name}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[0.82rem]">
                      <span aria-hidden="true" className="chip-dot" />
                      {p.category}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export function Projects() {
  const projects = useProjects();
  const ui = useUi();
  const { lp } = useLocale();
  const home = lp('/');
  const slugs = useRef(projects.map((p) => p.slug)).current;
  const active = useActiveStage(slugs);

  return (
    <Section id="projetos" labelledBy="projetos-title" className="bg-surface-2!">
      <SectionHeading id="projetos-title" index="01" label={ui.sections.projects.label} title={ui.sections.projects.title} intro={ui.sections.projects.intro(projects.length)} />

      {/* Celular e tablet: atalhos numerados para os cinco projetos */}
      <nav aria-label={ui.projects.index} className="mt-8 lg:hidden">
        <ol className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <a href={`#${stageId(p.slug)}`} className="flex min-h-11 items-center gap-3 rounded-[10px] border border-edge bg-surface px-3 py-2 text-fg hover:border-edge-strong" style={{ ['--dot' as string]: p.accent.detail }}>
                <span className="type-label text-accent">{num(i + 1)}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                <span aria-hidden="true" className="chip-dot" />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 grid gap-12 sm:mt-14 lg:mt-16 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14">
        <ProjectIndex projects={projects} active={active} />
        <div className="grid gap-14 sm:gap-20 lg:gap-28">
          {projects.map((project, i) => (
            <ProjectStage key={project.slug} project={project} index={i} total={projects.length} />
          ))}
        </div>
      </div>

      {/* Faixa final: chamada real para o formulário */}
      <div className="tone-dark on-dark relative mt-16 flex flex-col justify-between gap-6 overflow-hidden rounded-[16px] p-6 sm:mt-20 sm:flex-row sm:items-center sm:p-8">
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
    </Section>
  );
}

function ProjectStage({ project, index, total }: { project: Project; index: number; total: number }) {
  const ui = useUi();
  const { lp } = useLocale();
  const titleId = `projeto-${project.slug}`;
  const phone = project.screens.find((s) => s.device === 'mobile');
  const preview = usePreviewVideo(project.video?.src);
  const accent = { '--accent-base': project.accent.base, '--accent-detail': project.accent.detail, '--dot': project.accent.detail } as CSSProperties;
  const detailsUrl = lp(`/projetos/${project.slug}`);
  const flip = index % 2 === 1;

  return (
    <article id={stageId(project.slug)} aria-labelledby={titleId} style={accent} className="stage group/card scroll-mt-28">
      {/* Palco: captura real do computador, celular sobreposto e prévia gravada da demonstração */}
      <div className={cn('stage-media relative', flip && 'stage-media--flip')}>
        <Link to={detailsUrl} aria-label={ui.common.seeCaseStudy(project.name)} className="group relative block">
          <div className="browser frame-sel frame-sel-hover transition-transform duration-300 ease-out group-hover/card:-translate-y-1">
            <div className="browser-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span className="ml-2 truncate">{project.name}</span>
            </div>
            <div ref={preview.boxRef} className="relative overflow-hidden">
              <ProjectCover project={project} className="rounded-none" sizes="(min-width: 1024px) 60vw, 100vw" priority={index === 0} />
              {project.video && <PreviewVideoLayer preview={preview} label={ui.video.layer(project.name, project.video.shows)} />}
            </div>
          </div>
          {phone && (
            <div className={cn('stage-phone phone absolute w-[26%] max-w-[11rem] transition-transform duration-300 ease-out group-hover/card:-translate-y-2', flip ? 'left-[3%]' : 'right-[3%]')}>
              <div>
                <Capture screen={phone} sizes="11rem" />
              </div>
            </div>
          )}
        </Link>
        {project.video && <PreviewVideoButton preview={preview} name={project.name} className={cn('absolute z-10 bottom-3 sm:bottom-4', flip ? 'right-3 sm:right-4' : 'left-3 sm:left-4')} />}
      </div>

      {/* Informações comerciais */}
      <div className="mt-5 grid gap-5 sm:mt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10">
        <div className="min-w-0">
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
          <h3 id={titleId} className="type-h2 mt-3 text-fg">
            <Link to={detailsUrl} className="hover:text-accent">
              {project.name}
            </Link>
          </h3>
          <p className="type-body mt-2 max-w-[58ch] text-fg-muted">{project.teaser}</p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 max-sm:hidden" aria-label={ui.projects.tech}>
            {project.technologies.map((tech) => (
              <li key={tech} className="type-tag text-fg-muted">
                {tech}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-2 md:min-w-[15rem]">
          <div className="grid gap-2.5 min-[400px]:grid-cols-2 md:grid-cols-1">
            <DemoButton project={project} />
            <ButtonLink to={detailsUrl} variant="secondary">
              {ui.common.caseStudy}
              <ArrowRight aria-hidden="true" className="arrow h-4 w-4" />
            </ButtonLink>
          </div>
          <QuoteLink project={project} className="type-small" />
        </div>
      </div>
    </article>
  );
}
