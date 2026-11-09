/**
 * Gestão360 — demonstração interativa de painel financeiro.
 * Rota: /demos/gestao360 (fora do MainLayout: o app tem layout próprio,
 * com caminho de volta para Alto Code / Projetos).
 *
 * Todos os números vêm de `filtered`, o mesmo conjunto exibido na tabela:
 * indicadores, gráficos, contagem e CSV nunca divergem entre si.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/ui/Logo';
import { site } from '@/config/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import {
  ALL_CATEGORIES, DEFAULT_FILTERS, PERIODS,
  buildTrend, categoriesByKind, createDemoTransactions, csvFileName, filterTransactions,
  spendingByCategory, totalsFor, transactionsToCsv,
  type Filters, type Period, type TransactionKind,
} from './gestao360-data';
import { CATEGORY_COLORS, DonutChart, TrendChart } from './gestao360-charts';
import { useG360 } from './gestao360-i18n';
import './gestao360.css';

const PAGE_SIZE = 9;

type IconName = 'chart' | 'filter' | 'download' | 'money' | 'expense' | 'profit' | 'sales' | 'search' | 'back';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<IconName, ReactNode> = {
    chart: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 16V11m5 5V7m5 9v-4" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 18v2h16v-2" /></>,
    money: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    expense: <><path d="M4 7h16M6 11h12M9 16l3 3 3-3m-3-6v9" /></>,
    profit: <><path d="M3 17 9 11l4 4 8-8m-5 0h5v5" /></>,
    sales: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h8m-8 4h5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    back: <><path d="m14 5-7 7 7 7" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/** Baixa o CSV. O link temporário só é liberado depois que o download começa. */
