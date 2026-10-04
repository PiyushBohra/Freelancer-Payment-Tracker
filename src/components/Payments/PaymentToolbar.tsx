import { useId } from 'react';
import { Search, X } from 'lucide-react';
import type { SortOption, StatusFilter } from '../../types';
import { focusRing } from '../UI/Button';

interface PaymentToolbarProps {
  search: string;
  status: StatusFilter;
  sort: SortOption;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SortOption) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Date (newest first)' },
  { value: 'date-asc', label: 'Date (oldest first)' },
  { value: 'amount-desc', label: 'Amount (highest first)' },
  { value: 'amount-asc', label: 'Amount (lowest first)' },
  { value: 'client-asc', label: 'Client (A–Z)' },
];

const controlClass =
  'h-10 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 shadow-sm shadow-zinc-900/[0.02] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

export function PaymentToolbar({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: PaymentToolbarProps) {
  const searchId = useId();
  const sortId = useId();

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor={searchId} className="sr-only">
          Search by client or project
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <input
          id={searchId}
          type="search"
          placeholder="Search by client or project…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${controlClass} w-full pr-9 pl-9 placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:hidden`}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className={`absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ${focusRing}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          role="group"
          aria-label="Filter by status"
          className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={status === option.value}
              onClick={() => onStatusChange(option.value)}
              className={`h-8 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none ${
                status === option.value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor={sortId} className="text-sm whitespace-nowrap text-zinc-500 dark:text-zinc-400">
            Sort by
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={`${controlClass} w-full px-3 sm:w-auto`}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
