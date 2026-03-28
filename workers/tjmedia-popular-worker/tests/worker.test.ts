import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../worker.ts';

type WorkerEnvironment = {
  ALLOWED_ORIGINS?: string;
  DEBUG_MOCK_MODE?: string;
  R2_TJMEDIA_POPULAR: R2Bucket;
};

const TEST_ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:5174';

function buildTestEnvironment(overrides: Partial<WorkerEnvironment> = {}): WorkerEnvironment {
  return {
    ALLOWED_ORIGINS: TEST_ALLOWED_ORIGINS,
    R2_TJMEDIA_POPULAR: createMockR2Bucket(),
    ...overrides,
  } as WorkerEnvironment;
}


function createMockR2Bucket(
  store: Map<string, string> = new Map(),
): R2Bucket {
  return {
    get: vi.fn(async (key: string) => {
      const value = store.get(key);

      if (value === undefined) {
        return null;
      }

      return {
        text: async () => value,
        json: async () => JSON.parse(value),
        body: new ReadableStream(),
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
      } as unknown as R2ObjectBody;
    }),
    put: vi.fn(async (key: string, value: string | ReadableStream | ArrayBuffer | Blob | null) => {
      store.set(key, typeof value === 'string' ? value : '');
    }),
    delete: vi.fn(async () => {}),
    list: vi.fn(async (options?: R2ListOptions) => {
      const prefix = options?.prefix ?? '';
      const delimiter = options?.delimiter;
      const keys = [...store.keys()].filter((key) => key.startsWith(prefix));

      if (delimiter !== undefined) {
        const prefixes = new Set<string>();

        for (const key of keys) {
          const rest = key.slice(prefix.length);
          const delimiterIndex = rest.indexOf(delimiter);

          if (delimiterIndex !== -1) {
            prefixes.add(prefix + rest.slice(0, delimiterIndex + 1));
          }
        }

        return {
          objects: [],
          truncated: false,
          delimitedPrefixes: [...prefixes].sort(),
        } as unknown as R2Objects;
      }

      return {
        objects: keys.map((key) => ({ key })),
        truncated: false,
        delimitedPrefixes: [],
      } as unknown as R2Objects;
    }),
    head: vi.fn(async () => null),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
  } as unknown as R2Bucket;
}

function buildSuccessUpstreamBody(): string {
  return JSON.stringify({
    resultCode: '99',
    resultData: { items: [{ rank: '1', indexTitle: 'Drowning' }] },
  });
}

function mockUpstreamFetch(): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(buildSuccessUpstreamBody(), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  );
}

