/**
 * Estudo de caso de um projeto (/projetos/:slug).
 * Todo o conteúdo vem de src/data/projects.ts — para editar textos,
 * decisões ou capturas, altere o projeto lá.
 */
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { site } from '@/config/site';
import { getProject, projects, type Screen } from '@/data/projects';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Capture } from '@/components/ui/Capture';
import { ProjectCoverWithPreview } from '@/components/sections/ProjectCover';
import { DemoButton, QuoteLink, quoteTarget } from '@/components/sections/ProjectActions';
import { cn } from '@/utils/cn';
import NotFound from './NotFound';

const num = (n: number) => String(n).padStart(2, '0');

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProject(slug);
  useDocumentTitle(
    project ? `${project.name}: estudo de caso` : 'Projeto não encontrado',
    project ? `${project.teaser} Projeto demonstrativo da ${site.name}.` : undefined,
    project?.screens[0] ? `/projetos/${project.slug}/og.jpg` : undefined,
  );

  if (!project) return <NotFound />;

  const index = projects.indexOf(project);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const gallery = project.screens.slice(1);
  const desktopShots = gallery.filter((s) => s.device === 'desktop');
  const phoneShots = gallery.filter((s) => s.device === 'mobile');

  return (
    <>
      {/* 1. Abertura */}
      <section aria-labelledby="caso-titulo" className="on-dark bg-night pt-28 pb-40 text-white sm:pt-32 sm:pb-48">
        <div className="container-site">
          <nav aria-label="Trilha de navegação" className="type-small">
            <ol className="flex flex-wrap items-center gap-2 text-mist">
              <li>
                <Link to="/" className="inline-block py-1 hover:text-white">
                  {site.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to={{ pathname: '/', hash: '#projetos' }} className="inline-flex items-center gap-1.5 py-1 hover:text-white">
                  <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  Projetos
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {project.name}
              </li>
            </ol>
          </nav>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <p className="type-label flex flex-wrap items-center gap-3 text-mist">
                <span className="text-tide">Estudo de caso {num(index + 1)}/{num(projects.length)}</span>
                <span aria-hidden="true" className="h-px w-6 bg-ink-3" />
                {project.category}
              </p>
              <h1 id="caso-titulo" className="type-h1 mt-5">
                {project.name}
              </h1>
              <p className="type-lead mt-6 max-w-2xl text-mist">{project.summary}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <DemoButton project={project} size="lg" tone="dark" />
                {project.extra && (
                  <ButtonAnchor href={project.extra.url} variant="onDarkOutline" size="lg" download>
                    {project.extra.label}
                  </ButtonAnchor>
                )}
              </div>
              <QuoteLink project={project} tone="dark" className="mt-4" />
            </div>

            {/* Ficha técnica */}
            <dl className="type-small self-end border-t border-white/15 lg:col-span-4">
              {[
                ['Tipo', <DemoBadge key="b" kind={project.kind} tone="dark" />],
                ['Categoria', project.category],
                ['Tecnologias', project.technologies.join(' · ')],
                [
                  'Demonstração',
                  project.demo.status === 'disponivel' ? (
                    <Link key="d" to={project.demo.url} className="type-tag text-tide underline decoration-tide/40 underline-offset-4 hover:text-tide-bright">
                      {project.demo.url}
                    </Link>
                  ) : (
                    'Em produção'
                  ),
                ],
              ].map(([term, value]) => (
                <div key={String(term)} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-white/15 py-3">
                  <dt className="type-label text-mist">{term}</dt>
                  <dd className="text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 2. Imagem principal, sobreposta à abertura */}
      <div className="bg-paper">
        <div className="container-site -mt-28 sm:-mt-36">
          <figure>
            <div className="frame-sel rounded-lg bg-card p-2 shadow-lift sm:p-3">
              <ProjectCoverWithPreview project={project} sizes="(min-width: 1280px) 1200px, 100vw" priority />
            </div>
            {project.screens[0] && (
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-slate">
                <span className="type-small">{project.screens[0].caption}</span>
                <span className="type-tag">Captura real · {project.screens[0].route}</span>
              </figcaption>
            )}
          </figure>
        </div>

        {/* 3. Problema e objetivo */}
        <section aria-label="Contexto do projeto" className="py-20 sm:py-24">
          <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="border-t border-ink pt-6">
              <p className="type-label text-tide-deep">Problema</p>
              <h2 className="type-h3 mt-4">O que este projeto procura resolver</h2>
              <p className="type-body mt-4 text-slate">{project.problem}</p>
            </div>
            <div className="border-t border-ink pt-6">
              <p className="type-label text-tide-deep">Objetivo</p>
              <h2 className="type-h3 mt-4">O que a solução precisava entregar</h2>
              <p className="type-body mt-4 text-slate">{project.goal}</p>
            </div>
          </div>
          <div className="container-site mt-14 sm:mt-16">
            <h2 className="type-label text-tide-deep">Quem usa e o que resolve</h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {project.needs.map((need) => (
                <li key={need.who} className="rounded-xl bg-card p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
                  <p className="type-h4">{need.who}</p>
                  <p className="type-body mt-2 text-slate">{need.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* 4. Funcionalidades */}
      <section aria-labelledby="caso-func" className="bg-card py-20 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="type-label text-tide-deep">Funcionalidades</p>
            <h2 id="caso-func" className="type-h2 mt-4">
              O que dá para fazer
            </h2>
            <p className="type-body mt-4 text-slate">Tudo o que está listado pode ser testado na demonstração.</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
            {project.features.map((feature) => (
              <li key={feature} className="type-body flex gap-3 border-b border-line py-4">
                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-tide-deep" strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>
          {project.demo.status === 'disponivel' && (
            <div className="rounded-xl bg-paper p-6 sm:p-8 lg:col-span-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 id="caso-roteiro" className="type-h3">
                    Como experimentar a demonstração
                  </h3>
                  <p className="type-small mt-2 text-slate">Um roteiro curto, na ordem em que faz sentido testar. Os dados são fictícios e nada é enviado.</p>
                </div>
                <DemoButton project={project} />
              </div>
              <ol aria-labelledby="caso-roteiro" className="mt-6 grid gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
                {project.tryIt.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span aria-hidden="true" className="type-label pt-1 text-tide-deep">
                      {num(i + 1)}
                    </span>
                    <span className="type-small text-ink">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* 5. Decisões de implementação */}
      <section aria-labelledby="caso-decisoes" className="on-dark bg-night py-20 text-white sm:py-24">
        <div className="container-site">
          <p className="type-label text-tide">Bastidores</p>
          <h2 id="caso-decisoes" className="type-h2 mt-4 max-w-3xl">
            Cuidados que fazem diferença no uso
          </h2>
          <p className="type-body mt-4 max-w-2xl text-mist">Decisões de desenvolvimento tomadas para a solução funcionar bem no dia a dia, e não só parecer pronta.</p>
          <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {project.decisions.map((d, i) => (
              <li key={d.title} className="border-t border-white/15 pt-6">
                <span aria-hidden="true" className="type-label text-tide">
                  {num(i + 1)}
                </span>
                <h3 className="type-h4 mt-3">{d.title}</h3>
                <p className="type-body mt-2 text-mist">{d.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Capturas da interface */}
      {gallery.length > 0 && (
        <section aria-labelledby="caso-capturas" className="bg-paper py-20 sm:py-24">
          <div className="container-site">
            <p className="type-label text-tide-deep">Interface</p>
            <h2 id="caso-capturas" className="type-h2 mt-4">
              Capturas reais da demonstração
            </h2>
            <p className="type-body mt-4 max-w-2xl text-slate">
              Telas registradas da própria demonstração, com dados fictícios. Toque em uma imagem para abrir em tamanho original.
            </p>
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
      <section aria-labelledby="caso-cta" className="bg-card py-20 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="type-label text-tide-deep">Projeto semelhante</p>
            <h2 id="caso-cta" className="type-h2 mt-4">
              Quer algo parecido para o seu negócio?
            </h2>
            <p className="type-lead mt-5 max-w-2xl text-slate">
              A demonstração é um ponto de partida. Uma versão para o seu negócio parte do que você usa hoje e pode incluir, por exemplo:
            </p>
            <ul className="mt-6 grid gap-x-8 border-t border-line sm:grid-cols-2">
              {project.adaptations.map((item) => (
                <li key={item} className="type-body flex gap-3 border-b border-line py-4">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-tide-deep" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="type-small mt-4 text-slate">O que entra em cada caso é combinado na proposta, de acordo com a sua necessidade e o seu orçamento.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={quoteTarget(project)}
                className="group inline-flex min-h-12 items-center gap-2 rounded-lg bg-ink px-6 py-3 font-semibold text-white transition-colors hover:bg-ink-2"
              >
                {project.quoteCta}
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
              {project.demo.status === 'disponivel' && !/^https?:/.test(project.demo.url) && (
                <ButtonLink to={project.demo.url} variant="secondary" size="lg">
                  Testar demonstração
                </ButtonLink>
              )}
            </div>
          </div>
          <div className="grid content-start gap-6 lg:col-span-5">
            <div className="rounded-xl bg-paper p-6 sm:p-8">
              <h3 id="caso-orcamento" className="type-h4">
                Como pedir um orçamento
              </h3>
              <ol aria-labelledby="caso-orcamento" className="mt-5 space-y-4">
                {[
                  `Toque em "${project.quoteCta}". O formulário abre com o serviço escolhido e este projeto como referência.`,
                  'Conte como isso funciona hoje no seu negócio e o que precisa mudar.',
                  'Você recebe perguntas, se necessário, e uma proposta com escopo, prazo e valor antes de qualquer desenvolvimento.',
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span aria-hidden="true" className="type-label pt-1 text-tide-deep">
                      {num(i + 1)}
                    </span>
                    <span className="type-small text-ink">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="type-small mt-5 border-t border-line pt-4 text-slate">O orçamento é gratuito e sem compromisso.</p>
            </div>
            {project.kind === 'demo' && (
              <div className="rounded-xl bg-tide-wash p-6">
                <h3 className="type-h4">Sobre este projeto</h3>
                <p className="type-small mt-2 text-ink/80">
                  Este é um projeto demonstrativo autoral. A empresa, os produtos e os dados são fictícios; as funcionalidades são reais e podem ser testadas na demonstração. Nenhum resultado de cliente é apresentado aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. Navegação entre estudos de caso */}
      <nav aria-label="Outros estudos de caso" className="border-t border-line bg-paper">
        <div className="container-site grid sm:grid-cols-2">
          {[
            { p: prev, label: '← Anterior', align: 'start' as const },
            { p: next, label: 'Próximo →', align: 'end' as const },
          ].map(({ p, label, align }) => (
            <Link
              key={label}
              to={`/projetos/${p.slug}`}
              className={cn(
                'group flex flex-col gap-1 border-line py-8',
                align === 'start' ? 'sm:border-r sm:pr-8' : 'border-t sm:items-end sm:border-t-0 sm:pl-8 sm:text-right',
              )}
            >
              <span className="type-label text-slate">{label}</span>
              <span className="type-h3 transition-colors group-hover:text-tide-deep">{p.name}</span>
              <span className="type-small text-slate">{p.category}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-tide-deep underline decoration-tide-deep/30 underline-offset-4 group-hover:decoration-tide-deep">
                Ver {p.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function Shot({ shot }: { shot: Screen }) {
  const large = shot.device === 'mobile' ? `${shot.src}-780.webp` : `${shot.src}-1600.webp`;
  return (
    <figure>
      <a
        href={large}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-lg bg-card p-1.5 shadow-soft"
      >
        <span className="frame-sel frame-sel-hover block">
          <Capture screen={shot} sizes={shot.device === 'mobile' ? '(min-width: 1024px) 18vw, 45vw' : '(min-width: 1024px) 70vw, 100vw'} className="rounded-md" />
        </span>
        <span className="sr-only">(abre a imagem em tamanho original em nova aba)</span>
      </a>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="type-small text-ink">{shot.caption}</span>
        <span className="type-tag text-slate">Captura · {shot.route}</span>
      </figcaption>
    </figure>
  );
}
