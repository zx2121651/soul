import { test, expect } from '@playwright/test';

test.describe('Register Page Nickname Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    // Step 1: Fill basic info
    await page.click('button:has-text("男生")');
    await page.fill('input[type="date"]', '2000-01-01');
    await page.click('button:has-text("下一步")');
    await expect(page.locator('text=灵魂花名')).toBeVisible();
  });

  test('should validate nickname length', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    // Too short
    await input.fill('a');
    await expect(page.locator('text=昵称长度需在 2-12 个字符之间')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    // Valid
    await input.fill('ValidName');
    await expect(page.locator('text=昵称长度需在 2-12 个字符之间')).not.toBeVisible();
    await expect(nextBtn).toBeEnabled();
  });

  test('should validate special characters', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    await input.fill('Name!');
    await expect(page.locator('text=昵称只能包含中英文和数字')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    await input.fill('测试123');
    await expect(page.locator('text=昵称只能包含中英文和数字')).not.toBeVisible();
    await expect(nextBtn).toBeEnabled();
  });

  test('should validate restricted words', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    await input.fill('AdminUser');
    await expect(page.locator('text=昵称包含不合适的内容')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    await input.fill('Official官方');
    await expect(page.locator('text=昵称包含不合适的内容')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    await input.fill('GuanFangUser');
    await expect(page.locator('text=昵称包含不合适的内容')).toBeVisible();
    await expect(nextBtn).toBeDisabled();
  });

  test('should limit input length to 12', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    await input.fill('a'.repeat(20));
    const value = await input.inputValue();
    expect(value.length).toBe(12);
    await expect(page.locator('text=12/12')).toBeVisible();
  });

  test('should proceed to step 3 on valid nickname', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    await input.fill('HappyUser');
    await nextBtn.click();

    await expect(page.locator('text=账号设置')).toBeVisible();
    await expect(page.locator('text=3/3')).toBeVisible();
  });
});
