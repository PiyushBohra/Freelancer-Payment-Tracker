import { ArrowRight, Sparkles } from 'lucide-react';
import { IS_DEMO } from '../../config';
import { BrandMark } from '../Layout/Logo';
import { Button } from '../UI/Button';

interface WelcomeBannerProps {
  onGetStarted: () => void;
  onStartFresh: () => void;
}

export function WelcomeBanner({ onGetStarted, onStartFresh }: WelcomeBannerProps) {
  return (
    <section
      aria-labelledby="welcome-title"
      className="relative mb-8 overflow-hidden rounded-2xl border border-brand-200/70 bg-brand-50/70 p-6 sm:p-8 dark:border-brand-500/20 dark:bg-brand-500/[0.07]"
    >
      <BrandMark className="pointer-events-none absolute -right-6 -bottom-8 hidden size-56 rotate-[-8deg] opacity-[0.12] sm:block dark:opacity-[0.15]" />
      <div className="relative max-w-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200 dark:bg-zinc-900 dark:text-brand-300 dark:ring-brand-500/30">
          <Sparkles className="size-3.5" aria-hidden="true" />
          No sign-up needed
        </span>
        <h2 id="welcome-title" className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
          Welcome to Freelancer Payment Tracker
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Keep your client payments organized in one simple place. We’ve added a few sample payments so you can
          look around{IS_DEMO ? '. This is a free demo, so nothing you change is saved.' : ' — everything stays private in this browser.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button onClick={onGetStarted}>
            Get Started
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" onClick={onStartFresh}>
            Remove sample data
          </Button>
        </div>
      </div>
    </section>
  );
}
