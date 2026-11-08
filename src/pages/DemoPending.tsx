import { useLocation } from 'react-router-dom';
import { projects } from '@/data/projects';
import { canonicalPath } from '@/i18n/locale';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ButtonLink } from '@/components/ui/Button';
import NotFound from './NotFound';

/**
 * Rota reservada para demonstrações que ainda não foram publicadas.
 * Evita links quebrados e informa a situação com honestidade.
 * Quando a demonstração ficar pronta, cadastre a rota dela em App.tsx
 * e mude `demo.status` para 'disponivel' em src/data/projects.ts.
 */
export default function DemoPending() {
  const { pathname } = useLocation();
  const { lp } = useLocale();
  const ui = useUi();
  const t = ui.demoPending;
  const project = projects.find((p) => p.demo.url === canonicalPath(pathname));
  useDocumentTitle(project ? t.title(project.name) : undefined);
  if (!project) return <NotFound />;

  return (
    <section className="tone-light on-light flex min-h-[70vh] items-center pt-32 pb-20">
      <div className="container-site max-w-2xl">
        <h1 className="type-h2 text-fg">{t.heading(project.name)}</h1>
        <p className="type-lead mt-4 text-fg-muted">{t.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to={lp(`/projetos/${project.slug}`)}>{t.details}</ButtonLink>
          <ButtonLink to={{ pathname: lp('/'), hash: '#projetos' }} variant="secondary">
            {t.all}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
