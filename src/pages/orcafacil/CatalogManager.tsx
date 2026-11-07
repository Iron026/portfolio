/**
 * Cadastro demonstrativo do catálogo (até 10 itens), salvo apenas
 * no localStorage deste navegador.
 */
import { useId, useState } from 'react';
import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { MAX_ITEMS, UNITS, money, validateItemName, validatePrice, type CatalogItem, type UnitId } from './orca-data';

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
const centsToInput = (c: number) => (c / 100).toFixed(2).replace('.', ',');

export function CatalogManager({ catalog, onSave, onRemove, onRestore, usedIds, storageOk }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [status, setStatus] = useState('');
  const baseId = useId();
  const full = catalog.length >= MAX_ITEMS;

  function startNew() {
    setDraft({ ...EMPTY });
    setErrors({});
    setStatus('');
    window.setTimeout(() => document.getElementById(`${baseId}-nome`)?.focus(), 0);
  }
  function startEdit(item: CatalogItem) {
    setDraft({ id: item.id, name: item.name, unit: item.unit, price: centsToInput(item.price) });
    setErrors({});
    setStatus('');
    window.setTimeout(() => document.getElementById(`${baseId}-nome`)?.focus(), 0);
  }
  function save() {
    if (!draft) return;
    const nameError = validateItemName(draft.name, catalog, draft.id);
    const price = validatePrice(draft.price);
    const found = { name: nameError, price: price.error };
    setErrors(found);
    if (nameError) return document.getElementById(`${baseId}-nome`)?.focus();
    if (price.error) return document.getElementById(`${baseId}-preco`)?.focus();
    const name = draft.name.trim().replace(/\s+/g, ' ');
    onSave({ id: draft.id ?? `item-${Date.now().toString(36)}`, name, unit: draft.unit, price: price.cents! });
    setStatus(draft.id ? `“${name}” atualizado.` : `“${name}” adicionado ao catálogo.`);
    setDraft(null);
  }

  return (
    <section aria-labelledby={`${baseId}-titulo`} className="rounded-2xl bg-white p-5 ring-1 ring-(--orca-line) sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${baseId}-titulo`} className="text-[1.3rem] font-semibold">
            Catálogo de produtos
          </h2>
          <p className="mt-1 text-[0.92rem] text-(--orca-muted)">
            <span className="orca-num">{catalog.length}</span> de {MAX_ITEMS} itens. Salvo só neste navegador: não sincroniza com outros dispositivos.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          disabled={full || !!draft}
          className="inline-flex items-center gap-2 rounded-full bg-(--orca-blue) px-4 py-2 font-semibold text-white hover:bg-(--orca-blue-2) disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Novo item
        </button>
      </div>
      {full && <p className="mt-3 text-[0.9rem] text-(--orca-warn)">O catálogo chegou ao limite de {MAX_ITEMS} itens. Remova um item para cadastrar outro.</p>}
      {!storageOk && <p className="mt-3 text-[0.9rem] text-(--orca-warn)">Este navegador não permite salvar: as alterações valem só até fechar a página.</p>}

      {draft && (
        <div className="mt-4 rounded-xl bg-(--orca-wash) p-4" role="group" aria-label={draft.id ? 'Editar item' : 'Novo item'}>
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem] [&>*]:min-w-0">
            <div>
              <label htmlFor={`${baseId}-nome`} className="text-[0.92rem] font-medium">Nome do item</label>
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
              <label htmlFor={`${baseId}-unidade`} className="text-[0.92rem] font-medium">Vendido por</label>
              <select
                id={`${baseId}-unidade`}
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value as UnitId })}
                className="mt-1 h-11 w-full rounded-lg bg-white px-3 ring-1 ring-(--orca-line) outline-none focus-visible:ring-2 focus-visible:ring-(--orca-blue)"
              >
                {(Object.keys(UNITS) as UnitId[]).map((u) => (
                  <option key={u} value={u}>{UNITS[u].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${baseId}-preco`} className="text-[0.92rem] font-medium">Preço base (R$)</label>
              <input
                id={`${baseId}-preco`}
                inputMode="decimal"
                value={draft.price}
                placeholder="89,90"
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
              {draft.id ? 'Salvar alterações' : 'Adicionar ao catálogo'}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full px-5 py-2 font-semibold ring-1 ring-(--orca-line) hover:bg-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ul className="mt-4 divide-y divide-(--orca-line)">
        {catalog.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5" data-catalog-item={item.id}>
            <div className="min-w-0">
              <p className="font-medium">{item.name}</p>
              <p className="orca-num text-[0.88rem] text-(--orca-muted)">
                {money(item.price)} por {UNITS[item.unit].label}
              </p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => startEdit(item)} aria-label={`Editar ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-(--orca-wash)">
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemove(item.id);
                  setStatus(usedIds.has(item.id) ? `“${item.name}” removido do catálogo e do orçamento.` : `“${item.name}” removido do catálogo.`);
                  if (draft?.id === item.id) setDraft(null);
                }}
                disabled={catalog.length <= 1}
                aria-label={`Remover ${item.name}`}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-(--orca-wash) disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] text-[0.9rem] font-medium text-(--orca-blue)">{status}</p>

      <div className="mt-2 text-[0.9rem]">
        {confirmRestore ? (
          <span className="flex flex-wrap items-center gap-2">
            Voltar ao catálogo de exemplo? Seus itens cadastrados serão apagados.
            <button
              type="button"
              onClick={() => {
                onRestore();
                setConfirmRestore(false);
                setDraft(null);
                setStatus('Catálogo de exemplo restaurado.');
              }}
              className="rounded-full bg-(--orca-ink) px-3 py-1 font-semibold text-white"
            >
              Restaurar
            </button>
            <button type="button" onClick={() => setConfirmRestore(false)} className="rounded-full px-3 py-1 font-semibold ring-1 ring-(--orca-line)">
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmRestore(true)} className="inline-flex items-center gap-1.5 rounded font-medium text-(--orca-muted) underline underline-offset-2 hover:text-(--orca-ink)">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Restaurar catálogo de exemplo
          </button>
        )}
      </div>
    </section>
  );
}
