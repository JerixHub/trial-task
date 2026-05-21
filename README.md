# Pulse — Creator Analytics Dashboard

A unified analytics dashboard for YouTube channels and web stores. Built for the Vibecoder trial task.

**Live demo:** https://trial-task-six.vercel.app

## Stack

- Next.js 16 (App Router) + React 19
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
- **Unit tests on pure helpers only** (aggregate, format, PRNG, mock-data shape). UI snapshot tests add noise without catching real bugs in a 48h scope.

## License

MIT
