import { describe, it, expect } from 'vitest';
import { formatCompactNumber, formatCurrency, formatPercent, formatSignedPercent } from '@/lib/format';

describe('format', () => {
  it('formats compact numbers', () => {
    expect(formatCompactNumber(950)).toBe('950');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(2_400_000)).toBe('2.4M');
    expect(formatCompactNumber(1_200_000_000)).toBe('1.2B');
  });

  it('formats currency (USD, compact)', () => {
    expect(formatCurrency(50)).toBe('$50');
    expect(formatCurrency(1500)).toBe('$1.5K');
    expect(formatCurrency(2_400_000)).toBe('$2.4M');
  });

  it('formats percent', () => {
    expect(formatPercent(0.0421)).toBe('4.2%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('formats signed percent with arrow markers', () => {
    expect(formatSignedPercent(0.12)).toBe('+12.0%');
    expect(formatSignedPercent(-0.05)).toBe('−5.0%');
    expect(formatSignedPercent(null)).toBe('—');
  });
});
