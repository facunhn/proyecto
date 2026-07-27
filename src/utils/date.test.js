import { describe, it, expect } from 'vitest';
import { formatShortDate, isPastDate, todayIso } from './date';

describe('formatShortDate', () => {
  it('formats an ISO date as DD/MM', () => {
    expect(formatShortDate('2026-09-30')).toBe('30/09');
  });

  it('returns an empty string for missing dates', () => {
    expect(formatShortDate(null)).toBe('');
    expect(formatShortDate(undefined)).toBe('');
  });
});

describe('isPastDate', () => {
  it('is false for dates without a value', () => {
    expect(isPastDate(null)).toBe(false);
  });

  it('is false for today and future dates', () => {
    expect(isPastDate(todayIso())).toBe(false);
    expect(isPastDate('2999-01-01')).toBe(false);
  });

  it('is true for dates in the past', () => {
    expect(isPastDate('2000-01-01')).toBe(true);
  });
});
