import type { YouTubeResponse } from '../types/youtube.ts';
import { isWorkerErrorResponse } from '../types/youtube.ts';

function buildYoutubeApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/youtube';
  }

  const url = import.meta.env.VITE_YOUTUBE_SEARCH_WORKER_URL;

  if (url === undefined || url === '') {
    console.error('[Configuration] VITE_YOUTUBE_SEARCH_WORKER_URL is not set. YouTube API requests will fail.');
    throw new Error('YouTube Search Worker URL이 설정되지 않았습니다.');
  }

  return url;
}

export async function fetchYouTubeVideos(
  query: string,
): Promise<YouTubeResponse> {
  const youtubeApiBaseUrl = buildYoutubeApiBaseUrl().replace(/\/$/, '');
  const searchUrl = youtubeApiBaseUrl.startsWith('http')
    ? new URL(`${youtubeApiBaseUrl}/search`)
    : new URL(`${youtubeApiBaseUrl}/search`, window.location.origin);

  searchUrl.searchParams.set('search_query', query);

  const response = await fetch(searchUrl.toString());
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage: string | undefined;

    try {
      const errorBody = JSON.parse(responseText) as unknown;
      if (isWorkerErrorResponse(errorBody)) {
        errorMessage = errorBody.error?.message;
      }
    } catch {
      // non-JSON error response (e.g. 502 gateway HTML)
    }

    throw new Error(
      errorMessage ?? `YouTube worker request failed with ${response.status}.`,
    );
  }

  let parsedResponseBody: YouTubeResponse;

  try {
    parsedResponseBody = JSON.parse(responseText) as YouTubeResponse;
  } catch {
    throw new Error('YouTube worker returned invalid JSON.');
  }

  return parsedResponseBody;
}
