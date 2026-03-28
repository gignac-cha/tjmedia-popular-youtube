import type { SearchForm, TjmediaResponse } from '../types/tjmedia.ts';
import type { WorkerErrorResponse } from '../types/youtube.ts';
import { isWorkerErrorResponse } from '../types/youtube.ts';
import { isDefaultDateRange } from '../tools/search-form-storage.ts';

function buildTjmediaApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/tjmedia';
  }

  const url = import.meta.env.VITE_TJMEDIA_POPULAR_WORKER_URL;

  if (url === undefined || url === '') {
    console.error('[Configuration] VITE_TJMEDIA_POPULAR_WORKER_URL is not set. TJ Media API requests will fail.');
    throw new Error('TJ Media Worker URL이 설정되지 않았습니다.');
  }

  return url;
}

export function buildChartErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('resultCode 04')) {
    return 'TJMedia returned an application-level failure (`resultCode 04`). Try again in a moment or change the date range.';
  }

  if (errorMessage.includes('non-JSON content')) {
    return 'TJMedia returned a maintenance or unexpected HTML page instead of ranking data. Try again later.';
  }

  return `Failed to load charts: ${errorMessage}`;
}

export async function fetchPopularSongs(
  searchForm: SearchForm,
): Promise<TjmediaResponse> {
  const tjmediaApiBaseUrl = buildTjmediaApiBaseUrl().replace(/\/$/, '');
  const searchUrl = tjmediaApiBaseUrl.startsWith('http')
    ? new URL(`${tjmediaApiBaseUrl}/search`)
    : new URL(`${tjmediaApiBaseUrl}/search`, window.location.origin);

  searchUrl.searchParams.set('chartType', searchForm.chartType);
  searchUrl.searchParams.set('strType', searchForm.strType);

  if (!isDefaultDateRange(searchForm)) {
    searchUrl.searchParams.set('searchStartDate', searchForm.searchStartDate);
    searchUrl.searchParams.set('searchEndDate', searchForm.searchEndDate);
  }

  const response = await fetch(searchUrl.toString());
  const responseText = await response.text();

  let parsedResponseBody: TjmediaResponse | WorkerErrorResponse;

  try {
    parsedResponseBody = JSON.parse(responseText) as
      | TjmediaResponse
      | WorkerErrorResponse;
  } catch {
    throw new Error('TJMedia worker returned invalid JSON.');
  }

  if (!response.ok) {
    const errorMessage = isWorkerErrorResponse(parsedResponseBody)
      ? parsedResponseBody.error?.message
      : undefined;
    throw new Error(
      errorMessage ?? `TJMedia worker request failed with ${response.status}.`,
    );
  }

  const tjmediaResponse = parsedResponseBody as TjmediaResponse;

  if (tjmediaResponse.resultCode !== '99') {
    const resultCode = tjmediaResponse.resultCode ?? 'unknown';
    const resultMessage = tjmediaResponse.resultMsg ?? 'Unknown upstream error';
    throw new Error(
      `TJMedia returned unexpected resultCode ${resultCode}: ${resultMessage}.`,
    );
  }

  return tjmediaResponse;
}
