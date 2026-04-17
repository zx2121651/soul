import { test, expect } from '@playwright/test';

test.describe('Register Page Nickname Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API for registration flow
    await page.route('**/api/auth/send-code', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: null }) });
    });
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { requiresRegistration: true, registerToken: 'mock' } }) });
    });

    await page.goto('/register');

    // Step 1: Phone
    await page.fill('input[type="tel"]', '13800000000');
    await page.click('button:has-text("获取验证码")');

    // Step 2: OTP
    const otpInputs = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('1');
    }

    // Step 3: Basic info
    await expect(page.locator('h1')).toContainText('基础信息');
    await page.click('button:has-text("男生")');
    await page.fill('input[type="date"]', '2000-01-01');
    await page.click('button:has-text("下一步")');

    // Should be at Step 4 now
    await expect(page.locator('text=4/6')).toBeVisible();
    await expect(page.locator('h1')).toContainText('灵魂花名');
  });

  test('should validate nickname length', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    // Too short
    await input.fill('a');
    await expect(page.locator('text=昵称长度需在 2-12 个字符之间')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    // Valid
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

  test('should proceed to step 6 on valid nickname, avatar and interests', async ({ page }) => {
    const input = page.locator('input[placeholder="专属昵称"]');
    const nextBtn = page.locator('button:has-text("下一步")');

    await input.fill('居民小助手');
    await nextBtn.click();

    await expect(page.locator('text=5/6')).toBeVisible();
    await expect(page.locator('h1')).toContainText('选择头像');

    // Click "Next step" (下一步) - used to be "Just use this"
    await page.click('button:has-text("下一步")');

    await expect(page.locator('text=6/6')).toBeVisible();
    await expect(page.locator('h1')).toContainText('兴趣星球');

    // Select at least 3
    const tags = ['摇滚', '健身', '二次元'];
    for (const tag of tags) {
      await page.click(`button:has-text("${tag}")`, { force: true });
    }

    await expect(page.locator('button:has-text("开启星球旅程")')).toBeEnabled();
  });
});
