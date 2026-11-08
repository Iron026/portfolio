import { MessageCircle, Plus } from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { hasWhatsapp, whatsappLink } from '@/utils/contact';
import { useFaqs, useSiteText } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';

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
            <details key={faq.question} className="faq-item group border-b border-edge">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="type-h4 text-fg transition-colors group-hover:text-accent">{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg shadow-[inset_0_0_0_1px_var(--edge-strong)] transition-[transform,background-color,color] duration-200 group-open:rotate-45 group-open:bg-fg group-open:text-bg"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className="type-body max-w-[65ch] pb-6 text-fg-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
