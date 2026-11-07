import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { navItems } from './navigation';
import { getProject } from '@/data/projects';
import { cn } from '@/utils/cn';
import { MotionToggle } from '@/components/ui/MotionToggle';

export function Header() {
  const location = useLocation();
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
    if (location.pathname !== '/' || typeof IntersectionObserver === 'undefined') {
      setCurrent('');
      return;
    }
    // Observa todas as seções; as que não estão no menu apenas apagam o destaque.
    const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

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

  // Sobre o hero escuro o cabeçalho é transparente; nas demais situações, claro.
  // Páginas com abertura escura: início e estudos de caso existentes
  const darkTop = location.pathname === '/' || (location.pathname.startsWith('/projetos/') && !!getProject(location.pathname.split('/')[2]));
  const overHero = darkTop && !scrolled && !open;
  const tone = overHero ? 'light' : 'dark';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-200',
        overHero ? 'on-dark bg-transparent' : 'on-light bg-card/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur-sm',
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
        Pular para o conteúdo
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]">
        <Logo tone={tone} />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = current === item.hash;
              return (
                <li key={item.hash}>
                  <Link
                    to={{ pathname: '/', hash: item.hash }}
                    aria-current={active ? 'location' : undefined}
                    className={cn(
                      'relative block px-3 py-2 text-[0.95rem] font-medium transition-colors',
                      'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-tide after:transition-transform after:duration-200',
                      active && 'after:scale-x-100',
                      tone === 'light' ? (active ? 'text-white' : 'text-mist hover:text-white') : active ? 'text-ink' : 'text-slate hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <MotionToggle tone={tone} />
          <ButtonLink
            to={{ pathname: '/', hash: '#contato' }}
            variant={tone === 'light' ? 'onDark' : 'primary'}
            className="max-sm:hidden"
          >
            Solicitar orçamento
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movel"
            className={cn(
              'grid h-11 w-11 place-items-center rounded-lg transition-colors lg:hidden',
              tone === 'light' ? 'text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.28)]' : 'text-ink shadow-[inset_0_0_0_1px_var(--color-line)]',
            )}
          >
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
          </button>
        </div>
      </div>

      <div id="menu-movel" hidden={!open} className="on-light animate-fade border-t border-line bg-card lg:hidden">
        <nav aria-label="Menu móvel" className="container-site pt-2 pb-5">
          <ul className="divide-y divide-line">
            {navItems.map((item, i) => (
              <li key={item.hash}>
                <Link
                  to={{ pathname: '/', hash: item.hash }}
                  className="flex items-baseline gap-4 py-3.5 font-title text-[1.25rem] font-medium tracking-[-0.02em] text-ink hover:text-tide-deep"
                >
                  <span aria-hidden="true" className="type-label text-tide-deep">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink to={{ pathname: '/', hash: '#contato' }} size="lg" className="mt-4 w-full">
            Solicitar orçamento
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
