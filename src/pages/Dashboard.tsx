import { useMemo, useState } from 'react';
import { CircleCheck, Clock, Plus, Printer, ReceiptText, Wallet } from 'lucide-react';
import { EarningsChart } from '../components/Dashboard/EarningsChart';
import { RecentPayments } from '../components/Dashboard/RecentPayments';
import { StatCard } from '../components/Dashboard/StatCard';
import { WelcomeBanner } from '../components/Dashboard/WelcomeBanner';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { EmptyState } from '../components/UI/EmptyState';
import { PageHeader } from '../components/UI/PageHeader';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { Page } from '../types';
import { formatMoney } from '../utils/currency';
import { filterAndSortPayments, summarizePayments } from '../utils/payments';

interface DashboardProps {
  onAddPayment: () => void;
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onAddPayment, onNavigate }: DashboardProps) {
  const { payments, settings, hasSeenWelcome, dismissWelcome, clearAllPayments } = useAppData();
  const notify = useToast();
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const summary = useMemo(() => summarizePayments(payments), [payments]);
  const recent = useMemo(
    () => filterAndSortPayments(payments, { search: '', status: 'all', sort: 'date-desc' }).slice(0, 5),
    [payments],
  );

  const currency = settings.currency;
  const collected = summary.earnings > 0 ? Math.round((summary.paid / summary.earnings) * 100) : 0;

  return (
    <>
      {!hasSeenWelcome && (
        <WelcomeBanner onGetStarted={dismissWelcome} onStartFresh={() => setConfirmingRemove(true)} />
      )}

      <PageHeader
        title="Dashboard"
        description="An overview of what you’ve earned and what you’re still owed."
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              Print Report
            </Button>
            <Button icon={Plus} onClick={onAddPayment}>
              Add Payment
            </Button>
          </>
        }
      />

      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Earnings" value={formatMoney(summary.earnings, currency)} icon={Wallet} />
        <StatCard label="Paid" value={formatMoney(summary.paid, currency)} icon={CircleCheck} accent="emerald" />
        <StatCard label="Pending" value={formatMoney(summary.pending, currency)} icon={Clock} accent="amber" />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart payments={payments} currency={currency} />
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="p-5">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">At a glance</h2>
            <dl className="mt-3 grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
              {(
                [
                  ['Clients', summary.clientCount],
                  ['Projects', summary.projectCount],
                  ['Payments', summary.paymentCount],
                ] as const
              ).map(([label, count]) => (
                <div key={label} className="flex flex-col-reverse px-3 first:pl-0 last:pr-0">
                  <dt className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
                  <dd className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-white">
                    {count}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <p id="collected-label" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Collected
              </p>
              <p className="text-sm font-semibold text-zinc-900 tabular-nums dark:text-white">{collected}%</p>
            </div>
            <div
              role="progressbar"
              aria-labelledby="collected-label"
              aria-valuenow={collected}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
            >
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${collected}%` }} />
            </div>
            <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              Share of your {currency} earnings that has been paid.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-4">
        {payments.length === 0 ? (
          <Card>
            <EmptyState
              icon={ReceiptText}
              title="No payments yet"
              message="Start tracking your freelance income by adding your first payment."
              action={
                <Button icon={Plus} onClick={onAddPayment}>
                  Add Payment
                </Button>
              }
            />
          </Card>
        ) : (
          <RecentPayments payments={recent} onViewAll={() => onNavigate('payments')} />
        )}
      </div>

      {confirmingRemove && (
        <ConfirmDialog
          title="Remove sample data?"
          message="This deletes all the sample payments so you can start with an empty tracker."
          confirmLabel="Remove sample data"
          onCancel={() => setConfirmingRemove(false)}
          onConfirm={() => {
            clearAllPayments();
            setConfirmingRemove(false);
            notify('Sample data removed. You’re ready to add your first payment.');
          }}
        />
      )}
    </>
  );
}
