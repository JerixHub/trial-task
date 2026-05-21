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
