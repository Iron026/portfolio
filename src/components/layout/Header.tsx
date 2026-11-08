import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { MotionToggle } from '@/components/ui/MotionToggle';
import { navItems } from './navigation';
import { getProject } from '@/data/projects';
import { canonicalPath } from '@/i18n/locale';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { cn } from '@/utils/cn';

export function Header() {
  const location = useLocation();
  const { lp } = useLocale();
  const ui = useUi();
  const path = canonicalPath(location.pathname);
  const isHome = path === '/' || path === '';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Destaca no menu a seção visível (somente na página inicial)
  const [current, setCurrent] = useState('');
  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === 'undefined') {
      setCurrent('');
      return;
    }
    const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, location.pathname]);

  // Fecha o menu ao navegar
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Esc fecha o menu e devolve o foco ao botão
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Sobre aberturas escuras (início e estudos de caso) o cabeçalho é transparente
  const darkTop = isHome || (path.startsWith('/projetos/') && !!getProject(path.split('/')[2]));
  const overHero = darkTop && !scrolled && !open;
  const home = lp('/');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        overHero ? 'tone-dark on-dark bg-transparent!' : 'tone-light on-light bg-[rgb(255_255_255/0.86)]! shadow-[0_1px_0_var(--edge)] backdrop-blur-md',
      )}
    >
      <a
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('conteudo')?.focus();
        }}
        className="sr-only z-50 rounded-lg bg-tide px-4 py-2 font-semibold text-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        {ui.common.skipToContent}
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <Logo />

        <nav aria-label={ui.nav.main} className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = current === item.hash;
              return (
                <li key={item.hash}>
                  <Link
                    to={{ pathname: home, hash: item.hash }}
                    aria-current={active ? 'location' : undefined}
                    className={cn(
                      'relative block rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors',
                      'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-tide after:transition-transform after:duration-200',
                      active ? 'text-fg after:scale-x-100' : 'text-fg-muted hover:text-fg',
                    )}
                  >
                    {ui.nav.items[item.hash.slice(1)]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitch className="max-sm:hidden" />
          <MotionToggle />
          <ButtonLink to={{ pathname: home, hash: '#contato' }} className="max-md:hidden">
            {ui.common.requestQuote}
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movel"
            className="grid h-11 w-11 place-items-center rounded-[10px] text-fg shadow-[inset_0_0_0_1px_var(--edge-strong)] transition-colors lg:hidden"
          >
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            <span className="sr-only">{open ? ui.nav.closeMenu : ui.nav.openMenu}</span>
          </button>
        </div>
      </div>

      <div id="menu-movel" hidden={!open} className="tone-light on-light animate-fade border-t border-edge bg-surface! lg:hidden">
        <nav aria-label={ui.nav.mobile} className="container-site pt-2 pb-5">
          <ul className="divide-y divide-edge">
            {navItems.map((item, i) => (
              <li key={item.hash}>
                <Link
                  to={{ pathname: home, hash: item.hash }}
                  className="flex items-baseline gap-4 py-3.5 font-title text-[1.25rem] font-medium tracking-[-0.02em] text-fg hover:text-accent"
                >
                  <span aria-hidden="true" className="type-label text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {ui.nav.items[item.hash.slice(1)]}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <ButtonLink to={{ pathname: home, hash: '#contato' }} size="lg" className="flex-1">
              {ui.common.requestQuote}
            </ButtonLink>
            <LanguageSwitch className="sm:hidden" />
          </div>
        </nav>
      </div>
    </header>
  );
}
