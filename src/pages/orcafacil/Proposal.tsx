/** Proposta comercial: usada na tela (pré-visualização) e na impressão. */
import { BUSINESS, quoteTotals, type ProposalInfo } from './orca-data';
import { useOrca } from './orca-i18n';

export function Proposal({ t: totals, info, idPrefix = 'orca' }: { t: ReturnType<typeof quoteTotals>; info: ProposalInfo; idPrefix?: string }) {
  const { t: all, money, qty, percent, multiplier, date: fmtDate, name, opt } = useOrca();
  const t = all.doc;
  const date = fmtDate(info.date);
  const until = fmtDate(new Date(info.date.getFullYear(), info.date.getMonth(), info.date.getDate() + info.validityDays));
  return (
    <article aria-labelledby={`${idPrefix}-doc-titulo`} className="orca-doc rounded-2xl bg-white p-6 ring-1 ring-(--orca-line) sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-(--orca-line) pb-5">
        <div>
          <p className="text-[0.9rem] font-semibold text-(--orca-muted)">{t.company(BUSINESS.name, BUSINESS.city)}</p>
          <h2 id={`${idPrefix}-doc-titulo`} className="mt-1 text-[1.6rem] font-bold tracking-tight">
            {t.title}
          </h2>
          <p className="orca-num mt-1 text-[0.92rem]">{info.number}</p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-[0.92rem]">
          <dt className="text-(--orca-muted)">{t.date}</dt>
          <dd className="orca-num text-right">{date}</dd>
          <dt className="text-(--orca-muted)">{t.until}</dt>
          <dd className="orca-num text-right">{until}</dd>
          <dt className="text-(--orca-muted)">{t.client}</dt>
          <dd className="text-right">{info.client.trim() || t.noClient}</dd>
        </dl>
      </header>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.92rem]">
          <caption className="sr-only">{t.caption}</caption>
          <thead>
            <tr className="border-b border-(--orca-line) text-[0.8rem] text-(--orca-muted)">
              <th scope="col" className="py-2 pr-3 font-semibold">{t.item}</th>
              <th scope="col" className="py-2 pr-3 font-semibold">{t.spec}</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">{t.quantity}</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">{t.unit}</th>
              <th scope="col" className="py-2 text-right font-semibold">{t.value}</th>
            </tr>
          </thead>
          <tbody>
            {totals.rows.map((r, i) => (
              <tr key={i} className="border-b border-(--orca-line) align-top">
                <td className="py-2.5 pr-3 font-medium">{name(r.item)}</td>
                <td className="py-2.5 pr-3 text-(--orca-muted)">
                  {all.review.material(opt('material', r.options.material).label, multiplier(r.options.material.bp))} · {opt('acabamento', r.options.acabamento).label}
                  {r.options.acabamento.bp ? ` (+${percent(r.options.acabamento.bp)})` : ''} · {t.turnaround(opt('prazo', r.options.prazo).label)}
                  {r.options.prazo.bp ? ` (+${percent(r.options.prazo.bp)})` : ''}
                </td>
                <td className="orca-num py-2.5 pr-3 text-right whitespace-nowrap">{qty(r.qty, r.item.unit)}</td>
                <td className="orca-num py-2.5 pr-3 text-right whitespace-nowrap">{money(r.unitPrice)}</td>
                <td className="orca-num py-2.5 text-right font-semibold whitespace-nowrap">{money(r.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-[0.95rem]">
        <div className="flex justify-between gap-4">
          <dt>{all.review.subtotal}</dt>
          <dd className="orca-num">{money(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{all.review.discountLabel}{totals.discountBp ? ` (${percent(totals.discountBp)})` : ''}</dt>
          <dd className="orca-num">{totals.discount ? `−${money(totals.discount)}` : money(0)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-(--orca-ink) pt-2 text-[1.15rem] font-bold">
          <dt>{all.review.total}</dt>
          <dd className="orca-num" data-doc-total>{money(totals.total)}</dd>
        </div>
      </dl>

      {info.notes.trim() && (
        <div className="mt-5">
          <h3 className="font-sans text-[0.92rem] font-semibold tracking-normal">{t.notes}</h3>
          <p className="mt-1 text-[0.92rem] whitespace-pre-line">{info.notes.trim()}</p>
        </div>
      )}
      <p className="mt-6 border-t border-(--orca-line) pt-3 text-[0.8rem] text-(--orca-muted)">
        {t.footnote}
      </p>
    </article>
  );
}
