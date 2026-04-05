import { defineConfig, devices } from '@playwright/test';

const isLocal = process.env.TEST_LOCAL === 'true';

const DEPLOYED_URL = 'https://gignac-cha.github.io/tjmedia-popular-youtube/';
const LOCAL_URL = 'http://localhost:5173/tjmedia-popular-youtube/';

const BASE_URL = process.env.BASE_URL ?? (isLocal ? LOCAL_URL : DEPLOYED_URL);

export default defineConfig({
  testDir: './scenarios',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? 'github' : 'html',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  ...(isLocal && {
    webServer: [
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
    ],
  }),

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
