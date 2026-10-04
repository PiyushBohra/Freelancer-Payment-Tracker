import type { Payment, SortOption, StatusFilter } from '../types';
import { todayISO } from './date';

export function isOverdue(payment: Payment): boolean {
  return payment.status === 'pending' && payment.dueDate !== '' && payment.dueDate < todayISO();
}

/** The date used for sorting: due date, then payment date, then the day it was created. */
function sortDate(payment: Payment): string {
  return payment.dueDate || payment.paymentDate || payment.createdAt.slice(0, 10);
}

export interface PaymentQuery {
  search: string;
  status: StatusFilter;
  sort: SortOption;
}

export function filterAndSortPayments(payments: Payment[], query: PaymentQuery): Payment[] {
  const term = query.search.trim().toLowerCase();

  const filtered = payments.filter((payment) => {
    if (query.status !== 'all' && payment.status !== query.status) return false;
    if (!term) return true;
    return (
      payment.clientName.toLowerCase().includes(term) ||
      payment.projectName.toLowerCase().includes(term)
    );
  });

  return filtered.sort((a, b) => {
    switch (query.sort) {
      case 'date-asc':
        return sortDate(a).localeCompare(sortDate(b));
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'client-asc':
        return a.clientName.localeCompare(b.clientName, undefined, { sensitivity: 'base' });
      case 'date-desc':
      default:
        return sortDate(b).localeCompare(sortDate(a));
    }
  });
}

export interface PaymentSummary {
  earnings: number;
  paid: number;
  pending: number;
  clientCount: number;
  projectCount: number;
  paymentCount: number;
}

const key = (text: string) => text.trim().toLowerCase();

export function summarizePayments(payments: Payment[]): PaymentSummary {
  const summary: PaymentSummary = {
    earnings: 0,
    paid: 0,
    pending: 0,
    clientCount: new Set(payments.map((p) => key(p.clientName))).size,
    projectCount: new Set(payments.map((p) => key(p.projectName))).size,
    paymentCount: payments.length,
  };
  for (const payment of payments) {
    summary.earnings += payment.amount;
    if (payment.status === 'paid') summary.paid += payment.amount;
    else summary.pending += payment.amount;
  }
  return summary;
}

export interface ProjectSummary {
  /** Lower-cased project name, used to group payments. */
  key: string;
  name: string;
  clients: string[];
  payments: Payment[];
  total: number;
  paid: number;
  pending: number;
  overdueCount: number;
  /** Most recent due/payment date across the project's payments (YYYY-MM-DD). */
  latestDate: string;
}

/** Groups payments by project name (ignoring capitalisation) and lists every client connected to each. */
export function groupProjects(payments: Payment[]): ProjectSummary[] {
  const projects = new Map<string, ProjectSummary>();

  for (const payment of payments) {
    const id = key(payment.projectName);
    let project = projects.get(id);
    if (!project) {
      project = {
        key: id,
        name: payment.projectName.trim(),
        clients: [],
        payments: [],
        total: 0,
        paid: 0,
        pending: 0,
        overdueCount: 0,
        latestDate: '',
      };
      projects.set(id, project);
    }
    project.payments.push(payment);
    project.total += payment.amount;
    if (payment.status === 'paid') project.paid += payment.amount;
    else project.pending += payment.amount;
    if (isOverdue(payment)) project.overdueCount += 1;
    const client = payment.clientName.trim();
    if (!project.clients.some((c) => key(c) === key(client))) project.clients.push(client);
    const date = sortDate(payment);
    if (date > project.latestDate) project.latestDate = date;
  }

  return [...projects.values()];
}

export interface MonthEarnings {
  /** YYYY-MM */
  key: string;
  /** First day of the month (local time). */
  date: Date;
  paid: number;
  pending: number;
  total: number;
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Paid payments count in the month they were paid; pending ones in the month they are due. */
function earningsMonth(payment: Payment): string {
  const date =
    payment.status === 'paid'
      ? payment.paymentDate || payment.dueDate || payment.createdAt
      : payment.dueDate || payment.createdAt;
  return date.slice(0, 7);
}

/**
 * Paid and pending totals for the last `count` months. The window ends this month,
 * or up to two months ahead when pending payments are already due then.
 */
export function monthlyEarnings(payments: Payment[], count = 6): MonthEarnings[] {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = new Set(payments.map(earningsMonth));

  let end = thisMonth;
  for (let ahead = 1; ahead <= 2; ahead++) {
    const month = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + ahead, 1);
    if (used.has(monthKey(month))) end = month;
  }

  const months: MonthEarnings[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(end.getFullYear(), end.getMonth() - i, 1);
    months.push({ key: monthKey(date), date, paid: 0, pending: 0, total: 0 });
  }

  const byKey = new Map(months.map((m) => [m.key, m]));
  for (const payment of payments) {
    const month = byKey.get(earningsMonth(payment));
    if (!month) continue;
    if (payment.status === 'paid') month.paid += payment.amount;
    else month.pending += payment.amount;
    month.total += payment.amount;
  }
  return months;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}
