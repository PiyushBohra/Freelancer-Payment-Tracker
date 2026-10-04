export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export type PaymentStatus = 'paid' | 'pending';

export type Theme = 'light' | 'dark';

export interface Payment {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  currency: CurrencyCode;
  /** Local date in YYYY-MM-DD format, or an empty string when not set. */
  dueDate: string;
  /** Local date in YYYY-MM-DD format, or an empty string when not set. */
  paymentDate: string;
  status: PaymentStatus;
  notes: string;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp. */
  updatedAt: string;
}

/** The fields a user edits in the payment form. */
export type PaymentInput = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;

export interface Settings {
  currency: CurrencyCode;
  theme: Theme;
}

/** Everything the app keeps in localStorage. */
export interface AppData {
  version: 1;
  payments: Payment[];
  settings: Settings;
  hasSeenWelcome: boolean;
}

/** The shape of an exported backup file. */
export interface ExportFile {
  app: 'freelancer-payment-tracker';
  version: 1;
  exportedAt: string;
  settings: Settings;
  payments: Payment[];
}

export type Page = 'dashboard' | 'payments' | 'projects' | 'settings';

export type StatusFilter = 'all' | PaymentStatus;

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'client-asc';