function downloadCsv(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Gestao360Demo() {
  const { t, locale, intl, lp, money, compact, date, num, cat, desc } = useG360();
  useDocumentTitle(t.docTitle, t.docDescription);

  // A demo fica fora do MainLayout; garante que abra no topo ao vir do portfólio.
  // 'instant' evita a rolagem suave global do site (html { scroll-behavior: smooth }).
  // Chaves obrigatórias: desde o Chrome 150, scrollTo devolve uma Promise, e um efeito
  // não pode devolver nada além de uma função de limpeza (o React chamaria a Promise ao sair).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Apenas dados fictícios gerados no navegador; nenhuma chamada de API.
  const [today] = useState(() => new Date());
  const [rows] = useState(() => createDemoTransactions(today));
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [exportMessage, setExportMessage] = useState('');

  const filtered = useMemo(() => filterTransactions(rows, filters, today, locale), [rows, filters, today, locale]);
  const totals = useMemo(() => totalsFor(filtered), [filtered]);
  const trend = useMemo(() => buildTrend(filtered, filters.period, today, intl), [filtered, filters.period, today, intl]);
  const spending = useMemo(() => spendingByCategory(filtered), [filtered]);
  const hasTrendData = trend.some((p) => p.receita > 0 || p.despesa > 0);

  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, maxPage);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const periodLabel = t.periods[filters.period];
  const weekly = filters.period !== '365d';
  const groupLabel = weekly ? t.week : t.month;
  const partialLabels = trend.filter((p) => p.partial).map((p) => p.label);
  const isDefault =
    filters.period === DEFAULT_FILTERS.period && filters.kind === 'todos' && filters.category === ALL_CATEGORIES && !filters.search;

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => {
      const next = { ...f, [key]: value };
      // Ao escolher só receitas (ou só despesas), descarta uma categoria do outro tipo.
      if (key === 'kind' && value !== 'todos' && f.category !== ALL_CATEGORIES && !categoriesByKind[value as TransactionKind].includes(f.category)) {
        next.category = ALL_CATEGORIES;
      }
      return next;
    });
    setPage(1);
    setExportMessage('');
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setExportMessage('');
  }

  function exportCsv() {
    if (!filtered.length) return;
    const name = csvFileName(today, locale);
    downloadCsv(transactionsToCsv(filtered, locale), name);
    setExportMessage(t.exported(name, num(filtered.length), filtered.length === 1));
  }

  const kinds: TransactionKind[] = filters.kind === 'todos' ? ['receita', 'despesa'] : [filters.kind];

  return (
    <div className="g360-root">
      <aside className="g360-sidebar" aria-label={t.sideNav}>
        <Link className="g360-brand" to={{ pathname: lp('/'), hash: '#projetos' }} aria-label={t.backTo(site.name)}>
          <LogoMark className="g360-brand-mark" />
          <span>
            <strong>{site.name}</strong>
            <small>{t.demoProjects}</small>
          </span>
        </Link>
        <div className="g360-side-sep" />
        <span className="g360-side-heading">{t.demo}</span>
        <div className="g360-side-active" aria-current="page">
          <Icon name="chart" /> Gestão360
        </div>
        <p className="g360-side-help">{t.sideHelp}</p>
        <div className="g360-side-bottom">
          <span className="g360-side-dot" /> {t.fictional}
          <br />
          <small>{t.noLogin}</small>
        </div>
      </aside>

      <main className="g360-main" id="conteudo">
        <header className="g360-topbar">
          <nav aria-label={t.youAreHere} className="g360-top-kicker">
            <ol>
              <li><Link to={lp('/')}>{site.name}</Link></li>
              <li><Link to={{ pathname: lp('/'), hash: '#projetos' }}>{t.projects}</Link></li>
              <li aria-current="page">Gestão360</li>
            </ol>
          </nav>
          <div className="g360-top-actions">
            <LanguageSwitch className="tone-light bg-transparent!" />
            <Link to={lp('/projetos/gestao360')} className="g360-back">
              <Icon name="back" size={16} /> {t.details}
            </Link>
          </div>
        </header>

        <div className="g360-content">
          <div className="g360-heading-row">
            <div>
              <span className="g360-eyebrow">{t.eyebrow}</span>
              <h1>
                Gestão360 <span>Demo</span>
              </h1>
              <p>{t.intro}</p>
            </div>
            <div className="g360-export-box">
              <button className="g360-export" type="button" onClick={exportCsv} disabled={!filtered.length} aria-describedby="g360-export-help">
                <Icon name="download" size={18} /> {t.exportCsv}
              </button>
              <p id="g360-export-help">
                {filtered.length ? t.exportHelp(num(filtered.length)) : t.exportNone}
              </p>
            </div>
          </div>

          <p className="g360-export-status" role="status" aria-live="polite">
            {exportMessage}
          </p>

          <div className="g360-notice">
            <span className="g360-notice-dot" />
            <span>{t.notice}</span>
          </div>

          <section className="g360-filter-panel" aria-labelledby="g360-filtros-titulo">
            <h2 className="g360-filter-title" id="g360-filtros-titulo">
              <Icon name="filter" size={18} /> {t.filters}
              <span>{t.count(num(filtered.length), filtered.length === 1)}</span>
            </h2>
            <div className="g360-filter-grid">
              <div className="g360-field">
                <label htmlFor="g360-period">{t.period}</label>
                <select id="g360-period" value={filters.period} onChange={(e) => update('period', e.target.value as Period)}>
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {t.last(t.periods[p.value])}
                    </option>
                  ))}
                </select>
              </div>
              <div className="g360-field">
                <label htmlFor="g360-kind">{t.type}</label>
                <select id="g360-kind" value={filters.kind} onChange={(e) => update('kind', e.target.value as Filters['kind'])}>
                  <option value="todos">{t.kinds.todos}</option>
                  <option value="receita">{t.kinds.receita}</option>
                  <option value="despesa">{t.kinds.despesa}</option>
                </select>
              </div>
              <div className="g360-field">
                <label htmlFor="g360-cat">{t.category}</label>
                <select id="g360-cat" value={filters.category} onChange={(e) => update('category', e.target.value)}>
                  <option value={ALL_CATEGORIES}>{t.allCategories}</option>
                  {kinds.map((k) => (
                    <optgroup key={k} label={k === 'receita' ? t.revenueGroup : t.expenseGroup}>
                      {categoriesByKind[k].map((c) => (
                        <option key={c} value={c}>
                          {cat(c)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="g360-field">
                <label htmlFor="g360-search">{t.search}</label>
                <div className="g360-search-box">
                  <Icon name="search" size={17} />
                  <input
                    id="g360-search"
                    type="search"
                    value={filters.search}
                    onChange={(e) => update('search', e.target.value)}
                    placeholder={t.searchPlaceholder}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            <div className="g360-filter-foot">
              <span>{t.filterFoot}</span>
              <button type="button" className="g360-clear" onClick={clearFilters} disabled={isDefault}>
                {t.clear}
              </button>
            </div>
          </section>

          <section className="g360-kpis" aria-label={t.indicators(periodLabel)}>
            <Kpi label={t.kpi.revenue[0]} value={money(totals.revenue)} name="money" tone="teal" subtitle={t.kpi.revenue[1]} />
            <Kpi label={t.kpi.expenses[0]} value={money(totals.expenses)} name="expense" tone="rose" subtitle={t.kpi.expenses[1]} />
            <Kpi label={t.kpi.result[0]} value={money(totals.result)} name="profit" tone={totals.result >= 0 ? 'blue' : 'rose'} subtitle={t.kpi.result[1]} />
            <Kpi label={t.kpi.count[0]} value={num(totals.count)} name="sales" tone="gold" subtitle={t.kpi.count[1]} />
          </section>

          <section className="g360-chart-grid" aria-label={t.charts}>
            <div className="g360-panel g360-panel-trend">
              <div className="g360-panel-heading">
                <div>
                  <h2>{t.trendTitle}</h2>
                  <p>{t.trendSub(groupLabel)}</p>
                </div>
                <span className="g360-panel-chip">{periodLabel}</span>
              </div>
              {hasTrendData ? (
                <>
                  <TrendChart data={trend} groupLabel={groupLabel} weekly={weekly} />
                  {partialLabels.length > 0 && <p className="g360-chart-note">{t.partial(partialLabels)}</p>}
                </>
              ) : (
                <EmptyChart message={t.noData} />
              )}
            </div>
            <div className="g360-panel">
              <div className="g360-panel-heading">
                <div>
                  <h2>{t.byCategory}</h2>
                  <p>{t.byCategorySub}</p>
                </div>
              </div>
              {spending.length ? (
                <>
                  <DonutChart data={spending.map((p) => ({ ...p, name: cat(p.name) }))} total={totals.expenses} />
                  <ul className="g360-legend">
                    {spending.map((part, index) => (
                      <li key={part.name}>
                        <span className="g360-legend-name">
                          <i style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                          {cat(part.name)}
                        </span>
                        <span className="g360-legend-value">
                          {compact(part.value)} <strong>{totals.expenses ? Math.round((part.value / totals.expenses) * 100) : 0}%</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyChart
                  message={
                    filters.kind === 'receita' ? t.onlyRevenue : t.noExpenses
                  }
                />
              )}
            </div>
          </section>

          <section className="g360-panel g360-table-panel" aria-labelledby="g360-tabela-titulo">
            <div className="g360-panel-heading">
              <div>
                <h2 id="g360-tabela-titulo">{t.table}</h2>
                <p>{t.tableSub}</p>
              </div>
              <span className="g360-panel-chip">{t.records(num(filtered.length))}</span>
            </div>
            <div className="g360-table-scroll" tabIndex={0} role="region" aria-labelledby="g360-tabela-titulo">
              <table>
                <caption className="g360-sr-only">{t.caption(safePage, maxPage)}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.cols.date}</th>
                    <th scope="col">{t.cols.description}</th>
                    <th scope="col">{t.cols.category}</th>
                    <th scope="col">{t.cols.type}</th>
                    <th scope="col" className="g360-text-right">{t.cols.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.id}>
                      <td>{date(row.date)}</td>
                      <td>
                        <strong>{desc(row.description)}</strong>
                        <small>{row.id}</small>
                      </td>
                      <td>{cat(row.category)}</td>
                      <td>
                        <span className={`g360-type ${row.kind}`}>{t.kindLabel[row.kind]}</span>
                      </td>
                      <td className={`g360-text-right g360-amount ${row.kind}`}>
                        {row.kind === 'receita' ? '+' : '−'} {money(row.amount)}
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={5} className="g360-empty-row">
                        <strong>{t.emptyTitle}</strong>
                        <span>{t.emptyText}</span>
                        <button type="button" className="g360-clear" onClick={clearFilters}>
                          {t.clear}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <nav className="g360-pagination" aria-label={t.pagination}>
              <span>{t.showing(filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0, Math.min(safePage * PAGE_SIZE, filtered.length), num(filtered.length))}</span>
              <div>
                <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  {t.previous}
                </button>
                <span aria-live="polite">{t.page(safePage, maxPage)}</span>
                <button type="button" disabled={safePage >= maxPage} onClick={() => setPage(safePage + 1)}>
                  {t.next}
                </button>
              </div>
            </nav>
          </section>

          <footer className="g360-footer">
            {t.footer(site.name)} <Link to={lp('/projetos/gestao360')}>{t.backToProject}</Link>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, subtitle, name, tone }: { label: string; value: string; subtitle: string; name: IconName; tone: string }) {
  return (
    <div className="g360-kpi">
      <div className="g360-kpi-top">
        <span>{label}</span>
        <span className={`g360-kpi-icon ${tone}`}>
          <Icon name={name} size={19} />
        </span>
      </div>
      <strong title={value} data-kpi={label}>
        {value}
      </strong>
      <small>{subtitle}</small>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return <div className="g360-empty-chart">{message}</div>;
}
