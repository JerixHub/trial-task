'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { YouTubeSection } from '@/components/sections/YouTubeSection';
import { WebStoreSection } from '@/components/sections/WebStoreSection';
import { CombinedSection } from '@/components/sections/CombinedSection';
import { youtubeData, storeData } from '@/lib/mock-data';
import { filterByDateRange } from '@/lib/aggregate';
import { CHANNELS, STORES, TODAY } from '@/lib/constants';
import type { DateRangeDays } from '@/lib/types';

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRangeDays>(30);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(CHANNELS.map(c => c.id));
  const [selectedStores, setSelectedStores] = useState<string[]>(STORES.map(s => s.id));

  const ytCurrent = useMemo(
    () => filterByDateRange(youtubeData, dateRange, TODAY),
    [dateRange],
  );
  const storeCurrent = useMemo(
    () => filterByDateRange(storeData, dateRange, TODAY),
    [dateRange],
  );

  return (
    <div id="top" className="min-h-screen bg-bg text-text">
      <Header dateRange={dateRange} onDateRangeChange={setDateRange} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="pt-8 pb-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Creator Analytics</h1>
          <p className="mt-2 text-sm text-muted">
            Unified view of your YouTube channels and web stores. Showing last {dateRange} days.
          </p>
        </div>

        <YouTubeSection
          allRows={youtubeData}
          currentRows={ytCurrent}
          dateRange={dateRange}
          today={TODAY}
          selected={selectedChannels}
          onSelectedChange={setSelectedChannels}
        />

        <WebStoreSection
          allRows={storeData}
          currentRows={storeCurrent}
          dateRange={dateRange}
          today={TODAY}
          selected={selectedStores}
          onSelectedChange={setSelectedStores}
        />

        <CombinedSection
          ytAll={youtubeData}
          storeAll={storeData}
          ytCurrent={ytCurrent}
          storeCurrent={storeCurrent}
          dateRange={dateRange}
          today={TODAY}
        />

        <footer className="border-t border-border py-8 text-xs text-muted">
          <p>Pulse — built for the Vibecoder trial. Data is generated client-side; no real APIs are used.</p>
        </footer>
      </main>
    </div>
  );
}
