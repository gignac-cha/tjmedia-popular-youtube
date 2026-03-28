import { buildCORSHeaders } from './cors.ts';

export function htmlResponse(
  html: string,
  status = 200,
  origin?: string,
): Response {
  const headers = buildCORSHeaders(origin);
  headers.set('Content-Type', 'text/html; charset=utf-8');

  return new Response(html, {
    status,
    headers,
  });
}
