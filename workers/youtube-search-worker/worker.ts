import {
  initializeCORS,
  buildCORSHeaders,
  buildOptionsResponse,
} from '@tjmedia-popular-youtube/workers-tools/cors';
import { errorResponse } from '@tjmedia-popular-youtube/workers-tools/error';
import { htmlResponse } from '@tjmedia-popular-youtube/workers-tools/html';
import { jsonResponse } from '@tjmedia-popular-youtube/workers-tools/json';
import helpDocument from './help.html';

const HELP_PATHNAME = '/help';
const SEARCH_PATHNAME = '/search';
const YOUTUBE_SEARCH_URL = 'https://www.youtube.com/results';
const REQUIRED_QUERY_PARAMETER_NAME = 'search_query';
const YT_INITIAL_DATA_PREFIX = 'var ytInitialData = ';

type SearchSource = 'topic' | 'plain';

type YouTubeVideoItem = {
  videoId: string;
  title: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  source: SearchSource;
};

type YouTubeSearchResponse = {
  query: string;
  items: YouTubeVideoItem[];
};

type YouTubeThumbnail = {
  url?: string;
  width?: number;
  height?: number;
};

type YouTubeVideoRenderer = {
  videoId?: string;
  title?: {
    runs?: Array<{
      text?: string;
    }>;
  };
  thumbnail?: {
    thumbnails?: YouTubeThumbnail[];
  };
};

type YouTubeSearchContents = {
  contents?: {
    twoColumnSearchResultsRenderer?: {
      primaryContents?: {
        sectionListRenderer?: {
          contents?: Array<{
            itemSectionRenderer?: {
              contents?: Array<{
                videoRenderer?: YouTubeVideoRenderer;
              }>;
            };
          }>;
        };
      };
    };
  };
};

function buildHeadResponse(origin?: string): Response {
  const headers = buildCORSHeaders(origin);
  headers.set('Content-Type', 'text/plain; charset=utf-8');

  return new Response(null, {
    status: 200,
    headers,
  });
}


function extractJsonObjectLiteral(
  sourceText: string,
  startIndex: number,
): string {
  let depth = 0;
  let isInsideString = false;
  let isEscapingCharacter = false;
  let jsonStartIndex = -1;

  for (let index = startIndex; index < sourceText.length; index += 1) {
    const currentCharacter = sourceText[index];

    if (jsonStartIndex === -1) {
      if (currentCharacter === '{') {
        jsonStartIndex = index;
        depth = 1;
      }

      continue;
    }

    if (isEscapingCharacter) {
      isEscapingCharacter = false;
      continue;
    }

    if (currentCharacter === '\\') {
      isEscapingCharacter = true;
      continue;
    }

    if (currentCharacter === '"') {
      isInsideString = !isInsideString;
      continue;
    }

    if (isInsideString) {
      continue;
    }

    if (currentCharacter === '{') {
      depth += 1;
      continue;
    }

    if (currentCharacter === '}') {
      depth -= 1;

      if (depth === 0) {
        return sourceText.slice(jsonStartIndex, index + 1);
      }
    }
  }

  throw new Error('Failed to extract ytInitialData JSON.');
}

function getLargestThumbnail(
  thumbnails: YouTubeThumbnail[],
): YouTubeThumbnail | undefined {
  return thumbnails.reduce<YouTubeThumbnail | undefined>(
    (largestThumbnail, currentThumbnail) => {
      if (largestThumbnail === undefined) {
        return currentThumbnail;
      }

      const largestArea =
        (largestThumbnail.width ?? 0) * (largestThumbnail.height ?? 0);
      const currentArea =
        (currentThumbnail.width ?? 0) * (currentThumbnail.height ?? 0);

      return currentArea > largestArea ? currentThumbnail : largestThumbnail;
    },
    undefined,
  );
}

function normalizeVideoRenderer(
  videoRenderer: YouTubeVideoRenderer,
  source: SearchSource,
): YouTubeVideoItem | null {
  const videoId = videoRenderer.videoId?.trim();
  const title = videoRenderer.title?.runs
    ?.map((titleRun) => titleRun.text ?? '')
    .join('')
    .trim();
  const thumbnails = videoRenderer.thumbnail?.thumbnails ?? [];
  const largestThumbnail = getLargestThumbnail(thumbnails);

  if (
    videoId === undefined ||
    videoId.length === 0 ||
    title === undefined ||
    title.length === 0 ||
    largestThumbnail?.url === undefined
  ) {
    return null;
  }

  return {
    videoId,
    title,
    width: largestThumbnail.width ?? 0,
    height: largestThumbnail.height ?? 0,
    thumbnailUrl: largestThumbnail.url,
    source,
  };
}

