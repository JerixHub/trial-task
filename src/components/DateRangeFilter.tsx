'use client';

import clsx from 'clsx';
import type { DateRangeDays } from '@/lib/types';
import { DATE_RANGES } from '@/lib/constants';

interface Props {
  value: DateRangeDays;
  onChange: (v: DateRangeDays) => void;
}

const LABELS: Record<DateRangeDays, string> = { 7: '7d', 30: '30d', 90: '90d' };

export function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Date range" className="inline-flex rounded-md border border-border bg-surface p-0.5">
      {DATE_RANGES.map(d => (
        <button
          key={d}
          role="radio"
          aria-checked={value === d}
          onClick={() => onChange(d)}
          className={clsx(
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            value === d ? 'bg-surface-2 text-text' : 'text-muted hover:text-text',
          )}
        >
          {LABELS[d]}
        </button>
      ))}
    </div>
  );
}
