import { useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ButtonLink } from '@/components/ui/Button';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';

export default function NotFound() {
  const ui = useUi();
  const { lp } = useLocale();
  const t = ui.notFound;
  useDocumentTitle(t.title);
  // Página de erro não deve aparecer nos resultados de busca
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  return (
    <section className="tone-light on-light flex min-h-[70vh] items-center pt-32 pb-20">
      <div className="container-site">
        <p className="type-label text-accent">{t.label}</p>
        <h1 className="type-h1 mt-4 text-fg">
          <span className="frame-sel frame-word">404</span> {t.heading}
        </h1>
        <p className="type-lead mt-5 max-w-xl text-fg-muted">{t.text}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink to={lp('/')}>{t.home}</ButtonLink>
          <ButtonLink to={{ pathname: lp('/'), hash: '#projetos' }} variant="secondary">
            {t.projects}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
