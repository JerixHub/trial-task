export function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(n).toString();
}

export function formatCurrency(n: number): string {
  return '$' + formatCompactNumber(n);
}

export function formatPercent(v: number): string {
  return (v * 100).toFixed(1) + '%';
}

export function formatSignedPercent(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—';
  const sign = v >= 0 ? '+' : '−';
  return sign + (Math.abs(v) * 100).toFixed(1) + '%';
}
