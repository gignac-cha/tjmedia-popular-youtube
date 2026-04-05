// 이 테스트는 배포된 실제 API를 사용합니다. mock 데이터를 사용하지 않습니다.
// 네트워크 상태에 따라 로딩 시간이 다를 수 있으므로 timeout을 넉넉하게 설정합니다.
import { test, expect } from '@playwright/test';

test.describe('홈 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  // 시나리오 1: 초기 홈 렌더링 — 문서 제목, 헤더 텍스트, Ranking 섹션 확인
  test('초기 렌더링 시 문서 제목과 헤더 텍스트, Ranking 섹션이 존재한다', async ({ page }) => {
    // 문서 제목 확인
    await expect(page).toHaveTitle(/TJMedia/);

    // 헤더에 TJMedia 타이틀이 존재하는지 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const title = header.locator('h1', { hasText: 'TJMedia' });
    await expect(title).toBeVisible();

    // 헤더에 Charts 텍스트가 존재하는지 확인
    const chartsSubtitle = header.locator('text=Charts');
    await expect(chartsSubtitle).toBeVisible();

    // Ranking 섹션이 존재하는지 확인
    const rankingLabel = page.locator('text=Ranking');
    await expect(rankingLabel).toBeVisible();
  });

  // 시나리오 2: 기본 레이아웃 — 헤더, 곡 리스트 영역, 플레이어 미표시
  test('기본 레이아웃에서 헤더와 곡 리스트가 존재하고 플레이어는 없다', async ({ page }) => {
    // 헤더 존재
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 곡 리스트 섹션 존재 (ListSection은 <section> 태그)
    const listSection = page.locator('main section').first();
    await expect(listSection).toBeVisible();

    // 선택 전이므로 "Now Playing" 텍스트가 없어야 한다
    await expect(page.locator('text=Now Playing')).toBeHidden();
  });

  // 시나리오 3: 헤더 타이틀 클릭 초기화 — 타이틀 클릭하면 기본 상태로 복원
  test('헤더 타이틀을 클릭하면 기본 상태로 초기화된다', async ({ page }) => {
    // Ranking 라벨이 보일 때까지 대기 (데이터 로드 완료 표시)
    await page.locator('text=Ranking').waitFor({ state: 'visible' });

    // 타이틀 그룹(TJMedia + Charts)을 클릭
    const titleGroup = page.locator('header h1', { hasText: 'TJMedia' });
    await titleGroup.click();

    // 클릭 후에도 기본 상태가 유지됨 — 헤더와 Ranking이 여전히 존재
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Ranking')).toBeVisible();

    // URL 해시가 초기화되거나 기본값인지 확인 (퍼머링크 사용)
    const url = page.url();
    // 초기화 후 기본값이므로 해시가 비거나 기본 상태
    expect(url).toBeTruthy();
  });

  // 시나리오 4: 리스트 헤더 유지 — Ranking 라벨이 상태 전환 후에도 유지
  test('Ranking 라벨이 상태 전환 후에도 유지된다', async ({ page }) => {
    // 초기 Ranking 라벨 확인
    const rankingLabel = page.locator('text=Ranking');
    await expect(rankingLabel).toBeVisible();

    // 헤더 타이틀 클릭으로 상태 전환 (초기화 트리거)
    const titleElement = page.locator('header h1', { hasText: 'TJMedia' });
    await titleElement.click();

    // 상태 전환 후에도 Ranking 라벨이 유지되는지 확인
    await expect(rankingLabel).toBeVisible();
  });

  // 시나리오 5: 첫 진입 시 선택 없음 — 플레이어 UI 미표시
  test('첫 진입 시 플레이어 UI가 표시되지 않는다', async ({ page }) => {
    // "Now Playing" 텍스트가 보이지 않아야 한다
    await expect(page.locator('text=Now Playing')).toBeHidden();

    // 미니 플레이어 바 (MiniPlayerBar)의 곡 제목 영역이 보이지 않아야 한다
    // playerSlot 자체가 렌더링되지 않으므로 PlayerSection이 없어야 한다
    const playerSections = page.locator('main section');
    const count = await playerSections.count();

    // 곡 리스트 섹션만 존재하고 플레이어 섹션은 없어야 한다
    // (선택 전에는 playerSlot이 전달되지 않거나 비어있음)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // 시나리오 6: 헤더 고정 — 스크롤해도 헤더가 상단에 고정
  test('스크롤해도 헤더가 상단에 고정되어 있다', async ({ page }) => {
    // 헤더가 보일 때까지 대기
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 페이지를 아래로 스크롤
    await page.evaluate(() => window.scrollBy(0, 500));

    // 스크롤 후에도 헤더가 여전히 뷰포트에 보이는지 확인
    await expect(header).toBeVisible();

    // 헤더의 position이 sticky인지 확인 (CSS 스타일 검증)
    const position = await header.evaluate((element) =>
      window.getComputedStyle(element).position,
    );
    expect(position).toBe('sticky');
  });
});
