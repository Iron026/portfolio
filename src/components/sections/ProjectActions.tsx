import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, ExternalLink, MessageSquareText } from 'lucide-react';
import type { Project } from '@/data/projects';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { localizePath, type Locale } from '@/i18n/locale';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';

/** Botão da demonstração: link real quando disponível, aviso honesto quando ainda não. */
export function DemoButton({ project, size = 'md', className }: { project: Project; size?: 'md' | 'lg'; tone?: 'light' | 'dark'; className?: string }) {
  const ui = useUi();
  const { lp } = useLocale();
  if (project.demo.status !== 'disponivel') {
    return (
      <span className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-surface-2 px-5 text-[0.95rem] font-medium text-fg-muted ring-1 ring-edge', className)}>
        <Clock aria-hidden="true" className="h-4 w-4" />
        {ui.common.demoInProduction}
      </span>
    );
  }
  const isExternal = /^https?:\/\//.test(project.demo.url);
  return isExternal ? (
    <ButtonAnchor href={project.demo.url} size={size} className={className}>
      {ui.common.tryDemo}
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{ui.common.newTab}</span>
    </ButtonAnchor>
  ) : (
    <ButtonLink to={lp(project.demo.url)} size={size} className={className}>
      {ui.common.tryDemo}
      <ArrowUpRight aria-hidden="true" className="arrow h-4 w-4" />
    </ButtonLink>
  );
}

/** Endereço do formulário já com o serviço e o projeto de referência, no idioma da página. */
export function quoteTarget(project: Project, locale: Locale) {
  return { pathname: localizePath('/', locale), search: `?projeto=${project.slug}`, hash: '#contato' };
}

/** Chamada de orçamento contextual: "Quero um painel de gestão assim". */
export function QuoteLink({ project, className }: { project: Project; tone?: 'light' | 'dark'; className?: string }) {
  const { locale } = useLocale();
  return (
    <Link
      to={quoteTarget(project, locale)}
      className={cn('group inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline decoration-2 underline-offset-[6px] decoration-current/30 transition-colors hover:text-fg hover:decoration-current', className)}
    >
      <MessageSquareText aria-hidden="true" className="h-4 w-4 shrink-0" />
      {project.quoteCta}
    </Link>
  );
}
