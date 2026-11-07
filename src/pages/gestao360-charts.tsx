/**
 * Gráficos do Gestão360 em SVG próprio (sem biblioteca externa).
 * Ambos são desenhados a partir dos dados recebidos por props, ou seja,
 * exatamente o conjunto filtrado que aparece na tabela.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatMoney, moneyCompact, type TrendPoint } from './gestao360-data';

export const SERIES = {
  receita: { label: 'Receitas', color: '#12978a' },
  despesa: { label: 'Despesas', color: '#dc7890' },
} as const;

export const CATEGORY_COLORS = ['#168b82', '#5265c8', '#f4a340', '#d06a8c', '#8c76ba', '#64748b'];

/** Largura real do elemento, atualizada quando a tela muda de tamanho. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Passo "redondo" para o eixo (1, 2, 2,5 ou 5 × potência de 10). */
function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10;
  return nice * power;
}

/** Curva monotônica (não ultrapassa os pontos, nunca fica abaixo de zero). */
function monotonePath(points: Array<[number, number]>) {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M${points[0][0]},${points[0][1]}`;
  const dx = points.slice(1).map((p, i) => p[0] - points[i][0]);
  const slope = points.slice(1).map((p, i) => (p[1] - points[i][1]) / dx[i]);
  const tangent = points.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    if (slope[i - 1] * slope[i] <= 0) return 0;
    return (2 * slope[i - 1] * slope[i]) / (slope[i - 1] + slope[i]);
  });
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += ` C${x0 + h},${y0 + tangent[i] * h} ${x1 - h},${y1 - tangent[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

const HEIGHT = 285;
const M = { top: 16, right: 14, bottom: 30, left: 56 };

export function TrendChart({ data, groupLabel }: { data: TrendPoint[]; groupLabel: string }) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, '');
  const tableId = `${gradientId}-dados`;

  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = HEIGHT - M.top - M.bottom;
  const max = Math.max(0, ...data.flatMap((d) => [d.receita, d.despesa]));
  const step = niceStep(max / 4);
  const ticks = Math.max(1, Math.ceil(max / step));
  const yMax = step * ticks;
  const x = (i: number) => M.left + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
  const y = (v: number) => M.top + innerH - (yMax ? (v / yMax) * innerH : 0);
  const labelEvery = Math.max(1, Math.ceil((data.length * 46) / Math.max(innerW, 1)));

  const series = (['receita', 'despesa'] as const).map((key) => {
    const pts = data.map((d, i) => [x(i), y(d[key])] as [number, number]);
    const line = monotonePath(pts);
    const area = pts.length > 1 ? `${line} L${pts[pts.length - 1][0]},${y(0)} L${pts[0][0]},${y(0)} Z` : '';
    return { key, line, area, pts };
  });

  function indexFromPointer(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    if (data.length === 1) return 0;
    return Math.min(data.length - 1, Math.max(0, Math.round((px / rect.width) * (data.length - 1))));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = active ?? data.length - 1;
    let next = current;
    if (event.key === 'ArrowRight') next = Math.min(data.length - 1, current + 1);
    else if (event.key === 'ArrowLeft') next = Math.max(0, current - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = data.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
  }

  const point = active !== null ? data[active] : null;
  const tooltipLeft = active !== null ? Math.min(Math.max(x(active), 90), Math.max(width - 90, 90)) : 0;

  return (
    <div className="g360-trend">
      <div
        ref={wrapRef}
        className="g360-chart-area"
        tabIndex={0}
        role="group"
        aria-label={`Gráfico de evolução financeira por ${groupLabel}. Use as setas para percorrer os pontos.`}
        aria-describedby={tableId}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((a) => a ?? data.length - 1)}
        onBlur={() => setActive(null)}
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden="true" className="g360-svg">
            <defs>
              <linearGradient id={`${gradientId}-r`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.receita.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={SERIES.receita.color} stopOpacity={0.015} />
              </linearGradient>
              <linearGradient id={`${gradientId}-d`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.despesa.color} stopOpacity={0.14} />
                <stop offset="100%" stopColor={SERIES.despesa.color} stopOpacity={0.005} />
              </linearGradient>
            </defs>

            {Array.from({ length: ticks + 1 }, (_, i) => {
              const value = step * i;
              return (
                <g key={i}>
                  <line x1={M.left} x2={width - M.right} y1={y(value)} y2={y(value)} stroke="#e3e9f0" strokeDasharray={i === 0 ? undefined : '4 4'} />
                  <text x={M.left - 10} y={y(value)} dy="0.32em" textAnchor="end" className="g360-axis">
                    {moneyCompact(value)}
                  </text>
                </g>
              );
            })}

            {data.map((d, i) =>
              // Mostra um rótulo a cada `labelEvery` pontos e sempre o último,
              // pulando o penúltimo rótulo se ele ficaria colado no último.
              i === data.length - 1 || (i % labelEvery === 0 && data.length - 1 - i >= labelEvery) ? (
                <text key={d.key} x={x(i)} y={HEIGHT - 8} textAnchor={data.length === 1 ? 'middle' : i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} className="g360-axis">
                  {d.label}{d.partial ? '*' : ''}
                </text>
              ) : null,
            )}

            {series.map((s) => (
              <g key={s.key}>
                {s.area && <path d={s.area} fill={`url(#${gradientId}-${s.key === 'receita' ? 'r' : 'd'})`} />}
                <path d={s.line} fill="none" stroke={SERIES[s.key].color} strokeWidth={s.key === 'receita' ? 2.7 : 2.3} strokeLinecap="round" />
                {data.length === 1 && <circle cx={s.pts[0][0]} cy={s.pts[0][1]} r={4} fill={SERIES[s.key].color} />}
              </g>
            ))}

            {active !== null && (
              <g>
                <line x1={x(active)} x2={x(active)} y1={M.top} y2={y(0)} stroke="#9fb0c2" strokeDasharray="3 3" />
                {series.map((s) => (
                  <circle key={s.key} cx={s.pts[active][0]} cy={s.pts[active][1]} r={4.5} fill="#fff" stroke={SERIES[s.key].color} strokeWidth={2.5} />
                ))}
              </g>
            )}

            <rect
              x={M.left}
              y={M.top}
              width={innerW}
              height={innerH}
              fill="transparent"
              onPointerMove={(e) => setActive(indexFromPointer(e))}
              onPointerDown={(e) => setActive(indexFromPointer(e))}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}
        {point && (
          <div className="g360-tooltip" style={{ left: tooltipLeft }} aria-hidden="true">
            <strong>{point.label}{point.partial ? ' (parcial)' : ''}</strong>
            <div style={{ color: SERIES.receita.color }}>Receitas: {formatMoney(point.receita)}</div>
            <div style={{ color: '#a63d58' }}>Despesas: {formatMoney(point.despesa)}</div>
          </div>
        )}
      </div>

      <ul className="g360-chart-legend" aria-hidden="true">
        {(['receita', 'despesa'] as const).map((key) => (
          <li key={key}>
            <i style={{ backgroundColor: SERIES[key].color }} />
            {SERIES[key].label}
          </li>
        ))}
      </ul>

      {/* O recorte fica num <div>: tabelas ignoram width: 1px e criavam rolagem lateral em 320 px */}
      <div className="g360-sr-only">
      <table id={tableId}>
        <caption>Receitas e despesas por {groupLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{groupLabel === 'semana' ? 'Semana iniciada em' : 'Mês'}</th>
            <th scope="col">Receitas</th>
            <th scope="col">Despesas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}{d.partial ? ' (parcial)' : ''}</th>
              <td>{formatMoney(d.receita)}</td>
              <td>{formatMoney(d.despesa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- rosca */

function arcPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = p(r1, a0);
  const [x1, y1] = p(r1, a1);
  const [x2, y2] = p(r0, a1);
  const [x3, y3] = p(r0, a0);
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}

export function DonutChart({ data, total }: { data: { name: string; value: number }[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const size = 204;
  const c = size / 2;
  const r1 = 88;
  const r0 = 61;
  const gap = data.length > 1 ? (2 * Math.PI) / 180 : 0;
  let angle = 0;
  const slices = data.map((d, i) => {
    const span = total ? (d.value / total) * 2 * Math.PI : 0;
    const start = angle + gap / 2;
    const end = angle + span - gap / 2;
    angle += span;
    return { ...d, i, start, end, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
  });
  const focus = hover !== null ? slices[hover] : null;

  return (
    <div className="g360-pie-chart">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true" className="g360-svg">
        {slices.length === 1 ? (
          <circle cx={c} cy={c} r={(r0 + r1) / 2} fill="none" stroke={slices[0].color} strokeWidth={r1 - r0} />
        ) : (
          slices.map((s) =>
            s.end > s.start ? (
              <path
                key={s.name}
                d={arcPath(c, c, r0, hover === s.i ? r1 + 4 : r1, s.start, s.end)}
                fill={s.color}
                onPointerEnter={() => setHover(s.i)}
                onPointerLeave={() => setHover(null)}
              />
            ) : null,
          )
        )}
      </svg>
      <div className="g360-pie-center" aria-hidden="true">
        <small>{focus ? focus.name : 'Total'}</small>
        <strong>{moneyCompact(focus ? focus.value : total)}</strong>
      </div>
    </div>
  );
}
