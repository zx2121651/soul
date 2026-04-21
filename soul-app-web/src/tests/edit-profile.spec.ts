import { test, expect } from '@playwright/test';

test.describe('Edit Profile', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login or setup auth state
    // We can use a mock login or direct storage injection if we have a way to bypass OTP
    // For this test, let's assume we can navigate to edit profile if we are "logged in"

    await page.addInitScript(() => {
      window.localStorage.setItem('soul-auth-storage', JSON.stringify({
        state: {
          user: { id: 1, uuid: 'test-uuid', name: 'OriginalName', avatar: '/assets/avatars/avatar1.svg' },
          accessToken: 'mock-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });
  });

  test('should update name and bio', async ({ page }) => {
    // Mock the APIs
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'success',
          data: {
            profile: {
              id: 'test-uuid',
              name: 'OriginalName',
              avatar: '/assets/avatars/avatar1.svg',
              bio: 'Original Bio'
            },
            moments: []
          }
        })
      });
    });

    await page.route('**/api/users/me', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            message: 'success',
            data: {
              profile: {
                id: 'test-uuid',
                name: 'OriginalName',
                avatar: '/assets/avatars/avatar1.svg',
                bio: 'Original Bio'
              },
              moments: []
            }
          })
        });
        return;
      }

      const payload = route.request().postDataJSON();
      expect(payload.name).toBe('NewName');
      expect(payload.bio).toBe('New Bio');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'success',
          data: {
            profile: {
              id: 'test-uuid',
              name: 'NewName',
              avatar: '/assets/avatars/avatar1.svg',
              bio: 'New Bio'
            }
          }
        })
      });
    });

    await page.goto('/'); // Start at home/planet
    await page.goto('/edit-profile');

    // Check initial values
    await expect(page.locator('input[placeholder="请输入你的专属昵称"]')).toHaveValue('OriginalName');
    await expect(page.locator('textarea[placeholder="用一段话向宇宙介绍你自己..."]')).toHaveValue('Original Bio');

    // Update values
    await page.fill('input[placeholder="请输入你的专属昵称"]', 'NewName');
    await page.fill('textarea[placeholder="用一段话向宇宙介绍你自己..."]', 'New Bio');

    // Save
    await page.click('button:has(svg.lucide-check)');

    // Should navigate back
    await page.waitForURL((url) => !url.pathname.includes('/edit-profile'));
    expect(page.url()).not.toContain('/edit-profile');
  });

  test('should handle avatar upload flow', async ({ page }) => {
    // Mock APIs
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            profile: { id: 'test-uuid', name: 'User', avatar: 'old.jpg' },
            moments: []
          }
        })
      });
    });

    await page.route('**/api/upload/presigned-url*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            uploadUrl: 'http://mock-oss.com/upload',
            publicUrl: 'http://mock-oss.com/new-avatar.jpg'
          }
        })
      });
    });

    await page.route('http://mock-oss.com/upload', async (route) => {
      expect(route.request().method()).toBe('PUT');
      await route.fulfill({ status: 200 });
    });

    await page.goto('/edit-profile');

    // Trigger file selection
    const fileChooserPromise = page.waitForEvent('filechooser');
    // The overlay might intercept the click, so we click the container or use force
    await page.locator('img[alt="avatar"]').click({ force: true });
    const fileChooser = await fileChooserPromise;

    // Create a valid small PNG image buffer
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await fileChooser.setFiles([{
        name: 'test.png',
        mimeType: 'image/png',
        buffer
    }]);

    // Cropper should appear
    await expect(page.locator('text=裁剪头像')).toBeVisible();
    // Wait for the image to load in cropper
    await page.waitForTimeout(1000);

    // Click OK on cropper
    await page.click('button:has-text("确定")');

    // Loading indicator should appear - might be fast, but we can check if it eventually disappears or the avatar updates
    // await expect(page.locator('text=%')).toBeVisible();

    // After upload, avatar should be updated
    await expect(page.locator('img[alt="avatar"]')).toHaveAttribute('src', 'http://mock-oss.com/new-avatar.jpg');
  });
});
