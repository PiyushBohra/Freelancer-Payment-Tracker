import { useState } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { PaymentFormModal } from './components/Payments/PaymentFormModal';
import { PrintReport } from './components/PrintReport';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Dashboard } from './pages/Dashboard';
import { Payments } from './pages/Payments';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import type { Page, Payment } from './types';

/** null = closed, 'new' = adding, Payment = editing that payment. */
type FormState = null | 'new' | Payment;

function Shell() {
  const { payments, settings, addPayment, updatePayment } = useAppData();
  const notify = useToast();
  const [page, setPage] = useState<Page>('dashboard');
  const [form, setForm] = useState<FormState>(null);
  const [paymentsSearch, setPaymentsSearch] = useState('');

  const openAddForm = () => setForm('new');

  const navigate = (target: Page) => {
    setPaymentsSearch('');
    setPage(target);
  };

  const openProject = (projectName: string) => {
    setPaymentsSearch(projectName);
    setPage('payments');
  };

  return (
    <>
      <AppLayout page={page} onNavigate={navigate}>
        {page === 'dashboard' && <Dashboard onAddPayment={openAddForm} onNavigate={navigate} />}
        {page === 'payments' && (
          <Payments
            key={paymentsSearch}
            initialSearch={paymentsSearch}
            onAddPayment={openAddForm}
            onEditPayment={setForm}
          />
        )}
        {page === 'projects' && <Projects onAddPayment={openAddForm} onOpenProject={openProject} />}
        {page === 'settings' && <Settings />}
      </AppLayout>

      {form !== null && (
        <PaymentFormModal
          payment={form === 'new' ? null : form}
          defaultCurrency={settings.currency}
          onClose={() => setForm(null)}
          onSave={(input) => {
            if (form === 'new') {
              addPayment(input);
              notify('Payment added.');
            } else {
              updatePayment(form.id, input);
              notify('Payment updated.');
            }
            setForm(null);
          }}
        />
      )}

      <PrintReport payments={payments} currency={settings.currency} />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppDataProvider>
        <Shell />
      </AppDataProvider>
    </ToastProvider>
  );
}
