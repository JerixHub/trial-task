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
