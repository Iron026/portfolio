import { useRef, useState, type MouseEvent } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { hasWhatsapp, whatsappLink } from '@/utils/contact';
import { useFaqs, useSiteText } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';

/** Movimento reduzido no sistema ou "Pausar animações" no site: abre e fecha sem animação. */
function prefersStill() {
  return (
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    document.documentElement.dataset.motion === 'paused'
  );
}

const OPEN = { duration: 240, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' };
const CLOSE = { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' };

/**
 * Pergunta com resposta que abre e fecha suavemente.
 * Continua sendo um <details>/<summary> nativo (teclado, leitores de tela, busca na página
 * e funcionamento sem JavaScript). O clique no <summary> só é interceptado para animar a
 * altura real da resposta (medida na hora, sem altura fixa), com um leve aparecimento do texto.
 * Ao terminar, a resposta volta à altura automática: nada fica cortado.
 */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const [state, setState] = useState<'open' | 'closed'>('closed');

  function onSummaryClick(e: MouseEvent<HTMLElement>) {
    const details = detailsRef.current;
    const body = bodyRef.current;
    if (!details || !body || prefersStill() || typeof body.animate !== 'function') return; // comportamento nativo
    e.preventDefault();
    const opening = state === 'closed';
    // Se uma animação estiver em curso, parte da altura atual (sem salto)
    const running = animRef.current;
    const from = running ? body.getBoundingClientRect().height : opening ? 0 : body.getBoundingClientRect().height;
    const fromOpacity = running ? Number(getComputedStyle(body).opacity) : opening ? 0 : 1;
    running?.cancel();
    setState(opening ? 'open' : 'closed');
    if (opening) details.open = true;
    const to = opening ? body.scrollHeight : 0;
    body.style.overflow = 'hidden';
    const anim = body.animate(
      [
        { height: `${from}px`, opacity: fromOpacity, transform: `translateY(${opening ? -4 : 0}px)` },
        { height: `${to}px`, opacity: opening ? 1 : 0, transform: `translateY(${opening ? 0 : -4}px)` },
      ],
      opening ? OPEN : CLOSE,
    );
    animRef.current = anim;
    anim.onfinish = () => {
      animRef.current = null;
      body.style.overflow = '';
      if (!opening) details.open = false;
    };
    anim.oncancel = () => {
      body.style.overflow = '';
    };
  }

  return (
    <details
      ref={detailsRef}
      data-state={state}
      // Mantém o estado em dia quando o navegador abre por conta própria (busca na página, sem animação)
      onToggle={(e) => {
        if (!animRef.current) setState(e.currentTarget.open ? 'open' : 'closed');
      }}
      className="faq-item group border-b border-edge"
    >
      <summary onClick={onSummaryClick} className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="type-h4 text-fg transition-colors group-hover:text-accent">{question}</span>
        <span
          aria-hidden="true"
          className="faq-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg shadow-[inset_0_0_0_1px_var(--edge-strong)] transition-[rotate,background-color,color] duration-[240ms] ease-[cubic-bezier(0.2,0.75,0.25,1)] group-data-[state=open]:rotate-45 group-data-[state=open]:bg-fg group-data-[state=open]:text-bg"
        >
          <Plus className="h-4 w-4" />
        </span>
      </summary>
      <div ref={bodyRef} className="faq-body">
        <p className="type-body max-w-[65ch] pb-6 text-fg-muted">{answer}</p>
      </div>
    </details>
  );
}

export function Faq() {
  const faqs = useFaqs();
  const text = useSiteText();
  const ui = useUi();
  const { lp } = useLocale();
  const t = ui.sections.faq;
  return (
    <Section id="perguntas" labelledBy="faq-title" className="bg-surface!">
      <SectionHeading id="faq-title" index="05" label={t.label} title={t.title} intro={t.intro} />
      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="order-2 lg:order-1 lg:col-span-4">
          <div className="rounded-[16px] bg-surface-2 p-6 ring-1 ring-edge lg:sticky lg:top-28">
            <p className="type-h4 text-fg">{t.stillTitle}</p>
            <p className="type-small mt-1.5 text-fg-muted">{t.stillText}</p>
            {hasWhatsapp ? (
              <ButtonAnchor href={whatsappLink(text.whatsappGreeting)} className="mt-5">
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                {t.askWhatsapp}
                <span className="sr-only">{ui.common.newTab}</span>
              </ButtonAnchor>
            ) : (
              <ButtonLink to={{ pathname: lp('/'), hash: '#contato' }} className="mt-5">
                {t.askForm}
              </ButtonLink>
            )}
          </div>
        </div>
        <div className="order-1 border-t border-fg lg:order-2 lg:col-span-8">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </Section>
  );
}
