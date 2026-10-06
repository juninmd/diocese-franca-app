const { test, expect } = require('@playwright/test');

test('navigate to missas and trigger lembrete de missa local notification', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');

  // Navigate to Masses using generic regex
  await page.getByText(/Missas/i).first().click({ force: true });
  await page.waitForTimeout(2000);

  // Take a screenshot of the masses screen
  await page.screenshot({ path: 'screenshots/masses_lembrete.png', fullPage: true });
});
