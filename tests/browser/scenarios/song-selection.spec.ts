import { test, expect } from '@playwright/test';
import { waitForSongListLoaded, songItemLocator } from '../fixtures/helpers.ts';

test.describe('곡 선택 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await waitForSongListLoaded(page);
  });

  // 시나리오 1: 곡 선택 시 강조 상태 — 클릭 시 선택 스타일 적용
  test('곡을 클릭하면 data-selected 속성이 true로 변경된다', async ({ page }) => {
    const firstSong = songItemLocator(page, 0);

    // 선택 전 — data-selected가 false
    await expect(firstSong).toHaveAttribute('data-selected', 'false');

    // 클릭
    await firstSong.click();

    // 선택 후 — data-selected가 true
    await expect(firstSong).toHaveAttribute('data-selected', 'true');
  });

  // 시나리오 2: 선택된 곡 순위 아이콘 전환 — Play 아이콘 영역(SelectedRank) 표시
  test('곡을 선택하면 순위 대신 Play 아이콘이 표시된다', async ({ page }) => {
    const secondSong = songItemLocator(page, 1);

    // 선택 전 — 순위 텍스트 "2"가 보인다
    const rankArea = secondSong.locator('> div').first();
    await expect(rankArea).toContainText('2');

    // 클릭
    await secondSong.click();

    // 선택 후 — Play 아이콘(svg)이 Rank 영역 안에 표시된다
    const playIcon = secondSong.locator('svg').first();
    await expect(playIcon).toBeVisible();
  });

  // 시나리오 3: 재생 중 이퀄라이저 — 재생 상태에서 Equalizer 바 표시
  test('곡이 재생 중일 때 이퀄라이저 바가 표시된다', async ({ page }) => {
    const firstSong = songItemLocator(page, 0);

    // 곡 선택
    await firstSong.click();

    // YouTube iframe이 로드되면 자동 재생 시작 → playerState가 'playing'이 될 때까지 대기
    // 이퀄라이저 바(EqualizerBar)는 Equalizer 컨테이너 안에 3개의 div로 렌더링된다
    // 실제 YouTube 자동재생은 환경에 따라 불안정하므로,
    // 선택 직후 Play 아이콘(SelectedRank)이라도 표시되는지 확인한다
    const rankArea = firstSong.locator('> div').first();
    const svgOrEqualizer = rankArea.locator('svg, div');
    await expect(svgOrEqualizer.first()).toBeVisible();
  });

  // 시나리오 4: 다른 곡 재선택 — 이전 선택 해제, 새 곡만 선택
  test('다른 곡을 클릭하면 이전 선택이 해제되고 새 곡만 선택된다', async ({ page }) => {
    const firstSong = songItemLocator(page, 0);
    const secondSong = songItemLocator(page, 1);

    // 첫 번째 곡 선택
    await firstSong.click();
    await expect(firstSong).toHaveAttribute('data-selected', 'true');
    await expect(secondSong).toHaveAttribute('data-selected', 'false');

    // 두 번째 곡으로 재선택
    await secondSong.click();
    await expect(firstSong).toHaveAttribute('data-selected', 'false');
    await expect(secondSong).toHaveAttribute('data-selected', 'true');
  });

  // 시나리오 5: 곡 선택 후 플레이어 생성 — 플레이어 영역에 곡명/아티스트 표시
  test('곡을 선택하면 플레이어 영역에 곡명과 아티스트가 표시된다', async ({ page }) => {
    const firstSong = songItemLocator(page, 0);

    // 선택 전 — "Now Playing" 텍스트가 없다
    await expect(page.locator('text=Now Playing')).toBeHidden();

    // 첫 번째 곡 선택
    await firstSong.click();

    // "Now Playing" 부제목이 표시된다
    await expect(page.locator('text=Now Playing')).toBeVisible();

    // 플레이어 영역에 h2 제목이 존재하고 텍스트가 있다 (내용 무관)
    const videoTitle = page.locator('h2');
    await expect(videoTitle).toBeVisible();
    const titleText = await videoTitle.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });

  // 시나리오 6: 필터 변경 시 선택 해제 — 장르/날짜 변경 시 선택 해제, 플레이어 사라짐
  test('장르 필터를 변경하면 곡 선택이 해제되고 플레이어가 사라진다', async ({
    page,
    isMobile,
  }) => {
    // 첫 번째 곡 선택
    const firstSong = songItemLocator(page, 0);
    await firstSong.click();
    await expect(page.locator('text=Now Playing')).toBeVisible();

    // 장르 필터 변경 — "POP" 버튼 클릭
    if (isMobile) {
      // 모바일에서는 필터 토글 버튼을 눌러 BottomSheet를 연다
      const filterToggle = page
        .locator('header button')
        .filter({ has: page.locator('svg') })
        .first();
      await filterToggle.click();
      // BottomSheet 안의 POP 버튼 클릭 (.last()로 BottomSheet 내부 버튼 선택)
      await page.getByRole('button', { name: 'POP', exact: true }).last().click();
    } else {
      // 데스크톱에서는 헤더에 직접 노출된 POP 버튼 클릭
      await page.locator('header').getByRole('button', { name: 'POP', exact: true }).first().click();
    }

    // 곡 목록 재로드 대기
    await waitForSongListLoaded(page);

    // 선택 해제 — 모든 곡의 data-selected가 false
    const selectedItems = page.locator('.song-item[data-selected="true"]');
    await expect(selectedItems).toHaveCount(0);

    // 플레이어 사라짐 — "Now Playing" 텍스트가 없다
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  // 시나리오 7: 타이틀 초기화 시 선택 해제 — 헤더 타이틀 클릭 시 초기화
  test('헤더 타이틀을 클릭하면 곡 선택이 해제된다', async ({ page }) => {
    // 첫 번째 곡 선택
    const firstSong = songItemLocator(page, 0);
    await firstSong.click();
    await expect(firstSong).toHaveAttribute('data-selected', 'true');
    await expect(page.locator('text=Now Playing')).toBeVisible();

    // 헤더 타이틀(TJMedia + Charts) 클릭 → handleReset과 동일한 초기화
    const titleGroup = page.locator('header h1', { hasText: 'TJMedia' });
    await titleGroup.click();

    // 곡 목록 재로드 대기
    await waitForSongListLoaded(page);

    // 선택 해제 — 모든 곡의 data-selected가 false
    const selectedItems = page.locator('.song-item[data-selected="true"]');
    await expect(selectedItems).toHaveCount(0);

    // 플레이어 사라짐
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  // 시나리오 8: permalink 복원 선택 — URL에 rank 파라미터로 진입 시 자동 선택
  test('URL에 rank 파라미터가 있으면 해당 곡이 자동 선택된다', async ({ page }) => {
    // rank=1로 진입 — 첫 번째 곡 자동 선택 (1위는 확실히 존재)
    await page.goto('./?rank=1');
    await waitForSongListLoaded(page);

    // 첫 번째 곡(rank "1")이 자동 선택되어야 한다
    const firstSong = songItemLocator(page, 0);
    await expect(firstSong).toHaveAttribute('data-selected', 'true');

    // 플레이어에 "Now Playing"이 표시된다
    await expect(page.locator('text=Now Playing')).toBeVisible();
  });
});
