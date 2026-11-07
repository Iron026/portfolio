/**
 * Página individual do imóvel: galeria, atributos, descrição e consulta.
 * A consulta apenas gera um texto de exemplo para copiar: nada é enviado.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bath, BedDouble, Car, Check, ChevronLeft, ChevronRight, Copy, Info, MapPin, Ruler } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CITY, INTEREST_LABELS, PURPOSE_LABELS, TYPE_LABELS,
  consultMessage, formatMoney, formatPrice, getProperty, monthlyTotal, plural, pricePerSquareMeter, properties,
  type Interest, type Property,
} from './imoveis-data';
import { LIST_PATH, rememberLastViewed, savedSearch } from './imoveis-nav';
import { Scene } from './imoveis-art';
import { PropertyCard } from './PrimeImoveisList';

export default function PrimeImoveisDetail() {
  const { id } = useParams();
  const property = getProperty(id);
  useDocumentTitle(
    property ? `${property.title} (${property.id}) · Prime Imóveis` : 'Imóvel não encontrado · Prime Imóveis',
    property ? `${PURPOSE_LABELS[property.purpose]}: ${property.title} em ${property.neighborhood}. Imóvel fictício de demonstração.` : undefined,
  );
  const back = { pathname: LIST_PATH, search: savedSearch() };

  // Ao abrir o detalhe por link direto, o "voltar" ainda devolve o foco a este card.
  useEffect(() => {
    if (property) rememberLastViewed(property.id);
  }, [property]);

  if (!property) {
    return (
      <div className="mx-auto max-w-[76rem] px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-[2rem] font-semibold">Imóvel não encontrado</h1>
        <p className="mt-3 max-w-lg text-(--pi-muted)">
          O código {id ? `“${id}”` : 'informado'} não corresponde a nenhum imóvel do catálogo. Confira o endereço ou volte para a lista.
        </p>
        <Link to={back} className="mt-6 inline-flex rounded-full bg-(--pi-green) px-5 py-2.5 font-semibold text-white hover:bg-(--pi-green-2)">
          Ver imóveis disponíveis
        </Link>
      </div>
    );
  }

  const p = property;
  const similar = properties
    .filter((o) => o.id !== p.id && o.purpose === p.purpose)
    .sort((a, b) => Number(b.neighborhood === p.neighborhood) - Number(a.neighborhood === p.neighborhood) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
    .slice(0, 3);
  const perM2 = pricePerSquareMeter(p);
  const total = monthlyTotal(p);

  return (
    <div className="mx-auto max-w-[76rem] px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 rounded font-semibold text-(--pi-green) hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {back.search ? 'Voltar para os resultados' : 'Ver todos os imóveis'}
        </Link>
        <nav aria-label="Caminho do imóvel" className="text-sm text-(--pi-muted)">
          <ol className="flex flex-wrap gap-1.5">
            <li>
              <Link to={LIST_PATH} className="rounded hover:underline">Imóveis</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to={{ pathname: LIST_PATH, search: `?finalidade=${p.purpose}` }} className="rounded hover:underline">
                {PURPOSE_LABELS[p.purpose]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{p.id}</li>
          </ol>
        </nav>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] [&>*]:min-w-0">
        <div>
          <Gallery property={p} />

          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[0.8rem] font-semibold text-(--pi-green) ${p.purpose === 'venda' ? 'bg-(--pi-sand)' : 'bg-(--pi-mint)'}`}>
                {PURPOSE_LABELS[p.purpose]}
              </span>
              <span className="text-sm text-(--pi-muted)">
                {TYPE_LABELS[p.type]} · Código {p.id}
              </span>
            </div>
            <h1 className="mt-3 text-[2rem] font-semibold sm:text-[2.5rem]">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-(--pi-muted)">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              {p.neighborhood}, {CITY}
            </p>
            {/* No celular o quadro de valores fica mais abaixo; o preço aparece já aqui. */}
            <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:hidden">
              <span className="font-display text-[1.6rem] font-semibold tabular-nums">{formatPrice(p)}</span>
              <a href="#pi-valores" onClick={(e) => { e.preventDefault(); document.getElementById('pi-valores')?.scrollIntoView({ block: 'start' }); }} className="rounded font-semibold text-(--pi-green) underline underline-offset-2">
                Ver valores e consultar
              </a>
            </p>
          </div>

          <h2 className="sr-only">Características principais</h2>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Attr icon={<BedDouble className="h-5 w-5" />} label="Quartos" value={p.bedrooms ? String(p.bedrooms) : 'Não se aplica'} />
            <Attr icon={<Bath className="h-5 w-5" />} label="Banheiros" value={String(p.bathrooms)} />
            <Attr icon={<Car className="h-5 w-5" />} label="Vagas" value={p.parking ? String(p.parking) : 'Nenhuma'} />
            <Attr icon={<Ruler className="h-5 w-5" />} label="Área útil" value={`${p.area} m²`} />
          </dl>

          <h2 className="mt-9 text-[1.4rem] font-semibold">Sobre o imóvel</h2>
          <p className="mt-3 max-w-[65ch] text-[1.02rem] leading-relaxed">{p.description}</p>

          <h2 className="mt-8 text-[1.4rem] font-semibold">Diferenciais</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.features.map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.92rem] ring-1 ring-(--pi-line)">
                <Check aria-hidden="true" className="h-4 w-4 text-(--pi-green)" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <aside id="pi-valores" aria-label="Valores e consulta" className="lg:self-start">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-(--pi-line)">
            <p className="text-sm text-(--pi-muted)">{p.purpose === 'venda' ? 'Valor de venda' : 'Aluguel mensal'}</p>
            <p className="font-display text-[2rem] font-semibold tabular-nums">{formatPrice(p)}</p>
            <dl className="mt-4 space-y-2 border-t border-(--pi-line) pt-4 text-[0.95rem]">
              <Row label="Condomínio" value={p.condo ? `${formatMoney(p.condo)}/mês` : 'Não há'} />
              <Row label="IPTU" value={`${formatMoney(p.iptu)}/mês`} />
              {total !== null && <Row label="Total mensal estimado" value={`${formatMoney(total)}/mês`} strong />}
              {perM2 !== null && <Row label="Valor por m²" value={formatMoney(perM2)} />}
            </dl>
            <ConsultPanel property={p} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="pi-similares" className="mt-14">
          <h2 id="pi-similares" className="text-[1.5rem] font-semibold">
            Outros imóveis para {p.purpose === 'venda' ? 'comprar' : 'alugar'}
          </h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((o) => (
              <li key={o.id}>
                <PropertyCard property={o} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Attr({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-(--pi-line)">
      <dt className="flex items-center gap-2 text-sm text-(--pi-muted)">
        <span aria-hidden="true" className="text-(--pi-green)">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-[1.15rem] font-semibold">{value}</dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-(--pi-muted)">{label}</dt>
      <dd className={`tabular-nums ${strong ? 'font-semibold' : ''}`}>{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------ galeria */

function Gallery({ property: p }: { property: Property }) {
  const [index, setIndex] = useState(0);
  const count = p.gallery.length;
  const go = (i: number) => setIndex((i + count) % count);
  const current = p.gallery[index];

  // Ao trocar de imóvel (ex.: pelos similares), volta para a primeira imagem.
  useEffect(() => {
    setIndex(0);
  }, [p.id]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  }

  return (
    <section aria-roledescription="galeria" aria-label={`Imagens ilustrativas de ${p.title}`} onKeyDown={onKeyDown}>
      <figure className="relative overflow-hidden rounded-2xl bg-(--pi-mint)">
        <div className="aspect-[16/10] max-w-full">
          <Scene kind={current.scene} hue={p.hue} className="pi-scene" />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 text-[0.92rem]" aria-live="polite">
          <span>
            <span className="font-semibold">{current.caption}</span>
            <span className="text-(--pi-muted)"> · imagem {index + 1} de {count}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[0.8rem] text-(--pi-muted)">
            <Info aria-hidden="true" className="h-4 w-4" />
            Ilustração, não é foto do imóvel
          </span>
        </figcaption>
        <div className="absolute inset-x-3 top-[calc(50%-1.75rem)] flex justify-between">
          <GalleryButton label="Imagem anterior" onClick={() => go(index - 1)}>
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </GalleryButton>
          <GalleryButton label="Próxima imagem" onClick={() => go(index + 1)}>
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </GalleryButton>
        </div>
      </figure>
      <ul className="mt-3 grid grid-cols-4 gap-2" aria-label="Miniaturas">
        {p.gallery.map((g, i) => (
          <li key={g.caption + i}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={`Ver imagem ${i + 1}: ${g.caption}`}
              className={`block aspect-[16/10] w-full overflow-hidden rounded-lg ring-2 transition-opacity ${
                i === index ? 'ring-(--pi-green)' : 'opacity-75 ring-transparent hover:opacity-100'
              }`}
            >
              <Scene kind={g.scene} hue={p.hue} className="pi-scene" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GalleryButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-(--pi-green) shadow ring-1 ring-black/5 hover:bg-white"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ consulta */

function ConsultPanel({ property: p }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [interest, setInterest] = useState<Interest>('visita');
  const [status, setStatus] = useState('');
  const baseId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const message = consultMessage(p, name, interest);

  // Novo imóvel: painel fechado e status limpo.
  useEffect(() => {
    setOpen(false);
    setStatus('');
  }, [p.id]);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setStatus('Mensagem copiada. Por ser uma demonstração, nada foi enviado a nenhum corretor.');
    } catch {
      textRef.current?.focus();
      textRef.current?.select();
      setStatus('Não foi possível copiar automaticamente. O texto foi selecionado: use Ctrl+C (ou toque e segure) para copiar.');
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${baseId}-painel`}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-full bg-(--pi-green) px-5 py-3 font-semibold text-white hover:bg-(--pi-green-2)"
      >
        {open ? 'Fechar consulta' : 'Consultar imóvel'}
      </button>

      <div id={`${baseId}-painel`} hidden={!open} className="mt-5 border-t border-(--pi-line) pt-5">
        <h2 ref={headingRef} tabIndex={-1} className="font-sans text-base font-semibold tracking-normal outline-none">
          Mensagem de consulta
        </h2>
        <p className="mt-1 text-[0.88rem] text-(--pi-muted)">
          Demonstração: a Prime Imóveis é fictícia. O texto abaixo é só um exemplo para copiar e não é enviado a ninguém.
        </p>

        <label htmlFor={`${baseId}-nome`} className="mt-4 block text-[0.92rem] font-medium">
          Seu nome <span className="font-normal text-(--pi-muted)">(opcional)</span>
        </label>
        <input
          id={`${baseId}-nome`}
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(e) => { setName(e.target.value); setStatus(''); }}
          className="mt-1.5 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--pi-line) outline-none focus-visible:ring-2 focus-visible:ring-(--pi-gold-text)"
        />

        <fieldset className="mt-4">
          <legend className="text-[0.92rem] font-medium">Você quer</legend>
          <div className="mt-1.5 space-y-1.5">
            {(Object.keys(INTEREST_LABELS) as Interest[]).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-[0.95rem]">
                <input
                  type="radio"
                  name={`${baseId}-interesse`}
                  value={key}
                  checked={interest === key}
                  onChange={() => { setInterest(key); setStatus(''); }}
                  className="h-4 w-4 accent-(--pi-green)"
                />
                {INTEREST_LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor={`${baseId}-texto`} className="mt-4 block text-[0.92rem] font-medium">
          Texto gerado
        </label>
        <textarea
          id={`${baseId}-texto`}
          ref={textRef}
          readOnly
          value={message}
          rows={8}
          className="mt-1.5 w-full resize-none rounded-lg bg-(--pi-paper) p-3 text-[0.9rem] leading-relaxed ring-1 ring-(--pi-line) outline-none focus-visible:ring-2 focus-visible:ring-(--pi-gold-text)"
        />
        <button
          type="button"
          onClick={copy}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 font-semibold text-(--pi-green) ring-1 ring-(--pi-green) hover:bg-(--pi-mint)"
        >
          <Copy aria-hidden="true" className="h-4 w-4" />
          Copiar mensagem
        </button>
        <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-[0.88rem] font-medium text-(--pi-green)">
          {status}
        </p>
        <p className="text-[0.8rem] text-(--pi-muted)">
          Em um site real, este botão poderia abrir o WhatsApp ou o e-mail do corretor com a mensagem pronta.
        </p>
      </div>
      <p className="mt-3 text-center text-[0.8rem] text-(--pi-muted)">{plural(p.gallery.length, 'imagem ilustrativa', 'imagens ilustrativas')} · dados fictícios</p>
    </div>
  );
}
