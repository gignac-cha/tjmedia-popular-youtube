import { describe, expect, it } from 'vitest';
import { isWorkerErrorResponse } from './youtube.ts';

describe('isWorkerErrorResponse', () => {
  it('returns true when object has an "error" key', () => {
    const response = { error: { message: 'something failed', status: 500 } };

    expect(isWorkerErrorResponse(response)).toBe(true);
  });

  it('returns true when error value is undefined', () => {
    const response = { error: undefined };

    expect(isWorkerErrorResponse(response)).toBe(true);
  });

  it('returns true when error has no message or status', () => {
    const response = { error: {} };

    expect(isWorkerErrorResponse(response)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isWorkerErrorResponse(null)).toBe(false);
  });

  it('returns false for object without "error" key', () => {
    const response = { resultCode: '99', resultMsg: 'OK' };

    expect(isWorkerErrorResponse(response)).toBe(false);
  });

  it('returns false for empty object', () => {
    const response = {};

    expect(isWorkerErrorResponse(response)).toBe(false);
  });

  it('returns true when object has error among other keys', () => {
    const response = { error: { message: 'fail' }, extra: 'data' };

    expect(isWorkerErrorResponse(response)).toBe(true);
  });

  it('returns true when error is null (key still exists)', () => {
    const response = { error: null };

    expect(isWorkerErrorResponse(response)).toBe(true);
  });
});
