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
import {
  ALL_CATEGORIES, DEFAULT_FILTERS, PERIODS,
  buildTrend, categoriesByKind, createDemoTransactions, csvFileName, filterTransactions,
  formatDate, formatMoney, moneyCompact, spendingByCategory, totalsFor, transactionsToCsv,
  type Filters, type Period, type TransactionKind,
} from './gestao360-data';
import { CATEGORY_COLORS, DonutChart, TrendChart } from './gestao360-charts';
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
  useDocumentTitle('Gestão360: demonstração interativa', 'Painel financeiro demonstrativo com dados fictícios: filtros, indicadores, gráficos e exportação CSV.');

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

  const filtered = useMemo(() => filterTransactions(rows, filters, today), [rows, filters, today]);
  const totals = useMemo(() => totalsFor(filtered), [filtered]);
  const trend = useMemo(() => buildTrend(filtered, filters.period, today), [filtered, filters.period, today]);
  const spending = useMemo(() => spendingByCategory(filtered), [filtered]);
  const hasTrendData = trend.some((p) => p.receita > 0 || p.despesa > 0);

  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, maxPage);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const periodLabel = PERIODS.find((p) => p.value === filters.period)?.label ?? '';
  const groupLabel = filters.period === '365d' ? 'mês' : 'semana';
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
    const name = csvFileName(today);
    downloadCsv(transactionsToCsv(filtered), name);
    setExportMessage(
      `Arquivo ${name} gerado com ${filtered.length.toLocaleString('pt-BR')} ${filtered.length === 1 ? 'transação' : 'transações'} do filtro atual.`,
    );
  }

  const kinds: TransactionKind[] = filters.kind === 'todos' ? ['receita', 'despesa'] : [filters.kind];

  return (
    <div className="g360-root">
      <aside className="g360-sidebar" aria-label="Navegação da demonstração">
        <Link className="g360-brand" to={{ pathname: '/', hash: '#projetos' }} aria-label={`Voltar aos projetos de ${site.name}`}>
          <LogoMark tone="light" className="g360-brand-mark" />
          <span>
            <strong>{site.name}</strong>
            <small>Projetos demonstrativos</small>
          </span>
        </Link>
        <div className="g360-side-sep" />
        <span className="g360-side-heading">Demonstração</span>
        <div className="g360-side-active" aria-current="page">
          <Icon name="chart" /> Gestão360
        </div>
        <p className="g360-side-help">Explore os indicadores, ajuste os filtros e exporte os resultados.</p>
        <div className="g360-side-bottom">
          <span className="g360-side-dot" /> Ambiente fictício
          <br />
          <small>Sem dados reais ou login</small>
        </div>
      </aside>

      <main className="g360-main" id="conteudo">
        <header className="g360-topbar">
          <nav aria-label="Você está em" className="g360-top-kicker">
            <ol>
              <li><Link to="/">{site.name}</Link></li>
              <li><Link to={{ pathname: '/', hash: '#projetos' }}>Projetos</Link></li>
              <li aria-current="page">Gestão360</li>
            </ol>
          </nav>
          <Link to="/projetos/gestao360" className="g360-back">
            <Icon name="back" size={16} /> Ver detalhes do projeto
          </Link>
        </header>

        <div className="g360-content">
          <div className="g360-heading-row">
            <div>
              <span className="g360-eyebrow">Painel financeiro e comercial</span>
              <h1>
                Gestão360 <span>Demo</span>
              </h1>
              <p>Explore os resultados de um negócio fictício com dados interativos.</p>
            </div>
            <div className="g360-export-box">
              <button className="g360-export" type="button" onClick={exportCsv} disabled={!filtered.length} aria-describedby="g360-export-help">
                <Icon name="download" size={18} /> Exportar CSV
              </button>
              <p id="g360-export-help">
                {filtered.length
                  ? `Exporta as ${filtered.length.toLocaleString('pt-BR')} transações do filtro atual, prontas para abrir no Excel.`
                  : 'Nenhuma transação no filtro atual para exportar.'}
              </p>
            </div>
          </div>

          <p className="g360-export-status" role="status" aria-live="polite">
            {exportMessage}
          </p>

          <div className="g360-notice">
            <span className="g360-notice-dot" />
            <span>
              Demonstração com empresa e transações fictícias, geradas no seu navegador. Nenhuma informação é armazenada ou enviada.
            </span>
          </div>

          <section className="g360-filter-panel" aria-labelledby="g360-filtros-titulo">
            <h2 className="g360-filter-title" id="g360-filtros-titulo">
              <Icon name="filter" size={18} /> Filtros
              <span>
                {filtered.length.toLocaleString('pt-BR')} {filtered.length === 1 ? 'transação' : 'transações'}
              </span>
            </h2>
            <div className="g360-filter-grid">
              <div className="g360-field">
                <label htmlFor="g360-period">Período</label>
                <select id="g360-period" value={filters.period} onChange={(e) => update('period', e.target.value as Period)}>
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>
                      Últimos {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="g360-field">
                <label htmlFor="g360-kind">Tipo</label>
                <select id="g360-kind" value={filters.kind} onChange={(e) => update('kind', e.target.value as Filters['kind'])}>
                  <option value="todos">Receitas e despesas</option>
                  <option value="receita">Apenas receitas</option>
                  <option value="despesa">Apenas despesas</option>
                </select>
              </div>
              <div className="g360-field">
                <label htmlFor="g360-cat">Categoria</label>
                <select id="g360-cat" value={filters.category} onChange={(e) => update('category', e.target.value)}>
                  <option value={ALL_CATEGORIES}>Todas as categorias</option>
                  {kinds.map((k) => (
                    <optgroup key={k} label={k === 'receita' ? 'Receitas' : 'Despesas'}>
                      {categoriesByKind[k].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="g360-field">
                <label htmlFor="g360-search">Buscar transação</label>
                <div className="g360-search-box">
                  <Icon name="search" size={17} />
                  <input
                    id="g360-search"
                    type="search"
                    value={filters.search}
                    onChange={(e) => update('search', e.target.value)}
                    placeholder="Descrição, categoria ou ID"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            <div className="g360-filter-foot">
              <span>Indicadores, gráficos, tabela e exportação usam os mesmos filtros.</span>
              <button type="button" className="g360-clear" onClick={clearFilters} disabled={isDefault}>
                Limpar filtros
              </button>
            </div>
          </section>

          <section className="g360-kpis" aria-label={`Indicadores: ${periodLabel}`}>
            <Kpi label="Receitas" value={formatMoney(totals.revenue)} name="money" tone="teal" subtitle="Entradas no filtro" />
            <Kpi label="Despesas" value={formatMoney(totals.expenses)} name="expense" tone="rose" subtitle="Saídas no filtro" />
            <Kpi label="Resultado" value={formatMoney(totals.result)} name="profit" tone={totals.result >= 0 ? 'blue' : 'rose'} subtitle="Receitas − despesas" />
            <Kpi label="Transações" value={totals.count.toLocaleString('pt-BR')} name="sales" tone="gold" subtitle="Movimentações no filtro" />
          </section>

          <section className="g360-chart-grid" aria-label="Gráficos">
            <div className="g360-panel g360-panel-trend">
              <div className="g360-panel-heading">
                <div>
                  <h2>Evolução financeira</h2>
                  <p>Receitas e despesas por {groupLabel}</p>
                </div>
                <span className="g360-panel-chip">{periodLabel}</span>
              </div>
              {hasTrendData ? (
                <>
                  <TrendChart data={trend} groupLabel={groupLabel} />
                  {partialLabels.length > 0 && (
                    <p className="g360-chart-note">
                      {partialLabels.length === 1 ? 'O ponto' : 'Os pontos'} {partialLabels.join(' e ')}{' '}
                      {partialLabels.length === 1 ? 'inclui' : 'incluem'} só os dias dentro do período, por isso{' '}
                      {partialLabels.length === 1 ? 'pode ficar mais baixo' : 'podem ficar mais baixos'}.
                    </p>
                  )}
                </>
              ) : (
                <EmptyChart />
              )}
            </div>
            <div className="g360-panel">
              <div className="g360-panel-heading">
                <div>
                  <h2>Despesas por categoria</h2>
                  <p>Distribuição dos gastos no filtro</p>
                </div>
              </div>
              {spending.length ? (
                <>
                  <DonutChart data={spending} total={totals.expenses} />
                  <ul className="g360-legend">
                    {spending.map((part, index) => (
                      <li key={part.name}>
                        <span className="g360-legend-name">
                          <i style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                          {part.name}
                        </span>
                        <span className="g360-legend-value">
                          {moneyCompact(part.value)} <strong>{totals.expenses ? Math.round((part.value / totals.expenses) * 100) : 0}%</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyChart
                  message={
                    filters.kind === 'receita'
                      ? 'O filtro "Apenas receitas" está ativo, por isso não há despesas para mostrar.'
                      : 'Não há despesas para os filtros selecionados.'
                  }
                />
              )}
            </div>
          </section>

          <section className="g360-panel g360-table-panel" aria-labelledby="g360-tabela-titulo">
            <div className="g360-panel-heading">
              <div>
                <h2 id="g360-tabela-titulo">Transações</h2>
                <p>Os mesmos dados usados nos indicadores e gráficos</p>
              </div>
              <span className="g360-panel-chip">{filtered.length.toLocaleString('pt-BR')} registros</span>
            </div>
            <div className="g360-table-scroll" tabIndex={0} role="region" aria-labelledby="g360-tabela-titulo">
              <table>
                <caption className="g360-sr-only">Transações filtradas, página {safePage} de {maxPage}</caption>
                <thead>
                  <tr>
                    <th scope="col">Data</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Categoria</th>
                    <th scope="col">Tipo</th>
                    <th scope="col" className="g360-text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDate(t.date)}</td>
                      <td>
                        <strong>{t.description}</strong>
                        <small>{t.id}</small>
                      </td>
                      <td>{t.category}</td>
                      <td>
                        <span className={`g360-type ${t.kind}`}>{t.kind === 'receita' ? 'Receita' : 'Despesa'}</span>
                      </td>
                      <td className={`g360-text-right g360-amount ${t.kind}`}>
                        {t.kind === 'receita' ? '+' : '−'} {formatMoney(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={5} className="g360-empty-row">
                        <strong>Nenhuma transação encontrada.</strong>
                        <span>Revise a busca ou os filtros.</span>
                        <button type="button" className="g360-clear" onClick={clearFilters}>
                          Limpar filtros
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <nav className="g360-pagination" aria-label="Paginação das transações">
              <span>
                Exibindo {filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0} a {Math.min(safePage * PAGE_SIZE, filtered.length)} de{' '}
                {filtered.length.toLocaleString('pt-BR')}
              </span>
              <div>
                <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  Anterior
                </button>
                <span aria-live="polite">
                  Página {safePage} de {maxPage}
                </span>
                <button type="button" disabled={safePage >= maxPage} onClick={() => setPage(safePage + 1)}>
                  Próxima
                </button>
              </div>
            </nav>
          </section>

          <footer className="g360-footer">
            Projeto demonstrativo autoral de {site.name}. Empresa e números fictícios.{' '}
            <Link to="/projetos/gestao360">Voltar ao projeto</Link>
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

function EmptyChart({ message = 'Nenhum dado para os filtros selecionados.' }: { message?: string }) {
  return <div className="g360-empty-chart">{message}</div>;
}
