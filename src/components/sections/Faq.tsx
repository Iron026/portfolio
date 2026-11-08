import { MessageCircle, Plus } from 'lucide-react';
import { faqs } from '@/data/content';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { hasWhatsapp, whatsappLink } from '@/utils/contact';

export function Faq() {
  return (
    <Section id="perguntas" labelledBy="faq-title" className="bg-card">
      <SectionHeading
        id="faq-title"
        index="05"
        label="Dúvidas"
        title="Perguntas frequentes"
        intro="Dúvidas comuns antes de começar um projeto. Se a sua não estiver aqui, é só perguntar."
      />
      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="order-2 lg:order-1 lg:col-span-4">
          <div className="rounded-xl bg-paper p-6 lg:sticky lg:top-28">
            <p className="type-h4">Ainda ficou alguma dúvida?</p>
            <p className="type-small mt-1.5 text-slate">Mande sua pergunta pelo WhatsApp ou pelo formulário de contato.</p>
            {hasWhatsapp ? (
              <ButtonAnchor href={whatsappLink()} className="mt-5">
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                Perguntar pelo WhatsApp
                <span className="sr-only">(abre em nova aba)</span>
              </ButtonAnchor>
            ) : (
              <ButtonLink to={{ pathname: '/', hash: '#contato' }} className="mt-5">
                Enviar uma pergunta
              </ButtonLink>
            )}
          </div>
        </div>
        <div className="order-1 border-t border-ink lg:order-2 lg:col-span-8">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-line">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="type-h4 transition-colors group-hover:text-tide-deep">{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition-[transform,background-color,color] duration-200 group-open:rotate-45 group-open:bg-ink group-open:text-white"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className="type-body max-w-[65ch] pb-6 text-slate">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
