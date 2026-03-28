import { describe, expect, it } from 'vitest';
import { buildChartErrorMessage } from './tjmedia.ts';

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
