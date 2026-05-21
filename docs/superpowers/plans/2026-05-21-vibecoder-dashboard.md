# Vibecoder Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public, responsive analytics dashboard (YouTube, Web Store, Combined) in Next.js 15 + TS + Tailwind + Recharts with dark/light themes, deployed to Vercel.

**Architecture:** Single-page Next.js App Router site. Static seeded mock data generated at module load. Page-level state for global date range; section-level state for entity filters. Pure aggregation helpers feed Recharts components themed via CSS variables.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS v4, Recharts, lucide-react, next-themes, vitest (tests), pnpm.

**Spec:** `docs/superpowers/specs/2026-05-21-vibecoder-dashboard-design.md`

---

## File Map

**Create:**
- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `README.md`, `vitest.config.ts`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/providers.tsx`
- `src/lib/types.ts`, `src/lib/prng.ts`, `src/lib/mock-data.ts`, `src/lib/aggregate.ts`, `src/lib/format.ts`, `src/lib/constants.ts`
- `src/components/Header.tsx`, `src/components/ThemeToggle.tsx`, `src/components/DateRangeFilter.tsx`, `src/components/KpiCard.tsx`, `src/components/SectionShell.tsx`, `src/components/MultiSelect.tsx`
- `src/components/charts/RevenueLineChart.tsx`, `src/components/charts/ViewsBarChart.tsx`, `src/components/charts/ConversionBarChart.tsx`, `src/components/charts/StackedAreaChart.tsx`, `src/components/charts/SourceMixDonut.tsx`, `src/components/charts/chartTheme.ts`
- `src/components/sections/YouTubeSection.tsx`, `src/components/sections/WebStoreSection.tsx`, `src/components/sections/CombinedSection.tsx`
- `src/lib/__tests__/prng.test.ts`, `src/lib/__tests__/aggregate.test.ts`, `src/lib/__tests__/format.test.ts`, `src/lib/__tests__/mock-data.test.ts`
- `public/og.png` (optional, last)

---

## Conventions

- pnpm only
- Strict TypeScript: no `any`, no implicit any
- Use `'use client'` directive on every component that uses hooks or browser APIs
- Currency = USD. Format: `$1.2K`, `$3.4M`
- Date format: `YYYY-MM-DD` strings (no Date objects in props — easier memoization)
- Commit after each task. Conventional Commits style.

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Run create-next-app**

Run from `C:\Users\Jerixhub\Documents\trial`:

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```

If prompted "directory not empty" because `plan.md` and `docs/` exist, answer **yes** to proceed.

- [ ] **Step 2: Verify dev server boots**

```bash
pnpm dev
```

Expected: server starts at http://localhost:3000, default Next.js welcome page renders. Stop with Ctrl-C.

- [ ] **Step 3: Verify type check + build**

```bash
pnpm tsc --noEmit
pnpm build
```

Expected: both clean.

- [ ] **Step 4: Update `.gitignore`**

Append these lines to `.gitignore`:

```
# brainstorm artifacts
.superpowers/

# editor
.vscode/
.idea/
```

- [ ] **Step 5: Init git + first commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js + TS + Tailwind"
```

---

## Task 2: Install runtime dependencies

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Add deps**

```bash
pnpm add recharts lucide-react next-themes clsx
pnpm add -D vitest @vitest/ui @types/node jsdom
```

- [ ] **Step 2: Verify install**

```bash
pnpm tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add recharts, lucide-react, next-themes, vitest"
```

---

## Task 3: Vitest config

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Verify**

```bash
pnpm test
```

Expected: "No test files found" — that's fine, the runner works.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "chore: add vitest config"
```

---

## Task 4: Seeded PRNG with tests

**Files:**
- Create: `src/lib/prng.ts`, `src/lib/__tests__/prng.test.ts`

- [ ] **Step 1: Write failing test**

`src/lib/__tests__/prng.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mulberry32 } from '@/lib/prng';

describe('mulberry32', () => {
  it('produces deterministic sequence for same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produces values in [0, 1)', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('different seeds produce different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toEqual(b());
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
pnpm test
```

Expected: FAIL — cannot resolve `@/lib/prng`.

- [ ] **Step 3: Implement**

`src/lib/prng.ts`:

```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian(rng: () => number): number {
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
```

- [ ] **Step 4: Run — expect pass**

```bash
pnpm test
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prng.ts src/lib/__tests__/prng.test.ts
git commit -m "feat(lib): add seeded mulberry32 PRNG"
```

---

## Task 5: Types + constants

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
export type ISODate = string;

export type Niche = 'gaming' | 'tech' | 'lifestyle' | 'finance';
export type Category = 'apparel' | 'electronics' | 'home';

export interface Channel {
  id: string;
  name: string;
  niche: Niche;
  color: string;
}

export interface Store {
  id: string;
  name: string;
  category: Category;
  color: string;
}

export interface YouTubeDaily {
  date: ISODate;
  channelId: string;
  views: number;
  revenue: number;
}

export interface StoreDaily {
  date: ISODate;
  storeId: string;
  units: number;
  revenue: number;
  visitors: number;
}

export type DateRangeDays = 7 | 30 | 90;
```

- [ ] **Step 2: Write `src/lib/constants.ts`**

```ts
import type { Channel, Store } from './types';

export const CHANNELS: Channel[] = [
  { id: 'ch_pixelforge',    name: 'PixelForge',    niche: 'gaming',    color: '#8b5cf6' },
  { id: 'ch_bytedepot',     name: 'ByteDepot',     niche: 'tech',      color: '#3b82f6' },
  { id: 'ch_slowsundays',   name: 'SlowSundays',   niche: 'lifestyle', color: '#f97316' },
  { id: 'ch_moneymechanic', name: 'MoneyMechanic', niche: 'finance',   color: '#10b981' },
];

