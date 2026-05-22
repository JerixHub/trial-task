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

  const viewsLineData = useMemo(() => {
    const perDate = new Map<string, Record<string, number>>();
    for (const r of filtered) {
      const e = perDate.get(r.date) ?? {};
      e[r.channelId] = (e[r.channelId] ?? 0) + r.views;
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

  const viewsBarData = useMemo(() => {
    const m = groupByEntity(filtered, 'channelId', ['views']);
    return CHANNELS
      .filter(c => selected.includes(c.id))
      .map(c => ({ id: c.id, name: c.name, value: m.get(c.id)?.views ?? 0, color: c.color }));
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
          <h3 className="mb-2 text-sm font-medium text-text">Views over time</h3>
          <RevenueLineChart
            data={viewsLineData}
            series={series.map(s => ({ id: s.id, name: s.name, color: s.color }))}
            valueFormat="compact"
          />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-text">Views by channel</h3>
          <ViewsBarChart data={viewsBarData} valueLabel="views" />
        </div>
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
