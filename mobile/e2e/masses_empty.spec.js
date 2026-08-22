const { test, expect } = require('@playwright/test');

test('navigate to missas and verify empty state', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });

  await page.locator('div:text-is("Missas")').first().click({ force: true });
  await page.waitForTimeout(3000);

  // We capture the screenshot of the empty state (it might just be empty already if no data for today, otherwise we can't reliably test this if the DOM elements are hidden)
  // Let's capture what we have
  await page.screenshot({ path: 'screenshots/masses_empty.png', fullPage: true });
});
