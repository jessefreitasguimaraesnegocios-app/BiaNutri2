import type { FastingEntry } from '../types';

const STORAGE_KEY = (userId: string) => `biaNutriFasting_${userId}`;

export function getFastingEntries(userId: string): FastingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFastingEntry(userId: string, entry: FastingEntry): void {
  const entries = getFastingEntries(userId);
  const without = entries.filter((e) => e.date !== entry.date);
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify([...without, entry]));
}

export function getEntryByDate(userId: string, dateStr: string): FastingEntry | null {
  return getFastingEntries(userId).find((e) => e.date === dateStr) ?? null;
}

/** Calcula horas entre início e fim (considera passar da meia-noite). */
export function hoursBetween(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let minutes = (eh * 60 + em) - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

export function dateToKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
