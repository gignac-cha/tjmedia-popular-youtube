import { describe, expect, it, beforeEach } from 'vitest';
import { initializeCORS } from '../cors.ts';
import { jsonResponse } from '../json.ts';

describe('jsonResponse', () => {
  beforeEach(() => {
    initializeCORS('https://example.com');
  });

  it('returns JSON-serialized body', async () => {
    const response = jsonResponse({ key: 'value' });
    expect(await response.json()).toEqual({ key: 'value' });
  });

  it('serializes arrays', async () => {
    const response = jsonResponse([1, 2, 3]);
    expect(await response.json()).toEqual([1, 2, 3]);
  });

  it('serializes null', async () => {
    const response = jsonResponse(null);
    expect(await response.json()).toBeNull();
  });

  it('sets Content-Type to application/json', () => {
    const response = jsonResponse({ key: 'value' });
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('defaults to status 200', () => {
    const response = jsonResponse({ key: 'value' });
    expect(response.status).toBe(200);
  });

  it('accepts custom status', () => {
    const response = jsonResponse({ error: 'bad' }, 400);
    expect(response.status).toBe(400);
  });

  it('includes CORS headers for allowed origin', () => {
    const response = jsonResponse({}, 200, 'https://example.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('excludes origin header for disallowed origin', () => {
    const response = jsonResponse({}, 200, 'https://evil.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
