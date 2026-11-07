import { MessageCircle } from 'lucide-react';
import { site } from '@/config/site';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ButtonAnchor } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { contact, hasWhatsapp, whatsappLink } from '@/utils/contact';
import { AboutModules } from './AboutModules';

export function About() {
  const displayName = site.ownerName || site.name;
  return (
    <Section id="sobre" labelledBy="sobre-title" className="bg-lavender">
      <SectionHeading id="sobre-title" index="04" label="Sobre" title={site.about.title} />

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="max-w-[62ch] space-y-5">
            {site.about.paragraphs.map((paragraph, i) => (
              <p key={paragraph.slice(0, 32)} className={i === 0 ? 'type-lead text-ink' : 'type-body text-slate'}>
                {paragraph}
              </p>
            ))}
          </div>

          <h3 className="type-label mt-10 text-lavender-deep">Como trabalho com você</h3>
          <ol className="mt-4 grid gap-6 border-t border-lavender-2 pt-6 sm:grid-cols-3">
            {site.about.principles.map((p, i) => (
              <li key={p.title}>
                <span aria-hidden="true" className="type-label text-tide-deep">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="type-h4 mt-2">{p.title}</p>
                <p className="type-small mt-1.5 text-slate">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Cartão do responsável: quem é, como falar direto e com o que trabalha */}
        <aside aria-label={`Contato direto com ${displayName}`} className="lg:col-span-5">
          <AboutModules />
          <div className="mt-6 rounded-xl bg-card p-6 shadow-[inset_0_0_0_1px_var(--color-lavender-2)] sm:p-8">
            <div className="flex items-center gap-4">
              {site.ownerPhoto ? (
                <span className="frame-sel block shrink-0">
                  <img
                    src={site.ownerPhoto}
                    alt={`Foto de ${displayName}`}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="block h-20 w-20 object-cover"
                  />
                </span>
              ) : (
                <LogoMark className="h-16 w-16" />
              )}
              <div className="min-w-0">
                <p className="type-h4">{displayName}</p>
                <p className="type-small text-slate">
                  {site.ownerRole}
                  {site.ownerName && ` · responsável pela ${site.name}`}
                </p>
              </div>
            </div>

            <p className="type-small mt-6 text-ink">Quem conversa com você é quem desenvolve. Fale direto comigo:</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              {hasWhatsapp && (
                <ButtonAnchor href={whatsappLink()}>
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  WhatsApp
                  <span className="sr-only">(abre em nova aba)</span>
                </ButtonAnchor>
              )}
              {contact.profiles.map((profile) => (
                <a
                  key={profile.url}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-small inline-flex min-h-10 items-center font-semibold text-tide-deep underline decoration-tide-deep/30 underline-offset-4 hover:decoration-tide-deep"
                >
                  {profile.label}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              ))}
            </div>

            <h3 className="type-label mt-8 border-t border-line pt-6 text-slate">Ferramentas que utilizo</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {site.tools.map((tool) => (
                <li key={tool} className="type-tag rounded-sm bg-paper px-2 py-1 text-ink">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Section>
  );
}
