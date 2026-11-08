import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { useProcessSteps } from '@/i18n/content';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';

/**
 * Processo como uma linha de progresso: as etapas acendem uma a uma quando
 * entram na tela, e a linha que as liga se preenche até a última etapa
 * alcançada (horizontal no desktop, vertical no celular). Sem rolagem
 * controlada: tudo é legível de imediato, com ou sem animação.
 */
export function Process() {
  const steps = useProcessSteps();
  const ui = useUi();
  const listRef = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setReached(steps.length);
      return;
    }
    const items = [...el.querySelectorAll('li')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = items.indexOf(e.target as HTMLLIElement);
          setReached((r) => Math.max(r, i + 1));
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.3 },
    );
    items.forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [steps.length]);

  const progress = steps.length > 1 ? Math.max(0, reached - 1) / (steps.length - 1) : 1;

  return (
    <Section id="como-trabalho" labelledBy="processo-title" tone="dark" background={<AmbientBackground variant="process" />}>
      <SectionHeading id="processo-title" index="03" label={ui.sections.process.label} title={ui.sections.process.title} intro={ui.sections.process.intro} />

      <div className="relative mt-14 sm:mt-16">
        {/* trilho e preenchimento (decorativos) */}
        <div aria-hidden="true" className="absolute top-5 right-[10%] left-[10%] hidden h-px bg-white/15 lg:block">
          <div className="h-full origin-left bg-tide transition-transform duration-1000 ease-out" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-px bg-white/15 lg:hidden">
          <div className="w-full origin-top bg-tide transition-transform duration-1000 ease-out" style={{ height: '100%', transform: `scaleY(${progress})` }} />
        </div>

        <ol ref={listRef} className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
          {steps.map((step, i) => {
            const on = i < reached;
            return (
              <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] gap-4 lg:block lg:text-center" data-reached={on ? '' : undefined}>
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 grid h-10 w-10 place-items-center rounded-full font-code text-[0.85rem] font-medium tabular-nums ring-1 transition-[background-color,color,box-shadow] duration-500 lg:mx-auto',
                    on ? 'bg-tide text-night ring-tide shadow-[0_0_0_6px_rgb(34_195_176/0.12)]' : 'bg-night text-tide ring-white/20',
                  )}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="lg:mt-6">
                  <h3 className="type-h4 text-fg">
                    <span className="sr-only">
                      {ui.sections.process.step} {i + 1}:{' '}
                    </span>
                    {step.title}
                  </h3>
                  <p className="type-small mt-2 text-fg-muted lg:mx-auto lg:max-w-[24ch]">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <ul className="mt-14 flex flex-wrap gap-2.5 border-t border-edge pt-8 lg:justify-center">
        {ui.sections.process.assurances.map((a) => (
          <li key={a} className="chip h-9 border-edge-strong! text-fg!">
            <Check aria-hidden="true" className="h-3.5 w-3.5 text-tide" strokeWidth={2.5} />
            <span className="font-text text-[0.9rem]">{a}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