function parseYouTubeVideoItems(
  searchHtml: string,
  source: SearchSource,
): YouTubeVideoItem[] {
  const startIndex = searchHtml.indexOf(YT_INITIAL_DATA_PREFIX);

  if (startIndex === -1) {
    throw new Error('YouTube search HTML did not include ytInitialData.');
  }

  const jsonText = extractJsonObjectLiteral(
    searchHtml,
    startIndex + YT_INITIAL_DATA_PREFIX.length,
  );
  const initialData = JSON.parse(jsonText) as YouTubeSearchContents;

  return (
    initialData.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents ?? []
  )
    .flatMap((section) => section.itemSectionRenderer?.contents ?? [])
    .flatMap((item) => {
      const normalizedVideo = item.videoRenderer
        ? normalizeVideoRenderer(item.videoRenderer, source)
        : null;

      return normalizedVideo === null ? [] : [normalizedVideo];
    });
}

function mergeVideoItems(
  topicVideoItems: YouTubeVideoItem[],
  plainVideoItems: YouTubeVideoItem[],
): YouTubeVideoItem[] {
  const uniqueVideoItems = new Map<string, YouTubeVideoItem>();

  for (const videoItem of [...topicVideoItems, ...plainVideoItems]) {
    if (!uniqueVideoItems.has(videoItem.videoId)) {
      uniqueVideoItems.set(videoItem.videoId, videoItem);
    }
  }

  return [...uniqueVideoItems.values()];
}

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function fetchSearchHtml(
  searchQuery: string,
): Promise<string> {
  const upstreamUrl = new URL(YOUTUBE_SEARCH_URL);
  upstreamUrl.searchParams.set(REQUIRED_QUERY_PARAMETER_NAME, searchQuery);

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7',
      'User-Agent': DESKTOP_USER_AGENT,
    },
  });

  if (!upstreamResponse.ok) {
    throw new Error(
      `YouTube search request failed with ${upstreamResponse.status}.`,
    );
  }

  return upstreamResponse.text();
}

async function handleSearchRequest(
  request: Request,
  requestUrl: URL,
): Promise<Response> {
  const origin = request.headers.get('Origin') ?? undefined;
  const searchQuery = requestUrl.searchParams.get(
    REQUIRED_QUERY_PARAMETER_NAME,
  );

  if (searchQuery === null || searchQuery.trim().length === 0) {
    return errorResponse(
      `Missing query parameter: ${REQUIRED_QUERY_PARAMETER_NAME}`,
      400,
      origin,
    );
  }

  try {
    const [topicSearchHtml, plainSearchHtml] = await Promise.all([
      fetchSearchHtml(`${searchQuery} topic`),
      fetchSearchHtml(searchQuery),
    ]);

    const topicVideoItems = parseYouTubeVideoItems(topicSearchHtml, 'topic');
    const plainVideoItems = parseYouTubeVideoItems(plainSearchHtml, 'plain');
    const responseBody: YouTubeSearchResponse = {
      query: searchQuery,
      items: mergeVideoItems(topicVideoItems, plainVideoItems),
    };

    return jsonResponse(responseBody, 200, origin);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown YouTube worker error.';
    return errorResponse(message, 502, origin);
  }
}

type RouteContext = {
  request: Request;
  requestUrl: URL;
  origin?: string;
};

type RouteHandler = (context: RouteContext) => Response | Promise<Response>;

function handleOptionsRoute({ origin }: RouteContext): Response {
  return buildOptionsResponse(origin);
}

function handleHeadRoute({ origin }: RouteContext): Response {
  return buildHeadResponse(origin);
}


function handleHelpRoute({ origin }: RouteContext): Response {
  return htmlResponse(helpDocument, 200, origin);
}

function handleSearchRoute({ request, requestUrl }: RouteContext): Promise<Response> {
  return handleSearchRequest(request, requestUrl);
}

const getRoutes: Record<string, RouteHandler> = {
  '/': handleHelpRoute,
  [HELP_PATHNAME]: handleHelpRoute,
  [SEARCH_PATHNAME]: handleSearchRoute,
};

const methodRoutes: Record<string, Record<string, RouteHandler> | RouteHandler> = {
  OPTIONS: handleOptionsRoute,
  HEAD: handleHeadRoute,
  GET: getRoutes,
};

function routeRequest(context: RouteContext): Response | Promise<Response> {
  const methodEntry = methodRoutes[context.request.method];

  if (methodEntry === undefined) {
    return errorResponse('Method not allowed', 405, context.origin);
  }

  if (typeof methodEntry === 'function') {
    return methodEntry(context);
  }

  const pathHandler = methodEntry[context.requestUrl.pathname];

  if (pathHandler === undefined) {
    return errorResponse('Not found', 404, context.origin);
  }

  return pathHandler(context);
}

const worker = {
  async fetch(request: Request, environment?: { ALLOWED_ORIGINS?: string }): Promise<Response> {
    initializeCORS(environment?.ALLOWED_ORIGINS);
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('Origin') ?? undefined;

    return routeRequest({ request, requestUrl, origin });
  },
};

export default worker;
