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
            formatter={(v) => formatPercent(v as number)}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map(d => <Cell key={d.id} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
