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
            formatter={(v) => formatCurrency(v as number)}
            labelFormatter={(v) => shortDate(v as string)}
          />
          <Legend wrapperStyle={{ color: c.axis, fontSize: 12 }} />
          <Area type="monotone" dataKey="youtube" stackId="rev" stroke="#8b5cf6" fill="url(#ytFill)" name="YouTube" />
          <Area type="monotone" dataKey="store"   stackId="rev" stroke="#06b6d4" fill="url(#stFill)" name="Web Store" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
