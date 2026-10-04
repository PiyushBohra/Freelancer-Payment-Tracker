/**
 * The product mark: rising chart bars (growth) with a dollar coin (money).
 * The same drawing is used for the browser-tab icon in index.html.
 */
export function BrandMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand-600 dark:fill-brand-500" />
      <rect x="6.5" y="20" width="3.75" height="6" rx="1.2" fill="white" fillOpacity="0.7" />
      <rect x="12" y="16.5" width="3.75" height="9.5" rx="1.2" fill="white" fillOpacity="0.85" />
      <rect x="17.5" y="15.5" width="3.75" height="10.5" rx="1.2" fill="white" />
      <circle cx="23" cy="9.5" r="5.75" fill="#facc15" className="stroke-brand-600 dark:stroke-brand-500" strokeWidth="1.5" />
      <path
        d="M24.6 7.6c-.35-.55-.95-.85-1.6-.85-.95 0-1.65.5-1.65 1.25 0 1.75 3.4.95 3.4 2.8 0 .8-.75 1.35-1.75 1.35-.75 0-1.4-.35-1.75-.9M23 5.9v1M23 12.15v1"
        fill="none"
        stroke="#713f12"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="size-9 shrink-0 drop-shadow-sm" />
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">
          Payment Tracker
        </span>
        <span className="block text-[11px] font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          for freelancers
        </span>
      </span>
    </div>
  );
}
