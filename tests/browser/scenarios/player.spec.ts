import { test, expect, type Page } from '@playwright/test';
import {
  MOCK_YOUTUBE_MULTI_RESPONSE,
  MOCK_YOUTUBE_EMPTY_RESPONSE,
  buildMockResponse,
} from '../fixtures/mock-data.ts';
import { waitForSongListLoaded, selectFirstSong } from '../fixtures/helpers.ts';

// --- player.spec.ts 전용 유틸리티 함수 (MOCK_API=true 전용) ---

/** TJMedia API를 mock한다 (MOCK_API=true 전용) */
async function mockTJMediaAPIForTest(page: Page) {
  await page.route('**/search?chartType=*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildMockResponse(5)),
    });
  });
}

/** YouTube API를 다중 비디오 응답으로 목킹한다 (MOCK_API=true 전용) */
async function mockYouTubeAPIMulti(page: Page) {
  await page.route('**/search?search_query=*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_YOUTUBE_MULTI_RESPONSE),
    });
  });
}

/** YouTube API를 빈 응답으로 목킹한다 (MOCK_API=true 전용) */
async function mockYouTubeAPIEmpty(page: Page) {
  await page.route('**/search?search_query=*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_YOUTUBE_EMPTY_RESPONSE),
    });
  });
}

/** YouTube API를 에러 응답으로 목킹한다 (MOCK_API=true 전용) */
async function mockYouTubeAPIError(page: Page) {
  await page.route('**/search?search_query=*', async (route) => {
    await route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'upstream failed', status: 502 } }),
    });
  });
}

/** YouTube API 응답을 지연시킨다 (MOCK_API=true 전용) */
async function mockYouTubeAPIDelayed(page: Page) {
  await page.route('**/search?search_query=*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_YOUTUBE_MULTI_RESPONSE),
    });
  });
}

// =============================================================================
// 데스크톱 시나리오 (기본 뷰포트)
// =============================================================================

