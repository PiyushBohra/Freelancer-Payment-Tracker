import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../UI/Card';

type Accent = 'brand' | 'emerald' | 'amber' | 'zinc';

const ACCENTS: Record<Accent, string> = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20',
  emerald:
    'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: Accent;
  /** Secondary line, e.g. totals in other currencies. */
  footer?: ReactNode;
  size?: 'lg' | 'sm';
}

export function StatCard({ label, value, icon: Icon, accent = 'brand', footer, size = 'lg' }: StatCardProps) {
  return (
    <Card className={size === 'lg' ? 'p-5 sm:p-6' : 'p-5'}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-xl ring-1 ring-inset ${ACCENTS[accent]}`}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p
        className={`mt-3 font-semibold tracking-tight break-words text-zinc-900 tabular-nums dark:text-white ${
          size === 'lg' ? 'text-3xl' : 'text-2xl'
        }`}
      >
        {value}
      </p>
      {footer && <div className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{footer}</div>}
    </Card>
  );
}
