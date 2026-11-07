import { useLocation } from 'react-router-dom';
import { projects } from '@/data/projects';
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
  const project = projects.find((p) => p.demo.url === pathname);
  useDocumentTitle(project ? `Demonstração ${project.name}` : undefined);
  if (!project) return <NotFound />;

  return (
    <section className="flex min-h-[70vh] items-center bg-paper pt-32 pb-20">
      <div className="container-site max-w-2xl">
        <h1 className="type-h2">A demonstração de {project.name} está em produção</h1>
        <p className="type-lead mt-4 text-slate">
          Enquanto isso, você pode ver os detalhes do projeto: o problema que ele resolve, as funcionalidades previstas e as tecnologias utilizadas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to={`/projetos/${project.slug}`}>Ver detalhes do projeto</ButtonLink>
          <ButtonLink to={{ pathname: '/', hash: '#projetos' }} variant="secondary">
            Todos os projetos
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
