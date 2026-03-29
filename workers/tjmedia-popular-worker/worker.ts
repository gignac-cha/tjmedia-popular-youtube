import {
  initializeCORS,
  buildCORSHeaders,
  buildOptionsResponse,
} from '@tjmedia-popular-youtube/workers-tools/cors';
import { errorResponse } from '@tjmedia-popular-youtube/workers-tools/error';
import { htmlResponse } from '@tjmedia-popular-youtube/workers-tools/html';
import { jsonResponse } from '@tjmedia-popular-youtube/workers-tools/json';
import helpDocument from './help.html';
import mockErrorResponse from './fixtures/mock-error-response.json' with { type: 'json' };
import mockSuccessResponse from './fixtures/mock-success-response.json' with { type: 'json' };

const HELP_PATHNAME = '/help';
const SEARCH_PATHNAME = '/search';
const TJMEDIA_SEARCH_URL = 'https://www.tjmedia.com/legacy/api/topAndHot100';
const DEFAULT_CHART_TYPE = 'TOP';
const DEFAULT_STR_TYPE = '1';
const CRAWL_STR_TYPES = ['1', '2', '3'] as const;
const CRAWL_CHART_TYPE = 'TOP';

type DebugMockMode = 'off' | 'success' | 'error';

type WorkerEnvironment = {
  ALLOWED_ORIGINS?: string;
  DEBUG_MOCK_MODE?: string;
  R2_TJMEDIA_POPULAR: R2Bucket;
};

type TJMediaSearchResponse = {
  resultCode?: string;
  resultMsg?: string;
  resultData?: {
    itemsTotalCount: number;
    items: unknown[];
  };
};

const RESULT_CODE = {
  SUCCESS: '99',
  NO_DATA: '98',
  UNKNOWN_ERROR: '04',
} as const;

function buildDefaultDateRange(): {
  searchStartDate: string;
  searchEndDate: string;
} {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    searchStartDate: startDate.toISOString().slice(0, 10),
    searchEndDate: now.toISOString().slice(0, 10),
  };
}

function formatDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toKST(date: Date): Date {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

function getYesterdayKSTDateString(): string {
  const kst = toKST(new Date());
  kst.setUTCDate(kst.getUTCDate() - 1);

  return formatDateString(kst);
}

function getFirstDayOfMonthKSTDateString(): string {
  const kst = toKST(new Date());

  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function getDebugMockMode(environment: WorkerEnvironment): DebugMockMode {
  const value = environment.DEBUG_MOCK_MODE;

  if (value === 'success' || value === 'error') {
    return value;
  }

  return 'off';
}

function handleMockRequest(
  mode: DebugMockMode,
  origin?: string,
): Response | null {
  if (mode === 'success') {
    return jsonResponse(mockSuccessResponse, 200, origin);
  }

  if (mode === 'error') {
    return errorResponse(
      `TJMedia upstream returned error resultCode ${mockErrorResponse.resultCode}: ${mockErrorResponse.resultMsg}.`,
      502,
      origin,
    );
  }

  return null;
}


function buildHeadResponse(origin?: string): Response {
  const headers = buildCORSHeaders(origin);
  headers.set('Content-Type', 'text/plain; charset=utf-8');

  return new Response(null, {
    status: 200,
    headers,
  });
}



async function fetchFromUpstream(
  searchParameters: URLSearchParams,
  userAgent?: string | null,
): Promise<{ upstreamBody: string; upstreamContentType: string; upstreamStatus: number; error?: string }> {
  const upstreamRequestHeaders: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    Origin: 'https://www.tjmedia.com',
    Referer: 'https://www.tjmedia.com/',
  };

  if (userAgent !== null && userAgent !== undefined) {
    upstreamRequestHeaders['User-Agent'] = userAgent;
  }

  const upstreamResponse = await fetch(TJMEDIA_SEARCH_URL, {
    method: 'POST',
    headers: upstreamRequestHeaders,
    body: searchParameters.toString(),
  });

  const upstreamBody = await upstreamResponse.text();
  const upstreamContentType =
    upstreamResponse.headers.get('Content-Type') ?? 'application/octet-stream';

  return {
    upstreamBody,
    upstreamContentType,
    upstreamStatus: upstreamResponse.status,
  };
}

function validateUpstreamResponse(
  upstreamBody: string,
  upstreamContentType: string,
  upstreamStatus: number,
  origin?: string,
): { parsedBody: TJMediaSearchResponse; errorResponse?: Response } {
  if (!upstreamContentType.toLowerCase().includes('application/json')) {
    return {
      parsedBody: {},
      errorResponse: errorResponse(
        `TJMedia upstream returned non-JSON content (${upstreamContentType}).`,
        502,
        origin,
      ),
    };
  }

  let parsedBody: TJMediaSearchResponse;

  try {
    parsedBody = JSON.parse(upstreamBody) as TJMediaSearchResponse;
  } catch {
    return {
      parsedBody: {},
      errorResponse: errorResponse(
        'TJMedia upstream returned invalid JSON.',
        502,
        origin,
      ),
    };
  }

  if (upstreamStatus < 200 || upstreamStatus >= 300) {
    const upstreamMessage = parsedBody.resultMsg ?? 'Unknown upstream error';
    const upstreamCode = parsedBody.resultCode ?? 'unknown';

    return {
      parsedBody,
      errorResponse: errorResponse(
        `TJMedia upstream request failed (${upstreamCode}: ${upstreamMessage}).`,
        502,
        origin,
      ),
    };
  }

  switch (parsedBody.resultCode) {
    case RESULT_CODE.SUCCESS:
      break;

    case RESULT_CODE.NO_DATA:
      return {
        parsedBody: {
          ...parsedBody,
          resultCode: RESULT_CODE.SUCCESS,
          resultData: { itemsTotalCount: 0, items: [] },
        },
      };

    // Pass through as 200 — client checks resultCode and shows error via buildChartErrorMessage
    case RESULT_CODE.UNKNOWN_ERROR:
      return { parsedBody };

    default: {
      const upstreamMessage = parsedBody.resultMsg ?? 'Unknown upstream error';
      const upstreamCode = parsedBody.resultCode ?? 'unknown';

      return {
        parsedBody,
        errorResponse: errorResponse(
          `TJMedia upstream returned error resultCode ${upstreamCode}: ${upstreamMessage}.`,
          502,
          origin,
        ),
      };
    }
  }

  return { parsedBody };
}

async function handleSearchRequest(
  request: Request,
  requestUrl: URL,
  environment: WorkerEnvironment,
): Promise<Response> {
  const origin = request.headers.get('Origin') ?? undefined;
  const searchParameters = new URLSearchParams();
  const upstreamUserAgent = request.headers.get('User-Agent');
  const defaultDateRange = buildDefaultDateRange();

  const searchStartDate =
    requestUrl.searchParams.get('searchStartDate') ??
    defaultDateRange.searchStartDate;
  const searchEndDate =
    requestUrl.searchParams.get('searchEndDate') ??
    defaultDateRange.searchEndDate;
  const chartType =
    requestUrl.searchParams.get('chartType') ?? DEFAULT_CHART_TYPE;
  const strType =
    requestUrl.searchParams.get('strType') ?? DEFAULT_STR_TYPE;

  searchParameters.set('searchStartDate', searchStartDate);
  searchParameters.set('searchEndDate', searchEndDate);
  searchParameters.set('chartType', chartType);
  searchParameters.set('strType', strType);

  const cacheKey = `cache/${searchStartDate}_${searchEndDate}/strType-${strType}.json`;

  try {
    const cachedObject = await environment.R2_TJMEDIA_POPULAR.get(cacheKey);

    if (cachedObject !== null) {
      const cachedBody = await cachedObject.text();
      const headers = buildCORSHeaders(origin);
      headers.set('Content-Type', 'application/json; charset=utf-8');
      headers.set('X-Cache', 'HIT');

      return new Response(cachedBody, {
        status: 200,
        headers,
      });
    }
  } catch {
    // R2 read failed, fall through to upstream
  }

  const upstream = await fetchFromUpstream(searchParameters, upstreamUserAgent);
  const validation = validateUpstreamResponse(
    upstream.upstreamBody,
    upstream.upstreamContentType,
    upstream.upstreamStatus,
    origin,
  );

  if (validation.errorResponse !== undefined) {
    return validation.errorResponse;
  }

  const responseBody = JSON.stringify(validation.parsedBody);

  try {
    await environment.R2_TJMEDIA_POPULAR.put(cacheKey, responseBody);
  } catch {
    // R2 write failed, still return the response
  }

  const headers = buildCORSHeaders(origin);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Cache', 'MISS');

  return new Response(responseBody, {
    status: 200,
    headers,
  });
}

const CRAWL_MAX_RETRIES = 3;
const CRAWL_RETRY_DELAY_MILLISECONDS = 5000;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function crawlAndStore(
  strType: string,
  startDate: string,
  endDate: string,
  environment: WorkerEnvironment,
): Promise<boolean> {
  const searchParameters = new URLSearchParams();
  searchParameters.set('searchStartDate', startDate);
  searchParameters.set('searchEndDate', endDate);
  searchParameters.set('chartType', CRAWL_CHART_TYPE);
  searchParameters.set('strType', strType);

  const upstream = await fetchFromUpstream(searchParameters);
  const validation = validateUpstreamResponse(
    upstream.upstreamBody,
    upstream.upstreamContentType,
    upstream.upstreamStatus,
  );

  if (validation.errorResponse !== undefined) {
    console.error(`Scheduled crawl failed for strType ${strType} (${startDate}_${endDate}): upstream returned error.`);
    return false;
  }

  if (validation.parsedBody.resultCode !== RESULT_CODE.SUCCESS) {
    console.error(
      `Scheduled crawl skipped for strType ${strType} (${startDate}_${endDate}): resultCode ${validation.parsedBody.resultCode ?? 'unknown'}.`,
    );
    return false;
  }

  const cacheKey = `cache/${startDate}_${endDate}/strType-${strType}.json`;
  await environment.R2_TJMEDIA_POPULAR.put(cacheKey, JSON.stringify(validation.parsedBody));
  console.log(`Scheduled crawl succeeded for strType ${strType}: stored at ${cacheKey}.`);

  return true;
}

async function crawlWithRetry(
  strType: string,
  startDate: string,
  endDate: string,
  environment: WorkerEnvironment,
): Promise<void> {
  const label = `${startDate}_${endDate}`;

  for (let attempt = 1; attempt <= CRAWL_MAX_RETRIES; attempt++) {
    try {
      const succeeded = await crawlAndStore(strType, startDate, endDate, environment);
      // Whether true or false, the upstream responded — no need to retry
      if (!succeeded) {
        console.error(`Scheduled crawl gave up for strType ${strType} (${label}): upstream returned non-success.`);
      }
      return;
    } catch (error) {
      // Network error or unexpected failure — retry
      console.error(
        `Scheduled crawl failed for strType ${strType} (${label}) (attempt ${attempt}/${CRAWL_MAX_RETRIES}):`,
        error,
      );

      if (attempt < CRAWL_MAX_RETRIES) {
        await delay(CRAWL_RETRY_DELAY_MILLISECONDS);
      }
    }
  }

  console.error(`Scheduled crawl gave up for strType ${strType} (${label}) after ${CRAWL_MAX_RETRIES} attempts.`);
}

async function handleScheduledEvent(
  environment: WorkerEnvironment,
): Promise<void> {
  const yesterday = getYesterdayKSTDateString();
  const firstDayOfMonth = getFirstDayOfMonthKSTDateString();

  for (const strType of CRAWL_STR_TYPES) {
    // Daily archive: yesterday only
    await crawlWithRetry(strType, yesterday, yesterday, environment);

    // This month cache: 1st of month to yesterday
    if (firstDayOfMonth !== yesterday) {
      await crawlWithRetry(strType, firstDayOfMonth, yesterday, environment);
    }
  }
}

type RouteContext = {
  request: Request;
  requestUrl: URL;
  environment: WorkerEnvironment;
  origin?: string;
};

type RouteHandler = (context: RouteContext) => Response | Promise<Response>;


function handleHelpRoute({ origin }: RouteContext): Response {
  return htmlResponse(helpDocument, 200, origin);
}

function handleSearchRoute(context: RouteContext): Response | Promise<Response> {
  const mockMode = getDebugMockMode(context.environment);
  const mockResponse = handleMockRequest(mockMode, context.origin);

  if (mockResponse !== null) {
    return mockResponse;
  }

  return handleSearchRequest(context.request, context.requestUrl, context.environment);
}

function handleOptionsRoute({ origin }: RouteContext): Response {
  return buildOptionsResponse(origin);
}

function handleHeadRoute({ origin }: RouteContext): Response {
  return buildHeadResponse(origin);
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
  async fetch(
    request: Request,
    environment: WorkerEnvironment,
  ): Promise<Response> {
    initializeCORS(environment.ALLOWED_ORIGINS);
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('Origin') ?? undefined;

    return routeRequest({ request, requestUrl, environment, origin });
  },

  async scheduled(
    _event: ScheduledEvent,
    environment: WorkerEnvironment,
    context: ExecutionContext,
  ): Promise<void> {
    context.waitUntil(handleScheduledEvent(environment));
  },
};

export default worker;
