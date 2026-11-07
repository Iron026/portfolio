/**
 * Nova Serviços — landing page demonstrativa de uma empresa fictícia de
 * manutenção residencial. Rota: /demos/nova-servicos (fora do MainLayout).
 *
 * As âncoras usam rolagem por script (sem mudar o "#" do endereço), para
 * funcionar igual com URLs limpas e com o modo de rotas com "#".
 */
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ClipboardCheck, Clock, Droplets, Hammer, MapPin, Menu, PaintRoller, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import { site } from '@/config/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BENEFITS, COMPANY, EMPTY_FORM, FAQS, REGION, SERVICES, STEPS, type QuoteForm as Form, type ServiceId } from './ns-data';
import { QuoteForm } from './QuoteForm';
import './ns.css';

const SERVICE_ICONS: Record<ServiceId, typeof Zap> = { eletrica: Zap, hidraulica: Droplets, pintura: PaintRoller, montagem: Hammer };
const BENEFIT_ICONS = [ClipboardCheck, Clock, Sparkles, ShieldCheck];

const NAV = [
  { id: 'ns-servicos', label: 'Serviços' },
  { id: 'ns-vantagens', label: 'Vantagens' },
  { id: 'ns-como-funciona', label: 'Como funciona' },
  { id: 'ns-duvidas', label: 'Dúvidas' },
  { id: 'ns-orcamento', label: 'Contato' },
];

/** Rola até a seção e move o foco para o título dela (útil para teclado e leitor de tela). */
function goTo(id: string, focusId?: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (id === 'ns-inicio') window.scrollTo({ top: 0 });
  else target.scrollIntoView({ block: 'start' });
  const focusEl = (focusId && document.getElementById(focusId)) || target.querySelector<HTMLElement>('h2');
  focusEl?.focus({ preventScroll: true });
}

function Anchor({ to, focus, className, children, onNavigate }: { to: string; focus?: string; className?: string; children: ReactNode; onNavigate?: () => void }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
        // Espera o menu móvel fechar (o cabeçalho encolhe) antes de calcular a rolagem.
        window.setTimeout(() => goTo(to, focus), 0);
      }}
    >
      {children}
    </a>
  );
}

