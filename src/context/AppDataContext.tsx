import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { IS_DEMO } from '../config';
import type { AppData, CurrencyCode, Payment, PaymentInput, Settings, Theme } from '../types';
import { createDemoPayments } from '../data/demoData';
import { todayISO } from '../utils/date';
import { createId } from '../utils/id';
import { createEmptyAppData, loadAppData, saveAppData } from '../utils/storage';
import type { LoadResult } from '../utils/storage';
import { useToast } from './ToastContext';

interface AppDataContextValue {
  payments: Payment[];
  settings: Settings;
  hasSeenWelcome: boolean;
  storageWorks: boolean;
  addPayment: (input: PaymentInput) => void;
  updatePayment: (id: string, input: PaymentInput) => void;
  markAsPaid: (id: string) => void;
  deletePayment: (id: string) => void;
  replaceAllPayments: (payments: Payment[], settings?: Settings | null) => void;
  clearAllPayments: () => void;
  setCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: Theme) => void;
  dismissWelcome: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

/** The whole app uses one currency (chosen in Settings), so every payment follows it. */
function withCurrency(payments: Payment[], currency: CurrencyCode): Payment[] {
  return payments.map((p) => (p.currency === currency ? p : { ...p, currency }));
}

function initialData(load: LoadResult): AppData {
  if (load.status === 'ok') {
    return { ...load.data, payments: withCurrency(load.data.payments, load.data.settings.currency) };
  }
  // First launch (or unreadable data): start with demo data so the app isn't empty.
  return { ...createEmptyAppData(), payments: createDemoPayments() };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const notify = useToast();
  // The online demo never reads or writes browser storage: every visit starts fresh.
  const [load] = useState<LoadResult>(() => (IS_DEMO ? { status: 'first-launch' } : loadAppData()));
  const [data, setData] = useState<AppData>(() => initialData(load));
  const [storageWorks, setStorageWorks] = useState(load.status !== 'unavailable');
  const warnedAboutSaving = useRef(false);
  const reportedLoad = useRef(false);

  // Explain any problems found while loading, once.
  useEffect(() => {
    if (reportedLoad.current) return;
    reportedLoad.current = true;
    if (load.status === 'unavailable') {
      notify(
        'Your browser is blocking local storage, so changes won’t be saved after you close this page. Use Export Data to keep a copy.',
        'error',
      );
    } else if (load.status === 'unreadable') {
      notify('Your saved data couldn’t be read, so the app has started fresh. A copy of the old data was kept.', 'error');
    } else if (load.status === 'ok' && load.droppedCount > 0) {
      notify(`${load.droppedCount} saved payment(s) were damaged and couldn’t be loaded.`, 'error');
    }
  }, [load, notify]);

  // Save automatically whenever anything changes.
  useEffect(() => {
    if (IS_DEMO) return;
    const saved = saveAppData(data);
    setStorageWorks(saved);
    if (!saved && !warnedAboutSaving.current && load.status !== 'unavailable') {
      warnedAboutSaving.current = true;
      notify(
        'Your latest changes couldn’t be saved in this browser (storage may be full or disabled). Use Export Data to keep a copy.',
        'error',
      );
    }
  }, [data, load.status, notify]);

  // Apply the theme to the page.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', data.settings.theme === 'dark');
  }, [data.settings.theme]);

  const updatePayments = useCallback((update: (payments: Payment[]) => Payment[]) => {
    setData((current) => ({
      ...current,
      payments: withCurrency(update(current.payments), current.settings.currency),
    }));
  }, []);

  const addPayment = useCallback(
    (input: PaymentInput) => {
      const now = new Date().toISOString();
      updatePayments((payments) => [{ ...input, id: createId(), createdAt: now, updatedAt: now }, ...payments]);
    },
    [updatePayments],
  );

  const updatePayment = useCallback(
    (id: string, input: PaymentInput) => {
      const now = new Date().toISOString();
      updatePayments((payments) => payments.map((p) => (p.id === id ? { ...p, ...input, updatedAt: now } : p)));
    },
    [updatePayments],
  );

  const markAsPaid = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      updatePayments((payments) =>
        payments.map((p) =>
          p.id === id ? { ...p, status: 'paid', paymentDate: p.paymentDate || todayISO(), updatedAt: now } : p,
        ),
      );
    },
    [updatePayments],
  );

  const deletePayment = useCallback(
    (id: string) => updatePayments((payments) => payments.filter((p) => p.id !== id)),
    [updatePayments],
  );

  const replaceAllPayments = useCallback((payments: Payment[], settings?: Settings | null) => {
    setData((current) => {
      const nextSettings = settings ?? current.settings;
      return {
        ...current,
        payments: withCurrency(payments, nextSettings.currency),
        settings: nextSettings,
        hasSeenWelcome: true,
      };
    });
  }, []);

  const clearAllPayments = useCallback(() => {
    setData((current) => ({ ...current, payments: [], hasSeenWelcome: true }));
  }, []);

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setData((current) => ({
      ...current,
      payments: withCurrency(current.payments, currency),
      settings: { ...current.settings, currency },
    }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setData((current) => ({ ...current, settings: { ...current.settings, theme } }));
  }, []);

  const dismissWelcome = useCallback(() => {
    setData((current) => ({ ...current, hasSeenWelcome: true }));
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      payments: data.payments,
      settings: data.settings,
      hasSeenWelcome: data.hasSeenWelcome,
      storageWorks,
      addPayment,
      updatePayment,
      markAsPaid,
      deletePayment,
      replaceAllPayments,
      clearAllPayments,
      setCurrency,
      setTheme,
      dismissWelcome,
    }),
    [
      data,
      storageWorks,
      addPayment,
      updatePayment,
      markAsPaid,
      deletePayment,
      replaceAllPayments,
      clearAllPayments,
      setCurrency,
      setTheme,
      dismissWelcome,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
