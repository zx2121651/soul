import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete the full registration flow', async ({ page }) => {
    // 1. Open login page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Soul 登录');

    // 2. Click "Go to Register"
    await page.click('text=立即注册');
    await expect(page.locator('h1')).toContainText('手机号');

    // Mock API responses for stability
    // Mock send-code
    await page.route('**/api/auth/send-code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 0, message: 'Success', data: null }),
      });
    });

    // Mock login (OTP verification)
    await page.route('**/api/auth/login', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        if (payload.code) { // OTP flow
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 0,
              message: 'Success',
              data: {
                requiresRegistration: true,
                registerToken: 'mock_register_token_123'
              }
            }),
          });
          return;
        }
      }
      await route.continue();
    });

    // Mock final register
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'Success',
          data: {
            token: 'mock_access_token',
            user: {
              id: 999,
              uuid: 'mock-uuid',
              name: '测试用户',
              avatar: '/assets/avatars/avatar1.svg'
            }
          }
        }),
      });
    });

    // 3. Enter Phone
    await page.fill('input[type="tel"]', '13812345678');
    await page.click('button:has-text("获取验证码")');

    // 4. Enter OTP
    await expect(page.locator('h1')).toContainText('验证码');
    // Assuming OtpInput has 6 inputs
    const otpInputs = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('1');
    }

    // 5. Basic Info (Gender/Birthday)
    await expect(page.locator('h1')).toContainText('基础信息');
    await page.click('button:has-text("男生")');
    await page.fill('input[type="date"]', '2000-01-01');
    await page.click('button:has-text("下一步")');

    // 6. Nickname
    await expect(page.locator('h1')).toContainText('灵魂花名');
    await page.fill('input[placeholder="专属昵称"]', '灵魂舞者');
    await page.click('button:has-text("下一步")');

    // 7. Avatar
    await expect(page.locator('h1')).toContainText('选择头像');
    await page.click('button:has-text("下一步")');

    // 8. Interests
    await expect(page.locator('h1')).toContainText('兴趣星球');
    // Select at least 3 tags
    const tags = ['摇滚', '健身', '二次元'];
    for (const tag of tags) {
      await page.click(`button:has-text("${tag}")`, { force: true });
    }
    await page.click('button:has-text("开启星球旅程")');

    // 9. Verify redirect to /planet
    await expect(page).toHaveURL(/\/planet/);
    await expect(page.locator('span.text-\\[10px\\]:has-text("星球")')).toBeVisible();
  });
});
