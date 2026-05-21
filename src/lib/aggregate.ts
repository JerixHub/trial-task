import type { ISODate } from './types';

function isoDaysBefore(today: ISODate, daysAgo: number): ISODate {
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function filterByDateRange<T extends { date: ISODate }>(
  rows: T[],
  days: number,
  today: ISODate,
): T[] {
  const start = isoDaysBefore(today, days - 1);
  return rows.filter(r => r.date >= start && r.date <= today);
}

export function previousWindow(days: number, today: ISODate): { start: ISODate; end: ISODate } {
  const end = isoDaysBefore(today, days);
  const start = isoDaysBefore(today, days * 2 - 1);
  return { start, end };
}

export function filterPreviousWindow<T extends { date: ISODate }>(
  rows: T[],
  days: number,
  today: ISODate,
): T[] {
  const { start, end } = previousWindow(days, today);
  return rows.filter(r => r.date >= start && r.date <= end);
}

export function sumBy<T, K extends keyof T>(rows: T[], key: K): number {
  let s = 0;
  for (const r of rows) s += Number(r[key]) || 0;
  return s;
}

export function groupByDate<T extends { date: ISODate }>(
  rows: T[],
  numericKeys: (keyof T)[],
): Array<{ date: ISODate } & Record<string, number>> {
  const map = new Map<string, Record<string, number>>();
  for (const r of rows) {
    const existing = map.get(r.date) ?? {};
    for (const k of numericKeys) {
      existing[k as string] = (existing[k as string] ?? 0) + (Number(r[k]) || 0);
    }
    map.set(r.date, existing);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

export function deltaVsPrevious(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}

export function conversionRate(units: number, visitors: number): number {
  if (visitors === 0) return 0;
  return units / visitors;
}

export function revenueShare(yt: number, store: number): { yt: number; store: number } {
  const total = yt + store;
  if (total === 0) return { yt: 0, store: 0 };
  return { yt: yt / total, store: store / total };
}

export function groupByEntity<T, K extends keyof T>(
  rows: T[],
  idKey: K,
  numericKeys: (keyof T)[],
): Map<T[K], Record<string, number>> {
  const map = new Map<T[K], Record<string, number>>();
  for (const r of rows) {
    const id = r[idKey];
    const existing = map.get(id) ?? {};
    for (const k of numericKeys) {
      existing[k as string] = (existing[k as string] ?? 0) + (Number(r[k]) || 0);
    }
    map.set(id, existing);
  }
  return map;
}
