import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { HeroWorkbench } from './HeroWorkbench';
import { useProjects, useSiteText } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { site } from '@/config/site';

/** Divide o título para aplicar a moldura de seleção ao trecho de destaque. */
function splitTitle(title: string, accent: string) {
  const at = accent ? title.indexOf(accent) : -1;
  return at < 0 ? [title, '', ''] : [title.slice(0, at), accent, title.slice(at + accent.length)];
}

export function Hero() {
  const text = useSiteText();
  const ui = useUi();
  const { lp } = useLocale();
  const projects = useProjects();
  const [before, accent, after] = splitTitle(text.hero.title, text.hero.titleAccent);
  const home = lp('/');

  return (
    <section id="inicio" aria-labelledby="hero-title" className="tone-dark on-dark relative isolate overflow-hidden pt-24 sm:pt-32">
      <AmbientBackground variant="hero" />

      <div className="container-site">
        <p className="type-label flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-muted">
          <span className="text-accent">{site.name}</span>
          <span aria-hidden="true" className="h-px w-6 bg-white/25" />
          {ui.hero.eyebrow}
        </p>

        <h1 id="hero-title" className="hero-title mt-4 max-w-[19ch] animate-rise text-balance sm:mt-6">
          {before}
          {accent && <span className="frame-sel frame-word text-tide">{accent}</span>}
          {after}
        </h1>

        <div className="mt-6 grid gap-10 pb-12 sm:mt-10 lg:mt-14 lg:grid-cols-12 lg:gap-12 lg:pb-20 [&>*]:min-w-0">
          <div className="lg:col-span-5 lg:pt-2">
            <p className="type-lead text-fg-muted">{text.hero.subtitle}</p>
            <div className="mt-6 grid gap-3 min-[380px]:grid-cols-2 sm:mt-8 sm:flex">
              <ButtonLink to={{ pathname: home, hash: '#projetos' }} size="hero">
                {ui.hero.primary}
                <ArrowRight aria-hidden="true" className="arrow h-5 w-5" />
              </ButtonLink>
              <ButtonLink to={{ pathname: home, hash: '#contato' }} variant="onDarkOutline" size="hero">
                {ui.hero.secondary}
              </ButtonLink>
            </div>
            {/* Fatos verificáveis no próprio site — nenhuma métrica inventada */}
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 sm:mt-8">
              {ui.hero.facts.map((fact) => (
                <li key={fact} className="type-small inline-flex items-center gap-2 text-fg">
                  <Check aria-hidden="true" className="h-4 w-4 text-tide" strokeWidth={2.5} />
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {/* A bancada é um "objeto selecionado": moldura com alças e rótulo, como numa ferramenta de design */}
            <div className="frame-sel bench-canvas relative mt-7 p-1.5 sm:p-2" style={{ ['--frame-color' as string]: 'rgb(34 195 176 / 0.6)' }}>
              <span className="frame-label">
                {ui.hero.benchLabel} <span aria-hidden="true">·</span> {ui.hero.benchHint}
              </span>
              <HeroWorkbench />
            </div>
          </div>
        </div>
      </div>

      {/* Atalhos para as demonstrações: prova visível logo na primeira tela */}
      <nav aria-label={ui.hero.railLabel} className="border-t border-edge bg-white/[0.02]">
        <div className="container-site flex items-center gap-4 overflow-x-auto py-4 [scrollbar-width:none]">
          <span className="type-label shrink-0 text-fg-muted">{ui.hero.railLabel}</span>
          <ul className="flex shrink-0 items-center gap-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  to={lp(`/projetos/${p.slug}`)}
                  className="chip group h-9 border-edge-strong! text-fg! transition-colors hover:border-tide! hover:bg-white/[0.04]"
                  style={{ ['--dot' as string]: p.accent.detail }}
                >
                  <span aria-hidden="true" className="chip-dot" />
                  <span className="font-text text-[0.9rem] font-medium">{p.name}</span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-tide" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </section>
  );
}
