/** Vitrine da Arena Store: busca, categorias e ordenação (estado no endereço). */
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CATEGORIES, DEFAULT_FILTERS,
  filterCatalog, filtersFromParams, filtersToParams, hasSizes, products, totalStock,
  type CatalogFilters, type Category, type Product, type Sort,
} from './store-data';
import { ProductArt } from './store-art';
import { StockBadge } from './store-ui';
import { useStore } from './store-i18n';

export default function StoreCatalog() {
  const { t: all, locale, categories: CATEGORY_LABELS, sorts: SORT_LABELS } = useStore();
  const t = all.catalog;
  useDocumentTitle(t.docTitle, t.docDescription);
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const results = useMemo(() => filterCatalog(products, filters, locale), [filters, locale]);

  function update(patch: Partial<CatalogFilters>, replace = false) {
    setParams(filtersToParams({ ...filters, ...patch }), { replace });
  }
  const isDefault = !filters.q.trim() && !filters.category && filters.sort === 'relevancia';
  const heading = filters.category ? CATEGORY_LABELS[filters.category] : t.all;

  return (
    <>
      <section aria-labelledby="as-titulo" className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 id="as-titulo" className="text-[2.2rem] font-bold tracking-tight sm:text-[2.8rem]">
            {heading}
          </h1>
          <p className="mt-1 text-(--as-muted)">{t.intro}</p>
        </div>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="w-full md:max-w-sm">
          <label htmlFor="as-q" className="mb-1.5 block text-[0.92rem] font-medium">
            {t.search}
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-(--as-card) px-3 ring-1 ring-(--as-line) focus-within:ring-2 focus-within:ring-(--as-orange-text)">
            <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-(--as-muted)" />
            <input
              id="as-q"
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value }, true)}
              placeholder={t.placeholder}
              autoComplete="off"
              className="h-11 w-full min-w-0 bg-transparent outline-none placeholder:text-(--as-muted)"
            />
          </div>
        </form>
      </section>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-(--as-line) pb-4">
        <fieldset>
          <legend className="sr-only">{t.category}</legend>
          <div className="flex flex-wrap gap-2">
            {([['', t.allShort], ...CATEGORIES.map((c) => [c, CATEGORY_LABELS[c]])] as Array<[Category | '', string]>).map(([value, label]) => (
              <button
                key={label}
                type="button"
                aria-pressed={filters.category === value}
                onClick={() => update({ category: value })}
                className={
                  filters.category === value
                    ? 'rounded-full bg-(--as-ink) px-4 py-2 text-[0.92rem] font-semibold text-white'
                    : 'rounded-full bg-(--as-card) px-4 py-2 text-[0.92rem] font-medium ring-1 ring-(--as-line) hover:ring-(--as-ink)/40'
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center gap-2">
          <label htmlFor="as-ordem" className="text-[0.92rem] font-medium">
            {t.sortBy}
          </label>
          <select
            id="as-ordem"
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as Sort })}
            className="h-10 rounded-lg bg-(--as-card) px-3 ring-1 ring-(--as-line) outline-none focus-visible:ring-2 focus-visible:ring-(--as-orange-text)"
          >
            {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-[0.95rem] text-(--as-muted)" aria-live="polite" id="as-contagem">
        {t.count(results.length)}
        {filters.q.trim() ? t.forQuery(filters.q.trim()) : ''}
      </p>

      {results.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {results.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl bg-(--as-card) p-8 text-center ring-1 ring-(--as-line)">
          <p className="text-lg font-semibold">{t.emptyTitle}</p>
          <p className="mt-1 text-(--as-muted)">{t.emptyText}</p>
          <button
            type="button"
            onClick={() => setParams(filtersToParams(DEFAULT_FILTERS))}
            disabled={isDefault}
            className="mt-5 rounded-full bg-(--as-orange-text) px-5 py-2.5 font-semibold text-white hover:brightness-95"
          >
            {t.seeAll}
          </button>
        </div>
      )}
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t, cents, paths, categories: CATEGORY_LABELS, product: shown } = useStore();
  const p = shown(product);
  const units = totalStock(p);
  return (
    <article className={`as-card group flex h-full flex-col overflow-hidden rounded-2xl bg-(--as-card) ring-1 ring-(--as-line) transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(21,25,28,0.45)]`}>
      <div className={`aspect-[4/3] overflow-hidden ${units ? '' : 'opacity-70'}`}>
        <ProductArt kind={p.art} color={p.color} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[0.8rem] font-medium text-(--as-muted)">{CATEGORY_LABELS[p.category]}</p>
        <h2 className="mt-0.5 font-sans text-[1rem] leading-snug font-semibold tracking-normal">
          <Link to={paths.product(p.id)} className="as-card-link" data-product={p.id}>
            {p.name}
          </Link>
        </h2>
        <p className="mt-1 font-display text-[1.2rem] font-bold tabular-nums">{cents(p.price)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <StockBadge units={units} />
          {hasSizes(p) && <span className="text-[0.8rem] text-(--as-muted)">{t.catalog.sizes(p.sizes.length)}</span>}
        </div>
      </div>
    </article>
  );
}
