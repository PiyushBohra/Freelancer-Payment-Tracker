import { useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { CurrencyCode, Payment, PaymentInput, PaymentStatus } from '../../types';
import { CURRENCY_INFO } from '../../utils/currency';
import { todayISO } from '../../utils/date';
import { LIMITS, parseAmount, validatePaymentForm } from '../../utils/validation';
import type { PaymentFormErrors, PaymentFormValues } from '../../utils/validation';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';

interface PaymentFormModalProps {
  /** The payment being edited, or null when adding a new one. */
  payment: Payment | null;
  defaultCurrency: CurrencyCode;
  onSave: (input: PaymentInput) => void;
  onClose: () => void;
}

const FIELD_ORDER: (keyof PaymentFormValues)[] = [
  'clientName',
  'projectName',
  'amount',
  'currency',
  'status',
  'dueDate',
  'paymentDate',
  'notes',
];

const inputClass =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-900/[0.02] placeholder:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500';

function borderClass(hasError: boolean) {
  return hasError
    ? 'border-rose-400 dark:border-rose-500/70'
    : 'border-zinc-300 dark:border-zinc-700';
}

function toFormValues(payment: Payment | null, defaultCurrency: CurrencyCode): PaymentFormValues {
  if (!payment) {
    return {
      clientName: '',
      projectName: '',
      amount: '',
      currency: defaultCurrency,
      dueDate: '',
      paymentDate: '',
      status: 'pending',
      notes: '',
    };
  }
  return {
    clientName: payment.clientName,
    projectName: payment.projectName,
    amount: String(payment.amount),
    currency: defaultCurrency,
    dueDate: payment.dueDate,
    paymentDate: payment.paymentDate,
    status: payment.status,
    notes: payment.notes,
  };
}

export function PaymentFormModal({ payment, defaultCurrency, onSave, onClose }: PaymentFormModalProps) {
  const [values, setValues] = useState<PaymentFormValues>(() => toFormValues(payment, defaultCurrency));
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();
  const fieldId = (name: keyof PaymentFormValues) => `${baseId}-${name}`;
  const errorId = (name: keyof PaymentFormValues) => `${baseId}-${name}-error`;

  function setField<K extends keyof PaymentFormValues>(name: K, value: PaymentFormValues[K]) {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function setStatus(status: PaymentStatus) {
    setValues((current) => ({
      ...current,
      status,
      // Helpful default: marking as paid fills in today's date if none is set.
      paymentDate: status === 'paid' && !current.paymentDate ? todayISO() : current.paymentDate,
    }));
    if (errors.status) setErrors((current) => ({ ...current, status: undefined }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validatePaymentForm(values);
    setErrors(found);

    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      const target =
        firstInvalid === 'status'
          ? formRef.current?.querySelector<HTMLElement>('input[name="status"]')
          : document.getElementById(fieldId(firstInvalid));
      target?.focus();
      return;
    }

    onSave({
      clientName: values.clientName.trim(),
      projectName: values.projectName.trim(),
      amount: Math.round(parseAmount(values.amount) * 100) / 100,
      currency: values.currency,
      dueDate: values.dueDate,
      paymentDate: values.paymentDate,
      status: values.status as PaymentStatus,
      notes: values.notes.trim(),
    });
  }

  const describedBy = (name: keyof PaymentFormValues, extra?: string) =>
    [errors[name] ? errorId(name) : null, extra].filter(Boolean).join(' ') || undefined;

  return (
    <Modal
      title={payment ? 'Edit payment' : 'Add payment'}
      description={payment ? 'Update the details for this payment.' : 'Record a new client payment.'}
      onClose={onClose}
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Fields marked <span className="text-rose-600 dark:text-rose-400">*</span> are required.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client name" required htmlFor={fieldId('clientName')} error={errors.clientName} errorId={errorId('clientName')}>
            <input
              id={fieldId('clientName')}
              type="text"
              autoComplete="off"
              autoFocus
              maxLength={LIMITS.clientName}
              placeholder="e.g. Sarah Johnson"
              value={values.clientName}
              onChange={(e) => setField('clientName', e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.clientName)}
              aria-describedby={describedBy('clientName')}
              className={`${inputClass} ${borderClass(Boolean(errors.clientName))}`}
            />
          </Field>

          <Field label="Project name" required htmlFor={fieldId('projectName')} error={errors.projectName} errorId={errorId('projectName')}>
            <input
              id={fieldId('projectName')}
              type="text"
              autoComplete="off"
              maxLength={LIMITS.projectName}
              placeholder="e.g. Logo Design"
              value={values.projectName}
              onChange={(e) => setField('projectName', e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.projectName)}
              aria-describedby={describedBy('projectName')}
              className={`${inputClass} ${borderClass(Boolean(errors.projectName))}`}
            />
          </Field>

          <Field label={`Amount (${values.currency})`} required htmlFor={fieldId('amount')} error={errors.amount} errorId={errorId('amount')}>
            <div className="relative">
              <span
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-400"
                aria-hidden="true"
              >
                {CURRENCY_INFO[values.currency].symbol}
              </span>
              <input
                id={fieldId('amount')}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={values.amount}
                onChange={(e) => setField('amount', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={describedBy('amount')}
                className={`${inputClass} ${borderClass(Boolean(errors.amount))} tabular-nums ${
                  CURRENCY_INFO[values.currency].symbol.length > 1 ? 'pl-11' : 'pl-7'
                }`}
              />
            </div>
          </Field>

          <fieldset aria-describedby={describedBy('status')}>
            <legend className="mb-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Status <span className="text-rose-600 dark:text-rose-400" aria-hidden="true">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-950">
              {(['pending', 'paid'] as const).map((status) => (
                <label
                  key={status}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                    values.status === status
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={values.status === status}
                    onChange={() => setStatus(status)}
                    className="sr-only"
                  />
                  <span
                    className={`size-2 rounded-full ${status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    aria-hidden="true"
                  />
                  {status === 'paid' ? 'Paid' : 'Pending'}
                </label>
              ))}
            </div>
            {errors.status && <ErrorText id={errorId('status')}>{errors.status}</ErrorText>}
          </fieldset>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Due date" htmlFor={fieldId('dueDate')} error={errors.dueDate} errorId={errorId('dueDate')}>
            <input
              id={fieldId('dueDate')}
              type="date"
              value={values.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={describedBy('dueDate')}
              className={`${inputClass} ${borderClass(Boolean(errors.dueDate))}`}
            />
          </Field>

          <Field label="Payment date" htmlFor={fieldId('paymentDate')} error={errors.paymentDate} errorId={errorId('paymentDate')}>
            <input
              id={fieldId('paymentDate')}
              type="date"
              value={values.paymentDate}
              onChange={(e) => setField('paymentDate', e.target.value)}
              aria-invalid={Boolean(errors.paymentDate)}
              aria-describedby={describedBy('paymentDate')}
              className={`${inputClass} ${borderClass(Boolean(errors.paymentDate))}`}
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor={fieldId('notes')} error={errors.notes} errorId={errorId('notes')}>
          <textarea
            id={fieldId('notes')}
            rows={3}
            maxLength={LIMITS.notes}
            placeholder="Invoice number, payment method, reminders…"
            value={values.notes}
            onChange={(e) => setField('notes', e.target.value)}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={describedBy('notes')}
            className={`${inputClass} ${borderClass(Boolean(errors.notes))} resize-y`}
          />
        </Field>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end dark:border-zinc-800">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{payment ? 'Save changes' : 'Add payment'}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  errorId: string;
  children: ReactNode;
}

function Field({ label, htmlFor, required, error, errorId, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
      {children}
    </p>
  );
}
