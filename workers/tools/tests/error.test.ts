import { describe, expect, it, beforeEach } from 'vitest';
import { initializeCORS } from '../cors.ts';
import { errorResponse } from '../error.ts';

describe('errorResponse', () => {
  beforeEach(() => {
    initializeCORS('https://example.com');
  });

  it('returns error body with message and status', async () => {
    const response = errorResponse('Something went wrong', 500);
    const body = await response.json();
    expect(body).toEqual({
      error: {
        message: 'Something went wrong',
        status: 500,
      },
    });
  });

  it('sets HTTP status to match error status', () => {
    const response = errorResponse('Not found', 404);
    expect(response.status).toBe(404);
  });

  it('sets Content-Type to application/json', () => {
    const response = errorResponse('Error', 500);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('includes CORS headers for allowed origin', () => {
    const response = errorResponse('Error', 500, 'https://example.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('excludes origin header for disallowed origin', () => {
    const response = errorResponse('Error', 500, 'https://evil.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('handles 502 status', async () => {
    const response = errorResponse('Bad Gateway', 502);
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error.status).toBe(502);
  });
});