describe('tjmedia popular worker', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['/', '/help'])('returns the help document at %s', async (pathname) => {
    const response = await worker.fetch(
      new Request(`http://localhost${pathname}`),
      buildTestEnvironment(),
    );
    const responseText = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(responseText).toContain('TJMedia Popular Worker');
    expect(responseText).toContain('GET /search');
  });

  it('returns the preflight response', async () => {
    const response = await worker.fetch(
      new Request('http://localhost/search', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:5173',
        },
      }),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    );
  });

  it('returns an empty head response', async () => {
    const response = await worker.fetch(
      new Request('http://localhost/help', { method: 'HEAD' }),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  it('passes through valid search requests', async () => {
    const inboundUserAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
    const fetchMock = mockUpstreamFetch();
    const r2Bucket = createMockR2Bucket();

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=integrated&searchStartDate=2026-03-01&searchEndDate=2026-03-20&strType=1',
        {
          headers: {
            Origin: 'http://localhost:5173',
            'User-Agent': inboundUserAgent,
          },
        },
      ),
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.tjmedia.com/legacy/api/topAndHot100',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Origin: 'https://www.tjmedia.com',
          Referer: 'https://www.tjmedia.com/',
          'User-Agent': inboundUserAgent,
        },
        body: 'searchStartDate=2026-03-01&searchEndDate=2026-03-20&chartType=integrated&strType=1',
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    );
    expect(response.headers.get('X-Cache')).toBe('MISS');
    await expect(response.json()).resolves.toEqual({
      resultCode: '99',
      resultData: { items: [{ rank: '1', indexTitle: 'Drowning' }] },
    });
  });

  it('defaults omitted date parameters to the current month-to-date range', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-21T09:00:00.000Z'));

    const fetchMock = mockUpstreamFetch();

    const response = await worker.fetch(
      new Request('http://localhost/search?chartType=TOP&strType=1'),
      buildTestEnvironment(),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.tjmedia.com/legacy/api/topAndHot100',
      expect.objectContaining({
        body: 'searchStartDate=2026-03-01&searchEndDate=2026-03-21&chartType=TOP&strType=1',
      }),
    );
    expect(response.status).toBe(200);

    vi.useRealTimers();
  });

  it('returns a worker error when TJMedia returns resultCode 04', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          resultCode: '04',
          resultData: null,
          resultMsg: '알수 없는 에러',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      ),
    );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-02-01&searchEndDate=2026-02-28&strType=1',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(200);
    const body = await response.json() as { resultCode: string; resultMsg: string; resultData: null };
    expect(body.resultCode).toBe('04');
    expect(body.resultMsg).toBe('알수 없는 에러');
    expect(body.resultData).toBeNull();
  });

  it('returns empty items when TJMedia returns resultCode 98 (no data)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          resultCode: '98',
          resultMsg: '실패.',
          resultData: null,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      ),
    );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-04-01&searchEndDate=2026-04-30&strType=1',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(200);
    const body = await response.json() as { resultCode: string; resultData: { itemsTotalCount: number; items: unknown[] } };
    expect(body.resultCode).toBe('99');
    expect(body.resultData.itemsTotalCount).toBe(0);
    expect(body.resultData.items).toEqual([]);
  });

  it('returns 502 for unknown resultCode', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          resultCode: '01',
          resultMsg: 'Unknown failure.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      ),
    );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-24&strType=1',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(502);
    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.message).toContain('resultCode 01');
    expect(body.error.status).toBe(502);
  });

  it('returns a worker error when TJMedia returns HTML instead of JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html><title>서비스 점검중입니다</title></html>', {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }),
    );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-02-01&searchEndDate=2026-02-28&strType=1',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        message:
          'TJMedia upstream returned non-JSON content (text/html; charset=utf-8).',
        status: 502,
      },
    });
  });


  it('returns mock success response when DEBUG_MOCK_MODE is "success"', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&strType=1',
      ),
      buildTestEnvironment({ DEBUG_MOCK_MODE: 'success' }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const body = await response.json() as { resultCode: string; resultData: { items: { rank: string }[] } };
    expect(body.resultCode).toBe('99');
    expect(body.resultData.items.length).toBeGreaterThan(0);
    expect(body.resultData.items[0].rank).toBe('1');
  });

  it('returns mock error response when DEBUG_MOCK_MODE is "error"', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&strType=1',
      ),
      buildTestEnvironment({ DEBUG_MOCK_MODE: 'error' }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(502);

    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.message).toContain('resultCode 04');
  });

  it('calls upstream when DEBUG_MOCK_MODE is "off"', async () => {
    mockUpstreamFetch();

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&strType=1',
      ),
      buildTestEnvironment({ DEBUG_MOCK_MODE: 'off' }),
    );

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('returns 502 when upstream returns invalid JSON with application/json content type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('this is not valid json{{{', {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }),
    );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-24&strType=1',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(502);
    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.message).toContain('invalid JSON');
    expect(body.error.status).toBe(502);
  });

  it('returns 502 when upstream returns non-2xx status with valid JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          resultCode: '04',
          resultMsg: 'Internal Server Error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        },
      ),
    );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-24&strType=1',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(502);
    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.message).toContain('upstream request failed');
    expect(body.error.status).toBe(502);
  });

  it('returns 405 for unsupported HTTP method (POST)', async () => {
    const response = await worker.fetch(
      new Request('http://localhost/search', { method: 'POST' }),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(405);
    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.message).toContain('Method not allowed');
    expect(body.error.status).toBe(405);
  });

  it('returns 404 for unknown pathname', async () => {
    const response = await worker.fetch(
      new Request('http://localhost/nonexistent'),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(404);
    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.message).toContain('Not found');
    expect(body.error.status).toBe(404);
  });
});

