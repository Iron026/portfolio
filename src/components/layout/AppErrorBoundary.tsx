import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { LogoMark } from '@/components/ui/Logo';
import { buttonClass } from '@/components/ui/Button';
import { isChunkLoadError } from '@/utils/lazyPage';

interface Props {
  /** Muda a cada navegação: ao trocar de página (inclusive com Voltar/Avançar), o erro é descartado. */
  resetKey: string;
  children: ReactNode;
}
interface State {
  error: unknown;
  key: string;
}

/**
 * Rede de segurança da aplicação: um erro de renderização ou um arquivo que
 * não carregou nunca deixa o visitante diante de uma página vazia. Mostra uma
 * tela simples com caminho de volta e, ao navegar, tenta exibir a nova página.
 * Não depende do MainLayout (que pode ser justamente o que falhou).
 */
class Boundary extends Component<Props, State> {
  state: State = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[Alto Code] erro ao exibir a página:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const version = isChunkLoadError(error);
    return (
      <main role="alert" className="brand font-text grid min-h-screen place-items-center bg-paper px-5 py-16 text-ink">
        <div className="w-full max-w-lg">
          <a href="/" className="inline-flex items-center gap-3 font-title text-lg font-semibold tracking-[-0.02em]">
            <LogoMark /> Alto Code
          </a>
          <h1 className="type-h2 mt-10">Não foi possível abrir esta página</h1>
          <p className="type-lead mt-4 text-slate">
            {version
              ? 'O site foi atualizado enquanto esta aba estava aberta. Recarregue para usar a versão mais recente.'
              : 'Algo deu errado ao exibir este conteúdo. Tente de novo ou volte para o início.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={buttonClass('primary')} onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
            <a href="/" className={buttonClass('secondary')}>
              Voltar para o início
            </a>
          </div>
        </div>
      </main>
    );
  }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <Boundary resetKey={pathname}>{children}</Boundary>;
}
