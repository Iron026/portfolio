/**
 * Estudo de caso de um projeto (/projetos/:slug e /en/projects/:slug).
 * Todo o conteúdo vem de src/data/projects.ts (português) e projects.en.ts
 * (inglês); a estrutura é a mesma para os cinco projetos, e a cor de cada
 * demonstração (`accent`) dá a identidade da abertura e dos destaques.
 */
import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, MessageSquareText } from 'lucide-react';
import { site } from '@/config/site';
import { type Screen } from '@/data/projects';
import { useProject, useProjects } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ButtonLink } from '@/components/ui/Button';
import { Capture } from '@/components/ui/Capture';
import { ProjectCover, ProjectCoverWithPreview } from '@/components/sections/ProjectCover';
import { DemoButton, quoteTarget } from '@/components/sections/ProjectActions';
import { cn } from '@/utils/cn';
import { englishMedia } from '@/data/projects';
import NotFound from './NotFound';

const num = (n: number) => String(n).padStart(2, '0');

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = useProject(slug);
  const projects = useProjects();
  const ui = useUi();
  const { locale, lp } = useLocale();
  const t = ui.caseStudy;
  useDocumentTitle(
    project ? t.title(project.name) : ui.notFound.title,
    project ? `${project.teaser} ${t.seoSuffix(site.name)}` : undefined,
    project?.screens[0] ? (locale === 'en' ? englishMedia(`/projetos/${project.slug}/og.jpg`) : `/projetos/${project.slug}/og.jpg`) : undefined,
  );

  if (!project) return <NotFound />;

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const gallery = project.screens.slice(1);
  const desktopShots = gallery.filter((s) => s.device === 'desktop');
  const phoneShots = project.screens.filter((s) => s.device === 'mobile');
  const accent = { '--accent-base': project.accent.base, '--accent-detail': project.accent.detail, '--dot': project.accent.detail } as CSSProperties;
  const quote = quoteTarget(project, locale);

  return (
    <div style={accent}>
      {/* 1. Abertura com a cor da demonstração */}
      <section aria-labelledby="caso-titulo" className="case-hero tone-dark on-dark relative isolate overflow-hidden pt-28 pb-44 sm:pt-32 sm:pb-56">
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

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="type-label text-tide">{t.counter(num(index + 1), num(projects.length))}</span>
                <span className="chip border-edge-strong! text-fg!">
                  <span aria-hidden="true" className="chip-dot" />
                  {project.category}
                </span>
                <DemoBadge kind={project.kind} />
              </div>
              <h1 id="caso-titulo" className="case-title mt-6">
                {project.name}
              </h1>
              <p className="type-lead mt-6 max-w-2xl text-fg-muted">{project.summary}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <DemoButton project={project} size="lg" />
                <ButtonLink to={quote} variant="onDarkOutline" size="lg">
                  <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                  {t.similarQuote}
                </ButtonLink>
              </div>
            </div>

            {/* Ficha técnica */}
            <dl className="type-small self-end rounded-[14px] border border-edge bg-white/[0.03] px-5 lg:col-span-5">
              {[
                [t.sheet.type, <DemoBadge key="b" kind={project.kind} />],
                [t.sheet.category, project.category],
                [t.sheet.tech, project.technologies.join(' · ')],
                [t.sheet.screens, t.sheet.screensValue],
                [
                  t.sheet.demo,
                  project.demo.status === 'disponivel' ? (
                    <Link key="d" to={lp(project.demo.url)} className="type-tag text-tide underline decoration-tide/40 underline-offset-4 hover:text-tide-bright">
                      {lp(project.demo.url)}
                    </Link>
                  ) : (
                    t.sheet.inProduction
                  ),
                ],
              ].map(([term, value], i, all) => (
                <div key={String(term)} className={cn('grid grid-cols-[7.5rem_1fr] gap-4 py-3.5', i < all.length - 1 && 'border-b border-edge')}>
                  <dt className="type-label pt-0.5 text-fg-muted">{term}</dt>
                  <dd className="text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 2. Captura principal, sobreposta à abertura */}
      <div className="tone-light on-light">
        <div className="container-site -mt-32 sm:-mt-44">
          <figure className="relative">
            <div className="browser frame-sel" style={{ ['--frame-color' as string]: project.accent.detail }}>
              <div className="browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="ml-2 truncate">{project.screens[0]?.route ? lp(project.screens[0].route) : ''}</span>
              </div>
              <ProjectCoverWithPreview project={project} sizes="(min-width: 1280px) 1200px, 100vw" priority />
            </div>
            {phoneShots[0] && (
              <div className="phone absolute -right-2 bottom-16 hidden w-[17%] max-w-[13rem] lg:block">
                <div>
                  <Capture screen={phoneShots[0]} sizes="13rem" />
                </div>
              </div>
            )}
            {project.screens[0] && (
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-fg-muted">
                <span className="type-small">{project.screens[0].caption}</span>
                <span className="type-tag">
                  {t.realCapture} · {lp(project.screens[0].route)}
                </span>
              </figcaption>
            )}
          </figure>
        </div>

        {/* 3. Problema, objetivo e quem usa */}
        <section aria-label={`${t.problem} · ${t.goal}`} className="py-20 sm:py-24">
          <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="border-t-2 border-fg pt-6">
              <p className="type-label text-accent">{t.problem}</p>
              <h2 className="type-h3 mt-4 text-fg">{t.problemTitle}</h2>
              <p className="type-body mt-4 text-fg-muted">{project.problem}</p>
            </div>
            <div className="border-t-2 border-[var(--accent-detail)] pt-6">
              <p className="type-label text-accent">{t.goal}</p>
              <h2 className="type-h3 mt-4 text-fg">{t.goalTitle}</h2>
              <p className="type-body mt-4 text-fg-muted">{project.goal}</p>
            </div>
          </div>
          <div className="container-site mt-14 sm:mt-16">
            <h2 className="type-label text-accent">{t.whoUses}</h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {project.needs.map((need, i) => (
                <li key={need.who} className="panel flex gap-4 p-6">
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-base)] font-code text-[0.8rem] text-white">
                    {num(i + 1)}
                  </span>
                  <div>
                    <p className="type-h4 text-fg">{need.who}</p>
                    <p className="type-body mt-2 text-fg-muted">{need.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* 4. Funcionalidades e roteiro de teste */}
      <section aria-labelledby="caso-func" className="tone-light on-light bg-surface! py-20 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="type-label text-accent">{t.features}</p>
            <h2 id="caso-func" className="type-h2 mt-4 text-fg">
              {t.featuresTitle}
            </h2>
            <p className="type-body mt-4 text-fg-muted">{t.featuresNote}</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
            {project.features.map((feature) => (
              <li key={feature} className="type-body flex gap-3 border-b border-edge py-4 text-fg">
                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>
          {project.demo.status === 'disponivel' && (
            <div className="tone-dark on-dark relative overflow-hidden rounded-[18px] p-6 sm:p-8 lg:col-span-12" style={{ background: `linear-gradient(120deg, ${project.accent.base}, #060e1d 75%)` }}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 id="caso-roteiro" className="type-h3 text-fg">
                    {t.tryTitle}
                  </h3>
                  <p className="type-small mt-2 text-fg-muted">{t.tryNote}</p>
                </div>
                <DemoButton project={project} />
              </div>
              <ol aria-labelledby="caso-roteiro" className="mt-6 grid gap-x-6 gap-y-5 border-t border-edge pt-6 sm:grid-cols-2 lg:grid-cols-4">
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
          )}
        </div>
      </section>

      {/* 5. Cuidados de implementação */}
      <section aria-labelledby="caso-decisoes" className="tone-dark on-dark py-20 sm:py-24">
        <div className="container-site">
          <p className="type-label text-tide">{t.decisionsLabel}</p>
          <h2 id="caso-decisoes" className="type-h2 mt-4 max-w-3xl text-fg">
            {t.decisionsTitle}
          </h2>
          <p className="type-body mt-4 max-w-2xl text-fg-muted">{t.decisionsIntro}</p>
          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {project.decisions.map((d, i) => (
              <li key={d.title} className="rounded-[14px] border border-edge bg-white/[0.02] p-6 sm:p-7">
                <span aria-hidden="true" className="type-label text-[var(--accent-detail)]">
                  {num(i + 1)}
                </span>
                <h3 className="type-h4 mt-3 text-fg">{d.title}</h3>
                <p className="type-body mt-2 text-fg-muted">{d.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Capturas da interface */}
      {(desktopShots.length > 0 || phoneShots.length > 0) && (
        <section aria-labelledby="caso-capturas" className="tone-light on-light py-20 sm:py-24">
          <div className="container-site">
            <p className="type-label text-accent">{t.galleryLabel}</p>
            <h2 id="caso-capturas" className="type-h2 mt-4 text-fg">
              {t.galleryTitle}
            </h2>
            <p className="type-body mt-4 max-w-2xl text-fg-muted">{t.galleryIntro}</p>
            <div className={cn('mt-12 grid gap-8', phoneShots.length > 0 && 'lg:grid-cols-12')}>
              <div className={cn('grid gap-8', phoneShots.length > 0 && 'lg:col-span-9')}>
                {desktopShots.map((shot) => (
                  <Shot key={shot.src} shot={shot} />
                ))}
              </div>
              {phoneShots.length > 0 && (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1 lg:content-start">
                  {phoneShots.map((shot) => (
                    <Shot key={shot.src} shot={shot} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 7. Adaptações + como pedir orçamento + transparência */}
      <section aria-labelledby="caso-cta" className="tone-light on-light bg-surface! py-20 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="type-label text-accent">{t.similarLabel}</p>
            <h2 id="caso-cta" className="type-h2 mt-4 text-fg">
              {t.similarTitle}
            </h2>
            <p className="type-lead mt-5 max-w-2xl text-fg-muted">{t.similarLead}</p>
            <ul className="mt-6 grid gap-x-8 border-t border-edge sm:grid-cols-2">
              {project.adaptations.map((item) => (
                <li key={item} className="type-body flex gap-3 border-b border-edge py-4 text-fg">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="type-small mt-4 text-fg-muted">{t.similarNote}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={quote} size="lg">
                {project.quoteCta}
                <ArrowRight aria-hidden="true" className="arrow h-5 w-5 shrink-0" />
              </ButtonLink>
              {project.demo.status === 'disponivel' && !/^https?:/.test(project.demo.url) && (
                <ButtonLink to={lp(project.demo.url)} variant="secondary" size="lg">
                  {ui.common.tryDemo}
                </ButtonLink>
              )}
            </div>
          </div>
          <div className="grid content-start gap-6 lg:col-span-5">
            <div className="rounded-[16px] bg-surface-2 p-6 ring-1 ring-edge sm:p-8">
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
              <div className="rounded-[16px] bg-tide-wash p-6">
                <h3 className="type-h4 text-ink">{t.aboutProject}</h3>
                <p className="type-small mt-2 text-ink/80">{t.aboutProjectText}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. Navegação entre estudos de caso */}
      <nav aria-label={t.others} className="tone-light on-light border-t border-edge">
        <div className="container-site grid gap-4 py-10 sm:grid-cols-2">
          {[
            { p: prev, label: `← ${t.previous}`, align: 'start' as const },
            { p: next, label: `${t.next} →`, align: 'end' as const },
          ].map(({ p, label, align }) => (
            <Link
              key={label}
              to={lp(`/projetos/${p.slug}`)}
              style={{ ['--accent-base' as string]: p.accent.base, ['--dot' as string]: p.accent.detail }}
              className={cn('case-next group grid grid-cols-[6.5rem_1fr] items-center gap-5 rounded-[16px] border border-edge bg-surface p-4 transition-[box-shadow,border-color] hover:border-edge-strong hover:shadow-[var(--elev-hover)] sm:grid-cols-[8.5rem_1fr]', align === 'end' && 'sm:text-right')}
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
      </nav>
    </div>
  );
}

function Shot({ shot }: { shot: Screen }) {
  const ui = useUi();
  const { lp } = useLocale();
  const large = shot.device === 'mobile' ? `${shot.src}-780.webp` : `${shot.src}-1600.webp`;
  const mobile = shot.device === 'mobile';
  return (
    <figure>
      <a href={large} target="_blank" rel="noopener noreferrer" className={cn('group block', mobile ? 'phone' : 'browser')}>
        {!mobile && (
          <span className="browser-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="ml-2 truncate">{lp(shot.route)}</span>
          </span>
        )}
        <span className="frame-sel frame-sel-hover block">
          <Capture screen={shot} sizes={mobile ? '(min-width: 1024px) 18vw, 45vw' : '(min-width: 1024px) 70vw, 100vw'} />
        </span>
        <span className="sr-only">{ui.caseStudy.openOriginal}</span>
      </a>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="type-small text-fg">{shot.caption}</span>
        <span className="type-tag text-fg-muted">
          {ui.video.capture} · {lp(shot.route)}
        </span>
      </figcaption>
    </figure>
  );
}
