import { test, expect } from '@playwright/test';
import { buildMockResponse } from '../fixtures/mock-data.ts';
import { waitForSongListLoaded } from '../fixtures/helpers.ts';

test.describe('곡 목록 (SongList)', () => {
  // ──────────────────────────────────────────────
  // 시나리오 1: 로딩 스켈레톤 표시
  // ──────────────────────────────────────────────
  test('로딩 중 스켈레톤 행이 Ranking 아래에 표시된다', { tag: '@mock' }, async ({ page }) => {

    // API 응답을 지연시켜 로딩 상태를 유지
    await page.route('**/search?chartType=*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildMockResponse(10)),
      });
    });

    await page.goto('./');

    // Ranking 라벨이 보이는지 확인
    await expect(page.locator('text=Ranking')).toBeVisible();

    // 스켈레톤 아이템들이 렌더링되어야 한다 (SkeletonList는 15개 생성)
    const listSection = page.locator('main section').first();
    // 스켈레톤 아이템은 grid 구조를 가진 div (.song-item 클래스 없음)
    const skeletonItems = listSection.locator('> div:not(.song-item)');
    await expect(skeletonItems.first()).toBeVisible();
    const skeletonCount = await skeletonItems.count();
    expect(skeletonCount).toBeGreaterThanOrEqual(10);
  });

  // ──────────────────────────────────────────────
  // 시나리오 2: 정상 곡 목록 렌더링
  // ──────────────────────────────────────────────
  test('곡 목록이 순위, 썸네일, 제목, 아티스트 구조로 렌더링된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 곡 아이템이 1개 이상 렌더링되어야 한다
    const songItems = page.locator('.song-item');
    await expect(songItems.first()).toBeVisible();
    const count = await songItems.count();
    expect(count).toBeGreaterThan(0);

    // 첫 번째 곡 구조 검증 — 순위, 썸네일(img), 제목, 아티스트
    const firstItem = songItems.first();

    // 순위 텍스트 (1위는 GoldRank로 렌더링)
    await expect(firstItem.locator('text=1')).toBeVisible();

    // 썸네일 이미지
    const thumbnail = firstItem.locator('img');
    await expect(thumbnail).toBeVisible();

    // 제목과 아티스트 — 텍스트가 존재하는지만 확인 (내용 무관)
    // 구조: child 0 = rank, child 1 = thumbnail, child 2 = song info
    const songInfo = firstItem.locator('> div').nth(2);
    const titleText = await songInfo.locator('div').first().textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);

    const artistText = await songInfo.locator('div').nth(1).textContent();
    expect(artistText?.trim().length).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────
  // 시나리오 3: 1위 곡 강조 — GoldRank 스타일
  // ──────────────────────────────────────────────
  test('1위 곡은 골드 그라데이션 스타일로 강조된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    const songItems = page.locator('.song-item');
    await expect(songItems.first()).toBeVisible();

    // 1위 곡의 순위 영역에서 GoldRank 스타일 확인
    // GoldRank는 -webkit-text-fill-color: transparent + background-clip: text 적용
    // 구조: child 0 = rank div
    const firstRankArea = songItems.first().locator('> div').first();
    const goldRankElement = firstRankArea.locator('div', { hasText: '1' });
    await expect(goldRankElement).toBeVisible();

    // gold shimmer 스타일 검증: background-clip이 text로 설정
    const backgroundClip = await goldRankElement.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return style.getPropertyValue('-webkit-background-clip') ?? style.backgroundClip;
    });
    expect(backgroundClip).toBe('text');

    // 2위 곡에는 GoldRank 스타일이 없다
    const secondItem = songItems.nth(1);
    const secondRankText = secondItem.locator('> div').first();
    await expect(secondRankText).toContainText('2');
  });

  // ──────────────────────────────────────────────
  // 시나리오 4: 썸네일 호버 오버레이
  // ──────────────────────────────────────────────
  test('곡 아이템 호버 시 썸네일에 Play 오버레이가 표시된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    const songItems = page.locator('.song-item');
    await expect(songItems.first()).toBeVisible();

    // 호버 전: PlayOverlay는 opacity: 0
    const firstItem = songItems.first();
    const thumbnailContainer = firstItem.locator('img').locator('..');
    const playOverlay = thumbnailContainer.locator('div').last();

    const opacityBefore = await playOverlay.evaluate((element) =>
      window.getComputedStyle(element).opacity,
    );
    expect(opacityBefore).toBe('0');

    // 곡 아이템에 호버
    await firstItem.hover();

    // 호버 후: PlayOverlay opacity가 1이 되어야 한다 (CSS 트랜지션 auto-wait)
    await expect(playOverlay).toHaveCSS('opacity', '1');
  });

  // ──────────────────────────────────────────────
  // 시나리오 5: 긴 텍스트 말줄임
  // ──────────────────────────────────────────────
  test('긴 제목과 아티스트 이름은 말줄임(ellipsis) 처리된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    const songItem = page.locator('.song-item').first();
    await expect(songItem).toBeVisible();

    // SongTitle과 SongArtist의 overflow 스타일 검증
    // 구조: child 0 = rank, child 1 = thumbnail, child 2 = song info
    const songInfoChildren = songItem.locator('> div').nth(2).locator('div');
    const titleElement = songInfoChildren.first();
    const artistElement = songInfoChildren.nth(1);

    // overflow: hidden, text-overflow: ellipsis 확인
    for (const element of [titleElement, artistElement]) {
      const overflow = await element.evaluate((el) =>
        window.getComputedStyle(el).overflow,
      );
      expect(overflow).toBe('hidden');

      const textOverflow = await element.evaluate((el) =>
        window.getComputedStyle(el).textOverflow,
      );
      expect(textOverflow).toBe('ellipsis');

      const whiteSpace = await element.evaluate((el) =>
        window.getComputedStyle(el).whiteSpace,
      );
      expect(whiteSpace).toBe('nowrap');
    }
  });

  // ──────────────────────────────────────────────
  // 시나리오 6: 빈 결과 상태
  // ──────────────────────────────────────────────
  test('곡이 없으면 "No songs found for this period." 메시지가 표시된다', { tag: '@mock' }, async ({
    page,
  }) => {

    await page.route('**/search?chartType=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resultCode: '99',
          resultMsg: 'OK',
          resultData: { items: [] },
        }),
      });
    });

    await page.goto('./');

    // EmptyState 안의 메시지 확인
    const emptyMessage = page.locator('text=No songs found for this period.');
    await expect(emptyMessage).toBeVisible();

    // 곡 아이템이 없어야 한다
    await expect(page.locator('.song-item')).toHaveCount(0);
  });

  // ──────────────────────────────────────────────
  // 시나리오 7: 에러 상태 표시
  // ──────────────────────────────────────────────
  test('에러 발생 시 role="alert" 컨테이너에 에러 메시지와 다시 시도 버튼이 표시된다', { tag: '@mock' }, async ({
    page,
  }) => {
    await page.route('**/search?chartType=*', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Internal Server Error', status: 502 } }),
      });
    });

    await page.goto('./');

    // role="alert" 영역이 표시되어야 한다 (React Query retry: 1 이후)
    const alertContainer = page.locator('[role="alert"]');
    await expect(alertContainer).toBeVisible();

    // 에러 메시지 존재 확인
    await expect(alertContainer.locator('p')).toBeVisible();

    // 다시 시도 버튼 존재 확인
    const retryButton = alertContainer.locator('button', { hasText: '다시 시도' });
    await expect(retryButton).toBeVisible();
  });

  // ──────────────────────────────────────────────
  // 시나리오 8: 재시도 버튼 동작
  // ──────────────────────────────────────────────
  test('다시 시도 버튼 클릭 시 API를 재조회한다', { tag: '@mock' }, async ({ page }) => {
    let requestCount = 0;

    await page.route('**/search?chartType=*', async (route) => {
      requestCount += 1;

      if (requestCount <= 2) {
        // 첫 두 요청 (원본 + React Query 자동 재시도): 에러
        await route.fulfill({
          status: 502,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Server Error', status: 502 } }),
        });
      } else {
        // 세 번째 요청 (다시 시도 버튼 클릭): 성공
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildMockResponse(5)),
        });
      }
    });

    await page.goto('./');

    // 에러 상태 확인
    const retryButton = page.locator('button', { hasText: '다시 시도' });
    await expect(retryButton).toBeVisible();

    // 다시 시도 클릭
    await retryButton.click();

    // 재조회 후 곡 목록이 렌더링되어야 한다
    const songItems = page.locator('.song-item');
    await expect(songItems.first()).toBeVisible();
    await expect(songItems).toHaveCount(5);

    // API가 3번 호출되었는지 확인 (원본 + RQ 자동 재시도 + 다시 시도 클릭)
    expect(requestCount).toBe(3);
  });

  // ──────────────────────────────────────────────
  // 시나리오 9: 리스트/플레이어 공존
  // ──────────────────────────────────────────────
  test('곡을 선택해도 리스트가 계속 표시된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    const songItems = page.locator('.song-item');
    await expect(songItems.first()).toBeVisible();
    const countBefore = await songItems.count();

    // 첫 번째 곡 클릭
    await songItems.first().click();

    // 곡 선택 후에도 리스트가 유지되어야 한다
    const countAfter = await songItems.count();
    expect(countAfter).toBe(countBefore);
    await expect(page.locator('text=Ranking')).toBeVisible();

    // 선택된 곡에 data-selected="true" 속성이 적용됨
    await expect(songItems.first()).toHaveAttribute('data-selected', 'true');
  });

  // ──────────────────────────────────────────────
  // 시나리오 10: 스크롤 동작
  // ──────────────────────────────────────────────
  test('곡 100개가 렌더링되고 스크롤이 가능하다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    const songItems = page.locator('.song-item');
    await expect(songItems.first()).toBeVisible();
    const totalCount = await songItems.count();
    expect(totalCount).toBeGreaterThan(0);

    // 곡이 충분히 많으면 마지막 곡이 뷰포트 밖에 있어야 한다
    expect(totalCount).toBe(100);
    const lastItem = songItems.last();
    await expect(lastItem).not.toBeInViewport();

    // 마지막 곡까지 스크롤
    await lastItem.scrollIntoViewIfNeeded();

    // 스크롤 후 마지막 곡이 보여야 한다
    await expect(lastItem).toBeInViewport();
  });
});
