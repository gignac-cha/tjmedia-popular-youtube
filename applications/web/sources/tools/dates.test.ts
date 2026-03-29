import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildTodayDateRange, buildThisMonthDateRange } from './dates.ts';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-15T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildTodayDateRange', () => {
  it('returns searchStartDate as yesterday', () => {
    const result = buildTodayDateRange();

    expect(result.searchStartDate).toBe('2026-03-14');
  });

  it('returns searchEndDate as today', () => {
    const result = buildTodayDateRange();

    expect(result.searchEndDate).toBe('2026-03-15');
  });

  it('returns dates in YYYY-MM-DD format', () => {
    const result = buildTodayDateRange();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    expect(result.searchStartDate).toMatch(datePattern);
    expect(result.searchEndDate).toMatch(datePattern);
  });

  it('returns searchStartDate one day before searchEndDate', () => {
    const result = buildTodayDateRange();
    const start = new Date(result.searchStartDate);
    const end = new Date(result.searchEndDate);
    const differenceInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    expect(differenceInDays).toBe(1);
  });

  it('handles month boundary correctly', () => {
    vi.setSystemTime(new Date('2026-04-01T12:00:00'));
    const result = buildTodayDateRange();

    expect(result.searchStartDate).toBe('2026-03-31');
    expect(result.searchEndDate).toBe('2026-04-01');
  });
});

describe('buildThisMonthDateRange', () => {
  it('returns searchStartDate as the first day of the current month', () => {
    const result = buildThisMonthDateRange();

    expect(result.searchStartDate).toBe('2026-03-01');
  });

  it('returns searchEndDate as today', () => {
    const result = buildThisMonthDateRange();

    expect(result.searchEndDate).toBe('2026-03-15');
  });

  it('returns dates in YYYY-MM-DD format', () => {
    const result = buildThisMonthDateRange();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    expect(result.searchStartDate).toMatch(datePattern);
    expect(result.searchEndDate).toMatch(datePattern);
  });

  it('returns searchStartDate that ends with -01', () => {
    const result = buildThisMonthDateRange();

    expect(result.searchStartDate).toMatch(/-01$/);
  });

  it('returns searchStartDate on or before searchEndDate', () => {
    const result = buildThisMonthDateRange();

    expect(new Date(result.searchStartDate).getTime()).toBeLessThanOrEqual(
      new Date(result.searchEndDate).getTime(),
    );
  });
});
