import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildChartErrorMessage, fetchTJMediaPopularSongs } from './tjmedia.ts';
import type { SearchForm } from '../types/tjmedia.ts';

describe('buildChartErrorMessage', () => {
  it('returns specific message when error contains "resultCode 04"', () => {
    const result = buildChartErrorMessage(
      'TJMedia returned unexpected resultCode 04: some error',
    );

    expect(result).toBe(
      'TJMedia returned an application-level failure (`resultCode 04`). Try again in a moment or change the date range.',
    );
  });

  it('returns specific message when error contains "non-JSON content"', () => {
    const result = buildChartErrorMessage(
      'Worker received non-JSON content from upstream',
    );

    expect(result).toBe(
      'TJMedia returned a maintenance or unexpected HTML page instead of ranking data. Try again later.',
    );
  });

  it('returns prefixed generic message for other errors', () => {
    const result = buildChartErrorMessage('Network timeout');

    expect(result).toBe('Failed to load charts: Network timeout');
  });

  it('returns prefixed message for empty string', () => {
    const result = buildChartErrorMessage('');

    expect(result).toBe('Failed to load charts: ');
  });

  it('prioritizes resultCode 04 check when both patterns are present', () => {
    const result = buildChartErrorMessage(
      'resultCode 04 with non-JSON content',
    );

    expect(result).toBe(
      'TJMedia returned an application-level failure (`resultCode 04`). Try again in a moment or change the date range.',
    );
  });

  it('matches resultCode 04 anywhere in the string', () => {
    const result = buildChartErrorMessage(
      'Error: something happened, resultCode 04, details follow',
    );

    expect(result).toBe(
      'TJMedia returned an application-level failure (`resultCode 04`). Try again in a moment or change the date range.',
    );
  });

  it('matches non-JSON content anywhere in the string', () => {
    const result = buildChartErrorMessage(
      'Upstream returned non-JSON content (text/html)',
    );

    expect(result).toBe(
      'TJMedia returned a maintenance or unexpected HTML page instead of ranking data. Try again later.',
    );
  });

  it('matches "resultCode 041" because includes check is substring-based', () => {
    const result = buildChartErrorMessage('resultCode 041');

    expect(result).toBe(
      'TJMedia returned an application-level failure (`resultCode 04`). Try again in a moment or change the date range.',
    );
  });
});

const defaultSearchForm: SearchForm = {
  chartType: 'TOP',
  strType: '1',
  searchStartDate: '2026-03-01',
  searchEndDate: '2026-03-29',
};

describe('fetchTJMediaPopularSongs', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed response on success', async () => {
    const mockResponse = {
      resultCode: '99',
      resultData: { items: [{ rank: '1', indexTitle: 'Drowning' }] },
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await fetchTJMediaPopularSongs(defaultSearchForm);

    expect(result.resultCode).toBe('99');
    expect(result.resultData?.items?.[0].indexTitle).toBe('Drowning');
  });

  it('includes chartType and strType in search parameters', async () => {
    const mockResponse = { resultCode: '99', resultData: { items: [] } };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    await fetchTJMediaPopularSongs(defaultSearchForm);

    const calledUrl = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('chartType')).toBe('TOP');
    expect(calledUrl.searchParams.get('strType')).toBe('1');
  });

  it('throws when response is not ok with worker error body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'upstream failed', status: 502 } }),
        { status: 502 },
      ),
    );

    await expect(fetchTJMediaPopularSongs(defaultSearchForm)).rejects.toThrow('upstream failed');
  });

  it('throws generic error when response is not ok with non-JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('<html>Bad Gateway</html>', { status: 502 }),
    );

    await expect(fetchTJMediaPopularSongs(defaultSearchForm)).rejects.toThrow(
      'TJMedia worker request failed with 502.',
    );
  });

  it('throws when response body is invalid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('not json', { status: 200 }),
    );

    await expect(fetchTJMediaPopularSongs(defaultSearchForm)).rejects.toThrow(
      'TJMedia worker returned invalid JSON.',
    );
  });

  it('throws when resultCode is not 99', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ resultCode: '04', resultMsg: '알수 없는 에러' }),
        { status: 200 },
      ),
    );

    await expect(fetchTJMediaPopularSongs(defaultSearchForm)).rejects.toThrow(
      'TJMedia returned unexpected resultCode 04: 알수 없는 에러.',
    );
  });
});
