import { useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  useDocumentTitle('Página não encontrada');
  // Página de erro não deve aparecer nos resultados de busca
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  return (
    <section className="flex min-h-[70vh] items-center bg-paper pt-32 pb-20">
      <div className="container-site">
        <p className="type-label text-tide-deep">Erro 404</p>
        <h1 className="type-h1 mt-4">Esta página não existe</h1>
        <p className="type-lead mt-5 max-w-xl text-slate">
          O endereço pode ter sido digitado errado ou a página mudou de lugar. Volte para o início ou veja os projetos.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink to="/">Ir para o início</ButtonLink>
          <ButtonLink to={{ pathname: '/', hash: '#projetos' }} variant="secondary">
            Ver projetos
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
