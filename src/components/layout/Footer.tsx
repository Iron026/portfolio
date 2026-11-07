import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { services } from '@/data/services';
import { projects } from '@/data/projects';
import { Logo } from '@/components/ui/Logo';
import { navItems } from './navigation';
import { contact, hasEmail, hasWhatsapp, whatsappLink } from '@/utils/contact';

const linkClass = 'transition-colors hover:text-white';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark border-t border-white/10 bg-night text-mist">
      <div className="container-site grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="max-w-sm lg:col-span-3">
          <Logo tone="light" />
          <p className="type-small mt-5">{site.description}</p>
          <Link
            to={{ pathname: '/', hash: '#contato' }}
            className="mt-7 inline-flex h-11 items-center rounded-lg bg-tide px-5 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-tide-bright"
          >
            Solicitar orçamento
          </Link>
        </div>

        <FooterColumn title="Navegação" className="lg:col-span-2">
          {navItems.map((item) => (
            <li key={item.hash}>
              <Link to={{ pathname: '/', hash: item.hash }} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Projetos" className="lg:col-span-2">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link to={`/projetos/${p.slug}`} className={linkClass}>
                {p.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Serviços" className="lg:col-span-2">
          {services.map((s) => (
            <li key={s.id}>
              <Link to={{ pathname: '/', search: `?servico=${s.id}`, hash: '#contato' }} className={linkClass}>
                {s.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Contato" className="lg:col-span-3">
          {hasWhatsapp && (
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-tide hover:text-white">
                WhatsApp
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </li>
          )}
          {hasEmail && (
            <li>
              <a href={`mailto:${contact.email}`} className="text-tide hover:text-white">
                {contact.email}
              </a>
            </li>
          )}
          {contact.profiles.map((profile) => (
            <li key={profile.url}>
              <a href={profile.url} target="_blank" rel="noopener noreferrer" className="text-tide hover:text-white">
                {profile.label}
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </li>
          ))}
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site type-small flex flex-col gap-2 py-6 sm:flex-row sm:justify-between">
          <p>
            © {year} {site.name}. Todos os direitos reservados.
          </p>
          <p>Os projetos exibidos são demonstrativos, com empresas e dados fictícios.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="type-label text-white">{title}</h2>
      <ul className="type-small mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}
