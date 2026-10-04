import { getInitials } from '../../utils/payments';

/** A small circle with a client's initials. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/20 ${
        size === 'sm' ? 'size-6 text-[10px]' : 'size-8 text-xs'
      }`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
