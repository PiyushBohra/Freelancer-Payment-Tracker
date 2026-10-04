import { BriefcaseBusiness, LayoutDashboard, ReceiptText, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Page } from '../../types';

export const NAV_ITEMS: { page: Page; label: string; icon: LucideIcon }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'payments', label: 'Payments', icon: ReceiptText },
  { page: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { page: 'settings', label: 'Settings', icon: Settings },
];
