import { CircleCheck, Pencil, Trash2 } from 'lucide-react';
import type { Payment } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { isOverdue } from '../../utils/payments';
import { Avatar } from '../UI/Avatar';
import { focusRing } from '../UI/Button';
import { StatusBadge } from '../UI/StatusBadge';

interface PaymentListProps {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onMarkPaid: (payment: Payment) => void;
}

/** Shows payments as a table on larger screens and as cards on phones. */
export function PaymentList({ payments, onEdit, onDelete, onMarkPaid }: PaymentListProps) {
  return (
    <>
      {/* Table: tablets and up */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Payments</caption>
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:border-zinc-800 dark:text-zinc-400">
              <th scope="col" className="py-3 pr-4 pl-6 font-medium">Client</th>
              <th scope="col" className="px-4 py-3 font-medium">Project</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
              <th scope="col" className="px-4 py-3 font-medium">Due date</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="py-3 pr-6 pl-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {payments.map((payment) => (
              <tr key={payment.id} className="group transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                <td className="py-3.5 pr-4 pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={payment.clientName} />
                    <span className="font-medium text-zinc-900 dark:text-white">{payment.clientName}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                  <span className="line-clamp-2">{payment.projectName}</span>
                </td>
                <td className="px-4 py-3.5 text-right font-medium whitespace-nowrap text-zinc-900 tabular-nums dark:text-white">
                  {formatMoney(payment.amount, payment.currency)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <DueDate payment={payment} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="py-3.5 pr-6 pl-4">
                  <Actions payment={payment} onEdit={onEdit} onDelete={onDelete} onMarkPaid={onMarkPaid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards: phones */}
      <ul className="divide-y divide-zinc-100 md:hidden dark:divide-zinc-800" aria-label="Payments">
        {payments.map((payment) => (
          <li key={payment.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={payment.clientName} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-white">{payment.clientName}</p>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{payment.projectName}</p>
                </div>
              </div>
              <p className="shrink-0 font-semibold text-zinc-900 tabular-nums dark:text-white">
                {formatMoney(payment.amount, payment.currency)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <StatusBadge status={payment.status} />
                <span className="text-zinc-500 dark:text-zinc-400">
                  <span className="sr-only">Due date: </span>
                  <DueDate payment={payment} inline />
                </span>
              </div>
              <Actions payment={payment} onEdit={onEdit} onDelete={onDelete} onMarkPaid={onMarkPaid} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function DueDate({ payment, inline = false }: { payment: Payment; inline?: boolean }) {
  const overdue = isOverdue(payment);
  const prefix = inline && payment.dueDate ? 'Due ' : '';
  return (
    <span className={inline ? '' : 'flex flex-col'}>
      <span className={overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-zinc-600 dark:text-zinc-300'}>
        {prefix}
        {formatDate(payment.dueDate)}
      </span>
      {overdue && !inline && <span className="text-xs text-rose-600/80 dark:text-rose-400/80">Overdue</span>}
      {overdue && inline && <span className="font-medium text-rose-600 dark:text-rose-400"> · Overdue</span>}
      {!inline && payment.status === 'paid' && payment.paymentDate && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Paid {formatDate(payment.paymentDate)}</span>
      )}
    </span>
  );
}

const iconButton = `rounded-lg p-2 text-zinc-400 transition-colors ${focusRing}`;

function Actions({
  payment,
  onEdit,
  onDelete,
  onMarkPaid,
}: {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onMarkPaid: (payment: Payment) => void;
}) {
  const label = `${payment.clientName}, ${payment.projectName}`;
  return (
    <div className="flex shrink-0 items-center justify-end gap-0.5">
      {payment.status === 'pending' && (
        <button
          type="button"
          onClick={() => onMarkPaid(payment)}
          aria-label={`Mark as paid: ${label}`}
          title="Mark as paid"
          className={`${iconButton} hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400`}
        >
          <CircleCheck className="size-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onEdit(payment)}
        aria-label={`Edit payment: ${label}`}
        title="Edit"
        className={`${iconButton} hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200`}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(payment)}
        aria-label={`Delete payment: ${label}`}
        title="Delete"
        className={`${iconButton} hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
