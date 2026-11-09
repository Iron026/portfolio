import { categoryStyle } from './categories';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { CategoryId } from '@/data/services';
import { cn } from '@/utils/cn';
import { Section, SectionHeading } from '@/components/ui/Section';
import { MotionArea } from '@/components/ui/MotionArea';
import { SERVICE_ART } from './ServiceIllustrations';
import { useProjects, useServices } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';

const num = (n: number) => String(n).padStart(2, '0');

/**
 * Cor de apoio de cada categoria, dentro do sistema da marca:
 * `--cat` para preenchimentos e `--cat-text` para textos sobre claro (AA).
 */
const CATEGORY_ORDER: CategoryId[] = ['presenca', 'gestao', 'processos'];
const CATEGORY_STYLE: Record<CategoryId, CSSProperties> = {
  presenca: categoryStyle('presenca'),
  gestao: categoryStyle('gestao'),
  processos: categoryStyle('processos'),
};

/**
 * Serviços como índice editorial, agrupado pelas três categorias (cor própria).
 * Cada serviço é uma linha: nome, benefício, como funciona, pedido de orçamento
 * com o serviço já escolhido, exemplos sob demanda, projetos relacionados e a
 * ilustração animada (decorativa). A moldura de seleção aparece ao apontar ou focar.
 */
export function Services() {
  const { services, categories } = useServices();
  const projects = useProjects();
  const ui = useUi();
  const { lp } = useLocale();
  const home = lp('/');

  return (
    <Section id="servicos" labelledBy="servicos-title">
      <SectionHeading
        id="servicos-title"
        index="02"
        label={ui.sections.services.label}
        title={ui.sections.services.title}
        intro={ui.sections.services.intro}
        aside={
          <p className="type-small mt-3 text-fg-muted">
            {ui.sections.services.unsure}{' '}
            <Link to={{ pathname: home, search: '?servico=outro', hash: '#contato' }} className="font-semibold text-accent underline decoration-current/35 underline-offset-4 hover:decoration-current">
              {ui.sections.services.describe}
            </Link>
            .
          </p>
        }
      />

      {/* Índice de serviços: agrupado por categoria, uma linha por serviço */}
      <div className="mt-10 grid gap-10 sm:mt-12 lg:gap-8">
        {CATEGORY_ORDER.map((category) => {
          const group = services.filter((s) => s.category === category);
          if (!group.length) return null;
          return (
            <div key={category} style={CATEGORY_STYLE[category]} className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
              <div className="lg:pt-7">
                <p className="type-label flex items-center gap-2.5 text-[var(--cat-text)]">
                  <span aria-hidden="true" className="h-2.5 w-2.5 bg-[var(--cat)]" />
                  {categories[category]}
                </p>
                <p className="type-small mt-2 max-w-[28ch] text-fg-muted max-lg:hidden">{ui.services.categoryIntro[category]}</p>
              </div>
              <ul className="svc-list">
                {group.map((service) => {
                  const i = services.indexOf(service);
                  return (
                    <li key={service.id} className="min-w-0">
                      <article
                        id={`servico-${service.id}`}
                        aria-labelledby={`servico-${service.id}-titulo`}
                        className="svc-row group/svc frame-sel frame-sel-hover grid scroll-mt-24 gap-5 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-8 md:items-center"
                      >
                        <div className="min-w-0 md:order-1">
                          <div className="flex items-baseline gap-3">
                            <span aria-hidden="true" className="type-label font-semibold text-[var(--cat-text)]">
                              {num(i + 1)}
                            </span>
                            <h3 id={`servico-${service.id}-titulo`} className="type-h3 text-fg">
                              {service.name}
                              <span className="sr-only"> ({categories[service.category]})</span>
                            </h3>
                          </div>
                          <p className="type-body mt-1.5 max-w-[60ch] text-fg">{service.benefit}</p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-0">
                            <Link
                              to={{ pathname: home, search: `?servico=${service.id}`, hash: '#contato' }}
                              className="group inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-semibold text-[var(--cat-text)] hover:underline"
                            >
                              {service.cta}
                              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <details className="group/apps">
                              <summary className="type-small inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-medium text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
                                <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/apps:rotate-180" />
                                {ui.services.details}
                              </summary>
                              <p className="type-small mt-1 max-w-[60ch] text-fg-muted">{service.description}</p>
                              <ul className="type-small mt-2 space-y-1 text-fg">
                                {service.applications.map((item) => (
                                  <li key={item} className="flex gap-2.5">
                                    <span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-[var(--cat)]" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </details>
                            {service.proof.length > 0 && (
                            <p className="type-small flex flex-wrap items-center gap-1.5 text-fg-muted">
                              <span className="mr-0.5">{ui.services.inPractice}</span>
                              {service.proof.map((slug) => {
                                const project = projects.find((p) => p.slug === slug);
                                if (!project) return null;
                                return (
                                  <Link
                                    key={slug}
                                    to={lp(`/projetos/${slug}`)}
                                    className="type-tag inline-flex min-h-8 items-center gap-1 rounded-md bg-surface-2 px-2 text-fg transition-shadow hover:shadow-[inset_0_0_0_1px_var(--cat-text)]"
                                  >
                                    {project.name}
                                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-[var(--cat-text)]" />
                                  </Link>
                                );
                              })}
                            </p>
                            )}
                          </div>
                        </div>
                        {SERVICE_ART[service.id] && (
                          <MotionArea
                            aria-hidden="true"
                            className={cn(
                              'svc-art relative order-first h-28 overflow-hidden rounded-[12px] ring-1 md:order-2 md:self-start',
                              SERVICE_ART[service.id].tone === 'dark' ? 'bg-night ring-white/5' : 'bg-ice ring-ice-2',
                            )}
                          >
                            {(active) => SERVICE_ART[service.id].render(active)}
                          </MotionArea>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
