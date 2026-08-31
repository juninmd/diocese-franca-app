const { test, expect } = require('@playwright/test');

test('navigate to home and verify news section', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');

  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });

  const emptyState = page.getByText('Puxa, não conseguimos carregar as notícias agora. Tente novamente!');

  if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
      await page.screenshot({ path: 'screenshots/news_section.png', fullPage: true });
  } else {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/news_section.png', fullPage: true });
  }
});
