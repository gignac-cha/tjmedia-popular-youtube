// 이 테스트는 배포된 실제 API를 사용합니다. mock 데이터를 사용하지 않습니다.
// 네트워크 상태에 따라 로딩 시간이 다를 수 있으므로 timeout을 넉넉하게 설정합니다.
import { test, expect } from '@playwright/test';

/**
 * 반응형 레이아웃 테스트
 *
 * breakpoint: 1024px (모바일 ↔ 데스크톱)
 *
 * 주요 셀렉터 근거:
 * - header              → StyledHeader (<header>)
 * - MobileFilterToggle  → header button (display:none @1024px+)
 * - DesktopControls     → display:none → display:contents @1024px+
 * - PlayerSection       → <section> (fixed 모바일 / sticky 데스크톱)
 * - MiniPlayerBar       → PlayerSection 내부 (display:none @1024px+)
 * - ListSection         → <section> (padding-bottom: 80px 모바일 / 0 데스크톱)
 * - BottomSheet         → Backdrop + Sheet (display:none @1024px+)
 * - OverlayControls     → [data-overlay] (opacity:1 모바일 / opacity:0 데스크톱)
 * - MainContent         → <main> (flex-column 모바일 / flex-row 데스크톱)
 * - .song-item          → StyledSongItem
 */

// ──────────────────────────────────────────────
// 모바일 뷰포트 시나리오
// ──────────────────────────────────────────────
test.describe('모바일 반응형', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    // 곡 리스트가 로드될 때까지 대기
    await page.locator('.song-item').first().waitFor({ state: 'visible', timeout: 15_000 });
  });

  // 시나리오 1: 모바일 헤더 — 타이틀 + 필터 아이콘 버튼만 보이고, 데스크톱 필터 그룹은 숨김
  test('헤더에 타이틀과 필터 아이콘 버튼만 표시되고, 데스크톱 필터 그룹은 숨겨진다', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 타이틀 확인
    const title = header.locator('h1', { hasText: 'TJMedia' });
    await expect(title).toBeVisible();

    // 모바일 필터 토글 버튼이 보여야 한다 (MobileFilterToggle)
    const mobileFilterButton = header.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(mobileFilterButton).toBeVisible();

    // 데스크톱 필터 그룹은 display:none이므로 보이지 않아야 한다
    // DesktopControls는 display:none이므로 내부의 '가요' 버튼이 header에서 직접 보이지 않아야 한다
    // BottomSheet가 닫혀있으므로 '가요' 텍스트가 화면에 없어야 한다
    const genreButtons = page.locator('header button', { hasText: '가요' });
    const genreButtonCount = await genreButtons.count();
    for (let index = 0; index < genreButtonCount; index++) {
      await expect(genreButtons.nth(index)).toBeHidden();
    }
  });

  // 시나리오 3: 모바일 플레이어 고정 — 하단 fixed 형태
  test('플레이어가 하단에 fixed로 고정된다', async ({ page }) => {
    // 첫 번째 곡을 클릭하여 플레이어 활성화
    const firstSong = page.locator('.song-item').first();
    await firstSong.click();

    // 플레이어 섹션이 나타날 때까지 대기
    const playerSection = page.getByTestId('player-section');
    await expect(playerSection).toBeVisible({ timeout: 10_000 });

    // position: fixed 확인
    const position = await playerSection.evaluate(
      (element) => window.getComputedStyle(element).position,
    );
    expect(position).toBe('fixed');

    // bottom: 0px 확인 (하단 고정)
    const bottom = await playerSection.evaluate(
      (element) => window.getComputedStyle(element).bottom,
    );
    expect(bottom).toBe('0px');
  });

  // 시나리오 6: 모바일 리스트 하단 여백 — 플레이어 열렸을 때 마지막 곡 가려지지 않음
  test('플레이어가 열렸을 때 리스트 하단에 여백이 있어 마지막 곡이 가려지지 않는다', async ({ page }) => {
    // ListSection의 padding-bottom이 80px인지 확인 (플레이어 가림 방지)
    const listSection = page.getByTestId('song-list-section');
    const paddingBottom = await listSection.evaluate(
      (element) => window.getComputedStyle(element).paddingBottom,
    );
    expect(paddingBottom).toBe('80px');

    // 곡 선택으로 플레이어 활성화
    const firstSong = page.locator('.song-item').first();
    await firstSong.click();

    // 마지막 곡으로 스크롤
    const allSongs = page.locator('.song-item');
    const lastSong = allSongs.last();
    await lastSong.scrollIntoViewIfNeeded();

    // 마지막 곡이 여전히 뷰포트 안에 보이는지 확인
    await expect(lastSong).toBeInViewport();
  });

  // 시나리오 7: BottomSheet 모바일 전용 — 모바일에서만 렌더링
  test('필터 버튼 클릭 시 BottomSheet가 모바일에서 렌더링된다', async ({ page }) => {
    // 모바일 필터 토글 버튼 클릭
    const header = page.locator('header');
    const mobileFilterButton = header.locator('button').filter({ has: page.locator('svg') }).first();
    await mobileFilterButton.click();

    // BottomSheet의 Backdrop이 나타나야 한다 (position: fixed, inset: 0)
    // Backdrop은 position:fixed인 div로 확인

    // BottomSheet 내부의 필터 버튼('가요')이 보여야 한다 (.last()로 BottomSheet 내부 버튼 선택)
    const genreButtonInSheet = page.getByRole('button', { name: '가요' }).last();
    await expect(genreButtonInSheet).toBeVisible({ timeout: 5_000 });

    // BottomSheet 내부의 'POP' 버튼도 보여야 한다
    const popButton = page.getByRole('button', { name: 'POP', exact: true }).last();
    await expect(popButton).toBeVisible();

    // 'Today' 프리셋 버튼도 보여야 한다
    const todayButton = page.getByRole('button', { name: 'Today' }).last();
    await expect(todayButton).toBeVisible();
  });

  // 시나리오 8 (모바일): 오버레이 가시성 — 모바일에서 기본 표시
  test('비디오 오버레이 컨트롤이 모바일에서 기본적으로 표시된다', async ({ page }) => {
    // 곡 선택으로 플레이어 활성화
    const firstSong = page.locator('.song-item').first();
    await firstSong.click();

    // 플레이어가 나타날 때까지 대기
    await expect(page.locator('text=Now Playing')).toBeVisible({ timeout: 10_000 });

    // 오버레이 컨트롤 ([data-overlay]) 확인
    const overlayControls = page.locator('[data-overlay]').first();

    // 모바일에서는 opacity: 1이 기본값이어야 한다
    const opacity = await overlayControls.evaluate(
      (element) => window.getComputedStyle(element).opacity,
    );
    expect(opacity).toBe('1');
  });
});

