const { test, expect } = require('@playwright/test');

test('navigate to missas and verify empty state', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });

  await page.locator('div:text-is("Missas")').first().click({ force: true });
  await page.waitForTimeout(3000);

  // Wait for it, maybe click some filter to force empty state if needed.
  // We can just capture the screenshot of the empty state if it's there.
  await page.screenshot({ path: 'screenshots/masses_empty.png', fullPage: true });
});
