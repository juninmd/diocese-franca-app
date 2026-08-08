const { test, expect } = require('@playwright/test');

test('Home screen displays welcome and takes a screenshot', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://127.0.0.1:3001');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Then try to assert the text
  await expect(page.locator('text=Bem-vindo, Fiel!')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=Notícias da Diocese')).toBeVisible({ timeout: 15000 });

  // Take a full page screenshot to see what's actually rendered
  await page.screenshot({ path: 'screenshots/home_full.png', fullPage: true });
});