import { describe, expect, it, beforeEach } from 'vitest';
import { initializeCORS } from '../cors.ts';
import { textResponse } from '../text.ts';

describe('textResponse', () => {
  beforeEach(() => {
    initializeCORS('https://example.com');
  });

  it('returns text body', async () => {
    const response = textResponse('hello');
    expect(await response.text()).toBe('hello');
  });

  it('sets Content-Type to text/plain', () => {
    const response = textResponse('hello');
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  it('defaults to status 200', () => {
    const response = textResponse('hello');
    expect(response.status).toBe(200);
  });

  it('accepts custom status', () => {
    const response = textResponse('not found', 404);
    expect(response.status).toBe(404);
  });

  it('includes CORS headers for allowed origin', () => {
    const response = textResponse('hello', 200, 'https://example.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('excludes origin header for disallowed origin', () => {
    const response = textResponse('hello', 200, 'https://evil.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
