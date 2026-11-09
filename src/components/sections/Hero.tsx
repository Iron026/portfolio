/**
 * Início — "bancada de criação".
 *
 * A bancada (Site, Planilha, Automação, Sistema) comanda a primeira tela:
 * - a moldura de seleção da marca percorre o título até a palavra da solução escolhida;
 * - o painel de inspeção ao lado mostra o serviço correspondente, com links reais
 *   (projeto demonstrativo relacionado, quando existe, e pedido de orçamento);
 * - a cor da categoria do serviço (presença, gestão, processos) tinge a moldura e a luz de fundo.
 * Tudo continua funcionando sem animação (prefers-reduced-motion e o botão de pausa).
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { HeroWorkbench, TAB_SERVICE, type TabId } from './HeroWorkbench';
import { tabStyle } from './categories';
import { useProjects, useServices, useSiteText } from '@/i18n/content';
import { useLocale } from '@/i18n/useLocale';
import { useUi } from '@/i18n/ui';
import { site } from '@/config/site';
import { cn } from '@/utils/cn';

type Part = { text: string; id?: TabId | 'accent' };

/** Divide o título em trechos, marcando as palavras-alvo da moldura e o destaque. */
function splitTitle(title: string, targets: Record<TabId, string>, accent: string): Part[] {
  const marks = [...(Object.entries(targets) as Array<[TabId, string]>), ['accent', accent] as const]
    .map(([id, word]) => ({ id, word, at: word ? title.indexOf(word) : -1 }))
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at);
  const parts: Part[] = [];
  let pos = 0;
  for (const m of marks) {
    if (m.at < pos) continue;
    if (m.at > pos) parts.push({ text: title.slice(pos, m.at) });
    parts.push({ text: m.word, id: m.id as Part['id'] });
    pos = m.at + m.word.length;
  }
  if (pos < title.length) parts.push({ text: title.slice(pos) });
  return parts;
}