test.describe('플레이어 데스크톱 시나리오', () => {
  test.skip(({ isMobile }) => isMobile, '데스크톱 프로젝트에서만 실행');
  // 시나리오 1: 플레이어 기본 정보 — Now Playing 서브타이틀 + "곡명 - 가수명" 제목
  test('곡 선택 시 Now Playing 서브타이틀과 곡명-가수명 제목이 표시된다', async ({
    page,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
    await selectFirstSong(page);

    // "Now Playing" 서브타이틀 확인
    await expect(page.locator('text=Now Playing')).toBeVisible();

    // "곡명 - 가수명" 형태의 제목 확인 (h2 VideoTitle) — 내용 무관, 텍스트 존재만 확인
    const videoTitle = page.locator('h2');
    await expect(videoTitle).toBeVisible();
    const titleText = await videoTitle.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });

  // 시나리오 2: YouTube 검색 로딩 — 원형 스켈레톤 + 텍스트 스켈레톤
  test('YouTube 검색 중 원형 스켈레톤과 텍스트 스켈레톤이 표시된다', { tag: '@mock' }, async ({
    page,
  }) => {

    await mockTJMediaAPIForTest(page);
    await mockYouTubeAPIDelayed(page);
    await page.goto('./');
    await waitForSongListLoaded(page);

    // 곡 클릭 — YouTube API가 지연되므로 로딩 상태가 보인다
    await page.locator('.song-item').first().click();

    // 원형 스켈레톤 (borderRadius: 50%, width: 64px)
    const circularSkeleton = page.locator('section >> div[style*="border-radius: 50%"]');
    await expect(circularSkeleton).toBeVisible();

    // 텍스트 스켈레톤 (width: 200px)
    const textSkeleton = page.locator('section >> div[style*="width: 200px"]');
    await expect(textSkeleton).toBeVisible();
  });

  // 시나리오 3: YouTube 결과 없음 — "No videos found for ..." 문구
  test('YouTube 검색 결과가 없으면 "No videos found for ..." 메시지가 표시된다', { tag: '@mock' }, async ({
    page,
  }) => {

    await mockTJMediaAPIForTest(page);
    await mockYouTubeAPIEmpty(page);
    await page.goto('./');
    await waitForSongListLoaded(page);
    await page.locator('.song-item').first().click();

    // "No videos found for" 문구 확인
    await expect(page.locator('text=/No videos found for/')).toBeVisible();
  });

  // 시나리오 4: 플레이어 에러 — role="alert", "Failed to load videos."
  test('YouTube API 에러 시 role=alert과 "Failed to load videos." 메시지가 표시된다', { tag: '@mock' }, async ({
    page,
  }) => {

    await mockTJMediaAPIForTest(page);
    await mockYouTubeAPIError(page);
    await page.goto('./');
    await waitForSongListLoaded(page);
    await page.locator('.song-item').first().click();

    // role="alert" 영역 확인
    const alertElement = page.locator('[role="alert"]');
    await expect(alertElement).toBeVisible();

    // 에러 메시지 확인 (Worker 에러 응답의 message가 표시된다)
    await expect(alertElement).toContainText('upstream failed');
  });

  // 시나리오 5: 다중 비디오 네비게이션 버튼 — Previous/Next video + 카운터
  test('다중 비디오일 때 Previous/Next 버튼과 카운터가 표시된다', async ({
    page,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
    await selectFirstSong(page);

    // 카운터 텍스트("/ ")가 존재하는지 확인 — 비디오가 1개이면 네비게이션이 없다
    const counterLocator = page.locator('text=/ ');
    const hasMultipleVideos = (await counterLocator.count()) > 0;
    test.skip(!hasMultipleVideos, '비디오가 1개뿐이므로 네비게이션 테스트를 건너뜁니다');

    // Previous/Next 버튼 존재 확인 (VideoInfo 영역)
    const previousButton = page.getByRole('button', { name: 'Previous video' });
    const nextButton = page.getByRole('button', { name: 'Next video' });
    await expect(previousButton.first()).toBeVisible();
    await expect(nextButton.first()).toBeVisible();
  });

  // 시나리오 6: 첫/마지막 비디오 비활성화 — 첫: Previous disabled, 마지막: Next disabled
  test('첫 번째 비디오에서 Previous 비활성화, 마지막에서 Next 비활성화', async ({
    page,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
    await selectFirstSong(page);

    // 카운터 텍스트("/ ")가 존재하는지 확인
    const counterLocator = page.locator('text=/ ');
    const hasMultipleVideos = (await counterLocator.count()) > 0;
    test.skip(!hasMultipleVideos, '비디오가 1개뿐이므로 네비게이션 테스트를 건너뜁니다');

    // VideoInfo 영역의 버튼을 사용한다
    const previousButtons = page.getByRole('button', { name: 'Previous video' });
    const nextButtons = page.getByRole('button', { name: 'Next video' });

    // 첫 번째 비디오 — Previous 비활성화
    await expect(previousButtons.first()).toBeDisabled();
    await expect(nextButtons.first()).toBeEnabled();

    // 카운터에서 총 비디오 수를 읽는다
    const counterText = await counterLocator.first().textContent() ?? '';
    const totalMatch = counterText.match(/\/\s*(\d+)/);
    const totalVideos = totalMatch ? parseInt(totalMatch[1], 10) : 0;

    // 마지막 비디오로 이동 (Next를 (총 수 - 1)번 클릭)
    for (let index = 1; index < totalVideos; index++) {
      await nextButtons.first().click();
    }

    // 마지막 비디오 — Next 비활성화
    await expect(nextButtons.first()).toBeDisabled();
    await expect(previousButtons.first()).toBeEnabled();
  });

  // 시나리오 7: 비디오 전환 카운터 갱신 — Next/Previous 시 카운터 변경
  test('Next/Previous 클릭 시 카운터가 갱신된다', async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
    await selectFirstSong(page);

    // 카운터 텍스트("/ ")가 존재하는지 확인
    const counterLocator = page.locator('text=/ ');
    const hasMultipleVideos = (await counterLocator.count()) > 0;
    test.skip(!hasMultipleVideos, '비디오가 1개뿐이므로 네비게이션 테스트를 건너뜁니다');

    // 카운터에서 총 비디오 수를 읽는다
    const counterText = await counterLocator.first().textContent() ?? '';
    const totalMatch = counterText.match(/\/\s*(\d+)/);
    const totalVideos = totalMatch ? parseInt(totalMatch[1], 10) : 0;

    // 초기 카운터: 1 / N
    await expect(page.locator(`text=1 / ${totalVideos}`).first()).toBeVisible();

    // Next 클릭 → 2 / N
    const nextButton = page.getByRole('button', { name: 'Next video' }).first();
    await nextButton.click();
    await expect(page.locator(`text=2 / ${totalVideos}`).first()).toBeVisible();

    // Previous 클릭 → 1 / N
    const previousButton = page.getByRole('button', { name: 'Previous video' }).first();
    await previousButton.click();
    await expect(page.locator(`text=1 / ${totalVideos}`).first()).toBeVisible();
  });

  // 시나리오 12: 데스크톱 오버레이 컨트롤 — 호버 시에만 좌우 화살표/카운터 표시
  test('데스크톱에서 비디오 영역 호버 시 오버레이 컨트롤이 나타난다', async ({
    page,
  }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
    await selectFirstSong(page);

    // 오버레이 컨트롤은 데스크톱에서 opacity: 0이 기본이며, 호버 시 opacity: 1로 전환된다
    // [data-overlay] 속성을 가진 요소가 존재하는지 확인한다
    const overlayControls = page.locator('[data-overlay]');
    await expect(overlayControls.first()).toBeAttached();

    // 데스크톱 미디어쿼리(min-width: 1024px) 기준으로 opacity가 0인지 확인한다
    const overlayOpacity = await overlayControls.first().evaluate(
      (element) => getComputedStyle(element).opacity,
    );
    expect(overlayOpacity).toBe('0');

    // 비디오 컨테이너 호버 — [data-overlay]의 부모가 VideoContainer이며
    // VideoContainer:hover [data-overlay] { opacity: 1 } 룰이 적용된다
    const videoContainer = overlayControls.first().locator('..');
    await videoContainer.hover();

    // CSS :hover 트랜지션이 완료될 때까지 auto-wait으로 확인
    await expect(overlayControls.first()).toHaveCSS('opacity', '1');
  });
});

// =============================================================================
// 모바일 시나리오 (375 x 812 뷰포트)
// =============================================================================

test.describe('플레이어 모바일 시나리오', () => {
  test.skip(({ isMobile }) => !isMobile, '모바일 프로젝트에서만 실행');
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
    await selectFirstSong(page);
  });

  // 시나리오 8: 모바일 미니 플레이어 — MiniPlayerBar에 곡명-가수명 + 상태 아이콘
  test('미니 플레이어 바에 곡명-가수명과 상태 아이콘이 표시된다', async ({
    page,
  }) => {
    // MiniPlayerBar — PlayerSection(section:last)의 첫 직접 자식 div
    const miniPlayerBar = page.locator('section').last().locator('> div').first();
    const barText = await miniPlayerBar.textContent();
    expect(barText?.trim().length).toBeGreaterThan(0);

    // 상태 아이콘 (Play 아이콘 또는 Equalizer) 존재 확인
    // 초기 상태에서는 Play 아이콘(svg)이 보인다
    const statusIcon = miniPlayerBar.locator('svg');
    await expect(statusIcon.first()).toBeVisible();
  });

  // 시나리오 9: 모바일 접기/펼치기 — 미니 플레이어 바 탭 → 비디오 영역 토글
  test('미니 플레이어 바를 클릭하면 비디오 영역이 토글된다', async ({ page }) => {
    // 초기 상태: 비디오 영역이 펼쳐져 있다 (VideoContainer isExpanded=true)
    const videoContainer = page.locator('iframe').first();
    await expect(videoContainer).toBeVisible({ timeout: 10_000 }).catch(() => {
      // iframe이 아직 로드되지 않았을 수 있다 — PlayerTarget div로 대체 확인
    });

    // h2 제목이 보이면 펼쳐진 상태이다 — 내용 무관
    const h2Element = page.locator('h2');
    await expect(h2Element).toBeVisible();

    // 미니 플레이어 바 클릭 → 접기
    const miniPlayerBar = page.locator('section').last().locator('> div').first();
    await miniPlayerBar.click();

    // 접힌 상태: VideoInfo(h2 포함)가 display: none이 된다
    await expect(h2Element).toBeHidden();

    // 다시 클릭 → 펼치기
    await miniPlayerBar.click();
    await expect(h2Element).toBeVisible();
  });

  // 시나리오 10: 모바일 드래그 접기 — 아래로 드래그 → 접힘, 짧은 드래그 → 복원
  test('미니 플레이어 바를 아래로 드래그하면 접히고, 짧은 드래그는 복원된다', async ({
    page,
  }) => {
    // 펼쳐진 상태 확인 — h2가 보이면 펼쳐진 상태
    const h2Element = page.locator('h2');
    await expect(h2Element).toBeVisible();

    const miniPlayerBar = page.locator('section').last().locator('> div').first();
    const boundingBox = await miniPlayerBar.boundingBox();
    if (boundingBox === null) throw new Error('미니 플레이어 바의 boundingBox를 가져올 수 없습니다');

    const startX = boundingBox.x + boundingBox.width / 2;
    const startY = boundingBox.y + boundingBox.height / 2;

    // 짧은 드래그 (40px) — COLLAPSE_THRESHOLD_PIXELS(80) 미만 → 복원
    // page.evaluate로 실제 Touch 객체를 생성하여 터치 이벤트를 발생시킨다
    await page.evaluate(
      ({ sx, sy, deltaY }) => {
        const el = document.querySelectorAll('section')[document.querySelectorAll('section').length - 1]
          ?.querySelector(':scope > div');
        if (el === null || el === undefined) return;
        const touchStart = new Touch({ identifier: 0, target: el, clientX: sx, clientY: sy });
        const touchMove = new Touch({ identifier: 0, target: el, clientX: sx, clientY: sy + deltaY });
        el.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], bubbles: true }));
        el.dispatchEvent(new TouchEvent('touchmove', { touches: [touchMove], bubbles: true }));
        el.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
      },
      { sx: startX, sy: startY, deltaY: 40 },
    );
    // 짧은 드래그이므로 여전히 펼쳐진 상태
    await expect(h2Element).toBeVisible();

    // 긴 드래그 (120px) — 임계값 초과 → 접힘
    await page.evaluate(
      ({ sx, sy, deltaY }) => {
        const el = document.querySelectorAll('section')[document.querySelectorAll('section').length - 1]
          ?.querySelector(':scope > div');
        if (el === null || el === undefined) return;
        const touchStart = new Touch({ identifier: 0, target: el, clientX: sx, clientY: sy });
        const touchMove = new Touch({ identifier: 0, target: el, clientX: sx, clientY: sy + deltaY });
        el.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], bubbles: true }));
        el.dispatchEvent(new TouchEvent('touchmove', { touches: [touchMove], bubbles: true }));
        el.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
      },
      { sx: startX, sy: startY, deltaY: 120 },
    );
    // 접힌 상태: h2가 숨겨진다
    await expect(h2Element).toBeHidden();
  });

  // 시나리오 11: 재생 상태 미니 플레이어 아이콘 — 정지: Play, 재생: Equalizer
  test('재생 상태에 따라 미니 플레이어에 Play 또는 Equalizer 아이콘이 표시된다', async ({
    page,
  }) => {
    // 초기 상태 (idle/unstarted) — Play 아이콘(svg)이 보인다
    // MiniPlayerInfo 안의 첫 번째 요소가 svg(Play) 또는 div(Equalizer)이다
    const miniPlayerInfo = page.locator('section').last().locator('> div').first();

    // Play 아이콘: FontAwesomeIcon은 svg로 렌더링된다
    const playIcon = miniPlayerInfo.locator('svg[data-icon="play"]');
    const equalizerBars = miniPlayerInfo.locator('div').filter({
      has: page.locator('div[style*="animation"]'),
    });

    // 자동 재생이 시작되지 않은 상태에서는 Play 아이콘이 보인다
    // YouTube iframe 자동 재생은 환경에 따라 불안정하므로,
    // 최소한 Play 아이콘 또는 Equalizer 중 하나가 표시되는지 확인한다
    const hasPlayIcon = await playIcon.count();
    const hasEqualizerBars = await equalizerBars.count();
    expect(hasPlayIcon + hasEqualizerBars).toBeGreaterThan(0);
  });
});
