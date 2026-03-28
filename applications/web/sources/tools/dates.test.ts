import { describe, expect, it } from 'vitest';
import { buildTodayDateRange, buildThisMonthDateRange } from './dates.ts';

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

describe('buildTodayDateRange', () => {
  it('returns searchStartDate as yesterday', () => {
    const result = buildTodayDateRange();
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    expect(result.searchStartDate).toBe(formatLocalDate(yesterday));
  });

  it('returns searchEndDate as today', () => {
    const result = buildTodayDateRange();

    expect(result.searchEndDate).toBe(formatLocalDate(new Date()));
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
});

describe('buildThisMonthDateRange', () => {
  it('returns searchStartDate as the first day of the current month', () => {
    const result = buildThisMonthDateRange();
    const now = new Date();
    const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1);

    expect(result.searchStartDate).toBe(formatLocalDate(expectedStart));
  });

  it('returns searchEndDate as today', () => {
    const result = buildThisMonthDateRange();

    expect(result.searchEndDate).toBe(formatLocalDate(new Date()));
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
