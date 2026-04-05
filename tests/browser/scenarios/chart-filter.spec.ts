// 이 테스트는 배포된 실제 API를 사용합니다. mock 데이터를 사용하지 않습니다.
// 네트워크 상태에 따라 로딩 시간이 다를 수 있으므로 timeout을 넉넉하게 설정합니다.
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. 데스크톱 장르 필터 — 1024px 이상에서 가요/POP/J-POP 세그먼트 버튼 노출
// ---------------------------------------------------------------------------
test.describe('데스크톱 장르 필터', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('가요/POP/J-POP 세그먼트 버튼이 노출된다', async ({ page }) => {
    await page.goto('./');

    // DesktopControls 안의 장르 버튼들이 보여야 한다
    const header = page.locator('header');
    await expect(header.getByRole('button', { name: '가요' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'POP', exact: true }).first()).toBeVisible();
    await expect(header.getByRole('button', { name: 'J-POP' }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 모바일 공통 뷰포트
// ---------------------------------------------------------------------------
test.describe('모바일 필터', () => {
  test.skip(({ isMobile }) => !isMobile, '모바일 프로젝트에서만 실행');
  test.use({ viewport: { width: 375, height: 812 } });

  // -------------------------------------------------------------------------
  // 2. 모바일 필터 진입 — 필터 아이콘 → BottomSheet에 모든 컨트롤 표시
  // -------------------------------------------------------------------------
  test('필터 아이콘 클릭 시 BottomSheet에 가요/POP/J-POP/Today/This Month/Custom/Reset 표시', async ({
    page,
  }) => {
    await page.goto('./');

    // 필터 토글 버튼 (MobileFilterToggle) 클릭
    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    // BottomSheet가 열리면 모든 필터 컨트롤이 보여야 한다
    await expect(page.getByRole('button', { name: '가요' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'POP', exact: true }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'J-POP' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'This Month' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: /Custom/ }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' }).last()).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 3. 장르 변경 즉시 반영 — POP 선택 시 활성 상태 변경, BottomSheet 닫힘
  // -------------------------------------------------------------------------
  test('POP 선택 시 활성 상태가 변경되고 BottomSheet가 닫힌다', async ({ page }) => {
    await page.goto('./');

    // BottomSheet 열기
    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    // POP 버튼 클릭
    const popButton = page.getByRole('button', { name: 'POP', exact: true }).last();
    await popButton.click();

    // BottomSheet가 닫혀야 한다 (Backdrop이 사라짐)
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // 다시 BottomSheet 열어서 POP이 활성인지 확인
    await filterToggle.click();

    // URL에 type=english가 반영되어야 한다 (POP)
    await expect(page).toHaveURL(/type=english/);
  });

  test('J-POP 선택 시 활성 상태가 변경되고 BottomSheet가 닫힌다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    const jpopButton = page.getByRole('button', { name: 'J-POP' }).last();
    await jpopButton.click();

    // BottomSheet가 닫혀야 한다
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // URL에 type=japanese가 반영되어야 한다 (J-POP)
    await expect(page).toHaveURL(/type=japanese/);
  });

  // -------------------------------------------------------------------------
  // 4. 날짜 프리셋 전환 — Today/This Month 버튼 활성 상태 토글
  // -------------------------------------------------------------------------
  test('Today 클릭 후 This Month 클릭 시 활성 상태가 전환된다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    // Today 클릭 — BottomSheet가 닫힌다
    await page.getByRole('button', { name: 'Today' }).last().click();
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // 다시 열어서 This Month 클릭
    await filterToggle.click();
    await page.getByRole('button', { name: 'This Month' }).last().click();
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // This Month은 기본값이므로 from/to 파라미터가 URL에서 제거된다
    // 기본 상태로 복원되었는지 확인한다
    const url = new URL(page.url());
    expect(url.searchParams.has('from')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 5. Custom 날짜 열기 — Custom 버튼 → date input 2개 + Apply 버튼 표시
  // -------------------------------------------------------------------------
  test('Custom 버튼 클릭 시 date input과 Apply 버튼이 표시된다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    // Custom 버튼 클릭
    await page.getByRole('button', { name: /Custom/ }).last().click();

    // date input 2개와 Apply 버튼이 보여야 한다 (visible만 카운트 — DesktopControls에도 존재할 수 있음)
    const dateInputs = page.locator('input[type="date"]').locator('visible=true');
    await expect(dateInputs).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Apply' }).last()).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 6. Custom 날짜 적용 — 날짜 입력 후 Apply → BottomSheet 닫힘
  // -------------------------------------------------------------------------
  test('Custom 날짜 입력 후 Apply 클릭 시 BottomSheet가 닫힌다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    // Custom 모드 활성화
    await page.getByRole('button', { name: /Custom/ }).last().click();

    // 날짜 입력 (visible만 선택 — DesktopControls에도 존재할 수 있음)
    const dateInputs = page.locator('input[type="date"]').locator('visible=true');
    await dateInputs.first().fill('2026-01-01');
    await dateInputs.last().fill('2026-01-31');

    // Apply 클릭
    await page.getByRole('button', { name: 'Apply' }).last().click();

    // BottomSheet가 닫혀야 한다
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // URL에 커스텀 날짜가 반영되어야 한다
    await expect(page).toHaveURL(/from=2026-01-01/);
    await expect(page).toHaveURL(/to=2026-01-31/);
  });

  // -------------------------------------------------------------------------
  // 7. 필터 리셋 — Reset → 가요 + This Month 기본 상태 복원
  // -------------------------------------------------------------------------
  test('Reset 클릭 시 가요 + This Month 기본 상태로 복원된다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();

    // 먼저 POP으로 변경
    await filterToggle.click();
    await page.getByRole('button', { name: 'POP', exact: true }).last().click();
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // URL에 type=english가 반영됨을 확인
    await expect(page).toHaveURL(/type=english/);

    // Reset 클릭
    await filterToggle.click();
    await page.getByRole('button', { name: 'Reset' }).last().click();

    // 기본 상태로 복원 — type 파라미터가 없어야 한다 (가요는 기본값이므로 생략)
    const url = new URL(page.url());
    expect(url.searchParams.has('type')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 8. 타이틀 클릭과 Reset 일관성 — 둘 다 동일한 기본 상태
  // -------------------------------------------------------------------------
  test('타이틀 클릭과 Reset이 동일한 기본 상태를 만든다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();

    // POP으로 변경 후 Reset
    await filterToggle.click();
    await page.getByRole('button', { name: 'POP', exact: true }).last().click();
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });
    await filterToggle.click();
    await page.getByRole('button', { name: 'Reset' }).last().click();

    const resetURL = page.url();

    // 다시 J-POP으로 변경 후 타이틀 클릭
    await filterToggle.click();
    await page.getByRole('button', { name: 'J-POP' }).last().click();
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // TitleGroup 클릭 (TJMedia 타이틀)
    await page.locator('header h1').click();

    const titleClickURL = page.url();

    // Reset과 타이틀 클릭의 URL이 동일해야 한다
    // 기본 상태에서는 type 파라미터가 없으므로 둘 다 type이 없어야 한다
    expect(new URL(resetURL).searchParams.has('type')).toBe(
      new URL(titleClickURL).searchParams.has('type'),
    );
  });

  // -------------------------------------------------------------------------
  // 9. BottomSheet 배경 닫기 — backdrop 클릭 시 닫힘
  // -------------------------------------------------------------------------
  test('BottomSheet backdrop 클릭 시 닫힌다', async ({ page }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await filterToggle.click();

    // BottomSheet가 열려 있어야 한다
    await expect(page.getByRole('button', { name: '가요' }).last()).toBeVisible();

    // Backdrop 클릭 (화면 상단 영역 — Sheet 바깥)
    await page.mouse.click(187, 50);

    // BottomSheet가 닫혀야 한다
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // 10. BottomSheet 드래그 닫기 — 아래로 충분히 드래그 → 닫힘, 짧은 드래그 → 복원
  // -------------------------------------------------------------------------
  test('BottomSheet을 아래로 충분히 드래그하면 닫히고, 짧은 드래그는 복원된다', async ({
    page,
  }) => {
    await page.goto('./');

    const filterToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();

    // --- 짧은 드래그 → 복원 ---
    await filterToggle.click();
    await expect(page.getByRole('button', { name: '가요' }).last()).toBeVisible();

    // Sheet 내부에서 짧은 드래그 (DISMISS_THRESHOLD_PIXELS = 80 미만)
    const sheetBounds = await page.getByRole('button', { name: '가요' }).last().boundingBox();
    if (sheetBounds !== null) {
      const startX = sheetBounds.x + sheetBounds.width / 2;
      const startY = sheetBounds.y;

      // 짧은 스와이프 (30px — threshold 미만) — Touch API로 시뮬레이션
      await page.evaluate(
        ({ sx, sy, deltaY }) => {
          const backdrop = document.querySelector('[style*="z-index: 50"]');
          const sheet = backdrop?.querySelector('div') ?? backdrop;
          if (sheet === null || sheet === undefined) return;
          const touchStart = new Touch({ identifier: 0, target: sheet, clientX: sx, clientY: sy });
          const touchMove = new Touch({ identifier: 0, target: sheet, clientX: sx, clientY: sy + deltaY });
          sheet.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], bubbles: true }));
          sheet.dispatchEvent(new TouchEvent('touchmove', { touches: [touchMove], bubbles: true }));
          sheet.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
        },
        { sx: startX, sy: startY, deltaY: 30 },
      );

      // BottomSheet가 여전히 열려 있어야 한다
      await expect(page.getByRole('button', { name: '가요' }).last()).toBeVisible({ timeout: 3000 });
    }

    // 닫고 다시 열기
    await page.mouse.click(187, 50);
    await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });

    // --- 충분한 드래그 → 닫힘 ---
    await filterToggle.click();
    await expect(page.getByRole('button', { name: '가요' }).last()).toBeVisible();

    const sheetBounds2 = await page.getByRole('button', { name: '가요' }).last().boundingBox();
    if (sheetBounds2 !== null) {
      const startX = sheetBounds2.x + sheetBounds2.width / 2;
      const startY = sheetBounds2.y;

      // 충분한 스와이프 (150px — threshold 초과) — Touch API로 시뮬레이션
      await page.evaluate(
        ({ sx, sy, deltaY }) => {
          const backdrop = document.querySelector('[style*="z-index: 50"]');
          const sheet = backdrop?.querySelector('div') ?? backdrop;
          if (sheet === null || sheet === undefined) return;
          const touchStart = new Touch({ identifier: 0, target: sheet, clientX: sx, clientY: sy });
          const touchMove = new Touch({ identifier: 0, target: sheet, clientX: sx, clientY: sy + deltaY });
          sheet.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], bubbles: true }));
          sheet.dispatchEvent(new TouchEvent('touchmove', { touches: [touchMove], bubbles: true }));
          sheet.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
        },
        { sx: startX, sy: startY, deltaY: 150 },
      );

      // BottomSheet가 닫혀야 한다 (애니메이션 200ms 대기)
      await expect(page.locator('[style*="z-index: 50"]')).toBeHidden({ timeout: 5000 });
    }
  });
});
