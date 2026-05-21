# Vibecoder Trial — Analytics Dashboard Design

**Date:** 2026-05-21
**Author:** Jeric Carillo (jeric.carillo@digitize.au)
**Source brief:** `plan.md` (48h trial task)

---

## 1. Goal

Ship a working public analytics dashboard prototype in 48 hours that demonstrates fast execution, clean UI, independent problem solving, and shipping ability. Required sections: YouTube channel metrics, Web Store metrics, Combined analytics. Mock data is acceptable.

Success criteria:

- Deployed publicly on Vercel
- Source pushed to public GitHub repo with README
- All 3 required sections present with required metrics
- Visually clean, responsive, dark + light themes
- No build warnings, no TypeScript errors

---

## 2. Stack & Tooling

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | First-class Vercel deploy; free polish (metadata, 404, OG image) |
| Language | TypeScript (strict) | Required by brief; catches data-shape bugs early |
| Styling | Tailwind CSS v4 | Required by brief; fastest path to consistent spacing |
| Charts | Recharts | React-idiomatic, light bundle, easy theming via Tailwind colors |
| Icons | lucide-react | Tree-shakable, matches modern aesthetic |
| Theming | next-themes | One-line dark/light toggle on App Router with no FOUC |
| Package manager | pnpm | Faster installs; lockfile committed |
| Deployment | Vercel | Required by brief; auto-detects Next.js |

No backend, no database, no auth, no external API calls.

---

## 3. Information Architecture

**Layout:** single scrolling page at `/`. Sticky top header. Three stacked sections. Footer.

**Header** (sticky, backdrop-blur):

- Left: product wordmark
- Center: anchor links (`#youtube`, `#webstore`, `#combined`)
- Right: global date range filter (7d / 30d / 90d), theme toggle

**Section shell** (reused for all 3):

- h2 title + subtitle
- Right-aligned local filter row
- Body grid: KPI cards row, then chart row, then optional table

### 3.1 YouTube Channel Metrics (`#youtube`)

- Local filter: channel multi-select (default all selected)
- KPI cards: Total Views, Total Revenue (each with period-over-period delta)
- Charts: Views over time (multi-line, one series per channel); Revenue by channel (bar)
- Table: channel | views | revenue | RPM

### 3.2 Web Store Metrics (`#webstore`)

- Local filter: store multi-select (default all selected)
- KPI cards: Units Sold, Revenue, Conversion Rate (each with delta)
- Charts: Revenue trend (multi-line, one series per store); Conversion rate by store (bar)
- Table: store | units | revenue | conversion %

### 3.3 Combined Analytics (`#combined`)

- KPI cards: Total Revenue (all sources), YouTube revenue share %, Store revenue share %
- Stacked-area chart: revenue over time, split into YouTube vs Store
- Top contributor cards: top channel by revenue, top store by revenue
- Source-mix donut

Combined section ignores entity selectors (always all-sources) but respects the global date range.

---

## 4. Data Model

### 4.1 Types (`src/lib/types.ts`)

```ts
export type ISODate = string; // 'YYYY-MM-DD'

export interface Channel {
  id: string;
  name: string;
  niche: 'gaming' | 'tech' | 'lifestyle' | 'finance';
  color: string;
}

export interface Store {
  id: string;
  name: string;
  category: 'apparel' | 'electronics' | 'home';
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
```

### 4.2 Mock entities

- 4 channels: PixelForge (gaming), ByteDepot (tech), SlowSundays (lifestyle), MoneyMechanic (finance)
- 3 stores: Northline Apparel, Voltcase Electronics, Hearthwood Home

Final names may be adjusted at implementation time.

### 4.3 Series generator (`src/lib/mock-data.ts`)

- 90 daily rows per entity (1,080 rows total)
- Per-entity baseline (so channels have distinct scale)
- Weekly seasonality (weekends higher for lifestyle/gaming, weekdays higher for finance/tech)
- Small Gaussian-style noise
- Occasional spike (viral video / sale day) for visual interest
- Seeded PRNG (e.g. mulberry32) so each refresh shows identical data

### 4.4 Aggregation helpers (`src/lib/aggregate.ts`)

Pure functions, no side effects:

- `filterByDateRange(rows, days)`
- `sumBy(rows, key)`
- `groupByDate(rows)` → for time-series charts
- `deltaVsPrevious(currentSum, previousSum)` → KPI delta
- `conversionRate(units, visitors)`
- `revenueShare(ytTotal, storeTotal)`

Combined section sums across both sources via these helpers — no double-counting risk because YouTube and Store data are disjoint.

---

## 5. State & Interactivity

### 5.1 State location

Lifted to `app/page.tsx` and passed via props:

