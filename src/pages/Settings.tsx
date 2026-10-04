import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Check, Download, HardDrive, Moon, Sun, Trash2, TriangleAlert, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { PageHeader } from '../components/UI/PageHeader';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { CURRENCIES } from '../types';
import type { Payment, Settings as SettingsType, Theme } from '../types';
import { CURRENCY_INFO } from '../utils/currency';
import { createExportFile } from '../utils/storage';
import { LIMITS, parseImportFile } from '../utils/validation';

interface PendingImport {
  payments: Payment[];
  settings: SettingsType | null;
  fileName: string;
}

export function Settings() {
  const { payments, settings, storageWorks, setCurrency, setTheme, replaceAllPayments, clearAllPayments } =
    useAppData();
  const notify = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  function handleExport() {
    try {
      const file = createExportFile(payments, settings);
      const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'freelancer-payment-data.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(`Exported ${payments.length} payment${payments.length === 1 ? '' : 's'}.`);
    } catch {
      notify('Sorry, the export didn’t work. Please try again.', 'error');
    }
  }

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again later
    if (!file) return;

    if (file.size > LIMITS.importFileBytes) {
      notify('That file is too large to be a payment backup. Please choose a different file.', 'error');
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      notify('That file couldn’t be opened. Please try again.', 'error');
      return;
    }

    const result = parseImportFile(text);
    if (!result.ok) {
      notify(result.error, 'error');
      return;
    }
    setPendingImport({ payments: result.payments, settings: result.settings, fileName: file.name });
  }

  return (
    <>
      <PageHeader title="Settings" description="Choose your currency and theme, and manage your data." />

      <div className="space-y-6">
        <Section
          title="Currency"
          description="The currency used for all your payments and totals. Changing it switches the symbol on every amount. Amounts are not converted."
        >
          <fieldset>
            <legend className="sr-only">Currency</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CURRENCIES.map((code) => (
                <ChoiceCard
                  key={code}
                  name="currency"
                  checked={settings.currency === code}
                  onChange={() => {
                    setCurrency(code);
                    notify(`Currency set to ${code}.`);
                  }}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {CURRENCY_INFO[code].symbol}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-white">{code}</span>
                    <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {CURRENCY_INFO[code].name}
                    </span>
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section title="Appearance" description="Pick the look that’s easiest on your eyes.">
          <fieldset>
            <legend className="sr-only">Theme</legend>
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              {(
                [
                  ['light', 'Light mode', Sun],
                  ['dark', 'Dark mode', Moon],
                ] as [Theme, string, LucideIcon][]
              ).map(([theme, label, Icon]) => (
                <ChoiceCard key={theme} name="theme" checked={settings.theme === theme} onChange={() => setTheme(theme)}>
                  <Icon className="size-5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{label}</span>
                </ChoiceCard>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section
          title="Data"
          description="Your payments are saved automatically in this browser’s local storage. Nothing is uploaded anywhere."
        >
          {!storageWorks && (
            <div
              role="alert"
              className="mb-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                Your browser isn’t letting this app save data right now (it may be in private mode, or storage may be
                full). Export your data so you don’t lose it.
              </p>
            </div>
          )}

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <DataRow
              icon={Download}
              title="Export Data"
              description="Download a backup of all your payments as a JSON file."
              action={
                <Button variant="secondary" icon={Download} onClick={handleExport}>
                  Export Data
                </Button>
              }
            />
            <DataRow
              icon={Upload}
              title="Import Data"
              description="Restore payments from a backup file. This replaces your current payments."
              action={
                <>
                  <Button variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                    Import Data
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChosen}
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </>
              }
            />
            <DataRow
              icon={Trash2}
              title="Clear All Data"
              description="Permanently delete every payment, including the sample data. Your currency and theme are kept."
              danger
              action={
                <Button variant="danger" icon={Trash2} onClick={() => setConfirmingClear(true)} disabled={payments.length === 0}>
                  Clear All Data
                </Button>
              }
            />
          </div>

          <div className="mt-5 flex gap-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            <HardDrive className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              Data saved in your browser stays on this device and in this browser only. Clearing your browser’s
              history or site data will erase it, so export a backup regularly.
            </p>
          </div>
        </Section>
      </div>

      {pendingImport && (
        <ConfirmDialog
          title="Replace your data?"
          message={`“${pendingImport.fileName}” contains ${pendingImport.payments.length} payment${
            pendingImport.payments.length === 1 ? '' : 's'
          }. Importing will replace your ${payments.length} current payment${
            payments.length === 1 ? '' : 's'
          }. Tip: export a backup first if you want to keep them.`}
          confirmLabel="Replace and import"
          tone="primary"
          onCancel={() => setPendingImport(null)}
          onConfirm={() => {
            replaceAllPayments(pendingImport.payments, pendingImport.settings);
            notify(`Imported ${pendingImport.payments.length} payments.`);
            setPendingImport(null);
          }}
        />
      )}

      {confirmingClear && (
        <ConfirmDialog
          title="Clear all data?"
          message={`This permanently deletes all ${payments.length} payments from this browser. This can’t be undone — export a backup first if you might need them.`}
          confirmLabel="Yes, clear everything"
          onCancel={() => setConfirmingClear(false)}
          onConfirm={() => {
            clearAllPayments();
            setConfirmingClear(false);
            notify('All payments have been cleared.');
          }}
        />
      )}
    </>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
      <p className="mt-1 mb-5 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      {children}
    </Card>
  );
}

function ChoiceCard({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-offset-zinc-900 ${
        checked
          ? 'border-brand-500 bg-brand-50/60 dark:border-brand-400 dark:bg-brand-500/10'
          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50'
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
      {checked && (
        <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white dark:bg-brand-500">
          <Check className="size-3" strokeWidth={3} aria-hidden="true" />
        </span>
      )}
    </label>
  );
}

function DataRow({
  icon: Icon,
  title,
  description,
  action,
  danger = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <div className="sm:shrink-0">{action}</div>
    </div>
  );
}
