/**
 * Layout da demonstração Prime Imóveis (fora do MainLayout do portfólio).
 * Faixa superior com o caminho de volta para Alto Code / Projetos,
 * cabeçalho e rodapé próprios da imobiliária fictícia.
 */
import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { site } from '@/config/site';
import { CITY } from './imoveis-data';
import { usePi } from './imoveis-i18n';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import './imoveis.css';

export function PrimeMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--pi-gold)" />
      <path d="M9 20.5 20 11l11 9.5" fill="none" stroke="var(--pi-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 19v11h5.5v-6.5h3V30H27V19" fill="none" stroke="var(--pi-green)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export default function PrimeImoveisLayout() {
  const { pathname } = useLocation();
  const { t, lp, listPath: LIST_PATH } = usePi();

  // Ao trocar de página (lista ↔ detalhe), começa do topo. Filtros na mesma página não rolam a tela.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const nav = [
    { label: t.nav.buy, search: '?finalidade=venda' },
    { label: t.nav.rent, search: '?finalidade=aluguel' },
    { label: t.nav.all, search: '' },
  ];

  return (
    <div className="pi-root font-sans">
      <aside aria-label={t.bar.region} className="bg-(--pi-ink) text-[0.8rem] text-white/85">
        <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
          <nav aria-label={t.bar.youAreHere}>
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to={lp('/')} className="rounded underline-offset-2 hover:text-white hover:underline">
                  {site.name}
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li>
                <Link to={{ pathname: lp('/'), hash: '#projetos' }} className="rounded underline-offset-2 hover:text-white hover:underline">
                  {t.bar.projects}
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="font-semibold text-white">
                Prime Imóveis
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{t.bar.note}</span>
            <Link to={lp('/projetos/prime-imoveis')} className="rounded font-semibold text-white underline underline-offset-2">
              {t.bar.details}
            </Link>
            <LanguageSwitch className="tone-dark bg-transparent! p-0.5! [&>a]:h-7! [&>span]:h-7!" />
          </div>
        </div>
      </aside>

      <header className="pi-on-green bg-(--pi-green) text-white">
        <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to={LIST_PATH} className="flex items-center gap-3 rounded-lg" aria-label={t.home}>
            <PrimeMark />
            <span className="leading-tight">
              <span className="block font-display text-[1.3rem] font-semibold tracking-tight">Prime Imóveis</span>
              <span className="block text-[0.78rem] text-white/75">{t.tagline(CITY)}</span>
            </span>
          </Link>
          <nav aria-label={t.nav.label}>
            <ul className="flex flex-wrap gap-1 text-[0.95rem]">
              {nav.map((item) => (
                <li key={item.label}>
                  <Link
                    to={{ pathname: LIST_PATH, search: item.search }}
                    className="block rounded-full px-3.5 py-2 font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        <Outlet />
      </main>

      <footer className="pi-on-green mt-16 bg-(--pi-green) text-white/80">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-4 px-4 py-10 text-[0.92rem] sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <PrimeMark className="h-8 w-8 shrink-0" />
            <p className="max-w-md">{t.footer(CITY)}</p>
          </div>
          <p>
            {t.footerBy(site.name)}{' '}
            <Link to={{ pathname: lp('/'), hash: '#projetos' }} className="rounded font-semibold text-(--pi-gold) underline underline-offset-2">
              {t.otherProjects}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
