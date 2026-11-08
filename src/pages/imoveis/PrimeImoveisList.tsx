/**
 * Catálogo da Prime Imóveis: busca, filtros combináveis e cards.
 * Os filtros vivem na URL (fonte única da verdade), então atualizar a
 * página, usar "voltar" no navegador ou compartilhar o link mantém a busca.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Car, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  BEDROOM_OPTIONS, CITY, EMPTY_FILTERS, NEIGHBORHOODS, PRICE_RANGES, TYPES,
  activeFilterCount, filterProperties, filtersFromParams, filtersToParams, findRange, formatPrice, plural,
  properties, rangeLabel, summary, type Filters, type Property, type Purpose,
} from './imoveis-data';
import { rememberLastViewed, rememberSearch, takeLastViewed } from './imoveis-nav';
import { Scene } from './imoveis-art';
import { usePi } from './imoveis-i18n';

export default function PrimeImoveisList() {
  const { t: all, locale, types: TYPE_LABELS, purposes: PURPOSE_LABELS } = usePi();
  const t = all.list;
  useDocumentTitle(t.docTitle, t.docDescription(CITY));
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const results = useMemo(() => filterProperties(properties, filters, locale), [filters, locale]);
  const activeCount = activeFilterCount(filters);
  const [panelOpen, setPanelOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  // Guarda a busca atual para o botão "Voltar para os resultados" do detalhe.
  const search = filtersToParams(filters).toString();
  useEffect(() => {
    rememberSearch(search ? `?${search}` : '');
  }, [search]);

  // Ao voltar do detalhe, devolve o foco ao card do imóvel visitado.
  useEffect(() => {
    const id = takeLastViewed();
    if (!id) return;
    const link = listRef.current?.querySelector<HTMLAnchorElement>(`[data-property="${id}"]`);
    if (link) {
      link.scrollIntoView({ block: 'center', behavior: 'instant' });
      link.focus({ preventScroll: true });
    }
  }, []);

  function update(patch: Partial<Filters>, options: { replace?: boolean } = {}) {
    const next = { ...filters, ...patch };
    // A faixa de preço depende da finalidade: ao trocar de finalidade, ela é descartada.
    if ('purpose' in patch && patch.purpose !== filters.purpose) next.price = '';
    setParams(filtersToParams(next), { replace: options.replace ?? false });
  }

  const clearAll = () => setParams(filtersToParams(EMPTY_FILTERS));

  const chips: { label: string; clear: Partial<Filters> }[] = [];
  if (filters.q.trim()) chips.push({ label: t.chipSearch(filters.q.trim()), clear: { q: '' } });
  if (filters.purpose) chips.push({ label: PURPOSE_LABELS[filters.purpose], clear: { purpose: '' } });
  if (filters.type) chips.push({ label: TYPE_LABELS[filters.type], clear: { type: '' } });
  if (filters.neighborhood) chips.push({ label: filters.neighborhood, clear: { neighborhood: '' } });
  const range = findRange(filters.purpose, filters.price);
  if (range && filters.purpose) chips.push({ label: rangeLabel(range, filters.purpose, locale), clear: { price: '' } });
  if (filters.bedrooms) chips.push({ label: t.chipBedrooms(filters.bedrooms), clear: { bedrooms: 0 } });

  return (
    <>
      <section aria-labelledby="pi-busca-titulo" className="pi-on-green bg-(--pi-green) pb-10 text-white">
        <div className="mx-auto max-w-[76rem] px-4 pt-6 sm:px-6 lg:px-8">
          <h1 id="pi-busca-titulo" className="max-w-[22ch] text-[2.1rem] font-semibold sm:text-[2.8rem]">
            {t.title(CITY)}
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            {t.intro(properties.length)}
          </p>

          <form role="search" className="mt-7 flex flex-col gap-3 md:flex-row md:items-end" onSubmit={(e) => e.preventDefault()}>
            <fieldset className="shrink-0">
              <legend className="mb-2 text-sm font-medium text-white/85">{t.purpose}</legend>
              <div className="inline-flex rounded-full bg-white/10 p-1">
                {([['', t.all], ['venda', t.buy], ['aluguel', t.rent]] as const).map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={filters.purpose === value}
                    onClick={() => update({ purpose: value as Purpose | '' })}
                    className={
                      filters.purpose === value
                        ? 'rounded-full bg-(--pi-gold) px-4 py-2 text-sm font-semibold text-(--pi-green)'
                        : 'rounded-full px-4 py-2 text-sm font-medium text-white hover:bg-white/10'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="min-w-0 flex-1">
              <label htmlFor="pi-q" className="mb-2 block text-sm font-medium text-white/85">
                {t.searchLabel}
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 text-(--pi-ink) focus-within:ring-2 focus-within:ring-(--pi-gold)">
                <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-(--pi-muted)" />
                <input
                  id="pi-q"
                  type="search"
                  value={filters.q}
                  onChange={(e) => update({ q: e.target.value }, { replace: true })}
                  placeholder={t.searchPlaceholder}
                  autoComplete="off"
                  className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-(--pi-muted)"
                />
              </div>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-[76rem] gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8 [&>*]:min-w-0">
        <aside aria-label={t.filters}>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 font-semibold ring-1 ring-(--pi-line) lg:hidden"
            aria-expanded={panelOpen}
            aria-controls="pi-filtros"
            onClick={() => setPanelOpen((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
              {t.filters}{activeCount ? ` (${activeCount})` : ''}
            </span>
            <span className="text-sm font-medium text-(--pi-muted)">{panelOpen ? t.close : t.open}</span>
          </button>

          <div id="pi-filtros" className={`${panelOpen ? 'mt-3 block' : 'hidden'} space-y-5 rounded-2xl bg-white p-5 ring-1 ring-(--pi-line) lg:sticky lg:top-4 lg:mt-0 lg:block`}>
            <h2 className="hidden font-sans text-base font-semibold tracking-normal lg:block">{t.filters}</h2>
            <Select label={t.type} id="pi-tipo" value={filters.type} onChange={(v) => update({ type: v as Filters['type'] })}>
              <option value="">{t.allTypes}</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
            <Select label={t.neighborhood} id="pi-bairro" value={filters.neighborhood} onChange={(v) => update({ neighborhood: v })}>
              <option value="">{t.allNeighborhoods}</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <div>
              <Select
                label={t.price}
                id="pi-preco"
                value={filters.price}
                disabled={!filters.purpose}
                describedBy="pi-preco-dica"
                onChange={(v) => update({ price: v })}
              >
                <option value="">{filters.purpose ? t.anyPrice : t.pickPurpose}</option>
                {filters.purpose &&
                  PRICE_RANGES[filters.purpose].map((r) => (
                    <option key={r.value} value={r.value}>
                      {rangeLabel(r, filters.purpose as Purpose, locale)}
                    </option>
                  ))}
              </Select>
              <p id="pi-preco-dica" className="mt-1.5 text-[0.82rem] text-(--pi-muted)">
                {filters.purpose === 'aluguel' ? t.priceRent : filters.purpose === 'venda' ? t.priceSale : t.priceNone}
              </p>
            </div>
            <fieldset>
              <legend className="mb-2 text-[0.92rem] font-medium">{t.bedrooms}</legend>
              <div className="flex flex-wrap gap-1.5">
                {[0, ...BEDROOM_OPTIONS].map((n) => (
                  <label key={n} className="cursor-pointer">
                    <input
                      type="radio"
                      name="pi-quartos"
                      value={n}
                      checked={filters.bedrooms === n}
                      onChange={() => update({ bedrooms: n })}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full px-3 py-1.5 text-sm ring-1 ring-(--pi-line) peer-checked:bg-(--pi-green) peer-checked:text-white peer-checked:ring-(--pi-green) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--pi-gold-text)">
                      {n ? `${n}+` : t.any}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={clearAll}
              disabled={!activeCount}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-(--pi-green) ring-1 ring-(--pi-green)/40 hover:bg-(--pi-mint) disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t.clear}
            </button>
          </div>
        </aside>

        <section aria-labelledby="pi-resultados-titulo">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="pi-resultados-titulo" className="text-[1.5rem] font-semibold" aria-live="polite">
              {results.length ? t.found(results.length) : t.none}
            </h2>
            <p className="text-sm text-(--pi-muted)">{t.ofCatalog(properties.length)}</p>
          </div>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={t.active}>
              {chips.map((chip) => (
                <li key={chip.label}>
                  <button
                    type="button"
                    onClick={() => update(chip.clear)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pr-2 pl-3 text-sm ring-1 ring-(--pi-line) hover:ring-(--pi-green)"
                  >
                    {chip.label}
                    <X aria-hidden="true" className="h-4 w-4 text-(--pi-muted)" />
                    <span className="sr-only">{t.removeFilter}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {results.length ? (
            <ul ref={listRef} className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <li key={p.id}>
                  <PropertyCard property={p} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-(--pi-line)">
              <p className="text-lg font-semibold">{t.emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-md text-(--pi-muted)">{t.emptyText}</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 rounded-full bg-(--pi-green) px-5 py-2.5 font-semibold text-white hover:bg-(--pi-green-2)"
              >
                {t.clearAll}
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Select({
  label, id, value, onChange, disabled, describedBy, children,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void; disabled?: boolean; describedBy?: string; children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.92rem] font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg bg-white px-3 text-[0.95rem] ring-1 ring-(--pi-line) outline-none focus-visible:ring-2 focus-visible:ring-(--pi-gold-text) disabled:cursor-not-allowed disabled:bg-(--pi-paper) disabled:text-(--pi-muted)"
      >
        {children}
      </select>
    </div>
  );
}

export function PropertyCard({ property, headingLevel = 3 }: { property: Property; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const { t, locale, listPath, types: TYPE_LABELS, purposes: PURPOSE_LABELS, shown } = usePi();
  const p = shown(property);
  return (
    <article className="pi-card group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-(--pi-line) transition-shadow hover:shadow-[0_14px_34px_-18px_rgba(27,36,32,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-(--pi-mint)">
        <Scene kind={p.gallery[0].scene} hue={p.hue} className="pi-scene transition-transform duration-500 group-hover:scale-[1.03]" />
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[0.78rem] font-semibold text-(--pi-green) ${
            p.purpose === 'venda' ? 'bg-(--pi-sand)' : 'bg-(--pi-mint)'
          }`}
        >
          {PURPOSE_LABELS[p.purpose]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-display text-[1.35rem] font-semibold tabular-nums">{formatPrice(p, locale)}</p>
        <Heading className="mt-1 font-sans text-[1.02rem] leading-snug font-semibold tracking-normal">
          <Link to={`${listPath}/${p.id}`} className="pi-card-link" data-property={p.id} onClick={() => rememberLastViewed(p.id)}>
            {p.title}
          </Link>
        </Heading>
        <p className="mt-1 flex items-center gap-1.5 text-[0.9rem] text-(--pi-muted)">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
          {p.neighborhood} · {TYPE_LABELS[p.type]}
        </p>
        <div className="mt-auto pt-3">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--pi-line) pt-3 text-[0.88rem] text-(--pi-ink)">
            <span>{summary(p, locale)}</span>
            <span className="inline-flex items-center gap-1">
              <Car aria-hidden="true" className="h-4 w-4 text-(--pi-muted)" />
              {p.parking ? plural(p.parking, t.card.parking[0], t.card.parking[1]) : t.card.noParking}
            </span>
          </p>
          <p className="mt-2 text-[0.78rem] text-(--pi-muted)">
            {t.card.code} {p.id}
          </p>
        </div>
      </div>
    </article>
  );
}