describe('R2 cache for /search', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached response from R2 on cache hit', async () => {
    const cachedData = JSON.stringify({
      resultCode: '99',
      resultData: { items: [{ rank: '1', indexTitle: 'Cached Song' }] },
    });
    const store = new Map<string, string>();
    store.set('cache/2026-03-01_2026-03-20/strType-1.json', cachedData);
    const r2Bucket = createMockR2Bucket(store);
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-20&strType=1',
      ),
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('HIT');
    await expect(response.json()).resolves.toEqual({
      resultCode: '99',
      resultData: { items: [{ rank: '1', indexTitle: 'Cached Song' }] },
    });
  });

  it('stores upstream response in R2 on cache miss', async () => {
    mockUpstreamFetch();
    const r2Bucket = createMockR2Bucket();

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-20&strType=1',
      ),
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('MISS');
    expect(r2Bucket.put).toHaveBeenCalledWith(
      'cache/2026-03-01_2026-03-20/strType-1.json',
      buildSuccessUpstreamBody(),
    );
  });

  it('falls through to upstream when R2 get() throws an exception', async () => {
    const fetchMock = mockUpstreamFetch();
    const r2Bucket = createMockR2Bucket();
    vi.mocked(r2Bucket.get).mockRejectedValue(new Error('R2 read failure'));

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-20&strType=1',
      ),
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
    );

    expect(fetchMock).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('MISS');
    await expect(response.json()).resolves.toEqual({
      resultCode: '99',
      resultData: { items: [{ rank: '1', indexTitle: 'Drowning' }] },
    });
  });

  it('still returns response when R2 put() throws an exception', async () => {
    mockUpstreamFetch();
    const r2Bucket = createMockR2Bucket();
    vi.mocked(r2Bucket.put).mockRejectedValue(new Error('R2 write failure'));

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?chartType=TOP&searchStartDate=2026-03-01&searchEndDate=2026-03-20&strType=1',
      ),
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('MISS');
    await expect(response.json()).resolves.toEqual({
      resultCode: '99',
      resultData: { items: [{ rank: '1', indexTitle: 'Drowning' }] },
    });
  });
});

describe('scheduled handler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('crawls all three strTypes and stores them in R2', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T09:00:00.000Z'));

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(buildSuccessUpstreamBody(), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }),
    );

    const r2Bucket = createMockR2Bucket();
    const waitUntilPromises: Promise<unknown>[] = [];
    const mockContext = {
      waitUntil: (promise: Promise<unknown>) => {
        waitUntilPromises.push(promise);
      },
      passThroughOnException: () => {},
    } as unknown as ExecutionContext;

    await worker.scheduled(
      { scheduledTime: Date.now(), cron: '0 9 * * *' } as ScheduledEvent,
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
      mockContext,
    );

    await Promise.all(waitUntilPromises);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(r2Bucket.put).toHaveBeenCalledTimes(3);
    expect(r2Bucket.put).toHaveBeenCalledWith(
      'cache/2026-03-22_2026-03-22/strType-1.json',
      buildSuccessUpstreamBody(),
    );
    expect(r2Bucket.put).toHaveBeenCalledWith(
      'cache/2026-03-22_2026-03-22/strType-2.json',
      buildSuccessUpstreamBody(),
    );
    expect(r2Bucket.put).toHaveBeenCalledWith(
      'cache/2026-03-22_2026-03-22/strType-3.json',
      buildSuccessUpstreamBody(),
    );

    vi.useRealTimers();
  });

  it('continues crawling remaining strTypes when one fails', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T09:00:00.000Z'));

    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;

      if (callCount === 1) {
        return new Response(
          JSON.stringify({ resultCode: '04', resultMsg: 'error' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          },
        );
      }

      return new Response(buildSuccessUpstreamBody(), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    });

    const r2Bucket = createMockR2Bucket();
    const waitUntilPromises: Promise<unknown>[] = [];
    const mockContext = {
      waitUntil: (promise: Promise<unknown>) => {
        waitUntilPromises.push(promise);
      },
      passThroughOnException: () => {},
    } as unknown as ExecutionContext;

    await worker.scheduled(
      { scheduledTime: Date.now(), cron: '0 9 * * *' } as ScheduledEvent,
      buildTestEnvironment({ R2_TJMEDIA_POPULAR: r2Bucket }),
      mockContext,
    );

    await Promise.all(waitUntilPromises);

    // strType 1 failed, but 2 and 3 should succeed
    expect(r2Bucket.put).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
