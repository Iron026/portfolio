/**
 * Tour de funcionalidades (página de cada projeto).
 *
 * Abas: cada funcionalidade é uma aba; o painel mostra a captura real em que ela
 * aparece e a moldura de seleção da marca destaca a área exata da tela (o resto
 * escurece um pouco). A última parada mostra a versão para celular.
 * Teclado: setas, Home e End (padrão de abas). Sem animação com
 * prefers-reduced-motion ou com a pausa geral do site.
 */
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project } from '@/data/projects';
import { getTour } from '@/data/tour';
import { useLocale } from '@/i18n/useLocale';
import { Capture } from '@/components/ui/Capture';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';

const num = (n: number) => String(n).padStart(2, '0');
type Stop = (ReturnType<typeof getTour>[number] & { mobile?: false }) | { mobile: true; screen: number; title: string; text: string };

/** Carregado à parte (React.lazy) pela página do projeto: o tour e seus dados não pesam no Início. */
export default function ProjectTour({ project }: { project: Project }) {
  const ui = useUi();
  const { locale } = useLocale();
  const stops = getTour(project.slug, locale);
  const t = ui.caseStudy;
  const baseId = useId();
  const mobileIndex = project.screens.findIndex((s) => s.device === 'mobile');
  const all: Stop[] = [
    ...stops,
    ...(mobileIndex >= 0 ? [{ mobile: true as const, screen: mobileIndex, title: t.mobileStop, text: project.screens[mobileIndex].caption }] : []),
  ];
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const stop = all[active];
  const screen = stop ? project.screens[stop.screen] : undefined;

  function go(next: number, focus = false) {
    const i = (next + all.length) % all.length;
    setActive(i);
    if (focus) tabs.current[i]?.focus();
    tabs.current[i]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
  function onKeyDown(e: KeyboardEvent) {
    const keys: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: all.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  }

  if (!stop || !screen) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-10">
      <div role="tablist" aria-label={t.tourList} aria-orientation="vertical" onKeyDown={onKeyDown} className="tour-list -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] lg:mx-0 lg:grid lg:content-start lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {all.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${baseId}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => go(i)}
              className={cn('tour-tab group snap-start text-left', on && 'is-active')}
            >
              <span className="type-label text-accent">{num(i + 1)}</span>
              <span className="min-w-0">
                <span className="block font-medium text-fg">{s.title}</span>
                <span className={cn('mt-1 text-[0.92rem] leading-relaxed text-fg-muted max-lg:hidden', on ? 'block' : 'hidden')}>{s.text}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="min-w-0">
        <div className={cn('tour-stage', stop.mobile && 'tour-stage--phone')}>
          {stop.mobile ? (
            <div key={screen.src} className="phone tour-in mx-auto w-[min(15rem,62%)]">
              <div>
                <Capture screen={screen} sizes="15rem" />
              </div>
            </div>
          ) : (
            <div className="browser">
              <div className="browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="ml-2 truncate">
                  {project.name} · {screen.caption}
                </span>
              </div>
              <div className="relative overflow-hidden">
                <Capture key={screen.src} screen={screen} sizes="(min-width: 1024px) 60vw, 100vw" className="tour-in" />
                <span
                  aria-hidden="true"
                  className="tour-focus"
                  style={{ left: `${stop.focus[0]}%`, top: `${stop.focus[1]}%`, width: `${stop.focus[2]}%`, height: `${stop.focus[3]}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <p className="type-body text-fg lg:sr-only" aria-live="polite">
            <span className="font-medium">{stop.title}.</span> <span className="text-fg-muted">{stop.text}</span>
          </p>
          <p className="type-small max-lg:hidden text-fg-muted">{t.tourHint}</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => go(active - 1)} className="tour-step" aria-label={t.prevStop}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => go(active + 1)} className="tour-step" aria-label={t.nextStop}>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
