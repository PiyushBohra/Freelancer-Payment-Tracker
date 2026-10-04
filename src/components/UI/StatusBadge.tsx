import type { PaymentStatus } from '../../types';

const STYLES: Record<PaymentStatus, { label: string; className: string; dot: string }> = {
  paid: {
    label: 'Paid',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25',
    dot: 'bg-amber-500',
  },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
