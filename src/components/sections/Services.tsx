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
const CATEGORY_STYLE: Record<CategoryId, CSSProperties> = {
  presenca: { ['--cat' as string]: '#22c3b0', ['--cat-text' as string]: '#0a7568' },
  gestao: { ['--cat' as string]: '#5b84ff', ['--cat-text' as string]: '#2b4fb8' },
  processos: { ['--cat' as string]: '#f2a93b', ['--cat-text' as string]: '#8c5a07' },
};

/**
 * Serviços em cartões: ilustração animada (decorativa) com a cor da categoria,
 * benefício em destaque, como funciona, exemplos sob demanda, projetos que
 * provam o serviço e o caminho para o orçamento com o serviço já escolhido.
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

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {services.map((service, i) => (
          <li key={service.id} className="min-w-0">
            <article
              id={`servico-${service.id}`}
              aria-labelledby={`servico-${service.id}-titulo`}
              style={CATEGORY_STYLE[service.category]}
              className="svc-card group/svc flex h-full scroll-mt-24 flex-col p-4 sm:p-5"
            >
              {SERVICE_ART[service.id] && (
                <MotionArea
                  aria-hidden="true"
                  className={cn(
                    'svc-art relative h-32 overflow-hidden rounded-[10px] ring-1 transition-shadow duration-300',
                    SERVICE_ART[service.id].tone === 'dark' ? 'bg-night ring-white/5' : 'bg-ice ring-ice-2',
                  )}
                >
                  {(active) => SERVICE_ART[service.id].render(active)}
                </MotionArea>
              )}
              <div className="flex flex-1 flex-col px-1 pt-5 sm:px-2">
                <p className="type-label flex items-center gap-3 text-fg-muted">
                  <b className="font-semibold text-[var(--cat-text)]">{num(i + 1)}</b>
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--cat)]" />
                  {categories[service.category]}
                </p>
                <h3 id={`servico-${service.id}-titulo`} className="type-h4 mt-3 text-fg">
                  {service.name}
                </h3>
                <p className="type-small mt-2.5 font-medium text-fg">{service.benefit}</p>
                {/* No celular a descrição fica dentro de "Detalhes" para encurtar a seção */}
                <p className="type-small mt-2 text-fg-muted max-sm:hidden">{service.description}</p>

                <details className="group/apps mt-3">
                  <summary className="type-small inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 font-medium text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
                    <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/apps:rotate-180" />
                    <span className="sm:hidden">{ui.services.details}</span>
                    <span className="max-sm:hidden">{ui.services.examples}</span>
                  </summary>
                  <p className="type-small mt-2 text-fg-muted sm:hidden">{service.description}</p>
                  <ul className="type-small mt-2 space-y-1 text-fg">
                    {service.applications.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-[var(--cat)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="mt-auto pt-4">
                  {service.proof.length > 0 && (
                    <p className="type-small mb-3 flex flex-wrap items-center gap-1.5 text-fg-muted">
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
                  <Link
                    to={{ pathname: home, search: `?servico=${service.id}`, hash: '#contato' }}
                    className="group flex min-h-11 items-center justify-between gap-2 border-t border-edge pt-3 text-[0.95rem] font-semibold text-fg hover:text-[var(--cat-text)]"
                  >
                    {service.cta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
