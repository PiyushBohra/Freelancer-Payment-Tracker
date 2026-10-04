import { CURRENCIES } from '../types';
import type { CurrencyCode, Payment, PaymentStatus, Settings, Theme } from '../types';
import { isValidISODate } from './date';
import { createId } from './id';

export const LIMITS = {
  clientName: 100,
  projectName: 120,
  notes: 1000,
  maxAmount: 1_000_000_000,
  importFileBytes: 5 * 1024 * 1024,
};

export const DEFAULT_SETTINGS: Settings = { currency: 'USD', theme: 'light' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

function isStatus(value: unknown): value is PaymentStatus {
  return value === 'paid' || value === 'pending';
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/* ------------------------------------------------------------------ */
/* Form validation                                                     */
/* ------------------------------------------------------------------ */

export interface PaymentFormValues {
  clientName: string;
  projectName: string;
  amount: string;
  currency: CurrencyCode;
  dueDate: string;
  paymentDate: string;
  status: PaymentStatus | '';
  notes: string;
}

export type PaymentFormErrors = Partial<Record<keyof PaymentFormValues, string>>;

/** Turns "1,250.50" into 1250.5. Returns NaN if the text is not a plain number. */
export function parseAmount(text: string): number {
  const cleaned = text.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

export function validatePaymentForm(values: PaymentFormValues): PaymentFormErrors {
  const errors: PaymentFormErrors = {};

  const client = values.clientName.trim();
  if (!client) errors.clientName = 'Please enter the client’s name.';
  else if (client.length > LIMITS.clientName)
    errors.clientName = `Client name must be ${LIMITS.clientName} characters or fewer.`;

  const project = values.projectName.trim();
  if (!project) errors.projectName = 'Please enter the project name.';
  else if (project.length > LIMITS.projectName)
    errors.projectName = `Project name must be ${LIMITS.projectName} characters or fewer.`;

  if (!values.amount.trim()) {
    errors.amount = 'Please enter an amount.';
  } else {
    const amount = parseAmount(values.amount);
    if (Number.isNaN(amount)) errors.amount = 'Please enter a valid number, like 1500 or 1500.50.';
    else if (amount <= 0) errors.amount = 'The amount must be greater than zero.';
    else if (amount > LIMITS.maxAmount) errors.amount = 'That amount is too large.';
  }

  if (!isCurrency(values.currency)) errors.currency = 'Please choose a currency.';
  if (!isStatus(values.status)) errors.status = 'Please choose a status.';

  if (values.dueDate && !isValidISODate(values.dueDate)) errors.dueDate = 'Please enter a valid date.';
  if (values.paymentDate && !isValidISODate(values.paymentDate))
    errors.paymentDate = 'Please enter a valid date.';

  if (values.notes.length > LIMITS.notes)
    errors.notes = `Notes must be ${LIMITS.notes} characters or fewer.`;

  return errors;
}

/* ------------------------------------------------------------------ */
/* Data validation (used for localStorage and imported files)          */
/* ------------------------------------------------------------------ */

function optionalDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return '';
  return typeof value === 'string' && isValidISODate(value) ? value : null;
}

function timestamp(value: unknown, fallback: string): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback;
}

/** Checks an unknown value and returns a clean Payment, or null if it is not valid. */
export function parsePayment(value: unknown): Payment | null {
  if (!isRecord(value)) return null;

  const clientName = typeof value.clientName === 'string' ? value.clientName.trim() : '';
  const projectName = typeof value.projectName === 'string' ? value.projectName.trim() : '';
  if (!clientName || clientName.length > LIMITS.clientName) return null;
  if (!projectName || projectName.length > LIMITS.projectName) return null;

  const amount =
    typeof value.amount === 'number'
      ? value.amount
      : typeof value.amount === 'string'
        ? parseAmount(value.amount)
        : Number.NaN;
  if (!Number.isFinite(amount) || amount <= 0 || amount > LIMITS.maxAmount) return null;

  if (!isStatus(value.status)) return null;

  const currency = value.currency === undefined ? DEFAULT_SETTINGS.currency : value.currency;
  if (!isCurrency(currency)) return null;

  const dueDate = optionalDate(value.dueDate);
  const paymentDate = optionalDate(value.paymentDate);
  if (dueDate === null || paymentDate === null) return null;

  const notes = typeof value.notes === 'string' ? value.notes.slice(0, LIMITS.notes) : '';
  const now = new Date().toISOString();
  const createdAt = timestamp(value.createdAt, now);

  return {
    id: typeof value.id === 'string' && value.id.trim() ? value.id : createId(),
    clientName,
    projectName,
    amount: Math.round(amount * 100) / 100,
    currency,
    dueDate,
    paymentDate,
    status: value.status,
    notes,
    createdAt,
    updatedAt: timestamp(value.updatedAt, createdAt),
  };
}

export function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) return { ...DEFAULT_SETTINGS };
  return {
    currency: isCurrency(value.currency) ? value.currency : DEFAULT_SETTINGS.currency,
    theme: isTheme(value.theme) ? value.theme : DEFAULT_SETTINGS.theme,
  };
}

/** Gives any duplicate IDs a fresh ID so every payment can be edited and deleted safely. */
export function ensureUniqueIds(payments: Payment[]): Payment[] {
  const seen = new Set<string>();
  return payments.map((payment) => {
    if (!seen.has(payment.id)) {
      seen.add(payment.id);
      return payment;
    }
    const id = createId();
    seen.add(id);
    return { ...payment, id };
  });
}

export type ImportResult =
  | { ok: true; payments: Payment[]; settings: Settings | null }
  | { ok: false; error: string };

const NOT_OUR_FILE =
  'This file doesn’t look like a Freelancer Payment Tracker backup. Please choose a file you exported from the app.';

/** Validates the text of an imported backup file. Nothing is changed unless the whole file is valid. */
export function parseImportFile(text: string): ImportResult {
  if (!text.trim()) {
    return { ok: false, error: 'This file is empty. Please choose a file you exported from the app.' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: 'This file couldn’t be read. It may be damaged or not a JSON backup file.',
    };
  }

  let list: unknown;
  let settings: Settings | null = null;
  if (Array.isArray(raw)) {
    list = raw;
  } else if (isRecord(raw) && Array.isArray(raw.payments)) {
    list = raw.payments;
    if (raw.settings !== undefined) settings = parseSettings(raw.settings);
  } else {
    return { ok: false, error: NOT_OUR_FILE };
  }

  const items = list as unknown[];
  if (items.length === 0) {
    return { ok: false, error: 'This backup file doesn’t contain any payments.' };
  }

  const payments: Payment[] = [];
  for (let i = 0; i < items.length; i++) {
    const payment = parsePayment(items[i]);
    if (!payment) {
      return {
        ok: false,
        error: `Payment #${i + 1} in this file is missing information or has an invalid value. Nothing was imported, and your current data is unchanged.`,
      };
    }
    payments.push(payment);
  }

  return { ok: true, payments: ensureUniqueIds(payments), settings };
}
