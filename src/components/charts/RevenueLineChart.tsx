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
            formatter={(v) => formatCurrency(v as number)}
            labelFormatter={(v) => shortDate(v as string)}
          />
          {series.map(s => (
            <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
