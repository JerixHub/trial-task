'use client';

import { Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { DateRangeFilter } from './DateRangeFilter';
import type { DateRangeDays } from '@/lib/types';

interface Props {
  dateRange: DateRangeDays;
  onDateRangeChange: (v: DateRangeDays) => void;
}

const LINKS = [
  { href: '#youtube',  label: 'YouTube' },
  { href: '#webstore', label: 'Web Store' },
  { href: '#combined', label: 'Combined' },
];

export function Header({ dateRange, onDateRangeChange }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <Activity size={18} className="text-accent" />
          <span>Pulse</span>
        </a>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="rounded px-2 py-1 text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
