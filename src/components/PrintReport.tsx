import type { CurrencyCode, Payment } from '../types';
import { formatMoney } from '../utils/currency';
import { formatDate } from '../utils/date';
import { filterAndSortPayments, summarizePayments } from '../utils/payments';

interface PrintReportProps {
  payments: Payment[];
  currency: CurrencyCode;
}

/** Hidden on screen; this is what the browser prints when "Print Report" is used. */
export function PrintReport({ payments, currency }: PrintReportProps) {
  const summary = summarizePayments(payments);
  const sorted = filterAndSortPayments(payments, { search: '', status: 'all', sort: 'date-desc' });

  const total = (amount: number) => formatMoney(amount, currency);

  return (
    <div className="hidden bg-white text-sm text-black print:block">
      <header className="mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold">Freelancer Payment Report</h1>
        <p className="mt-1 text-xs text-zinc-600">
          Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })} ·{' '}
          {summary.paymentCount} payment{summary.paymentCount === 1 ? '' : 's'} · {summary.clientCount} client
          {summary.clientCount === 1 ? '' : 's'}
        </p>
      </header>

      <dl className="mb-8 grid grid-cols-3 gap-4">
        {[
          ['Total Earnings', total(summary.earnings)],
          ['Total Paid', total(summary.paid)],
          ['Total Pending', total(summary.pending)],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-zinc-400 p-3">
            <dt className="text-xs font-medium text-zinc-600 uppercase">{label}</dt>
            <dd className="mt-1 text-lg font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      {sorted.length === 0 ? (
        <p>No payments recorded.</p>
      ) : (
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 pr-3">Client</th>
              <th className="py-2 pr-3">Project</th>
              <th className="py-2 pr-3 text-right">Amount</th>
              <th className="py-2 pr-3">Due Date</th>
              <th className="py-2 pr-3">Paid On</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((payment) => (
              <tr key={payment.id} className="border-b border-zinc-300 break-inside-avoid">
                <td className="py-2 pr-3 align-top font-medium">{payment.clientName}</td>
                <td className="py-2 pr-3 align-top">{payment.projectName}</td>
                <td className="py-2 pr-3 text-right align-top tabular-nums">
                  {formatMoney(payment.amount, payment.currency)}
                </td>
                <td className="py-2 pr-3 align-top">{formatDate(payment.dueDate)}</td>
                <td className="py-2 pr-3 align-top">{formatDate(payment.paymentDate)}</td>
                <td className="py-2 align-top font-medium">{payment.status === 'paid' ? 'Paid' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
