import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { ETSY_SHOP_URL } from '../../config';
import { focusRing } from '../UI/Button';

/** Shown on every page of the online demo. */
export function DemoBanner() {
  return (
    <div
      role="note"
      aria-label="Demo version"
      className="mb-8 flex flex-col gap-3 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <p className="flex items-start gap-2.5">
        <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">You’re using the free demo.</strong> Try everything you like, but nothing
          is saved: your changes disappear when you close or refresh this page.
        </span>
      </p>
      <a
        href={ETSY_SHOP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-800 dark:bg-amber-300 dark:text-amber-950 dark:hover:bg-amber-200 ${focusRing}`}
      >
        Get the full version
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </div>
  );
}
