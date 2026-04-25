import { test, expect } from '@playwright/test';

test('capture planet page UI changes', async ({ page }) => {

  await page.route('**/api/planet', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ nodes: [
        { id: "1", isSelf: true, avatar: "/assets/avatars/avatar1.svg", position: [0,0,0], size: 1, name: "test", color: "#FF9A9E", phase: 0, speed: 1, amplitude: 1, match: 100 }
      ] })
    });
  });

  await page.route('**/api/announcements*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ latest: null })
    });
  });

  // Navigate to root to load the SPA
  await page.goto('/');

  // wait for login page to load to ensure JS is active
  await page.waitForSelector('input[placeholder="请输入您的账号"]');

  // Inject auth state
  await page.evaluate(() => {
    localStorage.setItem('soul-auth-storage', JSON.stringify({
      state: {
        accessToken: "fake-token",
        user: { id: 1, uuid: "1", name: "test", avatar: "" },
        isAuthenticated: true
      },
      version: 0
    }));
  });

  // Now navigate to the planet route directly
  await page.goto('/planet');

  // Wait for planet page to load completely (e.g. 3D canvas is present)
  await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });

  // Wait a bit for animations to settle and components to mount
  await page.waitForTimeout(3000);

  // Assert TopBar changes
  await expect(page.locator('text=灵魂测试')).toBeVisible();
  await expect(page.locator('text=当前 1,234,567 人在线')).toBeVisible();

  // Assert vertical banner changes
  await expect(page.locator('text=同城卡/加速卡/定位卡')).toBeVisible();

  // Assert badge text change
  await expect(page.locator('text=收到来电~')).toBeVisible();

  // Assert center prompt is gone
  await expect(page.locator('text=加速中，立即体验！')).toBeHidden();

});
