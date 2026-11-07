import { Check } from 'lucide-react';
import { MotionArea } from '@/components/ui/MotionArea';

/**
 * "Mesa de trabalho": quatro módulos ligados entre si, cada um com um movimento
 * próprio e independente, representando as frentes do trabalho: escrever código,
 * organizar processos, ler dados e automatizar tarefas. Um sinal percorre as
 * ligações entre eles. Decorativo (aria-hidden); a seção tem o texto.
 */
export function AboutModules() {
  return (
    <MotionArea aria-hidden="true" className="about-desk relative">
      {/* ligações entre os módulos (aparecem nos vãos) e o sinal que as percorre */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M28 26 H72 V74 H28 Z" className="fill-none stroke-lavender-deep/35" strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeDasharray="3 4" />
      </svg>
      <span className="about-signal" />

      <div className="relative grid grid-cols-[1.2fr_1fr] gap-3 sm:gap-4">
        {/* código */}
        <figure className="about-module">
          <figcaption className="about-label">código</figcaption>
          <pre className="mt-2 overflow-hidden font-code text-[9px] leading-[1.65] text-ink min-[400px]:text-[10px] sm:text-[10.5px]">
            <span className="block"><span className="text-lavender-deep">const</span> total = itens</span>
            <span className="block">{'  '}.map(i =&gt; i.qtd * i.preco)</span>
            <span className="about-type relative block w-fit">
              {'  '}.reduce(somar, 0)
              <span className="about-type-mask" />
            </span>
          </pre>
        </figure>

        {/* processos */}
        <figure className="about-module">
          <figcaption className="about-label">processos</figcaption>
          <div className="relative mt-2 grid grid-cols-3 gap-1.5 text-[9px] text-slate">
            {['a fazer', 'fazendo', 'feito'].map((c) => (
              <div key={c} className="rounded bg-lavender p-1">
                <span className="block font-code">{c}</span>
                <span className="mt-1 block h-2.5 rounded-sm bg-white" />
                <span className="mt-1 block h-2.5 rounded-sm bg-white" />
              </div>
            ))}
            {/* o cartão que avança de coluna */}
            <span className="about-card absolute top-[34px] left-1 h-2.5 w-[calc((100%-0.75rem)/3-0.5rem)] rounded-sm bg-tide" />
          </div>
        </figure>

        {/* dados */}
        <figure className="about-module">
          <figcaption className="about-label">dados</figcaption>
          <svg viewBox="0 0 120 44" className="mt-2 h-auto w-full overflow-visible">
            <polyline points="2,34 22,28 42,31 62,18 82,22 102,10 118,14" className="fill-none stroke-ink" strokeWidth="1.5" strokeLinejoin="round" />
            <polyline points="2,34 22,28 42,31 62,18 82,22 102,10 118,14 118,44 2,44" className="fill-tide/15 stroke-none" />
            <g className="about-point">
              <circle r="3.2" className="fill-amber stroke-white" strokeWidth="1.2" />
            </g>
          </svg>
        </figure>

        {/* automação */}
        <figure className="about-module">
          <figcaption className="about-label">automação</figcaption>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-ink">
            <span className="leading-snug">
              Pedido novo
              <span className="block text-slate">enviar resumo</span>
            </span>
            <span className="about-switch relative h-4 w-7 shrink-0 rounded-full bg-lavender-2">
              <span className="about-knob absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-soft" />
            </span>
          </div>
          <span className="about-done mt-2 inline-flex items-center gap-1 rounded-full bg-tide-wash px-2 py-0.5 font-code text-[9px] text-tide-deep">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            enviado
          </span>
        </figure>
      </div>
    </MotionArea>
  );
}
