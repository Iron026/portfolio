/** Peças pequenas reutilizadas nas telas da Arena Store. */
import { Minus, Plus } from 'lucide-react';
import { stockLevel } from './store-data';

export function StockBadge({ units, className = '' }: { units: number; className?: string }) {
  const level = stockLevel(units);
  const styles = {
    esgotado: 'bg-(--as-line) text-(--as-muted)',
    ultimas: 'bg-(--as-low-bg) text-(--as-low)',
    disponivel: 'bg-(--as-ok-bg) text-(--as-ok)',
  }[level];
  const text = { esgotado: 'Esgotado', ultimas: units === 1 ? 'Última unidade' : `Últimas ${units} unidades`, disponivel: 'Em estoque' }[level];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.8rem] font-semibold ${styles} ${className}`}>{text}</span>;
}

/** Seletor de quantidade com − e +, limitado entre `min` e `max`. */
export function QtyStepper({
  id, value, min = 1, max, onChange, label, size = 'md',
}: {
  id: string; value: number; min?: number; max: number; onChange: (n: number) => void; label: string; size?: 'sm' | 'md';
}) {
  const h = size === 'sm' ? 'h-9' : 'h-11';
  const w = size === 'sm' ? 'w-9' : 'w-11';
  const clamp = (n: number) => Math.min(Math.max(min, Math.floor(n) || min), Math.max(min, max));
  return (
    <div className="inline-flex items-center rounded-full bg-(--as-card) ring-1 ring-(--as-line)">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`Diminuir quantidade de ${label}`}
        className={`grid ${h} ${w} place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <label htmlFor={id} className="sr-only">
        Quantidade de {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className={`as-qty ${h} w-12 bg-transparent text-center font-semibold tabular-nums outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-(--as-orange-text)`}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
        className={`grid ${h} ${w} place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
