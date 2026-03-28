import { buildCORSHeaders } from './cors.ts';

export function jsonResponse<TData>(
  data: TData,
  status = 200,
  origin?: string,
): Response {
  const headers = buildCORSHeaders(origin);
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}
