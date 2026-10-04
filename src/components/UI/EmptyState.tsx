import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
      <div className="relative mb-5">
        <div className="absolute inset-0 -m-3 rounded-full bg-brand-100/60 dark:bg-brand-500/10" aria-hidden="true" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-brand-200 bg-white text-brand-600 shadow-sm dark:border-brand-500/30 dark:bg-zinc-900 dark:text-brand-400">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      </div>
      <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
