import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { navItems } from './navigation';
import { contact, hasEmail, hasWhatsapp, whatsappLink } from '@/utils/contact';
import { useProjects, useServices, useSiteText } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';

const linkClass = 'inline-flex min-h-8 items-center transition-colors hover:text-fg';

export function Footer() {
  const year = new Date().getFullYear();
  const ui = useUi();
  const text = useSiteText();
  const projects = useProjects();
  const { services } = useServices();
  const { lp } = useLocale();
  const home = lp('/');

  return (
    <footer className="tone-dark on-dark border-t border-edge text-fg-muted">
      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:gap-8">
        <div className="col-span-2 max-w-sm sm:col-span-1 lg:col-span-3">
          <Logo />
          <p className="type-small mt-5">{text.description}</p>
          <Link to={{ pathname: home, hash: '#contato' }} className="mt-7 inline-flex h-11 items-center rounded-[10px] bg-tide px-5 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-tide-bright">
            {ui.common.requestQuote}
          </Link>
        </div>

        <FooterColumn title={ui.footer.navigation} className="lg:col-span-2">
          {navItems.map((item) => (
            <li key={item.hash}>
              <Link to={{ pathname: home, hash: item.hash }} className={linkClass}>
                {ui.nav.items[item.hash.slice(1)]}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={ui.footer.projects} className="lg:col-span-2">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link to={lp(`/projetos/${p.slug}`)} className={linkClass}>
                {p.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={ui.footer.services} className="lg:col-span-2">
          {services.map((s) => (
            <li key={s.id}>
              <Link to={{ pathname: home, search: `?servico=${s.id}`, hash: '#contato' }} className={linkClass}>
                {s.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={ui.footer.contact} className="lg:col-span-3">
          {hasWhatsapp && (
            <li>
              <a href={whatsappLink(text.whatsappGreeting)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center text-tide hover:text-fg">
                WhatsApp
                <span className="sr-only"> {ui.common.newTab}</span>
              </a>
            </li>
          )}
          {hasEmail && (
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-8 items-center break-all text-tide hover:text-fg">
                {contact.email}
              </a>
            </li>
          )}
          {contact.profiles.map((profile) => (
            <li key={profile.url}>
              <a href={profile.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center text-tide hover:text-fg">
                {profile.label}
                <span className="sr-only"> {ui.common.newTab}</span>
              </a>
            </li>
          ))}
          <li className="pt-3">
            <LanguageSwitch />
          </li>
        </FooterColumn>
      </div>

      {/* Assinatura da marca em grande escala (decorativa) */}
      <div aria-hidden="true" className="container-site overflow-hidden">
        <p className="footer-mark select-none">{site.name}</p>
      </div>

      <div className="border-t border-edge">
        <div className="container-site type-small flex flex-col gap-2 py-6 sm:flex-row sm:justify-between">
          <p>
            © {year} {site.name}. {ui.footer.rights}
          </p>
          <p>{ui.footer.demos}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="type-label text-fg">{title}</h2>
      <ul className="type-small mt-4 space-y-1">{children}</ul>
    </div>
  );
}
