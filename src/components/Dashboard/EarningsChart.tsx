import { useEffect, useMemo, useRef, useState } from 'react';
import { ChartColumn } from 'lucide-react';
import type { CurrencyCode, Payment } from '../../types';
import { formatMoney } from '../../utils/currency';
import { monthlyEarnings } from '../../utils/payments';
import type { MonthEarnings } from '../../utils/payments';
import { Card } from '../UI/Card';

/* Series colours match the Paid / Pending badges. Checked for colour-blind
   separation in light and dark mode; the legend, gaps, tooltip and table view
   make sure colour is never the only way to tell them apart. */
const PAID_COLOR = '#059669';
const PENDING_COLOR = '#d97706';

const HEIGHT = 240;
const PAD = { top: 20, right: 8, bottom: 28, left: 56 };
const BAR_MAX = 24;
const GAP = 2;
const RADIUS = 4;

interface EarningsChartProps {
  payments: Payment[];
  currency: CurrencyCode;
}

export function EarningsChart({ payments, currency }: EarningsChartProps) {
  const months = useMemo(() => monthlyEarnings(payments, 6), [payments]);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const hasData = months.some((m) => m.total > 0);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold tracking-tight text-zinc-900 dark:text-white">Earnings by month</h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Last 6 months · paid by payment date, pending by due date
          </p>
        </div>
        <div
          role="group"
          aria-label="Show earnings as"
          className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 bg-zinc-100/70 p-0.5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          {(['chart', 'table'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`h-7 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none ${
                view === option
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {option === 'chart' ? 'Chart' : 'Table'}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex gap-4 text-xs text-zinc-600 dark:text-zinc-300" aria-label="Legend">
        <LegendItem color={PAID_COLOR} label="Paid" />
        <LegendItem color={PENDING_COLOR} label="Pending" />
      </ul>

      {view === 'table' ? (
        <EarningsTable months={months} currency={currency} />
      ) : hasData ? (
        <ColumnChart months={months} currency={currency} />
      ) : (
        <div className="mt-4 flex h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 text-center dark:border-zinc-800">
          <ChartColumn className="size-6 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            Your earnings chart will appear here once you add payments from the last few months.
          </p>
        </div>
      )}
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </li>
  );
}

/* ------------------------------------------------------------------ */

const monthName = (date: Date, withYear = false) =>
  date.toLocaleDateString(undefined, withYear ? { month: 'long', year: 'numeric' } : { month: 'short' });

/** Rounds the axis up to a clean number and returns evenly spaced ticks. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0];
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let v = 0; v < max + step; v += step) ticks.push(v);
  return ticks;
}

/** A rectangle with rounded top corners and a square bottom (the baseline end). */
function topRoundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.min(r, h, w / 2);
  return `M${x},${y + h} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + w - radius} Q${x + w},${y} ${x + w},${y + radius} V${y + h} Z`;
}

function ColumnChart({ months, currency }: { months: MonthEarnings[]; currency: CurrencyCode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const compact = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [currency],
  );

  const max = Math.max(...months.map((m) => m.total));
  const ticks = niceTicks(max);
  const yMax = ticks[ticks.length - 1] || 1;
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / months.length;
  const barW = Math.min(BAR_MAX, band * 0.55);
  const baseline = PAD.top + plotH;
  const y = (v: number) => PAD.top + plotH * (1 - v / yMax);
  const px = (v: number) => (v > 0 ? Math.max(2, (v / yMax) * plotH) : 0);
  const peak = months.reduce((best, m, i) => (m.total > months[best].total ? i : best), 0);

  const activeMonth = active === null ? null : months[active];
  const activeX = active === null ? 0 : PAD.left + band * active + band / 2;
  const tooltipOnLeft = activeX + barW / 2 + 190 > width;

  return (
    <div ref={wrapRef} className="relative mt-3" onPointerLeave={() => setActive(null)}>
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="group"
        aria-label="Column chart of paid and pending earnings for the last 6 months"
        className="block max-w-full overflow-visible"
      >
        {/* Gridlines + y-axis labels */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
            <text
              x={PAD.left - 10}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
              className="fill-zinc-400 text-[11px] tabular-nums dark:fill-zinc-500"
            >
              {compact.format(tick)}
            </text>
          </g>
        ))}

        {months.map((month, i) => {
          const cx = PAD.left + band * i + band / 2;
          const x = cx - barW / 2;
          const paidH = px(month.paid);
          const pendingH = px(month.pending);
          const paidTop = baseline - paidH;
          const pendingBottom = paidH > 0 ? paidTop - GAP : baseline;
          const dimmed = active !== null && active !== i;
          const label = `${monthName(month.date, true)}: total ${formatMoney(month.total, currency)}, paid ${formatMoney(
            month.paid,
            currency,
          )}, pending ${formatMoney(month.pending, currency)}`;

          return (
            <g key={month.key} style={{ opacity: dimmed ? 0.45 : 1 }} className="transition-opacity">
              {paidH > 0 && (
                <path
                  d={
                    pendingH > 0
                      ? `M${x},${baseline} V${paidTop} H${x + barW} V${baseline} Z`
                      : topRoundedRect(x, paidTop, barW, paidH, RADIUS)
                  }
                  fill={PAID_COLOR}
                />
              )}
              {pendingH > 0 && (
                <path d={topRoundedRect(x, pendingBottom - pendingH, barW, pendingH, RADIUS)} fill={PENDING_COLOR} />
              )}

              {/* Direct label on the highest month only */}
              {i === peak && month.total > 0 && (
                <text
                  x={cx}
                  y={y(month.total) - (paidH > 0 && pendingH > 0 ? GAP : 0) - 8}
                  textAnchor="middle"
                  className="fill-zinc-700 text-[11px] font-semibold dark:fill-zinc-200"
                >
                  {compact.format(month.total)}
                </text>
              )}

              {/* Month label */}
              <text
                x={cx}
                y={HEIGHT - 8}
                textAnchor="middle"
                className={`text-[11px] ${
                  active === i ? 'fill-zinc-900 font-medium dark:fill-white' : 'fill-zinc-500 dark:fill-zinc-400'
                }`}
              >
                {monthName(month.date)}
              </text>

              {/* Hit area: the whole column band, larger than the bar itself */}
              <rect
                x={PAD.left + band * i}
                y={PAD.top}
                width={band}
                height={plotH}
                rx={6}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={label}
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="cursor-default outline-none focus-visible:stroke-brand-500 focus-visible:stroke-2"
              />
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={PAD.left}
          x2={width - PAD.right}
          y1={baseline}
          y2={baseline}
          className="stroke-zinc-200 dark:stroke-zinc-700"
          strokeWidth={1}
          shapeRendering="crispEdges"
        />
      </svg>

      {activeMonth && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 w-44 rounded-xl border border-zinc-200 bg-white p-3 text-xs shadow-lg shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900"
          style={{
            top: PAD.top,
            left: tooltipOnLeft ? activeX - barW / 2 - 12 : activeX + barW / 2 + 12,
            transform: tooltipOnLeft ? 'translateX(-100%)' : undefined,
          }}
        >
          <p className="font-medium text-zinc-500 dark:text-zinc-400">{monthName(activeMonth.date, true)}</p>
          <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">
            {formatMoney(activeMonth.total, currency)}
          </p>
          <div className="mt-2 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
            <TooltipRow color={PAID_COLOR} label="Paid" value={formatMoney(activeMonth.paid, currency)} />
            <TooltipRow color={PENDING_COLOR} label="Pending" value={formatMoney(activeMonth.pending, currency)} />
          </div>
        </div>
      )}
    </div>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
        <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="font-semibold text-zinc-900 tabular-nums dark:text-white">{value}</span>
    </div>
  );
}

function EarningsTable({ months, currency }: { months: MonthEarnings[]; currency: CurrencyCode }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Paid and pending earnings for the last 6 months</caption>
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th scope="col" className="py-2 pr-4 font-medium">Month</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Paid</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Pending</th>
            <th scope="col" className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 tabular-nums dark:divide-zinc-800">
          {months.map((m) => (
            <tr key={m.key}>
              <th scope="row" className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-200">
                {monthName(m.date, true)}
              </th>
              <td className="py-2 pr-4 text-right text-zinc-600 dark:text-zinc-300">{formatMoney(m.paid, currency)}</td>
              <td className="py-2 pr-4 text-right text-zinc-600 dark:text-zinc-300">
                {formatMoney(m.pending, currency)}
              </td>
              <td className="py-2 text-right font-semibold text-zinc-900 dark:text-white">
                {formatMoney(m.total, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
