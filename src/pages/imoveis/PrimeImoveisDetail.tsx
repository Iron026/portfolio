/**
 * Página individual do imóvel: galeria, atributos, descrição e consulta.
 * A consulta apenas gera um texto de exemplo para copiar: nada é enviado.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bath, BedDouble, Car, Check, ChevronLeft, ChevronRight, Copy, Info, MapPin, Ruler } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CITY, interestLabels,
  consultMessage, formatMoney, formatPrice, getProperty, monthlyTotal, pricePerSquareMeter, properties,
  type Interest, type Property,
} from './imoveis-data';
import { rememberLastViewed, savedSearch } from './imoveis-nav';
import { usePi } from './imoveis-i18n';
import { Scene } from './imoveis-art';
import { PropertyCard } from './PrimeImoveisList';

export default function PrimeImoveisDetail() {
  const { id } = useParams();
  const { t: all, locale, listPath: LIST_PATH, types: TYPE_LABELS, purposes: PURPOSE_LABELS, shown } = usePi();
  const t = all.detail;
  const found = getProperty(id);
  const property = found ? shown(found) : undefined;
  useDocumentTitle(
    property ? `${property.title} (${property.id}) · Prime Imóveis` : t.notFoundTitle,
    property ? t.docDescription(PURPOSE_LABELS[property.purpose], property.title, property.neighborhood) : undefined,
  );
  const back = { pathname: LIST_PATH, search: savedSearch() };

  // Ao abrir o detalhe por link direto, o "voltar" ainda devolve o foco a este card.
  useEffect(() => {
    if (property) rememberLastViewed(property.id);
  }, [property]);

  if (!property) {
    return (
      <div className="mx-auto max-w-[76rem] px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-[2rem] font-semibold">{t.notFound}</h1>
        <p className="mt-3 max-w-lg text-(--pi-muted)">{t.notFoundText(id)}</p>
        <Link to={back} className="mt-6 inline-flex rounded-full bg-(--pi-green) px-5 py-2.5 font-semibold text-white hover:bg-(--pi-green-2)">
          {t.available}
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
          {back.search ? t.backResults : t.seeAll}
        </Link>
        <nav aria-label={t.path} className="text-sm text-(--pi-muted)">
          <ol className="flex flex-wrap gap-1.5">
            <li>
              <Link to={LIST_PATH} className="rounded hover:underline">{t.properties}</Link>
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
                {TYPE_LABELS[p.type]} · {t.code} {p.id}
              </span>
            </div>
            <h1 className="mt-3 text-[2rem] font-semibold sm:text-[2.5rem]">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-(--pi-muted)">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              {p.neighborhood}, {CITY}
            </p>
            {/* No celular o quadro de valores fica mais abaixo; o preço aparece já aqui. */}
            <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:hidden">
              <span className="font-display text-[1.6rem] font-semibold tabular-nums">{formatPrice(p, locale)}</span>
              <a href="#pi-valores" onClick={(e) => { e.preventDefault(); document.getElementById('pi-valores')?.scrollIntoView({ block: 'start' }); }} className="rounded font-semibold text-(--pi-green) underline underline-offset-2">
                {t.seePrices}
              </a>
            </p>
          </div>

          <h2 className="sr-only">{t.mainFeatures}</h2>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Attr icon={<BedDouble className="h-5 w-5" />} label={t.bedrooms} value={p.bedrooms ? String(p.bedrooms) : t.notApplicable} />
            <Attr icon={<Bath className="h-5 w-5" />} label={t.bathrooms} value={String(p.bathrooms)} />
            <Attr icon={<Car className="h-5 w-5" />} label={t.parking} value={p.parking ? String(p.parking) : t.none} />
            <Attr icon={<Ruler className="h-5 w-5" />} label={t.area} value={`${p.area} m²`} />
          </dl>

          <h2 className="mt-9 text-[1.4rem] font-semibold">{t.about}</h2>
          <p className="mt-3 max-w-[65ch] text-[1.02rem] leading-relaxed">{p.description}</p>

          <h2 className="mt-8 text-[1.4rem] font-semibold">{t.highlights}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.features.map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.92rem] ring-1 ring-(--pi-line)">
                <Check aria-hidden="true" className="h-4 w-4 text-(--pi-green)" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <aside id="pi-valores" aria-label={t.pricesPanel} className="lg:self-start">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-(--pi-line)">
            <p className="text-sm text-(--pi-muted)">{p.purpose === 'venda' ? t.salePrice : t.monthlyRent}</p>
            <p className="font-display text-[2rem] font-semibold tabular-nums">{formatPrice(p, locale)}</p>
            <dl className="mt-4 space-y-2 border-t border-(--pi-line) pt-4 text-[0.95rem]">
              <Row label={t.condo} value={p.condo ? `${formatMoney(p.condo, locale)}${t.perMonth}` : t.noCondo} />
              <Row label={t.iptu} value={`${formatMoney(p.iptu, locale)}${t.perMonth}`} />
              {total !== null && <Row label={t.monthlyTotal} value={`${formatMoney(total, locale)}${t.perMonth}`} strong />}
              {perM2 !== null && <Row label={t.perM2} value={formatMoney(perM2, locale)} />}
            </dl>
            <ConsultPanel property={p} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="pi-similares" className="mt-14">
          <h2 id="pi-similares" className="text-[1.5rem] font-semibold">
            {t.similar(p.purpose)}
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
  const t = usePi().t.gallery;
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
    <section aria-roledescription={t.role} aria-label={t.label(p.title)} onKeyDown={onKeyDown}>
      <figure className="relative overflow-hidden rounded-2xl bg-(--pi-mint)">
        <div className="aspect-[16/10] max-w-full">
          <Scene kind={current.scene} hue={p.hue} className="pi-scene" />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 text-[0.92rem]" aria-live="polite">
          <span>
            <span className="font-semibold">{current.caption}</span>
            <span className="text-(--pi-muted)">{t.position(index + 1, count)}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[0.8rem] text-(--pi-muted)">
            <Info aria-hidden="true" className="h-4 w-4" />
            {t.illustration}
          </span>
        </figcaption>
        <div className="absolute inset-x-3 top-[calc(50%-1.75rem)] flex justify-between">
          <GalleryButton label={t.previous} onClick={() => go(index - 1)}>
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </GalleryButton>
          <GalleryButton label={t.next} onClick={() => go(index + 1)}>
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </GalleryButton>
        </div>
      </figure>
      <ul className="mt-3 grid grid-cols-4 gap-2" aria-label={t.thumbs}>
        {p.gallery.map((g, i) => (
          <li key={g.caption + i}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={t.see(i + 1, g.caption)}
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
  const { t: all, locale } = usePi();
  const t = all.consult;
  const INTEREST_LABELS = interestLabels(locale);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [interest, setInterest] = useState<Interest>('visita');
  const [status, setStatus] = useState('');
  const baseId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const message = consultMessage(p, name, interest, locale);

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
      setStatus(t.copied);
    } catch {
      textRef.current?.focus();
      textRef.current?.select();
      setStatus(t.copyFailed);
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
        {open ? t.close : t.open}
      </button>

      <div id={`${baseId}-painel`} hidden={!open} className="mt-5 border-t border-(--pi-line) pt-5">
        <h2 ref={headingRef} tabIndex={-1} className="font-sans text-base font-semibold tracking-normal outline-none">
          {t.title}
        </h2>
        <p className="mt-1 text-[0.88rem] text-(--pi-muted)">{t.note}</p>

        <label htmlFor={`${baseId}-nome`} className="mt-4 block text-[0.92rem] font-medium">
          {t.name} <span className="font-normal text-(--pi-muted)">{t.optional}</span>
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
          <legend className="text-[0.92rem] font-medium">{t.want}</legend>
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
          {t.generated}
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
          {t.copy}
        </button>
        <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-[0.88rem] font-medium text-(--pi-green)">
          {status}
        </p>
        <p className="text-[0.8rem] text-(--pi-muted)">
          {t.real}
        </p>
      </div>
      <p className="mt-3 text-center text-[0.8rem] text-(--pi-muted)">{t.images(p.gallery.length)}</p>
    </div>
  );
}