export const STORES: Store[] = [
  { id: 'st_northline',  name: 'Northline Apparel',    category: 'apparel',     color: '#ec4899' },
  { id: 'st_voltcase',   name: 'Voltcase Electronics', category: 'electronics', color: '#06b6d4' },
  { id: 'st_hearthwood', name: 'Hearthwood Home',      category: 'home',        color: '#eab308' },
];

export const DATE_RANGES = [7, 30, 90] as const;
export const SEED = 20260521;
export const TODAY = '2026-05-21';
export const SERIES_DAYS = 90;
```

- [ ] **Step 3: Verify typecheck**

```bash
pnpm tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat(lib): add domain types and entity constants"
```

---

## Task 6: Mock data generator with tests

**Files:**
- Create: `src/lib/mock-data.ts`, `src/lib/__tests__/mock-data.test.ts`

- [ ] **Step 1: Write failing test**

`src/lib/__tests__/mock-data.test.ts`:

```ts
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
```

- [ ] **Step 2: Run — expect failure**

```bash
pnpm test
```

Expected: FAIL — cannot resolve `@/lib/mock-data`.

- [ ] **Step 3: Implement**

`src/lib/mock-data.ts`:

```ts
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
  const dow = new Date(date + 'T00:00:00Z').getUTCDay(); // 0 Sun .. 6 Sat
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
    const rpm = 1.5 + rng() * 4.5; // revenue per mille
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
    const aov = 35 + rng() * 90; // avg order value
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
```

- [ ] **Step 4: Run — expect pass**

```bash
pnpm test
```

Expected: 6 passed in mock-data + previous 3 in prng = 9 passed total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock-data.ts src/lib/__tests__/mock-data.test.ts
git commit -m "feat(lib): generate seeded YouTube + store mock data"
```

---

## Task 7: Aggregate helpers with tests

**Files:**
- Create: `src/lib/aggregate.ts`, `src/lib/__tests__/aggregate.test.ts`

- [ ] **Step 1: Write failing test**

`src/lib/__tests__/aggregate.test.ts`:

```ts
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
```

- [ ] **Step 2: Run — expect failure**

```bash
pnpm test
```

Expected: FAIL on aggregate import.

- [ ] **Step 3: Implement**

`src/lib/aggregate.ts`:

```ts
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
```

- [ ] **Step 4: Run — expect pass**

```bash
pnpm test
```

Expected: all aggregate tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/aggregate.ts src/lib/__tests__/aggregate.test.ts
git commit -m "feat(lib): add aggregate + delta helpers with tests"
```

---

## Task 8: Format helpers with tests

**Files:**
- Create: `src/lib/format.ts`, `src/lib/__tests__/format.test.ts`

- [ ] **Step 1: Write failing test**

`src/lib/__tests__/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatCompactNumber, formatCurrency, formatPercent, formatSignedPercent } from '@/lib/format';

