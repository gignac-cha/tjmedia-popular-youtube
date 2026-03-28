import { describe, expect, it, beforeEach } from 'vitest';
import { initializeCORS, buildCORSHeaders, buildOptionsResponse } from '../cors.ts';

describe('initializeCORS', () => {
  beforeEach(() => {
    initializeCORS(undefined);
  });

  it('rejects all origins when initialized with undefined', () => {
    initializeCORS(undefined);
    const headers = buildCORSHeaders('http://localhost:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('rejects all origins when initialized with empty string', () => {
    initializeCORS('');
    const headers = buildCORSHeaders('http://localhost:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('trims whitespace from patterns', () => {
    initializeCORS(' https://a.com , https://b.com ');
    expect(buildCORSHeaders('https://a.com').get('Access-Control-Allow-Origin')).toBe('https://a.com');
    expect(buildCORSHeaders('https://b.com').get('Access-Control-Allow-Origin')).toBe('https://b.com');
  });
});

describe('exact match', () => {
  beforeEach(() => {
    initializeCORS('https://example.com,http://localhost:5173');
  });

  it('allows exact match', () => {
    const headers = buildCORSHeaders('https://example.com');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('rejects non-matching origin', () => {
    const headers = buildCORSHeaders('https://evil.com');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('rejects undefined origin', () => {
    const headers = buildCORSHeaders(undefined);
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('is case-sensitive', () => {
    const headers = buildCORSHeaders('https://Example.com');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('wildcard match', () => {
  beforeEach(() => {
    initializeCORS('http://localhost:*,https://*.example.com');
  });

  it('matches wildcard port', () => {
    const headers = buildCORSHeaders('http://localhost:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });

  it('matches wildcard port with different port', () => {
    const headers = buildCORSHeaders('http://localhost:8080');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8080');
  });

  it('matches wildcard subdomain', () => {
    const headers = buildCORSHeaders('https://app.example.com');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });

  it('rejects non-matching wildcard', () => {
    const headers = buildCORSHeaders('https://example.com');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('escapes regex special characters in pattern', () => {
    initializeCORS('https://my.app.example.com');
    const headers = buildCORSHeaders('https://myXapp.example.com');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('CIDR match', () => {
  beforeEach(() => {
    initializeCORS(
      'http://127.0.0.0/8:*,http://10.0.0.0/8:*,http://172.16.0.0/12:*,http://192.168.0.0/16:*',
    );
  });

  it('matches 127.0.0.1 (loopback)', () => {
    const headers = buildCORSHeaders('http://127.0.0.1:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:5173');
  });

  it('matches 127.255.255.255 (loopback range end)', () => {
    const headers = buildCORSHeaders('http://127.255.255.255:3000');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://127.255.255.255:3000');
  });

  it('matches 10.x.x.x (class A private)', () => {
    const headers = buildCORSHeaders('http://10.0.1.50:8080');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://10.0.1.50:8080');
  });

  it('matches 172.16.x.x (class B private start)', () => {
    const headers = buildCORSHeaders('http://172.16.0.1:5174');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://172.16.0.1:5174');
  });

  it('matches 172.31.x.x (class B private end)', () => {
    const headers = buildCORSHeaders('http://172.31.255.254:5174');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://172.31.255.254:5174');
  });

  it('rejects 172.32.x.x (outside /12 range)', () => {
    const headers = buildCORSHeaders('http://172.32.0.1:5174');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('matches 192.168.x.x (class C private)', () => {
    const headers = buildCORSHeaders('http://192.168.1.100:3000');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://192.168.1.100:3000');
  });

  it('rejects public IP', () => {
    const headers = buildCORSHeaders('http://8.8.8.8:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('rejects 192.169.x.x (outside /16 range)', () => {
    const headers = buildCORSHeaders('http://192.169.0.1:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('CIDR port matching', () => {
  it('matches specific port', () => {
    initializeCORS('http://192.168.0.0/16:8080');
    const headers = buildCORSHeaders('http://192.168.1.1:8080');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://192.168.1.1:8080');
  });

  it('rejects wrong port', () => {
    initializeCORS('http://192.168.0.0/16:8080');
    const headers = buildCORSHeaders('http://192.168.1.1:9090');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('matches wildcard port', () => {
    initializeCORS('http://192.168.0.0/16:*');
    const headers = buildCORSHeaders('http://192.168.1.1:12345');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://192.168.1.1:12345');
  });

  it('matches implicit HTTP port 80', () => {
    initializeCORS('http://192.168.0.0/16:80');
    const headers = buildCORSHeaders('http://192.168.1.1');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://192.168.1.1');
  });

  it('matches implicit HTTPS port 443', () => {
    initializeCORS('https://192.168.0.0/16:443');
    const headers = buildCORSHeaders('https://192.168.1.1');
    expect(headers.get('Access-Control-Allow-Origin')).toBe('https://192.168.1.1');
  });
});

describe('CIDR edge cases', () => {
  it('handles /32 prefix (exact IP)', () => {
    initializeCORS('http://192.168.1.1/32:*');
    expect(buildCORSHeaders('http://192.168.1.1:5173').get('Access-Control-Allow-Origin')).toBe('http://192.168.1.1:5173');
    expect(buildCORSHeaders('http://192.168.1.2:5173').get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('handles /0 prefix (any IP)', () => {
    initializeCORS('http://0.0.0.0/0:*');
    expect(buildCORSHeaders('http://1.2.3.4:80').get('Access-Control-Allow-Origin')).toBe('http://1.2.3.4:80');
  });

  it('rejects invalid CIDR prefix > 32', () => {
    initializeCORS('http://192.168.0.0/33:*');
    const headers = buildCORSHeaders('http://192.168.1.1:5173');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('rejects invalid origin URL', () => {
    initializeCORS('http://192.168.0.0/16:*');
    const headers = buildCORSHeaders('not-a-url');
    expect(headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('mixed patterns', () => {
  beforeEach(() => {
    initializeCORS('https://gignac-cha.github.io,http://localhost:*,http://192.168.0.0/16:*');
  });

  it('matches exact origin', () => {
    expect(buildCORSHeaders('https://gignac-cha.github.io').get('Access-Control-Allow-Origin')).toBe('https://gignac-cha.github.io');
  });

  it('matches wildcard origin', () => {
    expect(buildCORSHeaders('http://localhost:5174').get('Access-Control-Allow-Origin')).toBe('http://localhost:5174');
  });

  it('matches CIDR origin', () => {
    expect(buildCORSHeaders('http://192.168.0.50:3000').get('Access-Control-Allow-Origin')).toBe('http://192.168.0.50:3000');
  });

  it('rejects unmatched origin', () => {
    expect(buildCORSHeaders('https://evil.com').get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('buildCORSHeaders', () => {
  beforeEach(() => {
    initializeCORS('https://example.com');
  });

  it('always includes Allow-Methods header', () => {
    const headers = buildCORSHeaders(undefined);
    expect(headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT,PATCH,DELETE,OPTIONS');
  });

  it('always includes Allow-Headers header', () => {
    const headers = buildCORSHeaders(undefined);
    expect(headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
  });

  it('always sets Vary header regardless of origin', () => {
    expect(buildCORSHeaders('https://example.com').get('Vary')).toBe('Origin');
    expect(buildCORSHeaders('https://evil.com').get('Vary')).toBe('Origin');
    expect(buildCORSHeaders(undefined).get('Vary')).toBe('Origin');
  });
});

describe('buildOptionsResponse', () => {
  beforeEach(() => {
    initializeCORS('https://example.com');
  });

  it('returns 204 status', () => {
    const response = buildOptionsResponse('https://example.com');
    expect(response.status).toBe(204);
  });

  it('returns null body', () => {
    const response = buildOptionsResponse('https://example.com');
    expect(response.body).toBeNull();
  });

  it('includes CORS headers for allowed origin', () => {
    const response = buildOptionsResponse('https://example.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('excludes origin header for disallowed origin', () => {
    const response = buildOptionsResponse('https://evil.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
