import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatSignedPercent } from '@/lib/format';

interface Props {
  label: string;
  value: string;
  delta: number | null;
}

export function KpiCard({ label, value, delta }: Props) {
  const isUp = delta !== null && delta >= 0;
  const isFlat = delta === null;

  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;
  const tone = isFlat
    ? 'text-muted'
    : isUp
      ? 'text-positive'
      : 'text-negative';

  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-colors">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl">{value}</div>
      <div className={clsx('mt-2 inline-flex items-center gap-1 text-xs font-medium', tone)}>
        <Icon size={14} />
        <span>{formatSignedPercent(delta)}</span>
        <span className="text-muted">vs prev period</span>
      </div>
    </div>
  );
}
