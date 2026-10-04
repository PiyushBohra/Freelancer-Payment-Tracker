import { ArrowRight } from 'lucide-react';
import type { Payment } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { isOverdue } from '../../utils/payments';
import { focusRing } from '../UI/Button';
import { Card } from '../UI/Card';
import { StatusBadge } from '../UI/StatusBadge';

interface RecentPaymentsProps {
  payments: Payment[];
  onViewAll: () => void;
}

export function RecentPayments({ payments, onViewAll }: RecentPaymentsProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6 dark:border-zinc-800">
        <h2 className="font-semibold tracking-tight text-zinc-900 dark:text-white">Recent payments</h2>
        <button
          type="button"
          onClick={onViewAll}
          className={`inline-flex items-center gap-1 rounded-md text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 ${focusRing}`}
        >
          View all
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{payment.projectName}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {payment.clientName}
                {payment.dueDate && (
                  <>
                    {' · '}
                    <span className={isOverdue(payment) ? 'font-medium text-rose-600 dark:text-rose-400' : ''}>
                      {isOverdue(payment) ? 'Overdue since' : 'Due'} {formatDate(payment.dueDate)}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-medium text-zinc-900 tabular-nums dark:text-white">
                {formatMoney(payment.amount, payment.currency)}
              </span>
              <span className="hidden sm:inline-flex">
                <StatusBadge status={payment.status} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
