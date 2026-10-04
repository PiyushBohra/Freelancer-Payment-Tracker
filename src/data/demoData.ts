import type { Payment, PaymentInput } from '../types';
import { daysFromToday } from '../utils/date';
import { createId } from '../utils/id';

/**
 * Fictional sample data shown on first launch. All names and amounts are made up.
 * Dates are relative to today so the demo always looks current.
 * Remove it any time with Settings → Clear All Data.
 */
const DEMO_PAYMENTS: PaymentInput[] = [
  {
    clientName: 'Sarah Johnson',
    projectName: 'Business Website',
    amount: 2400,
    currency: 'USD',
    dueDate: daysFromToday(-34),
    paymentDate: daysFromToday(-36),
    status: 'paid',
    notes: 'Five-page website with contact form. Paid by bank transfer.',
  },
  {
    clientName: 'Michael Brown',
    projectName: 'Logo Design',
    amount: 850,
    currency: 'USD',
    dueDate: daysFromToday(-21),
    paymentDate: daysFromToday(-19),
    status: 'paid',
    notes: 'Includes three concepts and two rounds of revisions.',
  },
  {
    clientName: 'Emma Wilson',
    projectName: 'Landing Page',
    amount: 1200,
    currency: 'USD',
    dueDate: daysFromToday(-12),
    paymentDate: daysFromToday(-12),
    status: 'paid',
    notes: '',
  },
  {
    clientName: 'David Miller',
    projectName: 'WordPress Development',
    amount: 1500,
    currency: 'USD',
    dueDate: daysFromToday(-4),
    paymentDate: '',
    status: 'pending',
    notes: 'Invoice #1042 sent. Follow up by email if not received this week.',
  },
  {
    clientName: 'Sarah Johnson',
    projectName: 'Website Maintenance',
    amount: 600,
    currency: 'USD',
    dueDate: daysFromToday(9),
    paymentDate: '',
    status: 'pending',
    notes: 'Updates, backups and small content changes.',
  },
  {
    clientName: 'Maple & Pine Studio',
    projectName: 'Product Photography',
    amount: 1050,
    currency: 'USD',
    dueDate: daysFromToday(-48),
    paymentDate: daysFromToday(-45),
    status: 'paid',
    notes: '40 edited product photos.',
  },
  {
    clientName: 'Emma Wilson',
    projectName: 'Website Maintenance',
    amount: 900,
    currency: 'USD',
    dueDate: daysFromToday(16),
    paymentDate: '',
    status: 'pending',
    notes: 'Quarterly plan: plugin updates, backups and security checks.',
  },
];

export function createDemoPayments(): Payment[] {
  const now = new Date().toISOString();
  return DEMO_PAYMENTS.map((payment) => ({
    ...payment,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  }));
}
