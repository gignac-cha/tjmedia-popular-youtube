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
  responseBody:
    | Record<string, unknown>
    | WorkerErrorResponse
    | null,
): responseBody is WorkerErrorResponse {
  return responseBody !== null && 'error' in responseBody;
}
