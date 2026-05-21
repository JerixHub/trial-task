import { CHANNELS, STORES, SEED, SERIES_DAYS, TODAY } from './constants';
import { mulberry32, gaussian } from './prng';
import type { Channel, Store, YouTubeDaily, StoreDaily } from './types';

function isoDaysBefore(today: string, daysAgo: number): string {
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function dateList(): string[] {
  const out: string[] = [];
  for (let i = SERIES_DAYS - 1; i >= 0; i--) out.push(isoDaysBefore(TODAY, i));
  return out;
}

function weekdayBoost(date: string, niche: Channel['niche'] | Store['category']): number {
  const dow = new Date(date + 'T00:00:00Z').getUTCDay();
  const weekend = dow === 0 || dow === 6;
  const weekendFavorers = ['gaming', 'lifestyle', 'apparel', 'home'];
  return weekend
    ? (weekendFavorers.includes(niche) ? 1.25 : 0.85)
    : (weekendFavorers.includes(niche) ? 0.9 : 1.15);
}

function spike(rng: () => number): number {
  return rng() < 0.04 ? 1 + rng() * 1.8 : 1;
}

const dates = dateList();

function buildYoutube(): YouTubeDaily[] {
  const out: YouTubeDaily[] = [];
  CHANNELS.forEach((c, ci) => {
    const rng = mulberry32(SEED + ci * 101);
    const baseViews = 8000 + rng() * 22000;
    const rpm = 1.5 + rng() * 4.5;
    dates.forEach(date => {
      const noise = 1 + gaussian(rng) * 0.12;
      const mult = weekdayBoost(date, c.niche) * Math.max(0.5, noise) * spike(rng);
      const views = Math.max(100, Math.round(baseViews * mult));
      const revenue = +(views / 1000 * rpm).toFixed(2);
      out.push({ date, channelId: c.id, views, revenue });
    });
  });
  return out;
}

function buildStore(): StoreDaily[] {
  const out: StoreDaily[] = [];
  STORES.forEach((s, si) => {
    const rng = mulberry32(SEED + 9999 + si * 211);
    const baseVisitors = 1200 + rng() * 3000;
    const aov = 35 + rng() * 90;
    const baseConv = 0.018 + rng() * 0.035;
    dates.forEach(date => {
      const noise = 1 + gaussian(rng) * 0.15;
      const mult = weekdayBoost(date, s.category) * Math.max(0.5, noise) * spike(rng);
      const visitors = Math.max(50, Math.round(baseVisitors * mult));
      const convNoise = 1 + gaussian(rng) * 0.08;
      const conv = Math.min(0.18, Math.max(0.005, baseConv * convNoise));
      const units = Math.max(1, Math.round(visitors * conv));
      const revenue = +(units * aov * (0.9 + rng() * 0.2)).toFixed(2);
      out.push({ date, storeId: s.id, units, revenue, visitors });
    });
  });
  return out;
}

export const youtubeData: YouTubeDaily[] = buildYoutube();
export const storeData: StoreDaily[] = buildStore();
export const allDates: string[] = dates;
