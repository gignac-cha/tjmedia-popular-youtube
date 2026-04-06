import { defineConfig, devices } from '@playwright/test';

const isLocal = process.env.TEST_LOCAL === 'true';
const isMock = process.env.TEST_MOCK === 'true';

const DEPLOYED_URL = 'https://gignac-cha.github.io/tjmedia-popular-youtube/';
const LOCAL_URL = 'http://localhost:5173/tjmedia-popular-youtube/';
const PREVIEW_URL = 'http://localhost:4173/tjmedia-popular-youtube/';

const BASE_URL = process.env.BASE_URL ?? (isMock ? PREVIEW_URL : isLocal ? LOCAL_URL : DEPLOYED_URL);

const liveWebServer = [
  {
    command: 'pnpm --filter @tjmedia-popular-youtube/tjmedia-popular-worker exec wrangler dev --env development --port 8788',
    url: 'http://localhost:8788',
    name: 'TJMedia Worker',
    timeout: 30_000,
    reuseExistingServer: true,
  },
  {
    command: 'pnpm --filter @tjmedia-popular-youtube/youtube-search-worker exec wrangler dev --env development --port 8789',
    url: 'http://localhost:8789',
    name: 'YouTube Worker',
    timeout: 30_000,
    reuseExistingServer: true,
  },
  {
    command: 'pnpm --filter @tjmedia-popular-youtube/web exec vite dev',
    url: LOCAL_URL,
    name: 'Web',
    timeout: 30_000,
    reuseExistingServer: true,
  },
];

const mockWebServer = [
  {
    command: 'pnpm --filter @tjmedia-popular-youtube/web exec vite build && pnpm --filter @tjmedia-popular-youtube/web exec vite preview --port 4173',
    url: PREVIEW_URL,
    name: 'Web Preview',
    timeout: 60_000,
    reuseExistingServer: true,
    env: {
      VITE_TJMEDIA_POPULAR_WORKER_URL: 'https://tjmedia-mock.placeholder.dev',
      VITE_YOUTUBE_SEARCH_WORKER_URL: 'https://youtube-mock.placeholder.dev',
    },
  },
];

export default defineConfig({
  testDir: './scenarios',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? 'github' : 'html',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  ...(isLocal && { webServer: liveWebServer }),
  ...(isMock && { webServer: mockWebServer }),

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'live-desktop',
      use: { ...devices['Desktop Chrome'] },
      grepInvert: /@mock/,
    },
    {
      name: 'live-mobile',
      use: { ...devices['Pixel 5'] },
      grepInvert: /@mock/,
    },
    {
      name: 'mock-desktop',
      use: { ...devices['Desktop Chrome'] },
      grep: /@mock/,
    },
    {
      name: 'mock-mobile',
      use: { ...devices['Pixel 5'] },
      grep: /@mock/,
    },
  ],
});