describe('format', () => {
  it('formats compact numbers', () => {
    expect(formatCompactNumber(950)).toBe('950');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(2_400_000)).toBe('2.4M');
    expect(formatCompactNumber(1_200_000_000)).toBe('1.2B');
  });

  it('formats currency (USD, compact)', () => {
    expect(formatCurrency(50)).toBe('$50');
    expect(formatCurrency(1500)).toBe('$1.5K');
    expect(formatCurrency(2_400_000)).toBe('$2.4M');
  });

  it('formats percent', () => {
    expect(formatPercent(0.0421)).toBe('4.2%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('formats signed percent with arrow markers', () => {
    expect(formatSignedPercent(0.12)).toBe('+12.0%');
    expect(formatSignedPercent(-0.05)).toBe('−5.0%');
    expect(formatSignedPercent(null)).toBe('—');
  });
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement**

`src/lib/format.ts`:

```ts
export function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(n).toString();
}

export function formatCurrency(n: number): string {
  return '$' + formatCompactNumber(n);
}

export function formatPercent(v: number): string {
  return (v * 100).toFixed(1) + '%';
}

export function formatSignedPercent(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—';
  const sign = v >= 0 ? '+' : '−';
  return sign + (Math.abs(v) * 100).toFixed(1) + '%';
}
```

- [ ] **Step 4: Run — expect pass**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/__tests__/format.test.ts
git commit -m "feat(lib): add number/currency/percent formatters"
```

---

## Task 9: Theme tokens + globals.css + providers

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/app/providers.tsx`

- [ ] **Step 1: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  --color-positive: var(--positive);
  --color-negative: var(--negative);
}

:root {
  --bg: #ffffff;
  --surface: #ffffff;
  --surface-2: #f9fafb;
  --border: #e5e7eb;
  --text: #0f172a;
  --muted: #64748b;
  --accent: #3b82f6;
  --accent-2: #8b5cf6;
  --positive: #10b981;
  --negative: #ef4444;
}

.dark {
  --bg: #0a0a0a;
  --surface: #111113;
  --surface-2: #16161a;
  --border: #27272a;
  --text: #f5f5f5;
  --muted: #a1a1aa;
  --accent: #60a5fa;
  --accent-2: #a78bfa;
  --positive: #34d399;
  --negative: #f87171;
}

html, body { background: var(--bg); color: var(--text); }
* { border-color: var(--border); }
```

- [ ] **Step 2: Create `src/app/providers.tsx`**

```tsx
'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pulse — Creator Analytics',
  description: 'Unified analytics across YouTube channels and web stores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg text-text antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify**

```bash
pnpm tsc --noEmit
pnpm build
```

Expected: clean. (Build will warn if `page.tsx` imports nothing — that's fine.)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/providers.tsx
git commit -m "feat(theme): add CSS vars, next-themes provider, dark default"
```

---

## Task 10: ThemeToggle + DateRangeFilter

**Files:**
- Create: `src/components/ThemeToggle.tsx`, `src/components/DateRangeFilter.tsx`

- [ ] **Step 1: Write `src/components/ThemeToggle.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = resolvedTheme ?? theme ?? 'dark';
  const next = current === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text transition-colors hover:bg-surface-2"
    >
      {mounted && current === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
```

- [ ] **Step 2: Write `src/components/DateRangeFilter.tsx`**

```tsx
'use client';

import clsx from 'clsx';
import type { DateRangeDays } from '@/lib/types';
import { DATE_RANGES } from '@/lib/constants';

interface Props {
  value: DateRangeDays;
  onChange: (v: DateRangeDays) => void;
}

const LABELS: Record<DateRangeDays, string> = { 7: '7d', 30: '30d', 90: '90d' };

export function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Date range" className="inline-flex rounded-md border border-border bg-surface p-0.5">
      {DATE_RANGES.map(d => (
        <button
          key={d}
          role="radio"
          aria-checked={value === d}
          onClick={() => onChange(d)}
          className={clsx(
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            value === d ? 'bg-surface-2 text-text' : 'text-muted hover:text-text',
          )}
        >
          {LABELS[d]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/DateRangeFilter.tsx
git commit -m "feat(ui): add ThemeToggle and DateRangeFilter"
```

---

## Task 11: Header component

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: Write `src/components/Header.tsx`**

```tsx
'use client';

import { Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { DateRangeFilter } from './DateRangeFilter';
import type { DateRangeDays } from '@/lib/types';

interface Props {
  dateRange: DateRangeDays;
  onDateRangeChange: (v: DateRangeDays) => void;
}

const LINKS = [
  { href: '#youtube',  label: 'YouTube' },
  { href: '#webstore', label: 'Web Store' },
  { href: '#combined', label: 'Combined' },
];

export function Header({ dateRange, onDateRangeChange }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <Activity size={18} className="text-accent" />
          <span>Pulse</span>
        </a>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="rounded px-2 py-1 text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat(ui): add sticky header with anchor nav + filters"
```

---

## Task 12: KpiCard + SectionShell

**Files:**
- Create: `src/components/KpiCard.tsx`, `src/components/SectionShell.tsx`

- [ ] **Step 1: Write `src/components/KpiCard.tsx`**

```tsx
import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatSignedPercent } from '@/lib/format';

interface Props {
  label: string;
  value: string;
  delta: number | null;
}

export function KpiCard({ label, value, delta }: Props) {
  const isUp = delta !== null && delta >= 0;
  const isFlat = delta === null;

  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;
  const tone = isFlat
    ? 'text-muted'
    : isUp
      ? 'text-positive'
      : 'text-negative';

  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-colors">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl">{value}</div>
      <div className={clsx('mt-2 inline-flex items-center gap-1 text-xs font-medium', tone)}>
        <Icon size={14} />
        <span>{formatSignedPercent(delta)}</span>
        <span className="text-muted">vs prev period</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/SectionShell.tsx`**

```tsx
import type { ReactNode } from 'react';

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  filters?: ReactNode;
  children: ReactNode;
}

export function SectionShell({ id, eyebrow, title, subtitle, filters, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 py-10 sm:py-14">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-accent">{eyebrow}</div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {filters && <div className="sm:self-end">{filters}</div>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/KpiCard.tsx src/components/SectionShell.tsx
git commit -m "feat(ui): add KpiCard and SectionShell"
```

---

## Task 13: MultiSelect dropdown

**Files:**
- Create: `src/components/MultiSelect.tsx`

- [ ] **Step 1: Write `src/components/MultiSelect.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  id: string;
  label: string;
  color?: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id],
    );
  }

  const summary = selected.length === options.length
    ? 'All'
    : selected.length === 0
      ? 'None'
      : `${selected.length} of ${options.length}`;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-2"
      >
        <span className="text-muted">{label}:</span>
        <span>{summary}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 z-20 mt-1 min-w-[14rem] rounded-md border border-border bg-surface p-1 shadow-lg">
          <div className="flex justify-between border-b border-border px-2 py-1.5 text-xs text-muted">
            <button onClick={() => onChange(options.map(o => o.id))} className="hover:text-text">All</button>
            <button onClick={() => onChange([])} className="hover:text-text">None</button>
          </div>
          {options.map(o => {
            const on = selected.includes(o.id);
            return (
              <button
                key={o.id}
                role="option"
                aria-selected={on}
                onClick={() => toggle(o.id)}
                className={clsx(
                  'flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2',
                  on ? 'text-text' : 'text-muted',
                )}
              >
                <span className="flex items-center gap-2">
                  {o.color && <span className="h-2 w-2 rounded-full" style={{ background: o.color }} />}
                  {o.label}
                </span>
                {on && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MultiSelect.tsx
git commit -m "feat(ui): add MultiSelect dropdown"
```

---

## Task 14: Chart theming helper

**Files:**
- Create: `src/components/charts/chartTheme.ts`

- [ ] **Step 1: Write `src/components/charts/chartTheme.ts`**

```ts
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ChartColors {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  text: string;
}

export function useChartColors(): ChartColors {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted ? resolvedTheme === 'dark' : true;

  return dark
    ? { grid: '#27272a', axis: '#a1a1aa', tooltipBg: '#111113', tooltipBorder: '#27272a', text: '#f5f5f5' }
    : { grid: '#e5e7eb', axis: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e5e7eb', text: '#0f172a' };
}

export function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/chartTheme.ts
git commit -m "feat(charts): add theme-aware chart color helper"
```

---

## Task 15: RevenueLineChart

**Files:**
- Create: `src/components/charts/RevenueLineChart.tsx`

- [ ] **Step 1: Write component**

```tsx
'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors, shortDate } from './chartTheme';
import { formatCurrency } from '@/lib/format';

export interface SeriesDef {
  id: string;
  name: string;
  color: string;
}

interface Props {
  data: Array<Record<string, number | string>>;
  series: SeriesDef[];
  height?: number;
}

export function RevenueLineChart({ data, series, height = 280 }: Props) {
  const c = useChartColors();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" stroke={c.axis} fontSize={11} tickFormatter={shortDate} minTickGap={24} />
          <YAxis stroke={c.axis} fontSize={11} tickFormatter={(v: number) => formatCurrency(v)} width={56} />
          <Tooltip
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.text, fontSize: 12 }}
            labelStyle={{ color: c.axis }}
            formatter={(v: number) => formatCurrency(v)}
            labelFormatter={(v: string) => shortDate(v)}
          />
          {series.map(s => (
            <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/RevenueLineChart.tsx
git commit -m "feat(charts): add RevenueLineChart (multi-series)"
```

---

## Task 16: ViewsBarChart + ConversionBarChart

**Files:**
- Create: `src/components/charts/ViewsBarChart.tsx`, `src/components/charts/ConversionBarChart.tsx`

- [ ] **Step 1: Write `src/components/charts/ViewsBarChart.tsx`**

```tsx
'use client';

import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from './chartTheme';
import { formatCompactNumber, formatCurrency } from '@/lib/format';

interface Datum { id: string; name: string; value: number; color: string; }

interface Props {
  data: Datum[];
  valueLabel: 'views' | 'revenue';
  height?: number;
}

export function ViewsBarChart({ data, valueLabel, height = 280 }: Props) {
  const c = useChartColors();
  const fmt = valueLabel === 'revenue' ? formatCurrency : formatCompactNumber;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="name" stroke={c.axis} fontSize={11} />
          <YAxis stroke={c.axis} fontSize={11} tickFormatter={(v: number) => fmt(v)} width={56} />
          <Tooltip
            cursor={{ fill: c.grid, opacity: 0.3 }}
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.text, fontSize: 12 }}
            formatter={(v: number) => fmt(v)}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map(d => <Cell key={d.id} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/charts/ConversionBarChart.tsx`**

```tsx
'use client';

import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from './chartTheme';
import { formatPercent } from '@/lib/format';

interface Datum { id: string; name: string; value: number; color: string; }

interface Props { data: Datum[]; height?: number; }

export function ConversionBarChart({ data, height = 280 }: Props) {
  const c = useChartColors();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="name" stroke={c.axis} fontSize={11} />
          <YAxis stroke={c.axis} fontSize={11} tickFormatter={(v: number) => formatPercent(v)} width={56} />
          <Tooltip
            cursor={{ fill: c.grid, opacity: 0.3 }}
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.text, fontSize: 12 }}
            formatter={(v: number) => formatPercent(v)}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map(d => <Cell key={d.id} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/ViewsBarChart.tsx src/components/charts/ConversionBarChart.tsx
git commit -m "feat(charts): add ViewsBarChart + ConversionBarChart"
```

---

## Task 17: StackedAreaChart + SourceMixDonut

**Files:**
- Create: `src/components/charts/StackedAreaChart.tsx`, `src/components/charts/SourceMixDonut.tsx`

- [ ] **Step 1: Write `src/components/charts/StackedAreaChart.tsx`**

```tsx
'use client';

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors, shortDate } from './chartTheme';
import { formatCurrency } from '@/lib/format';

interface Props {
  data: Array<{ date: string; youtube: number; store: number }>;
  height?: number;
}

export function StackedAreaChart({ data, height = 320 }: Props) {
  const c = useChartColors();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="ytFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="stFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" stroke={c.axis} fontSize={11} tickFormatter={shortDate} minTickGap={24} />
          <YAxis stroke={c.axis} fontSize={11} tickFormatter={(v: number) => formatCurrency(v)} width={56} />
          <Tooltip
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.text, fontSize: 12 }}
            labelStyle={{ color: c.axis }}
            formatter={(v: number) => formatCurrency(v)}
            labelFormatter={(v: string) => shortDate(v)}
          />
          <Legend wrapperStyle={{ color: c.axis, fontSize: 12 }} />
          <Area type="monotone" dataKey="youtube" stackId="rev" stroke="#8b5cf6" fill="url(#ytFill)" name="YouTube" />
          <Area type="monotone" dataKey="store"   stackId="rev" stroke="#06b6d4" fill="url(#stFill)" name="Web Store" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/charts/SourceMixDonut.tsx`**

```tsx
'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartColors } from './chartTheme';
import { formatCurrency, formatPercent } from '@/lib/format';

interface Props {
  ytRevenue: number;
  storeRevenue: number;
  height?: number;
}

export function SourceMixDonut({ ytRevenue, storeRevenue, height = 220 }: Props) {
  const c = useChartColors();
  const total = ytRevenue + storeRevenue;
  const data = [
    { id: 'yt',    name: 'YouTube',   value: ytRevenue,    color: '#8b5cf6' },
    { id: 'store', name: 'Web Store', value: storeRevenue, color: '#06b6d4' },
  ];
  return (
    <div className="relative" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" strokeWidth={0}>
            {data.map(d => <Cell key={d.id} fill={d.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.text, fontSize: 12 }}
            formatter={(v: number, _name: string, entry) => [
              `${formatCurrency(v)} (${total ? formatPercent(v / total) : '0%'})`,
              entry?.payload?.name as string,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs text-muted">Total revenue</div>
        <div className="text-xl font-semibold text-text">{formatCurrency(total)}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/StackedAreaChart.tsx src/components/charts/SourceMixDonut.tsx
git commit -m "feat(charts): add StackedAreaChart and SourceMixDonut"
```

---

## Task 18: YouTubeSection

**Files:**
- Create: `src/components/sections/YouTubeSection.tsx`

- [ ] **Step 1: Write component**

```tsx
'use client';

import { useMemo } from 'react';
import { KpiCard } from '../KpiCard';
import { SectionShell } from '../SectionShell';
import { MultiSelect } from '../MultiSelect';
import { RevenueLineChart } from '../charts/RevenueLineChart';
import { ViewsBarChart } from '../charts/ViewsBarChart';
import { CHANNELS } from '@/lib/constants';
import {
  deltaVsPrevious,
  filterPreviousWindow,
  groupByDate,
  groupByEntity,
  sumBy,
} from '@/lib/aggregate';
import { formatCompactNumber, formatCurrency } from '@/lib/format';
import type { DateRangeDays, YouTubeDaily } from '@/lib/types';

interface Props {
  allRows: YouTubeDaily[];
  currentRows: YouTubeDaily[];
  dateRange: DateRangeDays;
  today: string;
  selected: string[];
  onSelectedChange: (next: string[]) => void;
}

export function YouTubeSection({ allRows, currentRows, dateRange, today, selected, onSelectedChange }: Props) {
  const filtered = useMemo(
    () => currentRows.filter(r => selected.includes(r.channelId)),
    [currentRows, selected],
  );
  const prev = useMemo(
    () => filterPreviousWindow(allRows, dateRange, today).filter(r => selected.includes(r.channelId)),
    [allRows, dateRange, today, selected],
  );

  const totalViews = sumBy(filtered, 'views');
  const totalRevenue = sumBy(filtered, 'revenue');
  const prevViews = sumBy(prev, 'views');
  const prevRevenue = sumBy(prev, 'revenue');

  const series = CHANNELS.filter(c => selected.includes(c.id));

  const lineData = useMemo(() => {
    const perDate = new Map<string, Record<string, number>>();
    for (const r of filtered) {
      const e = perDate.get(r.date) ?? {};
      e[r.channelId] = (e[r.channelId] ?? 0) + r.revenue;
      perDate.set(r.date, e);
    }
    return [...perDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));
  }, [filtered]);

  const barData = useMemo(() => {
    const m = groupByEntity(filtered, 'channelId', ['revenue']);
    return CHANNELS
      .filter(c => selected.includes(c.id))
      .map(c => ({ id: c.id, name: c.name, value: m.get(c.id)?.revenue ?? 0, color: c.color }));
  }, [filtered, selected]);

  const tableRows = useMemo(() => {
    const m = groupByEntity(filtered, 'channelId', ['views', 'revenue']);
    return CHANNELS
      .filter(c => selected.includes(c.id))
      .map(c => {
        const v = m.get(c.id) ?? { views: 0, revenue: 0 };
        const rpm = v.views ? (v.revenue / v.views) * 1000 : 0;
        return { id: c.id, name: c.name, color: c.color, views: v.views, revenue: v.revenue, rpm };
      });
  }, [filtered, selected]);

  return (
    <SectionShell
      id="youtube"
      eyebrow="Section 1"
      title="YouTube Channel Metrics"
      subtitle="Per-channel views and revenue across the selected window."
      filters={
        <MultiSelect
          label="Channels"
          options={CHANNELS.map(c => ({ id: c.id, label: c.name, color: c.color }))}
          selected={selected}
          onChange={onSelectedChange}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Total views"   value={formatCompactNumber(totalViews)} delta={deltaVsPrevious(totalViews, prevViews)} />
        <KpiCard label="Total revenue" value={formatCurrency(totalRevenue)}    delta={deltaVsPrevious(totalRevenue, prevRevenue)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-text">Revenue over time</h3>
          <RevenueLineChart data={lineData} series={series.map(s => ({ id: s.id, name: s.name, color: s.color }))} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-text">Revenue by channel</h3>
          <ViewsBarChart data={barData} valueLabel="revenue" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Channel</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">RPM</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 text-text">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: r.color }} />
                  {r.name}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text">{formatCompactNumber(r.views)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-text">{formatCurrency(r.revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">${r.rpm.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/YouTubeSection.tsx
git commit -m "feat(section): add YouTube section (KPIs + 2 charts + table)"
```

---

## Task 19: WebStoreSection

**Files:**
- Create: `src/components/sections/WebStoreSection.tsx`

- [ ] **Step 1: Write component**

```tsx
'use client';

import { useMemo } from 'react';
import { KpiCard } from '../KpiCard';
import { SectionShell } from '../SectionShell';
import { MultiSelect } from '../MultiSelect';
import { RevenueLineChart } from '../charts/RevenueLineChart';
import { ConversionBarChart } from '../charts/ConversionBarChart';
import { STORES } from '@/lib/constants';
import {
  conversionRate,
  deltaVsPrevious,
  filterPreviousWindow,
  groupByEntity,
  sumBy,
} from '@/lib/aggregate';
import { formatCompactNumber, formatCurrency, formatPercent } from '@/lib/format';
import type { DateRangeDays, StoreDaily } from '@/lib/types';

interface Props {
  allRows: StoreDaily[];
  currentRows: StoreDaily[];
  dateRange: DateRangeDays;
  today: string;
  selected: string[];
  onSelectedChange: (next: string[]) => void;
}

export function WebStoreSection({ allRows, currentRows, dateRange, today, selected, onSelectedChange }: Props) {
  const filtered = useMemo(
    () => currentRows.filter(r => selected.includes(r.storeId)),
    [currentRows, selected],
  );
  const prev = useMemo(
    () => filterPreviousWindow(allRows, dateRange, today).filter(r => selected.includes(r.storeId)),
    [allRows, dateRange, today, selected],
  );

  const units = sumBy(filtered, 'units');
  const revenue = sumBy(filtered, 'revenue');
  const visitors = sumBy(filtered, 'visitors');
  const conv = conversionRate(units, visitors);

  const prevUnits = sumBy(prev, 'units');
  const prevRevenue = sumBy(prev, 'revenue');
  const prevVisitors = sumBy(prev, 'visitors');
  const prevConv = conversionRate(prevUnits, prevVisitors);

  const series = STORES.filter(s => selected.includes(s.id));

  const lineData = useMemo(() => {
    const perDate = new Map<string, Record<string, number>>();
    for (const r of filtered) {
      const e = perDate.get(r.date) ?? {};
      e[r.storeId] = (e[r.storeId] ?? 0) + r.revenue;
      perDate.set(r.date, e);
    }
    return [...perDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));
  }, [filtered]);

  const barData = useMemo(() => {
    const m = groupByEntity(filtered, 'storeId', ['units', 'visitors']);
    return STORES
      .filter(s => selected.includes(s.id))
      .map(s => {
        const v = m.get(s.id) ?? { units: 0, visitors: 0 };
        return { id: s.id, name: s.name, value: conversionRate(v.units, v.visitors), color: s.color };
      });
  }, [filtered, selected]);

  const tableRows = useMemo(() => {
    const m = groupByEntity(filtered, 'storeId', ['units', 'revenue', 'visitors']);
    return STORES
      .filter(s => selected.includes(s.id))
      .map(s => {
        const v = m.get(s.id) ?? { units: 0, revenue: 0, visitors: 0 };
        return {
          id: s.id, name: s.name, color: s.color,
          units: v.units, revenue: v.revenue,
          conv: conversionRate(v.units, v.visitors),
        };
      });
  }, [filtered, selected]);

  return (
    <SectionShell
      id="webstore"
      eyebrow="Section 2"
      title="Web Store Metrics"
      subtitle="Units, revenue, and conversion across selected stores."
      filters={
        <MultiSelect
          label="Stores"
          options={STORES.map(s => ({ id: s.id, label: s.name, color: s.color }))}
          selected={selected}
          onChange={onSelectedChange}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Units sold"      value={formatCompactNumber(units)} delta={deltaVsPrevious(units, prevUnits)} />
        <KpiCard label="Revenue"         value={formatCurrency(revenue)}    delta={deltaVsPrevious(revenue, prevRevenue)} />
        <KpiCard label="Conversion rate" value={formatPercent(conv)}        delta={deltaVsPrevious(conv, prevConv)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-text">Revenue trend</h3>
          <RevenueLineChart data={lineData} series={series.map(s => ({ id: s.id, name: s.name, color: s.color }))} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-text">Conversion rate by store</h3>
          <ConversionBarChart data={barData} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Store</th>
              <th className="px-4 py-3 text-right">Units</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Conv. rate</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 text-text">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: r.color }} />
                  {r.name}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text">{formatCompactNumber(r.units)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-text">{formatCurrency(r.revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{formatPercent(r.conv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/WebStoreSection.tsx
git commit -m "feat(section): add Web Store section (KPIs + 2 charts + table)"
```

---

## Task 20: CombinedSection

**Files:**
- Create: `src/components/sections/CombinedSection.tsx`

- [ ] **Step 1: Write component**

```tsx
'use client';

import { useMemo } from 'react';
import { KpiCard } from '../KpiCard';
import { SectionShell } from '../SectionShell';
import { StackedAreaChart } from '../charts/StackedAreaChart';
import { SourceMixDonut } from '../charts/SourceMixDonut';
import { CHANNELS, STORES } from '@/lib/constants';
import {
  deltaVsPrevious,
  filterPreviousWindow,
  groupByEntity,
  revenueShare,
  sumBy,
} from '@/lib/aggregate';
import { formatCurrency, formatPercent } from '@/lib/format';
import type { DateRangeDays, StoreDaily, YouTubeDaily } from '@/lib/types';

interface Props {
  ytAll: YouTubeDaily[];
  storeAll: StoreDaily[];
  ytCurrent: YouTubeDaily[];
  storeCurrent: StoreDaily[];
  dateRange: DateRangeDays;
  today: string;
}

export function CombinedSection({ ytAll, storeAll, ytCurrent, storeCurrent, dateRange, today }: Props) {
  const ytRev = sumBy(ytCurrent, 'revenue');
  const stRev = sumBy(storeCurrent, 'revenue');
  const total = ytRev + stRev;

  const ytPrev = sumBy(filterPreviousWindow(ytAll, dateRange, today), 'revenue');
  const stPrev = sumBy(filterPreviousWindow(storeAll, dateRange, today), 'revenue');
  const prevTotal = ytPrev + stPrev;

  const share = revenueShare(ytRev, stRev);

  const areaData = useMemo(() => {
    const perDate = new Map<string, { youtube: number; store: number }>();
    for (const r of ytCurrent) {
      const e = perDate.get(r.date) ?? { youtube: 0, store: 0 };
      e.youtube += r.revenue;
      perDate.set(r.date, e);
    }
    for (const r of storeCurrent) {
      const e = perDate.get(r.date) ?? { youtube: 0, store: 0 };
      e.store += r.revenue;
      perDate.set(r.date, e);
    }
    return [...perDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));
  }, [ytCurrent, storeCurrent]);

  const topChannel = useMemo(() => {
    const m = groupByEntity(ytCurrent, 'channelId', ['revenue']);
    let best: { id: string; name: string; color: string; revenue: number } | null = null;
    for (const c of CHANNELS) {
      const rev = m.get(c.id)?.revenue ?? 0;
      if (!best || rev > best.revenue) best = { id: c.id, name: c.name, color: c.color, revenue: rev };
    }
    return best;
  }, [ytCurrent]);

  const topStore = useMemo(() => {
    const m = groupByEntity(storeCurrent, 'storeId', ['revenue']);
    let best: { id: string; name: string; color: string; revenue: number } | null = null;
    for (const s of STORES) {
      const rev = m.get(s.id)?.revenue ?? 0;
      if (!best || rev > best.revenue) best = { id: s.id, name: s.name, color: s.color, revenue: rev };
    }
    return best;
  }, [storeCurrent]);

  return (
    <SectionShell
      id="combined"
      eyebrow="Section 3"
      title="Combined Analytics"
      subtitle="Unified revenue view across YouTube and Web Store."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total revenue"   value={formatCurrency(total)}        delta={deltaVsPrevious(total, prevTotal)} />
        <KpiCard label="YouTube share"   value={formatPercent(share.yt)}     delta={null} />
        <KpiCard label="Web Store share" value={formatPercent(share.store)}  delta={null} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-medium text-text">Revenue over time (stacked)</h3>
          <StackedAreaChart data={areaData} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-text">Source mix</h3>
          <SourceMixDonut ytRevenue={ytRev} storeRevenue={stRev} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {topChannel && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs uppercase tracking-wider text-muted">Top channel</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: topChannel.color }} />
              <span className="text-lg font-semibold text-text">{topChannel.name}</span>
            </div>
            <div className="mt-2 text-sm text-muted">{formatCurrency(topChannel.revenue)} revenue</div>
          </div>
        )}
        {topStore && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs uppercase tracking-wider text-muted">Top store</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: topStore.color }} />
              <span className="text-lg font-semibold text-text">{topStore.name}</span>
            </div>
            <div className="mt-2 text-sm text-muted">{formatCurrency(topStore.revenue)} revenue</div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/CombinedSection.tsx
git commit -m "feat(section): add Combined Analytics section"
```

---

## Task 21: page.tsx — compose everything

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { YouTubeSection } from '@/components/sections/YouTubeSection';
import { WebStoreSection } from '@/components/sections/WebStoreSection';
import { CombinedSection } from '@/components/sections/CombinedSection';
import { youtubeData, storeData } from '@/lib/mock-data';
import { filterByDateRange } from '@/lib/aggregate';
import { CHANNELS, STORES, TODAY } from '@/lib/constants';
import type { DateRangeDays } from '@/lib/types';

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRangeDays>(30);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(CHANNELS.map(c => c.id));
  const [selectedStores, setSelectedStores] = useState<string[]>(STORES.map(s => s.id));

  const ytCurrent = useMemo(
    () => filterByDateRange(youtubeData, dateRange, TODAY),
    [dateRange],
  );
  const storeCurrent = useMemo(
    () => filterByDateRange(storeData, dateRange, TODAY),
    [dateRange],
  );

  return (
    <div id="top" className="min-h-screen bg-bg text-text">
      <Header dateRange={dateRange} onDateRangeChange={setDateRange} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="pt-8 pb-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Creator Analytics</h1>
          <p className="mt-2 text-sm text-muted">
            Unified view of your YouTube channels and web stores. Showing last {dateRange} days.
          </p>
        </div>

        <YouTubeSection
          allRows={youtubeData}
          currentRows={ytCurrent}
          dateRange={dateRange}
          today={TODAY}
          selected={selectedChannels}
          onSelectedChange={setSelectedChannels}
        />

        <WebStoreSection
          allRows={storeData}
          currentRows={storeCurrent}
          dateRange={dateRange}
          today={TODAY}
          selected={selectedStores}
          onSelectedChange={setSelectedStores}
        />

        <CombinedSection
          ytAll={youtubeData}
          storeAll={storeData}
          ytCurrent={ytCurrent}
          storeCurrent={storeCurrent}
          dateRange={dateRange}
          today={TODAY}
        />

        <footer className="border-t border-border py-8 text-xs text-muted">
          <p>Pulse — built for the Vibecoder trial. Data is generated client-side; no real APIs are used.</p>
        </footer>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify dev server**

```bash
pnpm dev
```

Open http://localhost:3000. Visually confirm:
- Header sticky, anchor links jump to sections
- Date range buttons re-render KPIs and line chart
- Channel + store multi-selects toggle entries
- Theme toggle flips dark/light, charts re-color
- Three sections render with charts + tables
- No console errors

Stop with Ctrl-C.

- [ ] **Step 3: Verify build + type + tests**

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

Expected: all clean, all tests passing.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(app): compose dashboard page with all 3 sections"
```

---

## Task 22: Responsive + a11y sweep

**Files:** any files needing tweaks discovered during sweep.

- [ ] **Step 1: Mobile check at 375px**

```bash
pnpm dev
```

Open DevTools → device emulator → iPhone SE (375px). Verify:
- Header anchor links hidden (only theme toggle + date range visible)
- KPI cards stack 1-col
- Chart rows stack vertically
- Tables scroll horizontally without breaking layout
- No horizontal page overflow

If any element overflows, add `min-w-0` or adjust grid breakpoints in the offending file.

- [ ] **Step 2: Tablet check at 768px**

Verify 2-col KPI grids for YouTube (2 cards) and 3-col for WebStore.

- [ ] **Step 3: Theme contrast**

Toggle theme. Check that:
- KPI delta arrows readable in both themes
- Chart tooltips contrast against background
- Borders visible but not loud

- [ ] **Step 4: Keyboard a11y**

Tab through page. Verify focus rings visible (Tailwind default ring should suffice). If not, add `focus-visible:ring-2 focus-visible:ring-accent` to interactive elements.

- [ ] **Step 5: Commit any fixes**

```bash
git add -p
git commit -m "fix(ui): responsive + a11y polish"
```

(Skip if no changes needed.)

---

## Task 23: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Pulse — Creator Analytics Dashboard

A unified analytics dashboard for YouTube channels and web stores. Built for the Vibecoder trial task.

**Live demo:** _will be filled in after Vercel deploy_

## Screenshots

![Dark mode](docs/screenshots/dark.png)
![Light mode](docs/screenshots/light.png)

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS v4
- Recharts (charts), lucide-react (icons), next-themes (theme toggle)
- Vitest (unit tests)
- Deployed on Vercel

## Features

- Three sections: YouTube channel metrics, Web Store metrics, Combined analytics
- KPI cards with period-over-period delta (vs previous window)
- Multi-series line, bar, stacked-area, and donut charts
- Global date range filter: 7 / 30 / 90 days
- Per-section entity selectors (channels, stores)
- Dark + light themes with smooth toggle
- Fully responsive (375px → 1920px+)

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

Other scripts:

```bash
pnpm test           # vitest unit tests
pnpm build          # production build
pnpm tsc --noEmit   # type check
```

## Folder structure

```
src/
  app/                 Next.js app router (layout, page, theme provider)
  components/          UI primitives (Header, KpiCard, SectionShell, ...)
    charts/            Recharts wrappers
    sections/          One file per dashboard section
  lib/                 Mock data generator, aggregation, formatting
```

## Mock data

All data is generated client-side with a seeded PRNG (`src/lib/prng.ts`) so the dashboard is fully deterministic across reloads. No backend, no APIs, no auth. See `src/lib/mock-data.ts`.

## Design decisions

- **Single scrolling page** over routed sub-pages: faster to demo, less navigation friction, makes Combined Analytics naturally read as a summary below the source sections.
- **Recharts** over ApexCharts/ECharts: smallest learning curve in React, easiest to theme via CSS variables.
- **CSS variables for theming** instead of class-conditional styles: charts re-theme without re-render gymnastics, and the dark/light split lives in one place.
- **Date filter is global, entity filters are local**: matches user intent — "compare these channels in the last week" rather than juggling two date pickers.
- **No state management library**: useState + prop drilling is sufficient for a single page; adding Redux/Zustand would be overhead.
- **Unit tests on pure helpers only** (aggregate, format, PRNG, mock-data shape). UI snapshots add noise without catching real bugs in a 48h scope.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add project README"
```

---

## Task 24: Capture screenshots

**Files:** `docs/screenshots/dark.png`, `docs/screenshots/light.png`

- [ ] **Step 1: Boot dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Capture dark mode**

Open http://localhost:3000 in browser. Confirm dark theme is active. Full-page screenshot (DevTools → cmd+shift+P → "Capture full size screenshot"). Save as `docs/screenshots/dark.png` (create folder if missing).

- [ ] **Step 3: Capture light mode**

Toggle theme. Full-page screenshot. Save as `docs/screenshots/light.png`.

- [ ] **Step 4: Verify README renders both images**

Open `README.md` preview. Both images should display.

- [ ] **Step 5: Commit**

```bash
git add docs/screenshots/
git commit -m "docs: add light + dark screenshots"
```

---

## Task 25: GitHub + Vercel deploy

**Files:** none (deployment + repo operations)

- [ ] **Step 1: Confirm with user**

This task pushes to a public GitHub repo and deploys to Vercel. Both actions are public and reviewer-visible. Confirm with user before proceeding.

- [ ] **Step 2: Create GitHub repo**

User runs (gh CLI must be authenticated):

```bash
gh repo create vibecoder-analytics-dashboard --public --source=. --remote=origin --description "Creator analytics dashboard — YouTube + Web Store + Combined views. Vibecoder trial."
git push -u origin main
```

If `main` branch isn't current, run `git branch -M main` first.

- [ ] **Step 3: Deploy to Vercel**

Two options (pick one):

**a) Vercel dashboard (GUI):**
1. Sign in to vercel.com → New Project → Import the GitHub repo
2. Framework auto-detects as Next.js
3. No env vars needed
4. Click Deploy

**b) Vercel CLI:**

```bash
pnpm dlx vercel@latest --prod
```

Follow prompts; link to GitHub repo when asked.

- [ ] **Step 4: Update README with live URL**

Replace `_will be filled in after Vercel deploy_` in `README.md` with the actual production URL.

```bash
git add README.md
git commit -m "docs: add live demo URL"
git push
```

- [ ] **Step 5: Final verification**

Open the live URL in incognito. Verify:
- Page loads under 3s
- All 3 sections render with data
- Theme toggle works
- Mobile view works (DevTools)
- No console errors

Submission ready.

---

## Self-Review (already performed; nothing to action)

**Spec coverage:**
- Section 1 (YouTube) → Task 18 ✓
- Section 2 (Web Store) → Task 19 ✓
- Section 3 (Combined) → Task 20 ✓
- Required metrics (views, revenue, units, conv rate) → all present in section tasks ✓
- Optional features (KPI cards, selectors, date range, responsive) → Tasks 10, 12, 13, 22 ✓
- Dark + light theme → Tasks 9, 10 ✓
- Deployment (Vercel) → Task 25 ✓
- GitHub repo + README + folder structure + TS setup → Tasks 1, 23, 25 ✓

**Type consistency:** `DateRangeDays`, `YouTubeDaily`, `StoreDaily`, `Channel`, `Store` referenced consistently across Tasks 5–21. `groupByEntity` signature matches usage in 18/19/20. `KpiCard.delta: number | null` matches `deltaVsPrevious` return type and `formatSignedPercent` input.

**No placeholders** in any task except the README's live-URL placeholder, which is intentionally filled in at Task 25.5.
