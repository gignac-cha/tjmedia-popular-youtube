import { describe, expect, it, vi } from 'vitest';
import {
  parseSearchFormFromURL,
  parseRankFromURL,
  buildSearchParameters,
  buildPermalinkURL,
  pushPermalink,
} from './permalink.ts';
import { buildThisMonthDateRange } from './dates.ts';
import type { SearchForm } from '../types/tjmedia.ts';

describe('parseSearchFormFromURL', () => {
  it('returns defaults for empty search parameters', () => {
    const parameters = new URLSearchParams();
    const result = parseSearchFormFromURL(parameters);
    const defaultDateRange = buildThisMonthDateRange();

    expect(result.chartType).toBe('TOP');
    expect(result.strType).toBe('1');
    expect(result.searchStartDate).toBe(defaultDateRange.searchStartDate);
    expect(result.searchEndDate).toBe(defaultDateRange.searchEndDate);
  });

  it('parses type=korean as strType "1"', () => {
    const parameters = new URLSearchParams('type=korean');
    const result = parseSearchFormFromURL(parameters);

    expect(result.strType).toBe('1');
  });

  it('parses type=english as strType "2"', () => {
    const parameters = new URLSearchParams('type=english');
    const result = parseSearchFormFromURL(parameters);

    expect(result.strType).toBe('2');
  });

  it('parses type=japanese as strType "3"', () => {
    const parameters = new URLSearchParams('type=japanese');
    const result = parseSearchFormFromURL(parameters);

    expect(result.strType).toBe('3');
  });

  it('falls back to korean for invalid type', () => {
    const parameters = new URLSearchParams('type=invalid');
    const result = parseSearchFormFromURL(parameters);

    expect(result.strType).toBe('1');
  });

  it('parses from and to date parameters', () => {
    const parameters = new URLSearchParams('from=2025-01-15&to=2025-01-31');
    const result = parseSearchFormFromURL(parameters);

    expect(result.searchStartDate).toBe('2025-01-15');
    expect(result.searchEndDate).toBe('2025-01-31');
  });

  it('falls back to default dates for invalid from parameter', () => {
    const parameters = new URLSearchParams('from=not-a-date');
    const result = parseSearchFormFromURL(parameters);
    const defaultDateRange = buildThisMonthDateRange();

    expect(result.searchStartDate).toBe(defaultDateRange.searchStartDate);
  });

  it('falls back to default dates for malformed date format', () => {
    const parameters = new URLSearchParams('from=2025/01/15');
    const result = parseSearchFormFromURL(parameters);
    const defaultDateRange = buildThisMonthDateRange();

    expect(result.searchStartDate).toBe(defaultDateRange.searchStartDate);
  });

  it('falls back to default dates for invalid to parameter', () => {
    const parameters = new URLSearchParams('to=abc');
    const result = parseSearchFormFromURL(parameters);
    const defaultDateRange = buildThisMonthDateRange();

    expect(result.searchEndDate).toBe(defaultDateRange.searchEndDate);
  });

  it('parses all parameters together', () => {
    const parameters = new URLSearchParams(
      'type=english&from=2025-03-01&to=2025-03-15',
    );
    const result = parseSearchFormFromURL(parameters);

    expect(result.chartType).toBe('TOP');
    expect(result.strType).toBe('2');
    expect(result.searchStartDate).toBe('2025-03-01');
    expect(result.searchEndDate).toBe('2025-03-15');
  });
});

