import { MessageCircle } from 'lucide-react';
import { site } from '@/config/site';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ButtonAnchor } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { contact, hasWhatsapp, whatsappLink } from '@/utils/contact';
import { useSiteText } from '@/i18n/content';
import { useUi } from '@/i18n/ui';

/**
 * Sobre: quem está por trás da Alto Code. À esquerda, o cartão do responsável
 * (símbolo da marca na moldura de seleção, nome, ficha curta e canais diretos); à direita, a apresentação,
 * os compromissos de trabalho e as ferramentas. Sem foto (opcional em site.ts).
 */
export function About() {
  const text = useSiteText();
  const ui = useUi();
  const name = site.ownerName || site.name;
  const facts: Array<[string, string]> = [
    [ui.about.facts.degree, ui.about.facts.degreeValue],
    [ui.about.facts.experience, ui.about.facts.experienceValue],
    [ui.about.facts.contact, ui.about.facts.contactValue],
  ];

  return (
    <Section id="sobre" labelledBy="sobre-title" className="bg-lavender!">
      <SectionHeading id="sobre-title" index="04" label={ui.sections.about.label} title={text.about.title} />

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Cartão do responsável */}
        <div role="group" aria-label={ui.about.profile(name)} className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <div className="tone-dark on-dark relative overflow-hidden rounded-[18px] p-6 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-tide/10 blur-3xl" />
            <div className="relative flex items-center gap-5">
              {site.ownerPhoto ? (
                <span className="frame-sel block shrink-0">
                  <img src={site.ownerPhoto} alt={name} width={88} height={88} loading="lazy" className="block h-[5.5rem] w-[5.5rem] object-cover" />
                </span>
              ) : (
                <span className="frame-sel grid h-[5.5rem] w-[5.5rem] shrink-0 place-items-center bg-white/[0.03]">
                  <LogoMark className="w-[3.9rem] text-fg" />
                </span>
              )}
              <div className="min-w-0">
                <p className="font-title text-[1.75rem] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[2rem]">{name}</p>
                <p className="type-small mt-1 text-fg-muted">{ui.about.role(text.ownerRole, site.name)}</p>
              </div>
            </div>

            <dl className="relative mt-7 border-t border-edge">
              {facts.map(([term, value]) => (
                <div key={term} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-edge py-3">
                  <dt className="type-label pt-0.5 text-fg-muted">{term}</dt>
                  <dd className="type-small text-fg">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="type-small relative mt-6 text-fg">{ui.about.talk}:</p>
            <div className="relative mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
              {hasWhatsapp && (
                <ButtonAnchor href={whatsappLink(text.whatsappGreeting)}>
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  WhatsApp
                  <span className="sr-only">{ui.common.newTab}</span>
                </ButtonAnchor>
              )}
              {contact.profiles.map((profile) => (
                <a
                  key={profile.url}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-small inline-flex min-h-10 items-center font-semibold text-accent underline decoration-current/30 underline-offset-4 hover:decoration-current"
                >
                  {profile.label}
                  <span className="sr-only"> {ui.common.newTab}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Apresentação e compromissos */}
        <div className="lg:col-span-7">
          <div className="max-w-[62ch] space-y-5">
            {text.about.paragraphs.map((paragraph, i) => (
              <p key={paragraph.slice(0, 32)} className={i === 0 ? 'about-statement text-fg' : 'type-body text-fg-muted'}>
                {paragraph}
              </p>
            ))}
          </div>

          <h3 className="type-label mt-10 text-lavender-deep">{ui.about.commitments}</h3>
          <ul className="mt-4 grid gap-x-8 border-t border-lavender-2 sm:grid-cols-2">
            {text.about.principles.map((p, i) => (
              <li key={p.title} className="flex gap-4 border-b border-lavender-2 py-5">
                <span aria-hidden="true" className="type-label pt-1 text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="type-h4 text-fg">{p.title}</p>
                  <p className="type-small mt-1.5 text-fg-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="type-label mt-10 text-fg-muted">{ui.about.tools}</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {text.tools.map((tool) => (
              <li key={tool} className="type-tag rounded-md bg-surface px-2 py-1 text-fg ring-1 ring-lavender-2">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
