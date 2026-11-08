import { Link, useLocation } from 'react-router-dom';
import { HTML_LANG, LOCALES, switchLocalePath } from '@/i18n/locale';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';

/**
 * Seletor PT/EN. Leva para a MESMA página no outro idioma, mantendo busca e
 * âncora (?servico=..., filtros das demonstrações, #contato). É um link comum:
 * o botão Voltar do navegador retorna ao idioma anterior.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { pathname, search, hash } = useLocation();
  const { locale } = useLocale();
  const ui = useUi();
  return (
    <nav aria-label={ui.nav.language} className={cn('inline-flex items-center rounded-[10px] p-1 shadow-[inset_0_0_0_1px_var(--edge)]', className)}>
      {LOCALES.map((l) => {
        const active = l === locale;
        const label = l === 'pt' ? 'PT' : 'EN';
        return active ? (
          <span key={l} aria-current="true" lang={HTML_LANG[l]} className="grid h-9 min-w-9 place-items-center rounded-[7px] bg-fg px-2 font-code text-[0.75rem] font-medium text-bg">
            {label}
          </span>
        ) : (
          <Link
            key={l}
            to={{ pathname: switchLocalePath(pathname, l), search, hash }}
            hrefLang={HTML_LANG[l]}
            title={ui.nav.switchTo}
            className="grid h-9 min-w-9 place-items-center rounded-[7px] px-2 font-code text-[0.75rem] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            {/* Nome acessível começa pelo texto visível (WCAG 2.5.3): "EN, ver esta página em inglês" */}
            <span lang={HTML_LANG[l]}>{label}</span>
            <span className="sr-only">, {ui.nav.switchTo.charAt(0).toLowerCase() + ui.nav.switchTo.slice(1)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
