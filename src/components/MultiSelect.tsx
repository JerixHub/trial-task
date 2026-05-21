'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  id: string;
  label: string;
  color?: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id],
    );
  }

  const summary = selected.length === options.length
    ? 'All'
    : selected.length === 0
      ? 'None'
      : `${selected.length} of ${options.length}`;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-2"
      >
        <span className="text-muted">{label}:</span>
        <span>{summary}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 z-20 mt-1 min-w-[14rem] rounded-md border border-border bg-surface p-1 shadow-lg">
          <div className="flex justify-between border-b border-border px-2 py-1.5 text-xs text-muted">
            <button onClick={() => onChange(options.map(o => o.id))} className="hover:text-text">All</button>
            <button onClick={() => onChange([])} className="hover:text-text">None</button>
          </div>
          {options.map(o => {
            const on = selected.includes(o.id);
            return (
              <button
                key={o.id}
                role="option"
                aria-selected={on}
                onClick={() => toggle(o.id)}
                className={clsx(
                  'flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2',
                  on ? 'text-text' : 'text-muted',
                )}
              >
                <span className="flex items-center gap-2">
                  {o.color && <span className="h-2 w-2 rounded-full" style={{ background: o.color }} />}
                  {o.label}
                </span>
                {on && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
