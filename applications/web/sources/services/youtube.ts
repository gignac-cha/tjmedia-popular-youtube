import type { YoutubeResponse, WorkerErrorResponse } from '../types/youtube.ts';
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

export async function fetchYoutubeVideos(
  query: string,
): Promise<YoutubeResponse> {
  const youtubeApiBaseUrl = buildYoutubeApiBaseUrl().replace(/\/$/, '');
  const searchUrl = youtubeApiBaseUrl.startsWith('http')
    ? new URL(`${youtubeApiBaseUrl}/search`)
    : new URL(`${youtubeApiBaseUrl}/search`, window.location.origin);

  searchUrl.searchParams.set('search_query', query);

  const response = await fetch(searchUrl.toString());
  const responseText = await response.text();

  let parsedResponseBody: YoutubeResponse | WorkerErrorResponse;

  try {
    parsedResponseBody = JSON.parse(responseText) as
      | YoutubeResponse
      | WorkerErrorResponse;
  } catch {
    throw new Error('YouTube worker returned invalid JSON.');
  }

  if (!response.ok) {
    const errorMessage = isWorkerErrorResponse(parsedResponseBody)
      ? parsedResponseBody.error?.message
      : undefined;
    throw new Error(
      errorMessage ?? `YouTube worker request failed with ${response.status}.`,
    );
  }

  return parsedResponseBody as YoutubeResponse;
}
