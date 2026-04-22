import { test, expect } from '@playwright/test';

test('App Screenshot Tour', async ({ page }) => {
  // Config
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro size

  console.log('Starting screenshot tour...');

  // 1. Login Page
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/01_LoginPage.png', fullPage: true });

  // Do Login
  await page.fill('input[placeholder="请输入用户名/手机号"]', 'testuser');
  await page.fill('input[placeholder="请输入密码"]', 'testpassword123');
  await page.click('button[type="submit"]');

  // 2. Planet Page
  await page.waitForURL('**/planet');
  await page.waitForTimeout(3000); // let 3d render a bit
  await page.screenshot({ path: 'screenshots/02_PlanetPage.png', fullPage: true });

  // 3. Notifications
  await page.click('button:has(svg.lucide-bell)');
  await page.waitForURL('**/notifications');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/03_NotificationsPage.png', fullPage: true });

  // 4. Explore Page
  await page.goto('http://localhost:5173/explore');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/04_ExplorePage.png', fullPage: true });

  // 5. Chat Page
  await page.goto('http://localhost:5173/chat');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/05_ChatPage.png', fullPage: true });

  // Open a chat
  const chatAvatar = page.locator('img[alt="avatar"]').first();
  if (await chatAvatar.isVisible()) {
    await chatAvatar.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/06_ChatRoom.png', fullPage: true });

    // Open rich media plus menu
    const plusBtn = page.locator('button:has(svg.lucide-plus)');
    if (await plusBtn.isVisible()) {
        await plusBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/07_ChatRoom_MediaMenu.png', fullPage: true });
    }
  }

  // 6. Me Page
  await page.goto('http://localhost:5173/me');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/08_MePage.png', fullPage: true });

  // Open settings
  await page.click('button:has(svg.lucide-menu)');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/09_SettingsDrawer.png' });

  // 7. Tag Moments Page (force via URL)
  await page.goto('http://localhost:5173/tag/日常');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/10_TagMomentsPage.png', fullPage: true });

  console.log('Screenshots generated in /screenshots directory.');
});
