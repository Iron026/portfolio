import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, ExternalLink, MessageSquareText } from 'lucide-react';
import type { Project } from '@/data/projects';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

/** Botão da demonstração: link real quando disponível, aviso honesto quando ainda não. */
export function DemoButton({
  project,
  size = 'md',
  tone = 'light',
  className,
}: {
  project: Project;
  size?: 'md' | 'lg';
  /** 'dark' quando o botão fica sobre o fundo azul-marinho (página de detalhes). */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const variant = tone === 'dark' ? 'onDark' : 'primary';
  if (project.demo.status !== 'disponivel') {
    return (
      <span className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-paper px-5 text-[0.95rem] font-medium text-slate ring-1 ring-line', className)}>
        <Clock aria-hidden="true" className="h-4 w-4" />
        Demonstração em produção
      </span>
    );
  }
  const isExternal = /^https?:\/\//.test(project.demo.url);
  return isExternal ? (
    <ButtonAnchor href={project.demo.url} size={size} variant={variant} className={className}>
      Testar demonstração
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">(abre em nova aba)</span>
    </ButtonAnchor>
  ) : (
    <ButtonLink to={project.demo.url} size={size} variant={variant} className={className}>
      Testar demonstração
      <ArrowUpRight aria-hidden="true" className="arrow h-4 w-4" />
    </ButtonLink>
  );
}

/** Endereço do formulário já com o serviço e o projeto de referência. */
export function quoteTarget(project: Project) {
  return { pathname: '/', search: `?projeto=${project.slug}`, hash: '#contato' };
}

/** Chamada de orçamento contextual: "Quero um painel de gestão assim". */
export function QuoteLink({ project, tone = 'light', className }: { project: Project; tone?: 'light' | 'dark'; className?: string }) {
  return (
    <Link
      to={quoteTarget(project)}
      className={cn(
        'group inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-[6px] transition-colors',
        tone === 'dark'
          ? 'text-tide decoration-tide/40 hover:text-tide-bright hover:decoration-tide-bright'
          : 'text-tide-deep decoration-tide-deep/30 hover:text-ink hover:decoration-ink',
        className,
      )}
    >
      <MessageSquareText aria-hidden="true" className="h-4 w-4 shrink-0" />
      {project.quoteCta}
    </Link>
  );
}
