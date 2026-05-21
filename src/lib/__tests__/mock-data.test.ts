import { describe, it, expect } from 'vitest';
import { youtubeData, storeData } from '@/lib/mock-data';
import { CHANNELS, STORES, SERIES_DAYS } from '@/lib/constants';

describe('mock-data', () => {
  it('generates SERIES_DAYS rows per channel', () => {
    expect(youtubeData.length).toBe(CHANNELS.length * SERIES_DAYS);
  });

  it('generates SERIES_DAYS rows per store', () => {
    expect(storeData.length).toBe(STORES.length * SERIES_DAYS);
  });

  it('all youtube rows have positive views and revenue', () => {
    for (const r of youtubeData) {
      expect(r.views).toBeGreaterThan(0);
      expect(r.revenue).toBeGreaterThan(0);
    }
  });

  it('all store rows have positive units, revenue, visitors', () => {
    for (const r of storeData) {
      expect(r.units).toBeGreaterThan(0);
      expect(r.revenue).toBeGreaterThan(0);
      expect(r.visitors).toBeGreaterThan(r.units);
    }
  });

  it('dates are sorted ascending', () => {
    const dates = youtubeData.filter(r => r.channelId === CHANNELS[0].id).map(r => r.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('is deterministic across imports (same seed)', async () => {
    const a = (await import('@/lib/mock-data')).youtubeData[0].views;
    const b = (await import('@/lib/mock-data')).youtubeData[0].views;
    expect(a).toBe(b);
  });
});
