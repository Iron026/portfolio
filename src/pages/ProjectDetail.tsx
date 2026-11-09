/**
 * Projeto em detalhes (/projetos/:slug e /en/projects/:slug).
 *
 * Narrativa de produto, na ordem em que um potencial cliente decide:
 * 1. abertura: o que é, para quem, ações (testar, pedir algo parecido, ver funcionalidades);
 * 2. capa: captura real com a prévia gravada; descrição e controle FORA da moldura;
 * 3. para que serve: problema, objetivo e quem usa;
 * 4. tour de funcionalidades sobre as capturas reais (ProjectTour);
 * 5. como experimentar (roteiro curto);
 * 6. adaptar para o seu negócio + como pedir orçamento;
 * 7. detalhes técnicos recolhidos (tecnologias e decisões de desenvolvimento);
 * 8. outros projetos.
 * Conteúdo em src/data/projects.ts (+ .en.ts) e src/data/tour.ts.
 */
import { lazy, Suspense, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronDown, MessageSquareText } from 'lucide-react';
import { site } from '@/config/site';
import { useProject, useProjects } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ButtonLink } from '@/components/ui/Button';
import { Capture } from '@/components/ui/Capture';
import { ProjectCover } from '@/components/sections/ProjectCover';
import { DemoButton, quoteTarget } from '@/components/sections/ProjectActions';
import { PreviewPlayOverlay, PreviewVideoButton, PreviewVideoLayer, usePreviewVideo } from '@/components/ui/PreviewVideo';
import { englishMedia } from '@/data/projects';
import { cn } from '@/utils/cn';
import NotFound from './NotFound';

