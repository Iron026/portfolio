/**
 * Cadastro demonstrativo do catálogo (até 10 itens), salvo apenas
 * no localStorage deste navegador.
 */
import { useId, useState } from 'react';
import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { MAX_ITEMS, UNITS, validateItemName, validatePrice, type CatalogItem, type UnitId } from './orca-data';
import { useOrca } from './orca-i18n';

interface Props {
  catalog: CatalogItem[];
  onSave: (item: CatalogItem) => void;
  onRemove: (id: string) => void;
  onRestore: () => void;
  usedIds: Set<string>;
  storageOk: boolean;
}

type Draft = { id?: string; name: string; unit: UnitId; price: string };
const EMPTY: Draft = { name: '', unit: 'unidade', price: '' };

export function CatalogManager({ catalog, onSave, onRemove, onRestore, usedIds, storageOk }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [status, setStatus] = useState('');
  const baseId = useId();
  const { t: all, locale, money, unit, name: shownName, toInput } = useOrca();
  const t = all.catalog;
  const full = catalog.length >= MAX_ITEMS;

  function startNew() {
    setDraft({ ...EMPTY });
    setErrors({});
    setStatus('');
    window.setTimeout(() => document.getElementById(`${baseId}-nome`)?.focus(), 0);
  }
  function startEdit(item: CatalogItem) {
    setDraft({ id: item.id, name: shownName(item), unit: item.unit, price: toInput(item.price) });
    setErrors({});
    setStatus('');
    window.setTimeout(() => document.getElementById(`${baseId}-nome`)?.focus(), 0);
  }
  function save() {
    if (!draft) return;
    const nameError = validateItemName(draft.name, catalog, draft.id, locale);
    const price = validatePrice(draft.price, locale);
    const found = { name: nameError, price: price.error };
    setErrors(found);
    if (nameError) return document.getElementById(`${baseId}-nome`)?.focus();
    if (price.error) return document.getElementById(`${baseId}-preco`)?.focus();
    const name = draft.name.trim().replace(/\s+/g, ' ');
    // Nome sem alteração (por exemplo, item de exemplo exibido em inglês): mantém o nome salvo.
    const original = catalog.find((i) => i.id === draft.id);
    const stored = original && name === shownName(original) ? original.name : name;
    onSave({ id: draft.id ?? `item-${Date.now().toString(36)}`, name: stored, unit: draft.unit, price: price.cents! });
    setStatus(draft.id ? t.updated(name) : t.added(name));
    setDraft(null);
  }

  return (
    <section aria-labelledby={`${baseId}-titulo`} className="rounded-2xl bg-white p-5 ring-1 ring-(--orca-line) sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${baseId}-titulo`} className="text-[1.3rem] font-semibold">
            {t.title}
          </h2>
          <p className="mt-1 text-[0.92rem] text-(--orca-muted)">
            {t.count(catalog.length, MAX_ITEMS)}
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          disabled={full || !!draft}
          className="inline-flex items-center gap-2 rounded-full bg-(--orca-blue) px-4 py-2 font-semibold text-white hover:bg-(--orca-blue-2) disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {t.newItem}
        </button>
      </div>
      {full && <p className="mt-3 text-[0.9rem] text-(--orca-warn)">{t.full(MAX_ITEMS)}</p>}
      {!storageOk && <p className="mt-3 text-[0.9rem] text-(--orca-warn)">{t.noStorage}</p>}

      {draft && (
        <div className="mt-4 rounded-xl bg-(--orca-wash) p-4" role="group" aria-label={draft.id ? t.editGroup : t.newGroup}>
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem] [&>*]:min-w-0">
            <div>
              <label htmlFor={`${baseId}-nome`} className="text-[0.92rem] font-medium">{t.name}</label>
              <input
                id={`${baseId}-nome`}
                value={draft.name}
                maxLength={70}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${baseId}-nome-erro` : undefined}
                className="mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue) aria-[invalid=true]:ring-(--orca-error)"
              />
              {errors.name && <p id={`${baseId}-nome-erro`} className="mt-1 text-[0.85rem] font-medium text-(--orca-error)">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={`${baseId}-unidade`} className="text-[0.92rem] font-medium">{t.soldBy}</label>
              <select
                id={`${baseId}-unidade`}
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value as UnitId })}
                className="mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue)"
              >
                {(Object.keys(UNITS) as UnitId[]).map((u) => (
                  <option key={u} value={u}>{unit(u).label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${baseId}-preco`} className="text-[0.92rem] font-medium">{t.price}</label>
              <input
                id={`${baseId}-preco`}
                inputMode="decimal"
                value={draft.price}
                placeholder={t.pricePh}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? `${baseId}-preco-erro` : undefined}
                className="orca-num mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue) aria-[invalid=true]:ring-(--orca-error)"
              />
              {errors.price && <p id={`${baseId}-preco-erro`} className="mt-1 text-[0.85rem] font-medium text-(--orca-error)">{errors.price}</p>}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={save} className="rounded-full bg-(--orca-blue) px-5 py-2 font-semibold text-white hover:bg-(--orca-blue-2)">
              {draft.id ? t.saveChanges : t.addToCatalog}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full px-5 py-2 font-semibold ring-1 ring-(--orca-line) hover:bg-white">
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <ul className="mt-4 divide-y divide-(--orca-line)">
        {catalog.map((item) => {
          const label = shownName(item);
          return (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5" data-catalog-item={item.id}>
            <div className="min-w-0">
              <p className="font-medium">{label}</p>
              <p className="orca-num text-[0.88rem] text-(--orca-muted)">
                {t.per(money(item.price), unit(item.unit).label)}
              </p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => startEdit(item)} aria-label={t.edit(label)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-(--orca-wash)">
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemove(item.id);
                  setStatus(usedIds.has(item.id) ? t.removedBoth(label) : t.removed(label));
                  if (draft?.id === item.id) setDraft(null);
                }}
                disabled={catalog.length <= 1}
                aria-label={t.remove(label)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-(--orca-wash) disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </li>
          );
        })}
      </ul>

      <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] text-[0.9rem] font-medium text-(--orca-blue)">{status}</p>

      <div className="mt-2 text-[0.9rem]">
        {confirmRestore ? (
          <span className="flex flex-wrap items-center gap-2">
            {t.confirmRestore}
            <button
              type="button"
              onClick={() => {
                onRestore();
                setConfirmRestore(false);
                setDraft(null);
                setStatus(t.restored);
              }}
              className="rounded-full bg-(--orca-ink) px-3 py-1 font-semibold text-white"
            >
              {t.restore}
            </button>
            <button type="button" onClick={() => setConfirmRestore(false)} className="rounded-full px-3 py-1 font-semibold ring-1 ring-(--orca-line)">
              {t.cancel}
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmRestore(true)} className="inline-flex items-center gap-1.5 rounded font-medium text-(--orca-muted) underline underline-offset-2 hover:text-(--orca-ink)">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            {t.restoreSample}
          </button>
        )}
      </div>
    </section>
  );
}
