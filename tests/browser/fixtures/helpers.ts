import type { Page, Route } from '@playwright/test';
import { expect } from '@playwright/test';
import { MOCK_TJMEDIA_RESPONSE, MOCK_YOUTUBE_SINGLE_RESPONSE } from './mock-data.ts';

/**
 * TJMedia 및 YouTube API 요청을 가로채서 mock 데이터로 응답한다.
 * MOCK_API=true 환경에서만 사용한다.
 */
export async function mockAllApiRequests(page: Page) {
  await page.route('**/search?chartType=*', async (route: Route) => {
    const url = route.request().url();
    if (url.includes('chartType')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_TJMEDIA_RESPONSE),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/search?search_query=*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_YOUTUBE_SINGLE_RESPONSE),
    });
  });
}

/**
 * TJMedia API만 mock한다.
 * MOCK_API=true 환경에서만 사용한다.
 */
export async function mockTJMediaAPI(page: Page) {
  await page.route('**/search?chartType=*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TJMEDIA_RESPONSE),
    });
  });
}

/** 곡 목록이 로드될 때까지 대기한다 */
export async function waitForSongListLoaded(page: Page) {
  await page.locator('.song-item').first().waitFor({ state: 'visible' });
}

/** n번째 곡 항목(0-indexed)의 로케이터를 반환한다 */
export function songItemLocator(page: Page, index: number) {
  return page.locator('.song-item').nth(index);
}

/** 첫 번째 곡을 선택하고 플레이어가 표시될 때까지 대기한다 */
export async function selectFirstSong(page: Page) {
  const youtubeResponse = page.waitForResponse(
    (response) => response.url().includes('search_query') || response.url().includes('search?search_query'),
    { timeout: 30_000 },
  );
  await page.locator('.song-item').first().click();
  await youtubeResponse;
  await expect(page.locator('text=Now Playing')).toBeVisible({ timeout: 30_000 });
}

/** 장르 버튼을 클릭한다 (데스크톱/모바일 공통) */
export async function clickGenreButton(page: Page, genreName: string, isMobile: boolean) {
  if (isMobile) {
    const filterToggle = page
      .locator('header button')
      .filter({ has: page.locator('svg') })
      .first();
    await filterToggle.click();
    await page.getByRole('button', { name: genreName, exact: true }).last().click();
    // BottomSheet가 닫힐 때까지 대기
    await expect(page.getByTestId('bottom-sheet-backdrop')).toBeHidden({ timeout: 5000 });
  } else {
    await page.locator('header').getByRole('button', { name: genreName }).first().click();
  }
}