const num = (n: number) => String(n).padStart(2, '0');
/** Tour de funcionalidades: carregado à parte (fica abaixo da primeira tela). */
const ProjectTour = lazy(() => import('@/components/sections/ProjectTour'));

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = useProject(slug);
  const projects = useProjects();
  const ui = useUi();
  const { locale, lp } = useLocale();
  const t = ui.caseStudy;
  // Página do projeto: a prévia só toca (e só é baixada) depois do clique em "Ver em movimento"
  const preview = usePreviewVideo(project?.video?.src, { autoplay: false });
  useDocumentTitle(
    project ? t.title(project.name) : ui.notFound.title,
    project ? `${project.teaser} ${t.seoSuffix(site.name)}` : undefined,
    project?.screens[0] ? (locale === 'en' ? englishMedia(`/projetos/${project.slug}/og.jpg`) : `/projetos/${project.slug}/og.jpg`) : undefined,
  );

  if (!project) return <NotFound />;

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const phone = project.screens.find((s) => s.device === 'mobile');
  const accent = { '--accent-base': project.accent.base, '--accent-detail': project.accent.detail, '--dot': project.accent.detail } as CSSProperties;
  const quote = quoteTarget(project, locale);
  const available = project.demo.status === 'disponivel';

  return (
    <div style={accent}>
      {/* 1. Abertura com a cor da demonstração */}
      <section aria-labelledby="caso-titulo" className="case-hero tone-dark on-dark relative isolate overflow-hidden pt-28 pb-36 sm:pt-32 sm:pb-52">
        <div className="container-site">
          <nav aria-label={t.breadcrumb} className="type-small">
            <ol className="flex flex-wrap items-center gap-2 text-fg-muted">
              <li>
                <Link to={lp('/')} className="inline-block py-1 hover:text-fg">
                  {site.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to={{ pathname: lp('/'), hash: '#projetos' }} className="inline-flex items-center gap-1.5 py-1 hover:text-fg">
                  <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  {t.projects}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-fg">
                {project.name}
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <p className="type-label text-tide">{t.counter(num(index + 1), num(projects.length))}</p>
              <h1 id="caso-titulo" className="case-title mt-4 sm:mt-5">
                {project.name}
              </h1>
              <p className="type-lead mt-5 max-w-2xl text-fg-muted">{project.summary}</p>
            </div>
            <div className="grid gap-3 lg:col-span-4">
              <ul className="flex flex-wrap gap-2" aria-label={t.factsLabel}>
                <li>
                  <span className="chip border-edge-strong! text-fg!">
                    <span aria-hidden="true" className="chip-dot" />
                    {project.category}
                  </span>
                </li>
                <li>
                  <DemoBadge kind={project.kind} />
                </li>
                <li>
                  <span className="chip border-edge-strong! text-fg!">{t.sheet.screensValue}</span>
                </li>
              </ul>
              <div className="mt-2 grid gap-3 min-[460px]:grid-cols-2 lg:grid-cols-1">
                <DemoButton project={project} size="lg" />
                <ButtonLink to={quote} variant="onDarkOutline" size="lg">
                  <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                  {t.similarQuote}
                </ButtonLink>
              </div>
              {project.screens.length > 0 && (
                <a href="#caso-tour" className="group inline-flex min-h-10 items-center gap-2 text-[0.95rem] font-medium text-tide hover:text-fg">
                  <ArrowDown aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  {t.seeFeatures}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Capa: captura real com a prévia gravada. Descrição e controle ficam fora da moldura. */}
      <div className="tone-light on-light">
        <div className="container-site -mt-24 sm:-mt-40">
          <figure className="relative">
            <div className="browser frame-sel" style={{ ['--frame-color' as string]: project.accent.detail }}>
              <div className="browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="ml-2 truncate">{project.name}</span>
              </div>
              <div ref={preview.boxRef} className="relative overflow-hidden">
                <ProjectCover project={project} className="rounded-none" sizes="(min-width: 1280px) 1200px, 100vw" priority />
                {project.video && <PreviewVideoLayer preview={preview} label={ui.video.layer(project.name, project.video.shows)} />}
                {project.video && <PreviewPlayOverlay preview={preview} />}
              </div>
            </div>
            {phone && (
              <div className="phone absolute -right-2 bottom-24 hidden w-[17%] max-w-[13rem] lg:block">
                <div>
                  <Capture screen={phone} sizes="13rem" />
                </div>
              </div>
            )}
            <figcaption className="cover-caption mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:gap-4">
              {project.video && <PreviewVideoButton preview={preview} name={project.name} className="shrink-0 self-start sm:self-auto" />}
              <span className="type-small text-fg-muted">{project.video?.shows ?? project.screens[0]?.caption}</span>
            </figcaption>
          </figure>
        </div>

        {/* 3. Para que serve */}
        <section aria-labelledby="caso-proposito" className="py-16 sm:py-24">
          <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="type-label text-accent">{t.purposeLabel}</p>
              <h2 id="caso-proposito" className="type-h2 mt-4 text-fg">
                {t.purposeTitle}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              <div className="border-t-2 border-fg pt-5">
                <h3 className="type-label text-fg-muted">{t.problem}</h3>
                <p className="type-body mt-3 text-fg">{project.problem}</p>
              </div>
              <div className="border-t-2 border-[var(--accent-detail)] pt-5">
                <h3 className="type-label text-fg-muted">{t.goal}</h3>
                <p className="type-body mt-3 text-fg">{project.goal}</p>
              </div>
            </div>
            <div className="lg:col-span-12">
              <h2 className="type-label text-accent">{t.whoUses}</h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {project.needs.map((need, i) => (
                  <li key={need.who} className="panel flex gap-4 p-5 sm:p-6">
                    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-base)] font-code text-[0.8rem] text-white">
                      {num(i + 1)}
                    </span>
                    <div>
                      <p className="type-h4 text-fg">{need.who}</p>
                      <p className="type-body mt-1.5 text-fg-muted">{need.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Tour de funcionalidades sobre as capturas reais */}
      <section aria-labelledby="caso-tour-titulo" id="caso-tour" className="tone-light on-light bg-surface! py-16 sm:py-24">
        <div className="container-site">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="type-label text-accent">{t.tourLabel}</p>
              <h2 id="caso-tour-titulo" className="type-h2 mt-4 text-fg">
                {t.tourTitle}
              </h2>
            </div>
            <p className="type-body text-fg-muted lg:col-span-5">{t.tourIntro}</p>
          </div>
          <div className="mt-10 sm:mt-12">
            {project.screens.length > 0 && (
              <Suspense fallback={<div className="min-h-[34rem]" aria-busy="true" />}>
                <ProjectTour project={project} />
              </Suspense>
            )}
          </div>
          <div className="mt-12 border-t border-edge pt-8 sm:mt-14">
            <h3 className="type-label text-fg-muted">{t.allFeatures}</h3>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.features.map((feature) => (
                <li key={feature} className="type-small flex gap-2.5 text-fg">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Como experimentar */}
      {available && (
        <section aria-labelledby="caso-roteiro" className="tone-light on-light py-14 sm:py-20">
          <div className="container-site">
            <div className="tone-dark on-dark relative overflow-hidden rounded-[20px] p-6 sm:p-10" style={{ background: `linear-gradient(120deg, ${project.accent.base}, #060e1d 75%)` }}>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-xl">
                  <h2 id="caso-roteiro" className="type-h3 text-fg">
                    {t.tryTitle}
                  </h2>
                  <p className="type-small mt-2 text-fg-muted">{t.tryNote}</p>
                </div>
                <DemoButton project={project} />
              </div>
              <ol aria-labelledby="caso-roteiro" className="mt-7 grid gap-x-6 gap-y-5 border-t border-edge pt-7 sm:grid-cols-2 lg:grid-cols-4">
                {project.tryIt.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 font-code text-[0.75rem] text-tide">
                      {i + 1}
                    </span>
                    <span className="type-small text-fg">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* 6. Adaptar para o seu negócio + como pedir orçamento */}
      <section aria-labelledby="caso-cta" className={cn('tone-light on-light pb-16 sm:pb-24', available ? 'pt-2 sm:pt-4' : 'pt-16 sm:pt-24')}>
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="type-label text-accent">{t.similarLabel}</p>
            <h2 id="caso-cta" className="type-h2 mt-4 text-fg">
              {t.similarTitle}
            </h2>
            <p className="type-lead mt-4 max-w-2xl text-fg-muted">{t.similarLead}</p>
            <ul className="mt-6 grid gap-x-8 border-t border-edge sm:grid-cols-2">
              {project.adaptations.map((item) => (
                <li key={item} className="type-body flex gap-3 border-b border-edge py-3.5 text-fg">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="type-small mt-4 text-fg-muted">{t.similarNote}</p>
            <div className="mt-7">
              <ButtonLink to={quote} size="lg">
                {project.quoteCta}
                <ArrowRight aria-hidden="true" className="arrow h-5 w-5 shrink-0" />
              </ButtonLink>
            </div>
          </div>
          <div className="grid content-start gap-5 lg:col-span-5">
            <div className="rounded-[16px] bg-surface p-6 ring-1 ring-edge sm:p-7">
              <h3 id="caso-orcamento" className="type-h4 text-fg">
                {t.howToQuote}
              </h3>
              <ol aria-labelledby="caso-orcamento" className="mt-5 space-y-4">
                {t.quoteSteps(project.quoteCta).map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span aria-hidden="true" className="type-label pt-1 text-accent">
                      {num(i + 1)}
                    </span>
                    <span className="type-small text-fg">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="type-small mt-5 border-t border-edge pt-4 text-fg-muted">{t.freeQuote}</p>
            </div>
            {project.kind === 'demo' && (
              <div className="rounded-[16px] bg-tide-wash p-5 sm:p-6">
                <h3 className="type-h4 text-ink">{t.aboutProject}</h3>
                <p className="type-small mt-2 text-ink/80">{t.aboutProjectText}</p>
              </div>
            )}
          </div>
        </div>

        {/* 7. Detalhes técnicos, recolhidos: para quem quer saber como foi feito */}
        <div className="container-site mt-12 sm:mt-16">
          <details className="tech-details group rounded-[16px] border border-edge bg-surface">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <span>
                <span className="type-h4 block text-fg">{t.techTitle}</span>
                <span className="type-small block text-fg-muted">{t.techSummary}</span>
              </span>
              <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-fg-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-edge px-5 pt-5 pb-6 sm:px-6">
              <h3 className="type-label text-fg-muted">{t.sheet.tech}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
              <h3 className="type-label mt-6 text-fg-muted">{t.decisionsTitle}</h3>
              <ol className="mt-3 grid gap-x-8 gap-y-5 md:grid-cols-2">
                {project.decisions.map((d, i) => (
                  <li key={d.title} className="flex gap-3">
                    <span aria-hidden="true" className="type-label pt-1 text-accent">
                      {num(i + 1)}
                    </span>
                    <span>
                      <span className="block font-medium text-fg">{d.title}</span>
                      <span className="type-small mt-1 block text-fg-muted">{d.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        </div>
      </section>

      {/* 8. Outros projetos */}
      <nav aria-label={t.others} className="tone-light on-light border-t border-edge">
        <div className="container-site py-10">
          <p className="type-label text-fg-muted">{t.others}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { p: prev, label: `← ${t.previous}`, align: 'start' as const },
              { p: next, label: `${t.next} →`, align: 'end' as const },
            ].map(({ p, label, align }) => (
              <Link
                key={label}
                to={lp(`/projetos/${p.slug}`)}
                style={{ ['--accent-base' as string]: p.accent.base, ['--dot' as string]: p.accent.detail }}
                className={cn('case-next group grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5 rounded-[16px] border border-edge bg-surface p-4 transition-[box-shadow,border-color] hover:border-edge-strong hover:shadow-[var(--elev-hover)]', align === 'end' ? 'sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:text-right' : 'sm:grid-cols-[8.5rem_minmax(0,1fr)]')}
              >
                <span aria-hidden="true" className={cn('block overflow-hidden rounded-lg bg-[var(--accent-base)] p-1.5', align === 'end' && 'sm:order-2')}>
                  <ProjectCover project={p} className="rounded-md" sizes="9rem" />
                </span>
                <span className="min-w-0">
                  <span className="type-label block text-fg-muted">{label}</span>
                  <span className="type-h3 mt-1 block text-fg transition-colors group-hover:text-accent">{p.name}</span>
                  <span className={cn('chip mt-2', align === 'end' && 'sm:ml-auto')}>
                    <span aria-hidden="true" className="chip-dot" />
                    {p.category}
                  </span>
                  <span className="sr-only">{t.see(p.name)}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
