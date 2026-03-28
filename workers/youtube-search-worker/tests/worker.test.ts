import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../worker.ts';

type WorkerEnvironment = {
  ALLOWED_ORIGINS?: string;
};

const TEST_ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:5174';

function buildTestEnvironment(overrides: Partial<WorkerEnvironment> = {}): WorkerEnvironment {
  return {
    ALLOWED_ORIGINS: TEST_ALLOWED_ORIGINS,
    ...overrides,
  };
}

function buildYouTubeSearchHtml(
  videos: Array<{ videoId: string; title: string }>,
): string {
  return `<!doctype html><html><body><script>var ytInitialData = ${JSON.stringify(
    {
      contents: {
        twoColumnSearchResultsRenderer: {
          primaryContents: {
            sectionListRenderer: {
              contents: [
                {
                  itemSectionRenderer: {
                    contents: videos.map((video) => ({
                      videoRenderer: {
                        videoId: video.videoId,
                        title: {
                          runs: [{ text: video.title }],
                        },
                        thumbnail: {
                          thumbnails: [
                            {
                              url: `https://i.ytimg.com/vi/${video.videoId}/default.jpg`,
                              width: 120,
                              height: 90,
                            },
                            {
                              url: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
                              width: 480,
                              height: 360,
                            },
                          ],
                        },
                      },
                    })),
                  },
                },
              ],
            },
          },
        },
      },
    },
  )};</script></body></html>`;
}

describe('youtube search worker', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['/', '/help'])('returns the help document at %s', async (pathname) => {
    const response = await worker.fetch(new Request(`http://localhost${pathname}`), buildTestEnvironment());
    const responseText = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(responseText).toContain('YouTube Search Worker');
    expect(responseText).toContain('topic-first deduped YouTube video JSON');
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

  it('returns topic-first deduped video results', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          buildYouTubeSearchHtml([
            { videoId: 'topic-video', title: 'IU - Topic Official Audio' },
            { videoId: 'shared-video', title: 'IU - Shared Topic Result' },
          ]),
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=UTF-8',
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          buildYouTubeSearchHtml([
            { videoId: 'shared-video', title: 'IU - Shared Search Result' },
            { videoId: 'plain-video', title: 'IU Live Clip' },
          ]),
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=UTF-8',
            },
          },
        ),
      );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?search_query=%EC%95%84%EC%9D%B4%EC%9C%A0%20%EB%B0%A4%ED%8E%B8%EC%A7%80',
        {
          headers: {
            Origin: 'http://localhost:5173',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        },
      ),
      buildTestEnvironment(),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      new URL(
        'https://www.youtube.com/results?search_query=%EC%95%84%EC%9D%B4%EC%9C%A0+%EB%B0%A4%ED%8E%B8%EC%A7%80+topic',
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Chrome/'),
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        'https://www.youtube.com/results?search_query=%EC%95%84%EC%9D%B4%EC%9C%A0+%EB%B0%A4%ED%8E%B8%EC%A7%80',
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Chrome/'),
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    );
    await expect(response.json()).resolves.toEqual({
      query: '아이유 밤편지',
      items: [
        {
          videoId: 'topic-video',
          title: 'IU - Topic Official Audio',
          width: 480,
          height: 360,
          thumbnailUrl: 'https://i.ytimg.com/vi/topic-video/hqdefault.jpg',
          source: 'topic',
        },
        {
          videoId: 'shared-video',
          title: 'IU - Shared Topic Result',
          width: 480,
          height: 360,
          thumbnailUrl: 'https://i.ytimg.com/vi/shared-video/hqdefault.jpg',
          source: 'topic',
        },
        {
          videoId: 'plain-video',
          title: 'IU Live Clip',
          width: 480,
          height: 360,
          thumbnailUrl: 'https://i.ytimg.com/vi/plain-video/hqdefault.jpg',
          source: 'plain',
        },
      ],
    });
  });

  it('returns a worker error when youtube html cannot be parsed', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('<html><body>no ytInitialData here</body></html>', {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=UTF-8',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response('<html><body>no ytInitialData here</body></html>', {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=UTF-8',
          },
        }),
      );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?search_query=%EC%95%84%EC%9D%B4%EC%9C%A0',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'YouTube search HTML did not include ytInitialData.',
        status: 502,
      },
    });
  });

  it('rejects a missing search query', async () => {
    const response = await worker.fetch(new Request('http://localhost/search'), buildTestEnvironment());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Missing query parameter: search_query',
        status: 400,
      },
    });
  });

  it('rejects an unsupported HTTP method', async () => {
    const response = await worker.fetch(
      new Request('http://localhost/search', { method: 'POST' }),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Method not allowed',
        status: 405,
      },
    });
  });

  it('returns 404 for an unknown pathname', async () => {
    const response = await worker.fetch(
      new Request('http://localhost/nonexistent'),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Not found',
        status: 404,
      },
    });
  });

  it('returns 502 when extractJsonObjectLiteral fails on malformed ytInitialData', async () => {
    const malformedHtml =
      '<html><body><script>var ytInitialData = not valid json at all;</script></body></html>';

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(malformedHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(malformedHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        }),
      );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?search_query=%EC%95%84%EC%9D%B4%EC%9C%A0',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(502);
    const body = await response.json() as { error: { message: string; status: number } };
    expect(body.error.status).toBe(502);
  });

  it('filters out video items with missing videoId or title', async () => {
    const htmlWithIncompleteItems = `<!doctype html><html><body><script>var ytInitialData = ${JSON.stringify(
      {
        contents: {
          twoColumnSearchResultsRenderer: {
            primaryContents: {
              sectionListRenderer: {
                contents: [
                  {
                    itemSectionRenderer: {
                      contents: [
                        {
                          videoRenderer: {
                            title: {
                              runs: [{ text: 'Missing videoId' }],
                            },
                            thumbnail: {
                              thumbnails: [
                                {
                                  url: 'https://i.ytimg.com/vi/missing/default.jpg',
                                  width: 120,
                                  height: 90,
                                },
                              ],
                            },
                          },
                        },
                        {
                          videoRenderer: {
                            videoId: 'no-title',
                            thumbnail: {
                              thumbnails: [
                                {
                                  url: 'https://i.ytimg.com/vi/no-title/default.jpg',
                                  width: 120,
                                  height: 90,
                                },
                              ],
                            },
                          },
                        },
                        {
                          videoRenderer: {
                            videoId: 'valid-video',
                            title: {
                              runs: [{ text: 'Valid Video Title' }],
                            },
                            thumbnail: {
                              thumbnails: [
                                {
                                  url: 'https://i.ytimg.com/vi/valid-video/hqdefault.jpg',
                                  width: 480,
                                  height: 360,
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    )};</script></body></html>`;

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(htmlWithIncompleteItems, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(htmlWithIncompleteItems, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        }),
      );

    const response = await worker.fetch(
      new Request(
        'http://localhost/search?search_query=%EC%95%84%EC%9D%B4%EC%9C%A0',
      ),
      buildTestEnvironment(),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      query: string;
      items: Array<{ videoId: string; title: string }>;
    };
    expect(body.items).toHaveLength(1);
    expect(body.items[0].videoId).toBe('valid-video');
    expect(body.items[0].title).toBe('Valid Video Title');
  });
});
