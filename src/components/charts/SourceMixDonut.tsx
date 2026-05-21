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
            formatter={((v: number, _name: string, entry: any) => [
              `${formatCurrency(v)} (${total ? formatPercent(v / total) : '0%'})`,
              entry?.payload?.name as string,
            ]) as any}
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