- `dateRange: 7 | 30 | 90` (default 30) — global
- `selectedChannelIds: string[]` (default all) — local to YouTube section
- `selectedStoreIds: string[]` (default all) — local to Web Store section

Theme is managed by `next-themes` (class strategy), independent of page state.

No external state library (Redux/Zustand). useState + prop drilling is adequate for one-page scope.

### 5.2 Data flow

```
mock-data.ts (static seeded series)
        ↓
page.tsx applies dateRange filter once
        ↓
passes filtered slices to YouTubeSection / WebStoreSection / CombinedSection
        ↓
each section applies its own entity filter + memoized aggregate
```

`useMemo` on aggregate calls keyed by `(filteredRows, selectedIds)` to keep filter toggling snappy.

### 5.3 KPI delta

`(currentPeriodSum − previousPeriodSum) / previousPeriodSum`, rendered as up/down arrow + percentage. Previous period = same-length window immediately preceding the current range.

### 5.4 Theming

- CSS variables in `globals.css`: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`
- Tailwind config maps semantic class names to those variables
- Recharts series use the same CSS variables via `stroke="var(--accent)"` etc., so charts re-theme automatically
- `next-themes` toggles `class="dark"` on `<html>`; no flash on initial load

---

## 6. Folder Structure

```
src/
  app/
    layout.tsx         (theme provider, fonts, metadata, OG)
    page.tsx           (composes 3 sections, owns global state)
    globals.css        (tailwind directives, CSS vars)
    favicon.ico
  components/
    Header.tsx
    KpiCard.tsx
    SectionShell.tsx
    ChannelSelector.tsx
    StoreSelector.tsx
    DateRangeFilter.tsx
    ThemeToggle.tsx
    charts/
      RevenueLineChart.tsx
      ViewsBarChart.tsx
      ConversionBarChart.tsx
      StackedAreaChart.tsx
      SourceMixDonut.tsx
    sections/
      YouTubeSection.tsx
      WebStoreSection.tsx
      CombinedSection.tsx
  lib/
    mock-data.ts
    types.ts
    aggregate.ts
    format.ts          (currency, compact numbers, percentage)
    prng.ts            (seeded mulberry32)
public/
  og.png               (optional — generated last)
README.md
.gitignore
```

---

## 7. Responsive Behavior

- Grid-first layout using Tailwind's `grid-cols-*` with mobile defaults
- KPI cards: 1 col mobile → 2 col tablet → 3-4 col desktop depending on section
- Chart rows: stack on mobile, side-by-side at `md:` breakpoint
- Tables: horizontal scroll on mobile via `overflow-x-auto`
- Header anchor links collapse into a single sheet menu below `md:` (or are dropped — header still keeps theme toggle + date range)
- Verified at 375px, 768px, 1280px, 1920px

---

## 8. Quality Bar (must pass before submit)

- `pnpm build` clean — zero warnings
- `pnpm tsc --noEmit` clean — strict mode
- Lighthouse mobile ≥ 90 performance, 100 accessibility
- Visually verified at iPhone-width (375px) in both themes
- README screenshots match deployed app
- Deployed URL loads cold in under 2s on broadband

---

## 9. Repository & Deployment

**GitHub**

- Public repo (suggested name: `vibecoder-analytics-dashboard`)
- `.gitignore` covers `node_modules`, `.next`, `.env*`, `.DS_Store`, `.superpowers/`
- Conventional commits, small + frequent so reviewer sees progression

**README** must include:

- One-line hook + screenshot (light + dark, side-by-side)
- Live demo link
- Tech stack
- Features list
- Local run instructions (`pnpm i && pnpm dev`)
- Folder structure (collapsed)
- Note: mock data is generated client-side, no APIs
- Brief decisions/tradeoffs section

**Vercel**

- Connect repo → auto-detected Next.js → first deploy
- Production URL added to README
- Optional OG image for shareable link polish

---

## 10. Out of Scope (intentional)

- Authentication, real APIs, database
- E2E tests (unit tests on `aggregate.ts` only if time allows)
- Internationalization
- Custom animations beyond Recharts defaults
- Drag-to-reorder / customizable layouts
- User-saved filter presets

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Recharts theming awkward in dark mode | Use CSS vars everywhere; verify both themes after first chart is built, before scaling |
| Mock data looks flat / boring | Seasonality + occasional spike in generator; varied baselines per entity |
| Bundle size from Recharts | Tree-shake by importing only used components; check `pnpm build` output |
| Time overrun on polish | Hard cutoff: stop polish at hour 36, leave 12h for deploy, README, screenshots, fixes |
| Vercel build mismatch with local | Run `pnpm build` locally before every push; commit lockfile |
