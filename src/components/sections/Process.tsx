import { useEffect, useRef, useState } from 'react';
import { processSteps } from '@/data/content';
import { Section, SectionHeading } from '@/components/ui/Section';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { MotionArea } from '@/components/ui/MotionArea';
import { cn } from '@/utils/cn';

/**
 * Processo como um fluxo: as etapas acendem uma a uma quando a seção entra na
 * tela e, depois, um sinal percorre a linha que liga as cinco etapas; cada
 * marcador pulsa quando o sinal passa por ele.
 */
export function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setReached(processSteps.length);
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
  }, []);

  return (
    <Section id="como-trabalho" labelledBy="processo-title" className="on-dark bg-night text-white" background={<AmbientBackground variant="process" />}>
      <SectionHeading
        id="processo-title"
        tone="light"
        index="03"
        label="Processo"
        title="Como um projeto acontece"
        intro="Do primeiro contato à entrega, cada etapa é combinada com você antes de começar."
      />
      <MotionArea className="relative mt-12 sm:mt-16">
        {/* Linha que liga as etapas (telas largas) e o sinal que a percorre */}
        <div aria-hidden="true" className="process-track absolute inset-x-0 hidden lg:block">
          <div className="process-runner">
            <span className="process-signal" />
          </div>
        </div>
        <ol ref={listRef} className="grid gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-5">
          {processSteps.map((step, i) => {
            const on = i < reached;
            return (
              <li
                key={step.title}
                data-reached={on ? '' : undefined}
                className="process-step relative border-t border-white/15 pt-6 lg:border-t-0"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span aria-hidden="true" className="process-marker absolute -top-[4px] left-0 h-[7px] w-[7px] bg-tide" style={{ animationDelay: `${i * 1.6}s` }} />
                <span
                  aria-hidden="true"
                  className={cn(
                    'block font-title text-[1.75rem] leading-none font-medium tracking-[-0.03em] tabular-nums transition-colors duration-700 sm:text-[2.5rem]',
                    on ? 'text-tide' : 'text-tide/45',
                  )}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="type-h4 mt-3 text-white sm:mt-5">
                  <span className="sr-only">Etapa {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="type-small mt-2 text-mist">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </MotionArea>
    </Section>
  );
}
