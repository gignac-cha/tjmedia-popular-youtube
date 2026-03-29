import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchYouTubeVideos } from './youtube.ts';

describe('fetchYouTubeVideos', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed response on success', async () => {
    const mockResponse = {
      query: 'Drowning WOODZ',
      items: [{ videoId: 'abc', title: 'Drowning', thumbnailUrl: 'https://img', source: 'topic', width: 480, height: 360 }],
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await fetchYouTubeVideos('Drowning WOODZ');

    expect(result.query).toBe('Drowning WOODZ');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].videoId).toBe('abc');
  });

  it('includes search_query in URL parameters', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ query: 'test', items: [] }), { status: 200 }),
    );

    await fetchYouTubeVideos('아이유 밤편지');

    const calledUrl = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('search_query')).toBe('아이유 밤편지');
  });

  it('throws when response is not ok with worker error body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'search failed', status: 502 } }),
        { status: 502 },
      ),
    );

    await expect(fetchYouTubeVideos('test')).rejects.toThrow('search failed');
  });

  it('throws generic error when response is not ok with non-JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('<html>Bad Gateway</html>', { status: 502 }),
    );

    await expect(fetchYouTubeVideos('test')).rejects.toThrow(
      'YouTube worker request failed with 502.',
    );
  });

  it('throws when response body is invalid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('not json', { status: 200 }),
    );

    await expect(fetchYouTubeVideos('test')).rejects.toThrow(
      'YouTube worker returned invalid JSON.',
    );
  });
});
