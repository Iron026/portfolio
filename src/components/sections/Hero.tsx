import { ArrowRight } from 'lucide-react';
import { site } from '@/config/site';
import { projects } from '@/data/projects';
import { ButtonLink } from '@/components/ui/Button';
import { HeroWorkbench } from './HeroWorkbench';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

/** Divide o título para aplicar a moldura de seleção ao trecho de `site.hero.titleAccent`. */
function splitTitle(title: string, accent: string) {
  const at = accent ? title.indexOf(accent) : -1;
  return at < 0 ? [title, '', ''] : [title.slice(0, at), accent, title.slice(at + accent.length)];
}

export function Hero() {
  const [before, accent, after] = splitTitle(site.hero.title, site.hero.titleAccent);
  const liveDemos = projects.filter((p) => p.demo.status === 'disponivel').length;

  return (
    <section id="inicio" aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-night pt-24 text-white sm:pt-32">
      <AmbientBackground variant="hero" />

      <div className="container-site">
        <p className="type-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mist">
          <span className="text-tide">{site.name}</span>
          <span aria-hidden="true" className="h-px w-6 bg-ink-3" />
          Soluções digitais
        </p>

        <h1 id="hero-title" className="type-h1 mt-4 max-w-[21ch] animate-rise text-balance sm:mt-6">
          {before}
          {accent && <span className="frame-sel frame-word text-tide">{accent}</span>}
          {after}
        </h1>

        {/*
          Grade: no celular a ordem é texto → bancada; no desktop o texto fica à
          esquerda e a bancada à direita.
        */}
        <div className="mt-6 grid gap-8 pb-14 sm:mt-10 lg:mt-14 lg:grid-cols-12 lg:gap-10 lg:pb-24 [&>*]:min-w-0">
          <div className="lg:col-span-5 lg:pt-2">
            <p className="type-lead max-w-xl text-mist">{site.hero.subtitle}</p>
            <div className="mt-6 grid gap-3 min-[380px]:grid-cols-2 sm:mt-8 sm:flex">
              <ButtonLink to={{ pathname: '/', hash: '#projetos' }} variant="onDark" size="hero">
                Ver projetos
                <ArrowRight aria-hidden="true" className="arrow h-5 w-5" />
              </ButtonLink>
              <ButtonLink to={{ pathname: '/', hash: '#contato' }} variant="onDarkOutline" size="hero">
                Pedir orçamento
              </ButtonLink>
            </div>
            {/* Fatos verificáveis no próprio site — nenhuma métrica inventada */}
            <p className="type-small mt-6 text-mist sm:mt-8">
              <span className="text-white">{liveDemos} projetos demonstrativos</span> com funcionalidades reais para testar · orçamento sem compromisso
            </p>
          </div>

          <div className="lg:col-span-7">
            <p className="type-label mb-3 text-mist">Bancada interativa · experimente as abas</p>
            <HeroWorkbench />
          </div>
        </div>
      </div>
    </section>
  );
}