function HeroTitle({ parts, active }: { parts: Part[]; active: TabId }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  const words = useRef<Partial<Record<string, HTMLSpanElement | null>>>({});
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = words.current[active];
      const root = h1.current;
      if (!el || !root) {
        setBox(null);
        return;
      }
      const a = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(root).fontSize) * 0.1;
      setBox({ x: a.left - b.left - pad, y: a.top - b.top + pad * 0.9, w: a.width + pad * 2, h: a.height - pad * 1.1 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (h1.current) ro.observe(h1.current);
    // A troca da fonte de reserva pela Space Grotesk muda a largura das palavras sem mudar o
    // tamanho do título: remede quando cada fonte termina de carregar (não só em fonts.ready,
    // que pode resolver antes de a fonte do título começar a carregar).
    const fonts = document.fonts;
    fonts?.ready.then(measure).catch(() => {});
    fonts?.addEventListener?.('loadingdone', measure);
    return () => {
      ro.disconnect();
      fonts?.removeEventListener?.('loadingdone', measure);
    };
  }, [active, parts]);

  return (
    <h1 ref={h1} id="hero-title" className="hero-title relative mt-3 max-w-[21ch] animate-rise text-balance sm:mt-6">
      {parts.map((p, i) =>
        p.id ? (
          <span
            key={i}
            ref={(el) => {
              words.current[p.id!] = el;
            }}
            data-word={p.id}
            className={cn('hero-word', p.id === active && 'is-active', p.id === 'accent' && 'hero-accent')}
          >
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
      {box && (
        <span
          aria-hidden="true"
          className="title-sel"
          style={{ transform: `translate(${box.x}px, ${box.y}px)`, width: box.w, height: box.h }}
        />
      )}
    </h1>
  );
}

/** Painel de inspeção: o "objeto selecionado" na bancada, com dados reais do serviço. */
function HeroInspector({ active }: { active: TabId }) {
  const ui = useUi();
  const { lp } = useLocale();
  const { services, categories } = useServices();
  const projects = useProjects();
  const service = services.find((s) => s.id === TAB_SERVICE[active]);
  if (!service) return null;
  const proofs = service.proof.map((slug) => projects.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p);
  const t = ui.hero.inspector;
  return (
    <div className="inspector" aria-label={t.region} role="group">
      <div key={active} className="bench-in grid content-start gap-3">
        <p className="type-label flex items-center gap-2 text-fg-muted">
          <span aria-hidden="true" className="inspector-dot" />
          {t.label}
        </p>
        <div>
          <p className="font-title text-[1.15rem] leading-tight font-semibold tracking-[-0.02em] text-fg">{service.name}</p>
          <p className="type-tag mt-1 text-[var(--cat-dark)]">{categories[service.category]}</p>
        </div>
        <p className="text-[0.9rem] leading-relaxed text-fg-muted max-lg:hidden">{service.benefit}</p>
        {proofs.length > 0 && (
          <div className="grid gap-1.5">
            <p className="type-label text-fg-muted">{t.inPractice}</p>
            <ul className="flex flex-wrap gap-1.5">
              {proofs.slice(0, 2).map((p) => (
                <li key={p.slug}>
                  <Link to={lp(`/projetos/${p.slug}`)} className="chip h-8 border-edge-strong! text-fg! hover:border-[var(--cat)]!" style={{ ['--dot' as string]: p.accent.detail }}>
                    <span aria-hidden="true" className="chip-dot" />
                    <span className="font-text text-[0.85rem]">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-1 border-t border-edge pt-3">
          <Link to={{ pathname: lp('/'), search: `?servico=${service.id}`, hash: '#contato' }} className="group min-h-8 py-1 text-[0.9rem] leading-snug font-medium text-[var(--cat-dark)] hover:underline">
            {service.cta}
            <ArrowRight aria-hidden="true" className="ml-1.5 inline h-4 w-4 align-[-3px] transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link to={{ pathname: lp('/'), hash: `#servico-${service.id}` }} className="inline-flex min-h-8 items-center gap-1.5 text-[0.85rem] text-fg-muted hover:text-fg hover:underline">
            {t.service}
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const text = useSiteText();
  const ui = useUi();
  const { lp } = useLocale();
  const projects = useProjects();
  const [active, setActive] = useState<TabId>('planilha');
  const parts = splitTitle(text.hero.title, text.hero.titleTargets, text.hero.titleAccent);
  const home = lp('/');
  // Cada aba tem a sua cor (separada das categorias dos serviços)
  const tone = tabStyle(active);

  return (
    <section id="inicio" aria-labelledby="hero-title" data-tab={active} style={tone} className="hero tone-dark on-dark relative isolate overflow-hidden pt-[5.5rem] sm:pt-32">
      <AmbientBackground variant="hero" />
      <span aria-hidden="true" className="hero-light" />

      <div className="container-site">
        <p className="type-label flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-muted">
          <span className="text-accent max-sm:hidden">{site.name}</span>
          <span aria-hidden="true" className="h-px w-6 bg-white/25 max-sm:hidden" />
          {ui.hero.eyebrow}
        </p>

        <HeroTitle parts={parts} active={active} />

        <div className="mt-5 grid gap-9 pb-10 sm:mt-10 sm:gap-10 sm:pb-12 lg:mt-12 lg:grid-cols-12 lg:gap-10 lg:pb-20 [&>*]:min-w-0">
          <div className="lg:col-span-4 lg:pt-3">
            <p className="type-lead max-w-[46ch] text-fg-muted max-sm:text-[1.0625rem] max-sm:leading-[1.6]">{text.hero.subtitle}</p>
            <div className="mt-6 grid gap-2.5 min-[380px]:grid-cols-2 sm:mt-8 sm:flex sm:gap-3 lg:grid lg:grid-cols-1 xl:flex">
              <ButtonLink to={{ pathname: home, hash: '#projetos' }} size="hero">
                {ui.hero.primary}
                <ArrowRight aria-hidden="true" className="arrow h-5 w-5" />
              </ButtonLink>
              <ButtonLink to={{ pathname: home, hash: '#contato' }} variant="onDarkOutline" size="hero">
                {ui.hero.secondary}
              </ButtonLink>
            </div>
            {/* Fatos verificáveis no próprio site — nenhuma métrica inventada */}
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 sm:mt-8 sm:gap-y-2">
              {ui.hero.facts.map((fact) => (
                <li key={fact} className="type-small inline-flex items-center gap-2 text-fg">
                  <Check aria-hidden="true" className="h-4 w-4 text-tide" strokeWidth={2.5} />
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-8">
            {/* A bancada é um "objeto selecionado": moldura com alças, rótulo e painel de inspeção, como numa ferramenta de design */}
            <div className="frame-sel bench-canvas relative mt-7">
              {/* Em telas muito estreitas, só o nome da bancada (a dica cortaria a etiqueta) */}
              <span className="frame-label">
                {ui.hero.benchLabel}
                <span className="max-[359px]:hidden">
                  {' '}
                  <span aria-hidden="true">·</span> {ui.hero.benchHint}
                </span>
              </span>
              <div className="grid gap-px overflow-hidden rounded-[12px] sm:grid-cols-[minmax(0,1fr)_15rem]">
                <HeroWorkbench active={active} onActiveChange={setActive} />
                <HeroInspector active={active} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atalhos para os projetos: prova visível logo na primeira tela */}
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
