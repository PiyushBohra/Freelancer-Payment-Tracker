import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { HardDrive, Moon, Sun } from 'lucide-react';
import { IS_DEMO } from '../../config';
import { useAppData } from '../../context/AppDataContext';
import type { Page } from '../../types';
import { focusRing } from '../UI/Button';
import { DemoBanner } from './DemoBanner';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navigation';

interface AppLayoutProps {
  page: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export function AppLayout({ page, onNavigate, children }: AppLayoutProps) {
  const { settings, setTheme } = useAppData();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Move keyboard/screen-reader focus to the new page after navigating.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [page]);

  const isDark = settings.theme === 'dark';
  const ThemeIcon = isDark ? Sun : Moon;
  const themeLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div className="min-h-screen print:hidden">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-200/80 bg-white px-4 py-6 lg:flex dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="px-2">
          <Logo />
        </div>
        <nav aria-label="Main" className="mt-10">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ page: target, label, icon: Icon }) => {
              const active = page === target;
              return (
                <li key={target}>
                  <button
                    type="button"
                    onClick={() => onNavigate(target)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${
                      active
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`size-[18px] ${active ? 'text-brand-600 dark:text-brand-400' : ''}`}
                      aria-hidden="true"
                    />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white ${focusRing}`}
          >
            <ThemeIcon className="size-[18px]" aria-hidden="true" />
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-200">
              <HardDrive className="size-3.5" aria-hidden="true" />
              {IS_DEMO ? 'Demo: nothing is saved' : 'Saved in this browser'}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {IS_DEMO
                ? 'Changes reset when you leave. The full version saves your data on your device.'
                : 'Your data never leaves this device. Export a backup from Settings.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile / tablet header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Logo />
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={themeLabel}
            title={themeLabel}
            className={`rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white ${focusRing}`}
          >
            <ThemeIcon className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Main" className="px-2 sm:px-4">
          <ul className="flex">
            {NAV_ITEMS.map(({ page: target, label, icon: Icon }) => {
              const active = page === target;
              return (
                <li key={target} className="flex-1 sm:flex-none">
                  <button
                    type="button"
                    onClick={() => onNavigate(target)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center justify-center gap-2 border-b-2 px-1.5 py-2.5 text-sm sm:px-3 font-medium transition-colors focus-visible:bg-zinc-100 focus-visible:outline-none dark:focus-visible:bg-zinc-800 ${
                      active
                        ? 'border-brand-600 text-zinc-900 dark:border-brand-400 dark:text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="hidden size-4 sm:block" aria-hidden="true" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="focus:outline-none lg:pl-64"
      >
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {IS_DEMO && <DemoBanner />}
          {children}
        </div>
      </main>
    </div>
  );
}
