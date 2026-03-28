import { describe, expect, it, beforeEach } from 'vitest';
import { initializeCORS } from '../cors.ts';
import { htmlResponse } from '../html.ts';

describe('htmlResponse', () => {
  beforeEach(() => {
    initializeCORS('https://example.com');
  });

  it('returns HTML body', async () => {
    const response = htmlResponse('<h1>Hello</h1>');
    expect(await response.text()).toBe('<h1>Hello</h1>');
  });

  it('sets Content-Type to text/html', () => {
    const response = htmlResponse('<h1>Hello</h1>');
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  });

  it('defaults to status 200', () => {
    const response = htmlResponse('<h1>Hello</h1>');
    expect(response.status).toBe(200);
  });

  it('accepts custom status', () => {
    const response = htmlResponse('<h1>Error</h1>', 500);
    expect(response.status).toBe(500);
  });

  it('includes CORS headers for allowed origin', () => {
    const response = htmlResponse('<h1>Hello</h1>', 200, 'https://example.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('excludes origin header for disallowed origin', () => {
    const response = htmlResponse('<h1>Hello</h1>', 200, 'https://evil.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
