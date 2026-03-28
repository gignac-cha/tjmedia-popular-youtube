import { describe, expect, it } from 'vitest';
import { buildTodayDateRange, buildThisMonthDateRange } from './dates.ts';

describe('buildTodayDateRange', () => {
  it('returns searchStartDate and searchEndDate both set to today', () => {
    const result = buildTodayDateRange();
    const today = new Date().toISOString().slice(0, 10);

    expect(result.searchStartDate).toBe(today);
    expect(result.searchEndDate).toBe(today);
  });

  it('returns dates in YYYY-MM-DD format', () => {
    const result = buildTodayDateRange();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    expect(result.searchStartDate).toMatch(datePattern);
    expect(result.searchEndDate).toMatch(datePattern);
  });

  it('returns searchStartDate equal to searchEndDate', () => {
    const result = buildTodayDateRange();

    expect(result.searchStartDate).toBe(result.searchEndDate);
  });
});

describe('buildThisMonthDateRange', () => {
  it('returns searchStartDate as the first day of the current month', () => {
    const result = buildThisMonthDateRange();
    const now = new Date();
    const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    expect(result.searchStartDate).toBe(expectedStart);
  });

  it('returns searchEndDate as today', () => {
    const result = buildThisMonthDateRange();
    const today = new Date().toISOString().slice(0, 10);

    expect(result.searchEndDate).toBe(today);
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
