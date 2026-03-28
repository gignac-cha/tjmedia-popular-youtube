import { buildCORSHeaders } from './cors.ts';

export function textResponse(
  text: string,
  status = 200,
  origin?: string,
): Response {
  const headers = buildCORSHeaders(origin);
  headers.set('Content-Type', 'text/plain; charset=utf-8');

  return new Response(text, {
    status,
    headers,
  });
}
