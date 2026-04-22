import { test, expect } from '@playwright/test';

test('App Screenshot Tour 2', async ({ page }) => {
  // Config
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro size

  console.log('Starting screenshot tour...');

  // Mock fake login locally
  await page.goto('http://localhost:5173/login');
  await page.evaluate(() => {
    localStorage.setItem('soul_token', 'fake_token_for_playwright');
  });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // 2. Planet Page
  await page.goto('http://localhost:5173/planet');
  await page.waitForTimeout(5000); // let 3d render a bit
  await page.screenshot({ path: 'screenshots/02_PlanetPage.png', fullPage: true });

  console.log('Screenshots generated in /screenshots directory.');
});
