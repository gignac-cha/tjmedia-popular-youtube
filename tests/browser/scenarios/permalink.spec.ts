import { test, expect } from '@playwright/test';
import {
  waitForSongListLoaded,
  songItemLocator,
  clickGenreButton,
} from '../fixtures/helpers.ts';

test.describe('퍼머링크(permalink) 시나리오', () => {
  // ---------------------------------------------------------------------------
  // 시나리오 1: 기본 URL 무파라미터 진입 — 가요 + This Month 기본, 선택 없음
  // ---------------------------------------------------------------------------
  test('파라미터 없이 진입하면 가요 + This Month 기본 상태이고 곡 선택이 없다', async ({
    page,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // URL에 type, from, to, rank 파라미터가 없어야 한다
    const url = new URL(page.url());
    expect(url.searchParams.has('type')).toBe(false);
    expect(url.searchParams.has('from')).toBe(false);
    expect(url.searchParams.has('to')).toBe(false);
    expect(url.searchParams.has('rank')).toBe(false);

    // 곡이 선택되지 않은 상태 — data-selected="true"인 항목이 없어야 한다
    const selectedItems = page.locator('.song-item[data-selected="true"]');
    await expect(selectedItems).toHaveCount(0);

    // 플레이어가 표시되지 않아야 한다
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // 시나리오 2: 장르 파라미터 반영 — ?type=english → POP, ?type=japanese → J-POP
  // ---------------------------------------------------------------------------
  test('?type=english 로 진입하면 POP 장르가 활성화된다', async ({ page }) => {
    await page.goto('./?type=english');
    await waitForSongListLoaded(page);

    // URL에 type=english가 유지되어야 한다
    const url = new URL(page.url());
    expect(url.searchParams.get('type')).toBe('english');
  });

  test('?type=japanese 로 진입하면 J-POP 장르가 활성화된다', async ({ page }) => {
    await page.goto('./?type=japanese');
    await waitForSongListLoaded(page);

    // URL에 type=japanese가 유지되어야 한다
    const url = new URL(page.url());
    expect(url.searchParams.get('type')).toBe('japanese');
  });

  // ---------------------------------------------------------------------------
  // 시나리오 3: 날짜 파라미터 반영 — ?from=YYYY-MM-DD&to=YYYY-MM-DD → Custom 날짜
  // ---------------------------------------------------------------------------
  test('?from=2026-01-01&to=2026-01-31 로 진입하면 Custom 날짜가 적용된다', async ({
    page,
  }) => {
    await page.goto('./?from=2026-01-01&to=2026-01-31');
    await waitForSongListLoaded(page);

    // URL에 from/to가 유지되어야 한다
    const url = new URL(page.url());
    expect(url.searchParams.get('from')).toBe('2026-01-01');
    expect(url.searchParams.get('to')).toBe('2026-01-31');
  });

  // ---------------------------------------------------------------------------
  // 시나리오 4: 순위 파라미터 자동 선택 — ?rank=1 → 해당 순위 곡 자동 선택 + 플레이어
  // ---------------------------------------------------------------------------
  test('?rank=1 로 진입하면 1위 곡이 자동 선택되고 플레이어가 표시된다', async ({
    page,
  }) => {
    await page.goto('./?rank=1');
    await waitForSongListLoaded(page);

    // 1위 곡이 선택된 상태여야 한다
    const firstSong = songItemLocator(page, 0);
    await expect(firstSong).toHaveAttribute('data-selected', 'true');

    // 플레이어에 "Now Playing"이 표시되어야 한다
    await expect(page.locator('text=Now Playing')).toBeVisible();
  });

  test('?rank=2 로 진입하면 2위 곡이 자동 선택된다', async ({ page }) => {
    await page.goto('./?rank=2');
    await waitForSongListLoaded(page);

    // 2위 곡이 선택된 상태여야 한다
    const secondSong = songItemLocator(page, 1);
    await expect(secondSong).toHaveAttribute('data-selected', 'true');

    // 1위 곡은 선택 해제 상태
    const firstSong = songItemLocator(page, 0);
    await expect(firstSong).toHaveAttribute('data-selected', 'false');

    // 플레이어에 "Now Playing"이 표시되어야 한다
    await expect(page.locator('text=Now Playing')).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // 시나리오 5: 곡 선택 시 URL 갱신 — 클릭 → rank 파라미터 추가
  // ---------------------------------------------------------------------------
  test('곡을 클릭하면 URL에 rank 파라미터가 추가된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 선택 전 — rank 파라미터 없음
    expect(new URL(page.url()).searchParams.has('rank')).toBe(false);

    // 2번째 곡 클릭
    const secondSong = songItemLocator(page, 1);
    await secondSong.click();

    // URL에 rank=2가 추가되어야 한다
    const urlAfterClick = new URL(page.url());
    expect(urlAfterClick.searchParams.get('rank')).toBe('2');
  });

  test('다른 곡을 클릭하면 rank 파라미터가 갱신된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 1번째 곡 클릭
    await songItemLocator(page, 0).click();
    expect(new URL(page.url()).searchParams.get('rank')).toBe('1');

    // 3번째 곡 클릭
    await songItemLocator(page, 2).click();
    expect(new URL(page.url()).searchParams.get('rank')).toBe('3');
  });

  // ---------------------------------------------------------------------------
  // 시나리오 6: 필터 변경 시 rank 제거 — 장르/날짜 변경 → rank 제거
  // ---------------------------------------------------------------------------
  test('곡 선택 후 장르를 변경하면 URL에서 rank가 제거된다', async ({
    page,
    isMobile,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 곡 선택 → rank 추가 확인
    await songItemLocator(page, 0).click();
    expect(new URL(page.url()).searchParams.get('rank')).toBe('1');

    // 장르 변경 (POP)
    await clickGenreButton(page, 'POP', isMobile);
    await waitForSongListLoaded(page);

    // rank가 제거되어야 한다
    const urlAfterGenreChange = new URL(page.url());
    expect(urlAfterGenreChange.searchParams.has('rank')).toBe(false);
    expect(urlAfterGenreChange.searchParams.get('type')).toBe('english');
  });

  // ---------------------------------------------------------------------------
  // 시나리오 7: 기본값 생략 — 가요 + 기본 날짜에서는 type/from/to 미표시
  // ---------------------------------------------------------------------------
  test('기본 장르(가요)와 기본 날짜(This Month)에서는 type/from/to가 URL에 표시되지 않는다', async ({
    page,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 기본 상태에서 URL에 type, from, to가 없어야 한다
    const url = new URL(page.url());
    expect(url.searchParams.has('type')).toBe(false);
    expect(url.searchParams.has('from')).toBe(false);
    expect(url.searchParams.has('to')).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 시나리오 8: 비기본 장르만 type 추가 — POP/J-POP만 type 파라미터
  // ---------------------------------------------------------------------------
  test('POP 선택 시 type=english, J-POP 선택 시 type=japanese가 URL에 추가된다', async ({
    page,
    isMobile,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);

    // POP 선택
    await clickGenreButton(page, 'POP', isMobile);
    await waitForSongListLoaded(page);
    expect(new URL(page.url()).searchParams.get('type')).toBe('english');

    // J-POP 선택
    await clickGenreButton(page, 'J-POP', isMobile);
    await waitForSongListLoaded(page);
    expect(new URL(page.url()).searchParams.get('type')).toBe('japanese');

    // 가요로 돌아가면 type이 제거되어야 한다
    await clickGenreButton(page, '가요', isMobile);
    await waitForSongListLoaded(page);
    expect(new URL(page.url()).searchParams.has('type')).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 시나리오 9: 잘못된 rank 무시 — rank=0, rank=-1, rank=abc → 초기 상태
  // ---------------------------------------------------------------------------
  test('rank=0 으로 진입하면 곡 선택 없이 초기 상태가 된다', async ({ page }) => {
    await page.goto('./?rank=0');
    await waitForSongListLoaded(page);

    // 선택된 곡이 없어야 한다
    const selectedItems = page.locator('.song-item[data-selected="true"]');
    await expect(selectedItems).toHaveCount(0);

    // 플레이어가 표시되지 않아야 한다
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  test('rank=-1 로 진입하면 곡 선택 없이 초기 상태가 된다', async ({ page }) => {
    await page.goto('./?rank=-1');
    await waitForSongListLoaded(page);

    const selectedItems = page.locator('.song-item[data-selected="true"]');
    await expect(selectedItems).toHaveCount(0);
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  test('rank=abc 로 진입하면 곡 선택 없이 초기 상태가 된다', async ({ page }) => {
    await page.goto('./?rank=abc');
    await waitForSongListLoaded(page);

    const selectedItems = page.locator('.song-item[data-selected="true"]');
    await expect(selectedItems).toHaveCount(0);
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // 시나리오 10: 뒤로가기/앞으로가기 — popstate 시 필터/선택 상태 URL과 동기화
  // ---------------------------------------------------------------------------
  test('뒤로가기/앞으로가기 시 필터와 선택 상태가 URL과 동기화된다', async ({
    page,
    isMobile,
  }) => {
    // 1단계: 기본 상태로 진입
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 2단계: 곡 선택 → rank=1 추가 (history entry 1)
    await songItemLocator(page, 0).click();
    expect(new URL(page.url()).searchParams.get('rank')).toBe('1');

    // 3단계: 장르 변경 → POP (history entry 2, rank 제거됨)
    await clickGenreButton(page, 'POP', isMobile);
    await waitForSongListLoaded(page);
    expect(new URL(page.url()).searchParams.get('type')).toBe('english');
    expect(new URL(page.url()).searchParams.has('rank')).toBe(false);

    // 뒤로가기 → rank=1 상태로 복원
    await page.goBack();
    await waitForSongListLoaded(page);

    const urlAfterBack = new URL(page.url());
    expect(urlAfterBack.searchParams.get('rank')).toBe('1');
    expect(urlAfterBack.searchParams.has('type')).toBe(false);

    // 1위 곡이 다시 선택되어야 한다
    const firstSong = songItemLocator(page, 0);
    await expect(firstSong).toHaveAttribute('data-selected', 'true');

    // 앞으로가기 → POP + rank 없음 상태로 복원
    await page.goForward();
    await waitForSongListLoaded(page);

    const urlAfterForward = new URL(page.url());
    expect(urlAfterForward.searchParams.get('type')).toBe('english');
    expect(urlAfterForward.searchParams.has('rank')).toBe(false);

    // 선택된 곡이 없어야 한다
    const selectedAfterForward = page.locator('.song-item[data-selected="true"]');
    await expect(selectedAfterForward).toHaveCount(0);
  });
});
