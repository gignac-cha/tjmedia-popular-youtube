let allowedPatterns: string[] = [];

export function initializeCORS(origins: string | undefined): void {
  if (origins === undefined || origins === '') {
    allowedPatterns = [];
    return;
  }
  allowedPatterns = origins.split(',').map((pattern) => pattern.trim());
}

function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let result = 0;

  for (const part of parts) {
    const octet = Number.parseInt(part, 10);
    if (Number.isNaN(octet) || octet < 0 || octet > 255) return null;
    result = (result << 8) | octet;
  }

  return result >>> 0;
}

function matchesCIDR(ip: string, cidr: string): boolean {
  const [base, prefixLength] = cidr.split('/');
  const prefix = Number.parseInt(prefixLength, 10);

  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const ipNumber = ipToNumber(ip);
  const baseNumber = ipToNumber(base);

  if (ipNumber === null || baseNumber === null) return false;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;

  return (ipNumber & mask) === (baseNumber & mask);
}

function matchesWildcard(origin: string, pattern: string): boolean {
  const regexString = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  return new RegExp(`^${regexString}$`).test(origin);
}

const CIDR_PATTERN_REGEX = /^(https?):\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}):(.+)$/;

function parseCIDRPattern(pattern: string): { protocol: string; cidr: string; port: string } | null {
  const match = CIDR_PATTERN_REGEX.exec(pattern);
  if (match === null) return null;
  return { protocol: match[1], cidr: match[2], port: match[3] };
}

function matchesOrigin(origin: string, pattern: string): boolean {
  const cidrPattern = parseCIDRPattern(pattern);

  if (cidrPattern === null) {
    if (pattern.includes('*')) {
      return matchesWildcard(origin, pattern);
    }
    return origin === pattern;
  }

  try {
    const url = new URL(origin);
    const originProtocol = url.protocol.replace(':', '');

    if (originProtocol !== cidrPattern.protocol) return false;
    if (!matchesCIDR(url.hostname, cidrPattern.cidr)) return false;
    if (cidrPattern.port === '*') return true;

    return url.port === cidrPattern.port
      || (url.port === '' && originProtocol === 'https' && cidrPattern.port === '443')
      || (url.port === '' && originProtocol === 'http' && cidrPattern.port === '80');
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string): boolean {
  return allowedPatterns.some((pattern) => matchesOrigin(origin, pattern));
}

export function buildCORSHeaders(origin?: string): Headers {
  const headers = new Headers();

  if (origin !== undefined && isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return headers;
}

export function buildOptionsResponse(origin?: string): Response {
  return new Response(null, {
    status: 204,
    headers: buildCORSHeaders(origin),
  });
}