describe('parseRankFromURL', () => {
  it('returns null when rank parameter is missing', () => {
    const parameters = new URLSearchParams();
    const result = parseRankFromURL(parameters);

    expect(result).toBeNull();
  });

  it('returns parsed integer for valid rank', () => {
    const parameters = new URLSearchParams('rank=5');
    const result = parseRankFromURL(parameters);

    expect(result).toBe(5);
  });

  it('returns null for non-numeric rank', () => {
    const parameters = new URLSearchParams('rank=abc');
    const result = parseRankFromURL(parameters);

    expect(result).toBeNull();
  });

  it('returns null for rank of 0', () => {
    const parameters = new URLSearchParams('rank=0');
    const result = parseRankFromURL(parameters);

    expect(result).toBeNull();
  });

  it('returns null for negative rank', () => {
    const parameters = new URLSearchParams('rank=-3');
    const result = parseRankFromURL(parameters);

    expect(result).toBeNull();
  });

  it('returns 1 for rank=1', () => {
    const parameters = new URLSearchParams('rank=1');
    const result = parseRankFromURL(parameters);

    expect(result).toBe(1);
  });

  it('returns integer part for decimal rank', () => {
    const parameters = new URLSearchParams('rank=3.7');
    const result = parseRankFromURL(parameters);

    expect(result).toBe(3);
  });

  it('returns null for empty rank value', () => {
    const parameters = new URLSearchParams('rank=');
    const result = parseRankFromURL(parameters);

    expect(result).toBeNull();
  });
});

describe('buildSearchParameters', () => {
  it('omits type when genre is korean (default)', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.has('type')).toBe(false);
  });

  it('includes type when genre is english', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '2',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.get('type')).toBe('english');
  });

  it('includes type when genre is japanese', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '3',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.get('type')).toBe('japanese');
  });

  it('omits from and to when dates match defaults', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.has('from')).toBe(false);
    expect(result.has('to')).toBe(false);
  });

  it('includes from when searchStartDate differs from default', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: '2024-06-15',
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.get('from')).toBe('2024-06-15');
  });

  it('includes to when searchEndDate differs from default', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: '2024-06-30',
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.get('to')).toBe('2024-06-30');
  });

  it('includes rank when provided', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, 7);

    expect(result.get('rank')).toBe('7');
  });

  it('omits rank when null', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildSearchParameters(searchForm, null);

    expect(result.has('rank')).toBe(false);
  });

  it('includes all non-default parameters together', () => {
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '2',
      searchStartDate: '2024-05-01',
      searchEndDate: '2024-05-31',
    };

    const result = buildSearchParameters(searchForm, 3);

    expect(result.get('type')).toBe('english');
    expect(result.get('from')).toBe('2024-05-01');
    expect(result.get('to')).toBe('2024-05-31');
    expect(result.get('rank')).toBe('3');
  });
});

describe('buildPermalinkURL', () => {
  it('returns base path for all-default parameters and no rank', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildPermalinkURL(searchForm, null);

    expect(result).toBe('/tjmedia-popular-youtube/');
  });

  it('returns URL with type parameter for non-default genre', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '2',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildPermalinkURL(searchForm, null);

    expect(result).toBe('/tjmedia-popular-youtube/?type=english');
  });

  it('returns URL with rank parameter', () => {
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    const result = buildPermalinkURL(searchForm, 3);

    expect(result).toBe('/tjmedia-popular-youtube/?rank=3');
  });

  it('returns URL with multiple parameters', () => {
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '3',
      searchStartDate: '2024-07-01',
      searchEndDate: '2024-07-31',
    };

    const result = buildPermalinkURL(searchForm, 10);

    expect(result).toContain('type=japanese');
    expect(result).toContain('from=2024-07-01');
    expect(result).toContain('to=2024-07-31');
    expect(result).toContain('rank=10');
    expect(result).toMatch(/^\/tjmedia-popular-youtube\/\?/);
  });
});

describe('pushPermalink', () => {
  it('calls history.pushState with the permalink URL', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '2',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    pushPermalink(searchForm, 5);

    expect(pushStateSpy).toHaveBeenCalledWith(
      null,
      '',
      expect.stringContaining('type=english'),
    );
    expect(pushStateSpy).toHaveBeenCalledWith(
      null,
      '',
      expect.stringContaining('rank=5'),
    );

    pushStateSpy.mockRestore();
  });

  it('calls history.pushState with base path for defaults', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const defaultDateRange = buildThisMonthDateRange();
    const searchForm: SearchForm = {
      chartType: 'TOP',
      strType: '1',
      searchStartDate: defaultDateRange.searchStartDate,
      searchEndDate: defaultDateRange.searchEndDate,
    };

    pushPermalink(searchForm, null);

    expect(pushStateSpy).toHaveBeenCalledWith(
      null,
      '',
      '/tjmedia-popular-youtube/',
    );

    pushStateSpy.mockRestore();
  });
});
