export type YoutubeItem = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  source: string;
  width: number;
  height: number;
};

export type YoutubeResponse = {
  query: string;
  items: YoutubeItem[];
};

export type WorkerErrorResponse = {
  error?: {
    message?: string;
    status?: number;
  };
};

export function isWorkerErrorResponse(
  responseBody: unknown,
): responseBody is WorkerErrorResponse {
  return (
    responseBody !== null &&
    typeof responseBody === 'object' &&
    'error' in (responseBody as Record<string, unknown>)
  );
}
