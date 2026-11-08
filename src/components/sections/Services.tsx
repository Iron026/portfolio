import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { serviceCategories, services } from '@/data/services';
import { getProject } from '@/data/projects';
import { cn } from '@/utils/cn';
import { Section, SectionHeading } from '@/components/ui/Section';
import { MotionArea } from '@/components/ui/MotionArea';
import { SERVICE_ART } from './ServiceIllustrations';

const num = (n: number) => String(n).padStart(2, '0');

/**
 * Serviços em cartões compactos: benefício em uma frase, como funciona,
 * aplicações sob demanda (abrir/fechar) e o caminho para o orçamento.
 */
export function Services() {
  return (
    <Section id="servicos" labelledBy="servicos-title" className="bg-paper">
      <SectionHeading
        id="servicos-title"
        index="02"
        label="Serviços"
        title="O que eu desenvolvo"
        intro="Seis tipos de solução para apresentar, organizar e agilizar o seu negócio. Escolha o mais próximo do que você precisa e peça um orçamento."
        aside={
          <p className="type-small mt-3 text-slate">
            Não sabe qual escolher?{' '}
            <Link
              to={{ pathname: '/', search: '?servico=outro', hash: '#contato' }}
              className="font-semibold text-tide-deep underline decoration-tide-deep/35 underline-offset-4 hover:decoration-tide-deep"
            >
              Descreva o que você precisa
            </Link>
            .
          </p>
        }
      />

      <ul className="mt-12 grid gap-px overflow-hidden rounded-xl bg-line shadow-[inset_0_0_0_1px_var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <li key={service.id} className="min-w-0">
            <article
              id={`servico-${service.id}`}
              aria-labelledby={`servico-${service.id}-titulo`}
              className="group/svc flex h-full scroll-mt-24 flex-col bg-card p-5 sm:p-7"
            >
              {SERVICE_ART[service.id] && (
                <MotionArea
                  aria-hidden="true"
                  className={cn(
                    'svc-art mb-5 h-32 overflow-hidden rounded-lg ring-1 transition-shadow duration-300 group-hover/svc:ring-tide/60',
                    SERVICE_ART[service.id].tone === 'dark' ? 'bg-night ring-white/5' : 'bg-ice ring-ice-2',
                  )}
                >
                  {(active) => SERVICE_ART[service.id].render(active)}
                </MotionArea>
              )}
              <p className="type-label flex items-center gap-3 text-slate">
                <b className="font-semibold text-tide-deep">{num(i + 1)}</b>
                {serviceCategories[service.category]}
              </p>
              <h3 id={`servico-${service.id}-titulo`} className="type-h4 mt-3">
                {service.name}
              </h3>
              <p className="type-small mt-2.5 font-medium text-ink">{service.benefit}</p>
              {/* No celular a descrição fica dentro de "Detalhes" para encurtar a seção */}
              <p className="type-small mt-2 text-slate max-sm:hidden">{service.description}</p>

              <details className="group/apps mt-3 sm:mt-4">
                <summary className="type-small inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 font-medium text-slate hover:text-ink [&::-webkit-details-marker]:hidden">
                  <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/apps:rotate-180" />
                  <span className="sm:hidden">Detalhes e aplicações</span>
                  <span className="max-sm:hidden">Aplicações</span>
                </summary>
                <p className="type-small mt-2 text-slate sm:hidden">{service.description}</p>
                <ul className="type-small mt-2 space-y-1 text-ink">
                  {service.applications.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-tide-deep" />
                      {item}
                    </li>
                  ))}
                </ul>
              </details>

              <div className="mt-auto pt-4 sm:pt-5">
                {service.proof.length > 0 && (
                  <p className="type-small mb-3 flex flex-wrap items-center gap-1.5 text-slate">
                    <span className="mr-0.5">Na prática:</span>
                    {service.proof.map((slug) => {
                      const project = getProject(slug);
                      if (!project) return null;
                      return (
                        <Link
                          key={slug}
                          to={`/projetos/${slug}`}
                          className="type-tag inline-flex min-h-8 items-center gap-1 rounded-sm bg-paper px-2 text-ink transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-tide-deep)]"
                        >
                          {project.name}
                          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-tide-deep" />
                        </Link>
                      );
                    })}
                  </p>
                )}
                <Link
                  to={{ pathname: '/', search: `?servico=${service.id}`, hash: '#contato' }}
                  className="group flex min-h-11 items-center justify-between gap-2 border-t border-line pt-3 text-[0.95rem] font-semibold text-ink hover:text-tide-deep"
                >
                  {service.cta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
