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
