import { test, expect } from '@playwright/test';

test.describe('Register Page Nickname Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    // Step 1: Fill basic info
    await page.click('button:has-text("男生")');
    await page.fill('input[type="date"]', '2000-01-01');
    await page.click('button:has-text("下一步")');
    await expect(page.locator('text=2/4')).toBeVisible();
  });

  test('should validate nickname length', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    // Too short
    await input.fill('a');
    await expect(page.locator('text=昵称长度需在 2-12 个字符之间')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    // Valid
    await input.fill('souluser');
    // Note: 'souluser' contains 'soul', so it might fail restricted words.
    // Let's use 'myuser123'
    await input.fill('myuser123');
    await expect(page.locator('text=昵称长度需在 2-12 个字符之间')).not.toBeVisible();
    await expect(nextBtn).toBeEnabled();
  });

  test('should validate special characters', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    await input.fill('user@123');
    await expect(page.locator('text=昵称只能包含中英文和数字')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    await input.fill('用户123');
    await expect(page.locator('text=昵称只能包含中英文和数字')).not.toBeVisible();
    await expect(nextBtn).toBeEnabled();
  });

  test('should validate restricted words', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    await input.fill('管理员');
    await expect(page.locator('text=昵称包含不合适的内容')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    await input.fill('sb');
    await expect(page.locator('text=昵称包含不合适的内容')).toBeVisible();
    await expect(nextBtn).toBeDisabled();
  });

  test('should limit input length to 12', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    await input.fill('a'.repeat(15));
    const value = await input.inputValue();
    expect(value.length).toBe(12);
  });

  test('should proceed to step 4 on valid nickname and avatar', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    // 'Soul小助手' contains 'Soul' which is a bad word.
    await input.fill('居民小助手');
    await nextBtn.click();

    await expect(page.locator('text=3/4')).toBeVisible();
    await expect(page.locator('text=选择头像')).toBeVisible();

    // Click "Just use this" (就用这个)
    await page.click('button:has-text("就用这个")');

    await expect(page.locator('text=4/4')).toBeVisible();
    await expect(page.locator('text=账号设置')).toBeVisible();
  });
});
