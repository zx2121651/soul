import { test, expect } from '@playwright/test';

test('open chat room and check settings menu', async ({ page }) => {
  // First, load the app so bootstrapApp() auths
  await page.goto('http://localhost:5173/planet');
  await page.waitForTimeout(1000);

  // Go to chat page
  await page.goto('http://localhost:5173/chat');

  // Wait for chat list to load
  await page.waitForSelector('img[alt="avatar"]', { state: 'visible', timeout: 5000 });

  // Click on the first chat to open ChatRoom
  await page.click('img[alt="avatar"]');

  // Wait for ChatRoom to animate in (looking for Send button)
  await page.waitForSelector('input[placeholder="发消息..."]', { state: 'visible', timeout: 5000 });

  // Find the MoreHorizontal button in top nav
  // It's the last button in the flex container next to Video
  const moreBtn = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') });
  await moreBtn.click();

  // Verify ActionSheet appears
  await expect(page.locator('text=拉黑此人')).toBeVisible();
  await expect(page.locator('text=举报')).toBeVisible();
  await expect(page.locator('text=清空聊天记录')).toBeVisible();
  await expect(page.locator('text=取消')).toBeVisible();

  // Click report to test toast
  await page.click('text=举报');

  // Verify toast
  await expect(page.locator('text=已提交举报，我们将尽快处理')).toBeVisible();
});
