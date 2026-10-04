/**
 * The single place where the app talks to localStorage.
 * All data lives under one key as one JSON object (see AppData).
 */
import type { AppData, ExportFile, Payment, Settings } from '../types';
import { DEFAULT_SETTINGS, ensureUniqueIds, parsePayment, parseSettings } from './validation';

export const STORAGE_KEY = 'freelancer-payment-tracker:v1';
const BACKUP_KEY = `${STORAGE_KEY}:unreadable-backup`;

export type LoadResult =
  | { status: 'ok'; data: AppData; droppedCount: number }
  | { status: 'first-launch' }
  | { status: 'unreadable' }
  | { status: 'unavailable' };

function getStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = `${STORAGE_KEY}:probe`;
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function loadAppData(): LoadResult {
  const storage = getStorage();
  if (!storage) return { status: 'unavailable' };

  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable' };
  }
  if (raw === null) return { status: 'first-launch' };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Invalid data');
    }
    const record = parsed as Record<string, unknown>;
    const list = Array.isArray(record.payments) ? record.payments : [];
    const payments = list.map(parsePayment).filter((p): p is Payment => p !== null);

    return {
      status: 'ok',
      droppedCount: list.length - payments.length,
      data: {
        version: 1,
        payments: ensureUniqueIds(payments),
        settings: parseSettings(record.settings),
        hasSeenWelcome: record.hasSeenWelcome === true,
      },
    };
  } catch {
    // Keep a copy of the unreadable data so it is never silently lost.
    try {
      storage.setItem(BACKUP_KEY, raw);
    } catch {
      /* ignore */
    }
    return { status: 'unreadable' };
  }
}

/** Saves all app data. Returns false if the browser refused (storage full, disabled, private mode). */
export function saveAppData(data: AppData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function createExportFile(payments: Payment[], settings: Settings): ExportFile {
  return {
    app: 'freelancer-payment-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    payments,
  };
}

export function createEmptyAppData(): AppData {
  return { version: 1, payments: [], settings: { ...DEFAULT_SETTINGS }, hasSeenWelcome: false };
}
