import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
 *
 * A linha é medida a partir dos centros reais dos marcadores (01 a 05): começa no
 * primeiro, termina exatamente no último e o preenchimento para no centro da etapa
 * alcançada, mesmo quando os textos (em inglês, por exemplo) têm alturas diferentes.
 */
type Track = { vertical: boolean; x: number; y: number; length: number; stops: number[] };

/** Centros dos marcadores relativos ao contêiner: define a direção, o início, o fim e as paradas da linha. */
function measureTrack(wrap: HTMLElement, marks: HTMLElement[]): Track | null {
  if (marks.length < 2) return null;
  const base = wrap.getBoundingClientRect();
  const centers = marks.map((m) => {
    const r = m.getBoundingClientRect();
    return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
  });
  const first = centers[0];
  const last = centers[centers.length - 1];
  const vertical = Math.abs(last.y - first.y) > Math.abs(last.x - first.x);
  return {
    vertical,
    x: first.x,
    y: first.y,
    length: vertical ? last.y - first.y : last.x - first.x,
    stops: centers.map((c) => (vertical ? c.y - first.y : c.x - first.x)),
  };
}
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

  // Posição da linha: remedida quando o tamanho da lista muda (fontes, idioma, largura da tela)
  const wrapRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<Track | null>(null);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const list = listRef.current;
    if (!wrap || !list) return;
    const measure = () => setTrack(measureTrack(wrap, [...list.querySelectorAll<HTMLElement>('[data-step-mark]')]));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [steps]);

  const filled = track ? track.stops[Math.max(0, Math.min(reached, steps.length) - 1)] ?? 0 : 0;
  const progress = track && track.length > 0 ? filled / track.length : 0;

  return (
    <Section id="como-trabalho" labelledBy="processo-title" tone="dark" background={<AmbientBackground variant="process" />}>
      <SectionHeading id="processo-title" index="03" label={ui.sections.process.label} title={ui.sections.process.title} intro={ui.sections.process.intro} />

      <div ref={wrapRef} className="relative mt-14 sm:mt-16">
        {/* trilho e preenchimento (decorativos), do centro do marcador 01 ao centro do 05 */}
        {track && (
          <div
            aria-hidden="true"
            data-process-track={track.vertical ? 'vertical' : 'horizontal'}
            className="process-line pointer-events-none absolute bg-white/15"
            style={
              track.vertical
                ? { left: track.x - 0.5, top: track.y, width: 1, height: track.length }
                : { left: track.x, top: track.y - 0.5, width: track.length, height: 1 }
            }
          >
            <div
              className={cn('process-line-fill h-full w-full bg-tide transition-transform duration-1000 ease-out', track.vertical ? 'origin-top' : 'origin-left')}
              style={{ transform: track.vertical ? `scaleY(${progress})` : `scaleX(${progress})` }}
            />
          </div>
        )}

        <ol ref={listRef} className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
          {steps.map((step, i) => {
            const on = i < reached;
            return (
              <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] gap-4 lg:block lg:text-center" data-reached={on ? '' : undefined}>
                <span
                  aria-hidden="true"
                  data-step-mark=""
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
