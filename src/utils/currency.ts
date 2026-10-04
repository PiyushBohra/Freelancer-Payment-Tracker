import type { CurrencyCode } from '../types';

export const CURRENCY_INFO: Record<CurrencyCode, { name: string; symbol: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
};

const formatters = new Map<string, Intl.NumberFormat>();

/** Formats an amount like "$8,500" or "$1,250.50". */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const key = `${currency}:${hasCents}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(amount);
}