export default function NovaServicosDemo() {
  useDocumentTitle(
    'Nova Serviços: manutenção residencial com orçamento antes do serviço',
    'Landing page demonstrativa de uma empresa fictícia de elétrica, hidráulica, pintura e montagem, com formulário de orçamento validado.',
  );
  // Chaves obrigatórias: desde o Chrome 150, scrollTo devolve uma Promise, e um efeito
  // não pode devolver nada além de uma função de limpeza (o React chamaria a Promise ao sair).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        document.getElementById('ns-menu-botao')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  /** CTA de um serviço: pré-seleciona no formulário e leva até ele. */
  function requestService(id: ServiceId) {
    setForm((f) => ({ ...f, service: id }));
    window.setTimeout(() => goTo('ns-orcamento', 'ns-nome'), 0);
  }

  return (
    <div className="ns-root font-sans">
      {/* Faixa do portfólio: caminho de volta para Alto Code / Projetos */}
      <aside aria-label="Sobre esta demonstração" className="ns-on-dark bg-(--ns-ink) text-[0.8rem] text-white/85">
        <div className="mx-auto flex max-w-[72rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <nav aria-label="Você está em">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="rounded hover:text-white hover:underline">{site.name}</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li><Link to={{ pathname: '/', hash: '#projetos' }} className="rounded hover:text-white hover:underline">Projetos</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="font-semibold text-white">Nova Serviços</li>
            </ol>
          </nav>
          <p className="flex flex-wrap items-center gap-x-3">
            <span>Empresa fictícia, página demonstrativa</span>
            <Link to="/projetos/nova-servicos" className="rounded font-semibold text-white underline underline-offset-2">
              Ver detalhes do projeto
            </Link>
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-(--ns-line) bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[72rem] items-center justify-between gap-3 px-4 sm:px-6">
          <Anchor to="ns-inicio" focus="ns-hero-titulo" className="flex items-center gap-2.5 rounded-lg" onNavigate={() => setMenuOpen(false)}>
            <NovaMark />
            <span className="font-display text-[1.15rem] font-semibold tracking-tight whitespace-nowrap max-[359px]:sr-only sm:text-[1.2rem]">{COMPANY}</span>
          </Anchor>
          <nav aria-label="Seções da página" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.id}>
                  <Anchor to={item.id} className="rounded-full px-3 py-2 text-[0.95rem] font-medium text-(--ns-muted) hover:text-(--ns-ink)">
                    {item.label}
                  </Anchor>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Anchor to="ns-orcamento" focus="ns-nome" className="rounded-full bg-(--ns-yellow) px-4 py-2 text-[0.95rem] font-semibold whitespace-nowrap text-(--ns-ink) hover:brightness-95" onNavigate={() => setMenuOpen(false)}>
              {/* No celular o texto encurta para caber ao lado do nome e do menu. */}
              <span className="sm:hidden">Orçamento</span>
              <span className="hidden sm:inline">Pedir orçamento</span>
            </Anchor>
            <button
              id="ns-menu-botao"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="ns-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-(--ns-line) lg:hidden"
            >
              {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
              <span className="sr-only">{menuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            </button>
          </div>
        </div>
        <nav id="ns-menu" aria-label="Seções da página (menu)" hidden={!menuOpen} className="border-t border-(--ns-line) bg-white lg:hidden">
          <ul className="mx-auto max-w-[72rem] px-4 py-2">
            {NAV.map((item) => (
              <li key={item.id}>
                <Anchor to={item.id} className="block rounded-lg px-2 py-3 text-lg font-medium" onNavigate={() => setMenuOpen(false)}>
                  {item.label}
                </Anchor>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="conteudo">
        {/* ------------------------------------------------------------ hero */}
        <section id="ns-inicio" aria-labelledby="ns-hero-titulo" className="bg-(--ns-bg)">
          <div className="mx-auto grid max-w-[72rem] items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:pt-20 lg:pb-24 [&>*]:min-w-0">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-(--ns-petrol)">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                Atendimento em {REGION}
              </p>
              <h1 id="ns-hero-titulo" tabIndex={-1} className="mt-3 max-w-[16ch] text-[2.5rem] leading-[1.05] font-semibold outline-none sm:text-[3.4rem]">
                Manutenção residencial sem dor de cabeça
              </h1>
              <p className="mt-5 max-w-[48ch] text-lg text-(--ns-muted)">
                Elétrica, hidráulica, pintura e montagem com horário marcado e orçamento aprovado por você antes do serviço.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Anchor to="ns-orcamento" focus="ns-nome" className="rounded-full bg-(--ns-petrol) px-7 py-3.5 text-center text-lg font-semibold text-white hover:bg-(--ns-petrol-2)">
                  Pedir orçamento
                </Anchor>
                <Anchor to="ns-servicos" className="rounded-full px-7 py-3.5 text-center text-lg font-semibold text-(--ns-petrol) ring-1 ring-(--ns-petrol)/40 hover:bg-white">
                  Ver serviços
                </Anchor>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-(--ns-line) shadow-[0_24px_60px_-34px_rgba(18,35,43,0.45)]">
              <h2 className="font-sans text-lg font-semibold tracking-normal">Do que você precisa?</h2>
              <p className="mt-1 text-[0.95rem] text-(--ns-muted)">Escolha um serviço para começar o pedido.</p>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {SERVICES.map((s) => {
                  const Icon = SERVICE_ICONS[s.id];
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => requestService(s.id)}
                        className="flex w-full flex-col items-start gap-3 rounded-2xl bg-(--ns-bg) p-4 text-left ring-1 ring-transparent transition-colors hover:bg-(--ns-wash) hover:ring-(--ns-petrol)/30"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--ns-yellow) text-(--ns-ink)">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="font-semibold">{s.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ serviços */}
        <section id="ns-servicos" aria-labelledby="ns-servicos-titulo" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[72rem] px-4 sm:px-6">
            <SectionTitle id="ns-servicos-titulo" title="Serviços" intro="Quatro especialidades para resolver o dia a dia da casa ou do pequeno comércio." />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2">
              {SERVICES.map((s) => {
                const Icon = SERVICE_ICONS[s.id];
                return (
                  <li key={s.id} className="flex flex-col rounded-2xl bg-(--ns-bg) p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-(--ns-petrol) text-white">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <h3 className="text-[1.35rem] font-semibold">{s.name}</h3>
                    </div>
                    <p className="mt-3 text-(--ns-muted)">{s.summary}</p>
                    <ul className="mt-4 space-y-1.5 text-[0.98rem]">
                      {s.examples.map((ex) => (
                        <li key={ex} className="flex gap-2.5">
                          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-(--ns-petrol)" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => requestService(s.id)}
                      className="mt-6 self-start rounded-full px-5 py-2.5 font-semibold text-(--ns-petrol) ring-1 ring-(--ns-petrol)/40 hover:bg-white"
                    >
                      Pedir orçamento de {s.name.toLowerCase()}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------------ vantagens */}
        <section id="ns-vantagens" aria-labelledby="ns-vantagens-titulo" className="py-16 sm:py-20">
          <div className="mx-auto max-w-[72rem] px-4 sm:px-6">
            <SectionTitle id="ns-vantagens-titulo" title="Por que pedir para a Nova Serviços" />
            <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => {
                const Icon = BENEFIT_ICONS[i];
                return (
                  <li key={b.title}>
                    <Icon aria-hidden="true" className="h-7 w-7 text-(--ns-petrol)" />
                    <h3 className="mt-3 font-sans text-[1.1rem] font-semibold tracking-normal">{b.title}</h3>
                    <p className="mt-1.5 text-(--ns-muted)">{b.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------------ etapas */}
        <section id="ns-como-funciona" aria-labelledby="ns-etapas-titulo" className="ns-on-dark bg-(--ns-petrol) py-16 text-white sm:py-20">
          <div className="mx-auto max-w-[72rem] px-4 sm:px-6">
            <SectionTitle id="ns-etapas-titulo" title="Como funciona" intro="Do pedido ao serviço concluído, em quatro passos." tone="dark" />
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="border-t-2 border-(--ns-yellow) pt-4">
                  <span aria-hidden="true" className="font-display text-[2.2rem] leading-none font-semibold text-(--ns-yellow)">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-sans text-[1.1rem] font-semibold tracking-normal">
                    <span className="sr-only">Passo {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-white/80">{s.text}</p>
                </li>
              ))}
            </ol>
            <Anchor to="ns-orcamento" focus="ns-nome" className="mt-10 inline-flex rounded-full bg-(--ns-yellow) px-6 py-3 font-semibold text-(--ns-ink) hover:brightness-95">
              Começar meu pedido
            </Anchor>
          </div>
        </section>

        {/* ------------------------------------------------------------ dúvidas */}
        <section id="ns-duvidas" aria-labelledby="ns-duvidas-titulo" className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-[72rem] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] [&>*]:min-w-0">
            <SectionTitle id="ns-duvidas-titulo" title="Perguntas frequentes" intro="Se a sua dúvida não estiver aqui, escreva no campo de descrição do pedido." />
            <Faq />
          </div>
        </section>

        {/* ------------------------------------------------------------ orçamento */}
        <section id="ns-orcamento" aria-labelledby="ns-orcamento-titulo" className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[72rem] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.7fr] [&>*]:min-w-0">
            <div>
              <SectionTitle id="ns-orcamento-titulo" title="Contato e orçamento" intro="Conte o que precisa e receba o valor antes de qualquer serviço." />
              <dl className="mt-8 space-y-4 text-[0.98rem]">
                <div>
                  <dt className="font-semibold">Região de atendimento</dt>
                  <dd className="text-(--ns-muted)">{REGION}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Horário</dt>
                  <dd className="text-(--ns-muted)">Segunda a sábado, das 8h às 18h</dd>
                </div>
                <div>
                  <dt className="font-semibold">Telefone e WhatsApp</dt>
                  <dd className="text-(--ns-muted)">Não divulgados: a empresa é fictícia e esta página é uma demonstração.</dd>
                </div>
              </dl>
            </div>
            <QuoteForm form={form} setForm={setForm} />
          </div>
        </section>
      </main>

      <footer className="ns-on-dark bg-(--ns-ink) text-white/80">
        <div className="mx-auto flex max-w-[72rem] flex-col gap-4 px-4 py-10 text-[0.92rem] sm:px-6 md:flex-row md:justify-between">
          <div className="flex items-start gap-3">
            <NovaMark className="h-8 w-8 shrink-0" />
            <p className="max-w-md">
              A Nova Serviços é uma empresa fictícia. Serviços, textos e região de atendimento foram criados para esta demonstração; não há atendimento real.
            </p>
          </div>
          <p>
            Projeto demonstrativo de {site.name}.{' '}
            <Link to={{ pathname: '/', hash: '#projetos' }} className="rounded font-semibold text-(--ns-yellow) underline underline-offset-2">
              Ver outros projetos
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ id, title, intro, tone = 'light' }: { id: string; title: string; intro?: string; tone?: 'light' | 'dark' }) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} tabIndex={-1} className="text-[2rem] font-semibold outline-none sm:text-[2.5rem]">
        {title}
      </h2>
      {intro && <p className={`mt-3 text-lg ${tone === 'dark' ? 'text-white/80' : 'text-(--ns-muted)'}`}>{intro}</p>}
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  return (
    <ul className="divide-y divide-(--ns-line) border-y border-(--ns-line)">
      {FAQS.map((f, i) => {
        const expanded = open === i;
        return (
          <li key={f.q}>
            <h3 className="font-sans text-[1.08rem] font-medium tracking-normal">
              <button
                type="button"
                id={`${baseId}-p${i}`}
                aria-expanded={expanded}
                aria-controls={`${baseId}-r${i}`}
                onClick={() => setOpen(expanded ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                {f.q}
                <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-(--ns-muted) transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <div id={`${baseId}-r${i}`} role="region" aria-labelledby={`${baseId}-p${i}`} hidden={!expanded}>
              <p className="max-w-[65ch] pb-5 text-(--ns-muted)">{f.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function NovaMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--ns-petrol)" />
      <path d="M11 29V12l18 16V11" fill="none" stroke="var(--ns-yellow)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
