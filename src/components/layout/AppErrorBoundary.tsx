import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { LogoMark } from '@/components/ui/Logo';
import { buttonClass } from '@/components/ui/Button';
import { isChunkLoadError } from '@/utils/lazyPage';
import { UI, type UiText } from '@/i18n/ui';
import { localeFromPath, localizePath, HTML_LANG } from '@/i18n/locale';

interface Props {
  /** Muda a cada navegação: ao trocar de página (inclusive com Voltar/Avançar), o erro é descartado. */
  resetKey: string;
  children: ReactNode;
  /** Textos no idioma da página (o componente de classe não usa hooks). */
  text: UiText['error'];
  home: string;
  lang: string;
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
      <main role="alert" lang={this.props.lang} className="brand font-text grid min-h-screen place-items-center bg-paper px-5 py-16 text-ink">
        <div className="w-full max-w-lg">
          <a href={this.props.home} className="inline-flex items-center gap-3 font-title text-lg font-semibold tracking-[-0.02em]">
            <LogoMark accent="#0e9888" className="w-11" /> Alto Code
          </a>
          <h1 className="type-h2 mt-10">{this.props.text.heading}</h1>
          <p className="type-lead mt-4 text-slate">
            {version ? this.props.text.updated : this.props.text.generic}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={buttonClass('primary')} onClick={() => window.location.reload()}>
              {this.props.text.retry}
            </button>
            <a href={this.props.home} className={buttonClass('secondary')}>
              {this.props.text.home}
            </a>
          </div>
        </div>
      </main>
    );
  }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);
  return (
    <Boundary resetKey={pathname} text={UI[locale].error} home={localizePath('/', locale)} lang={HTML_LANG[locale]}>
      {children}
    </Boundary>
  );
}
