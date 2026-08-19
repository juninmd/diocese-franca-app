const { test, expect } = require('@playwright/test');

test('navigate and capture screenshots for all screens', async ({ page }) => {
  // Wait for the app to be fully ready
  await page.goto('http://localhost:3001/');
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000); // Give time for any animations or images to load
  await page.screenshot({ path: 'screenshots/home_full.png', fullPage: true });

  // Navigate to Igrejas using Exact text for Bottom Tab
  await page.locator('div:text-is("Igrejas")').first().click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/churches_full.png', fullPage: true });

  // Navigate to Padres using Exact text for Bottom Tab
  await page.locator('div:text-is("Padres")').first().click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/priests_full.png', fullPage: true });

  // Navigate to Missas using Exact text for Bottom Tab
  await page.locator('div:text-is("Missas")').first().click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/masses_full.png', fullPage: true });
});
