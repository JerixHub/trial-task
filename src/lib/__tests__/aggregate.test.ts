import { describe, it, expect } from 'vitest';
import {
  filterByDateRange,
  sumBy,
  groupByDate,
  deltaVsPrevious,
  conversionRate,
  revenueShare,
  previousWindow,
} from '@/lib/aggregate';

const rows = [
  { date: '2026-05-15', revenue: 10 },
  { date: '2026-05-18', revenue: 20 },
  { date: '2026-05-21', revenue: 30 },
];

describe('aggregate', () => {
  it('filterByDateRange keeps last N days inclusive', () => {
    const r = filterByDateRange(rows, 7, '2026-05-21');
    expect(r.map(x => x.date)).toEqual(['2026-05-15', '2026-05-18', '2026-05-21']);
  });

  it('filterByDateRange drops older rows', () => {
    const r = filterByDateRange(rows, 4, '2026-05-21');
    expect(r.map(x => x.date)).toEqual(['2026-05-18', '2026-05-21']);
  });

  it('sumBy sums numeric key', () => {
    expect(sumBy(rows, 'revenue')).toBe(60);
  });

  it('groupByDate sums per date', () => {
    const r = groupByDate(
      [
        { date: '2026-05-15', revenue: 10 },
        { date: '2026-05-15', revenue: 5 },
        { date: '2026-05-16', revenue: 7 },
      ],
      ['revenue'],
    );
    expect(r).toEqual([
      { date: '2026-05-15', revenue: 15 },
      { date: '2026-05-16', revenue: 7 },
    ]);
  });

  it('deltaVsPrevious returns ratio change', () => {
    expect(deltaVsPrevious(120, 100)).toBeCloseTo(0.2);
  });

  it('deltaVsPrevious returns null when previous is 0', () => {
    expect(deltaVsPrevious(120, 0)).toBeNull();
  });

  it('conversionRate divides units by visitors', () => {
    expect(conversionRate(50, 1000)).toBeCloseTo(0.05);
  });

  it('conversionRate returns 0 for 0 visitors', () => {
    expect(conversionRate(5, 0)).toBe(0);
  });

  it('revenueShare sums to 1', () => {
    const { yt, store } = revenueShare(60, 40);
    expect(yt + store).toBeCloseTo(1);
    expect(yt).toBeCloseTo(0.6);
  });

  it('previousWindow returns range immediately before current', () => {
    expect(previousWindow(7, '2026-05-21')).toEqual({
      start: '2026-05-08',
      end: '2026-05-14',
    });
  });
});
