'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = resolvedTheme ?? theme ?? 'dark';
  const next = current === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text transition-colors hover:bg-surface-2"
    >
      {mounted && current === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
