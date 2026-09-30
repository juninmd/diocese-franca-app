const { test, expect } = require('@playwright/test');

test('navigate and capture screenshots for all screens', async ({ page }) => {
  // Wait for the app to be fully ready
  await page.goto('http://localhost:3001/');

  // Ensure the app is connected to the backend to avoid the offline banner in screenshots
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(3000); // Give time for any animations, images to load and network status to settle

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

  // Empty State - Missas
  // Emulate an empty state for missas by clicking "Domingo" when it may be empty,
  // Or we can simulate it by searching for something that doesn't exist on Igrejas/Padres.

  // Empty states are already tested and screenshoted in separate spec files:
  // e2e/churches_priests_empty.spec.js
  // e2e/masses_empty.spec.js
  // News section is tested in e2e/news.spec.js
  // We can just rely on the test runner for these other screenshots.
});
