import { useMemo, useState } from 'react';
import { Plus, Printer, ReceiptText, SearchX } from 'lucide-react';
import { PaymentList } from '../components/Payments/PaymentList';
import { PaymentToolbar } from '../components/Payments/PaymentToolbar';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { EmptyState } from '../components/UI/EmptyState';
import { PageHeader } from '../components/UI/PageHeader';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { Payment, SortOption, StatusFilter } from '../types';
import { formatMoney } from '../utils/currency';
import { filterAndSortPayments } from '../utils/payments';

interface PaymentsProps {
  /** Pre-fills the search box, e.g. when opening a project from the Projects page. */
  initialSearch?: string;
  onAddPayment: () => void;
  onEditPayment: (payment: Payment) => void;
}

export function Payments({ initialSearch = '', onAddPayment, onEditPayment }: PaymentsProps) {
  const { payments, deletePayment, markAsPaid } = useAppData();
  const notify = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const visible = useMemo(
    () => filterAndSortPayments(payments, { search, status, sort }),
    [payments, search, status, sort],
  );

  const isFiltered = search.trim() !== '' || status !== 'all';

  function resetFilters() {
    setSearch('');
    setStatus('all');
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every client payment in one place. Search, filter and keep things up to date."
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={() => window.print()} disabled={payments.length === 0}>
              Print Report
            </Button>
            <Button icon={Plus} onClick={onAddPayment}>
              Add Payment
            </Button>
          </>
        }
      />

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
        <>
          <PaymentToolbar
            search={search}
            status={status}
            sort={sort}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onSortChange={setSort}
          />

          <p className="mt-5 mb-3 text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
            {isFiltered
              ? `Showing ${visible.length} of ${payments.length} payments`
              : `${payments.length} payment${payments.length === 1 ? '' : 's'}`}
          </p>

          <Card className="overflow-hidden">
            {visible.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No matching payments"
                message="Try a different search term or status filter."
                action={
                  <Button variant="secondary" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <PaymentList
                payments={visible}
                onEdit={onEditPayment}
                onDelete={setPaymentToDelete}
                onMarkPaid={(payment) => {
                  markAsPaid(payment.id);
                  notify(`Marked ${payment.projectName} as paid.`);
                }}
              />
            )}
          </Card>
        </>
      )}

      {paymentToDelete && (
        <ConfirmDialog
          title="Delete this payment?"
          message={`${paymentToDelete.clientName} — ${paymentToDelete.projectName} (${formatMoney(
            paymentToDelete.amount,
            paymentToDelete.currency,
          )}) will be permanently deleted. This can’t be undone.`}
          confirmLabel="Delete payment"
          onCancel={() => setPaymentToDelete(null)}
          onConfirm={() => {
            deletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
            notify('Payment deleted.');
          }}
        />
      )}
    </>
  );
}