// ──────────────────────────────────────────────
// 데스크톱 뷰포트 시나리오
// ──────────────────────────────────────────────
test.describe('데스크톱 반응형', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    // 곡 리스트가 로드될 때까지 대기
    await page.locator('.song-item').first().waitFor({ state: 'visible', timeout: 15_000 });
  });

  // 시나리오 2: 데스크톱 헤더 — 필터 그룹 직접 노출, 모바일 필터 버튼 숨김
  test('헤더에 필터 그룹이 직접 노출되고, 모바일 필터 버튼은 숨겨진다', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 데스크톱에서 필터 버튼('가요', 'POP', 'J-POP')이 직접 보여야 한다
    await expect(header.getByRole('button', { name: '가요' }).first()).toBeVisible();
    await expect(header.getByRole('button', { name: 'POP', exact: true }).first()).toBeVisible();
    await expect(header.getByRole('button', { name: 'J-POP' }).first()).toBeVisible();

    // 날짜 프리셋('Today', 'This Month')도 보여야 한다
    await expect(header.getByRole('button', { name: 'Today' }).first()).toBeVisible();
    await expect(header.getByRole('button', { name: 'This Month' }).first()).toBeVisible();

    // 모바일 필터 토글 버튼은 display:none이므로 보이지 않아야 한다
    // MobileFilterToggle는 1024px 이상에서 display:none
    // 헤더의 마지막 직계 div(HeaderTop) 안의 버튼 중 필터 아이콘 버튼을 확인
    const headerTopButtons = header.locator('> div').first().locator('button');
    const buttonCount = await headerTopButtons.count();
    for (let index = 0; index < buttonCount; index++) {
      const button = headerTopButtons.nth(index);
      const isVisible = await button.isVisible();
      if (isVisible) {
        // 보이는 버튼 중 필터 아이콘만 있는 버튼(텍스트 없음)이면 안 된다
        const textContent = await button.textContent();
        // MobileFilterToggle는 텍스트 없이 SVG만 가지므로, 텍스트가 비어있으면 안 됨
        // 하지만 데스크톱에선 display:none이므로 isVisible이 false여야 한다
        expect(textContent?.trim()).not.toBe('');
      }
    }
  });

  // 시나리오 4: 데스크톱 플레이어 고정 — 우측 sticky
  test('플레이어가 우측에 sticky로 고정된다', async ({ page }) => {
    // 곡 선택으로 플레이어 활성화
    const firstSong = page.locator('.song-item').first();
    await firstSong.click();

    // 플레이어 섹션이 나타날 때까지 대기
    const playerSection = page.getByTestId('player-section');
    await expect(playerSection).toBeVisible({ timeout: 10_000 });

    // position: sticky 확인
    const position = await playerSection.evaluate(
      (element) => window.getComputedStyle(element).position,
    );
    expect(position).toBe('sticky');

    // top 값이 81px인지 확인 (헤더 높이에 맞춤)
    const top = await playerSection.evaluate(
      (element) => window.getComputedStyle(element).top,
    );
    expect(top).toBe('81px');
  });

  // 시나리오 5: 데스크톱 2단 레이아웃 — 리스트 좌측 + 플레이어 우측
  test('2단 레이아웃으로 리스트가 좌측, 플레이어가 우측에 배치된다', async ({ page }) => {
    // 곡 선택으로 플레이어 활성화
    const firstSong = page.locator('.song-item').first();
    await firstSong.click();

    // 플레이어가 나타날 때까지 대기
    await expect(page.locator('text=Now Playing')).toBeVisible({ timeout: 10_000 });

    // MainContent(<main>)가 flex-direction: row인지 확인
    const mainContent = page.locator('main');
    const flexDirection = await mainContent.evaluate(
      (element) => window.getComputedStyle(element).flexDirection,
    );
    expect(flexDirection).toBe('row');

    // 리스트 섹션(첫 번째 section)과 플레이어 섹션(두 번째 section)의 수평 위치 비교
    const listSection = page.getByTestId('song-list-section');
    const playerSection = page.getByTestId('player-section');

    const listBox = await listSection.boundingBox();
    const playerBox = await playerSection.boundingBox();

    expect(listBox).not.toBeNull();
    expect(playerBox).not.toBeNull();

    // 리스트가 플레이어보다 왼쪽에 있어야 한다
    expect(listBox!.x).toBeLessThan(playerBox!.x);
  });

  // 시나리오 7 (데스크톱): BottomSheet가 데스크톱에서 렌더링되지 않음
  test('필터 버튼이 데스크톱에서는 BottomSheet 없이 직접 노출된다', async ({ page }) => {
    // 데스크톱에서 MobileFilterToggle이 숨겨져 있으므로 BottomSheet 트리거 자체가 불가
    // BottomSheet의 Backdrop과 Sheet는 display:none @1024px+

    // 필터 버튼이 헤더에 직접 보이는지 확인
    const header = page.locator('header');
    await expect(header.getByRole('button', { name: '가요' })).toBeVisible();

    // BottomSheet의 Backdrop(position:fixed + background rgba)가 DOM에 없는지 확인
    // BottomSheet isOpen=false이면 렌더링 자체가 안 됨 (조건부 렌더링)
    // 설령 열려도 @1024px+에서 display:none
    // body overflow가 정상인지 확인 (BottomSheet가 열리면 overflow:hidden이 됨)
    const bodyOverflow = await page.evaluate(
      () => document.body.style.overflow,
    );
    expect(bodyOverflow).toBe('');
  });

  // 시나리오 8 (데스크톱): 오버레이 가시성 — 데스크톱에서 호버 시만 표시
  test('비디오 오버레이 컨트롤이 데스크톱에서 기본적으로 숨겨지고 호버 시 나타난다', async ({ page }) => {
    // 곡 선택으로 플레이어 활성화
    const firstSong = page.locator('.song-item').first();
    await firstSong.click();

    // 플레이어가 나타날 때까지 대기
    await expect(page.locator('text=Now Playing')).toBeVisible({ timeout: 10_000 });

    // 오버레이 컨트롤 ([data-overlay]) 확인
    const overlayControls = page.locator('[data-overlay]').first();

    // 데스크톱에서는 기본 opacity: 0 이어야 한다
    const opacityBefore = await overlayControls.evaluate(
      (element) => window.getComputedStyle(element).opacity,
    );
    expect(opacityBefore).toBe('0');

    // VideoContainer에 호버하면 opacity: 1이 되어야 한다
    // VideoContainer는 오버레이의 부모 요소
    const videoContainer = overlayControls.locator('..');
    await videoContainer.hover();

    // CSS :hover 트랜지션이 완료될 때까지 auto-wait으로 확인
    await expect(overlayControls).toHaveCSS('opacity', '1');
  });
});
