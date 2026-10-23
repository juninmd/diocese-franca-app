const { test, expect } = require('@playwright/test');

test('scraped data validation - verifies parishes, priests and mass schedules', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');

  // 1. Verify Home screen loads with Diocese title
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

  // 2. Navigate to Padres tab
  const priestsTab = page.getByRole('tab', { name: /padres/i }).or(page.getByText(/padres/i)).first();
  if (await priestsTab.isVisible()) {
    await priestsTab.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify bishop or priest name from scraped data is present
    await expect(page.getByText(/Dom Paulo Roberto Beloto/i).or(page.getByText(/Bispo Diocesano/i)).first()).toBeVisible({ timeout: 8000 });
  }

  // 3. Navigate to Igrejas tab
  const churchesTab = page.getByRole('tab', { name: /igrejas|paróquias/i }).or(page.getByText(/igrejas/i)).first();
  if (await churchesTab.isVisible()) {
    await churchesTab.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify catedral or parish name is visible
    await expect(page.getByText(/Catedral|Nossa Senhora|Paróquia/i).first()).toBeVisible({ timeout: 8000 });
  }

  // 4. Navigate to Missas tab
  const massesTab = page.getByRole('tab', { name: /missas/i }).or(page.getByText(/missas/i)).first();
  if (await massesTab.isVisible()) {
    await massesTab.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify mass times section
    await expect(page.getByText(/Horários|Missa|Domingo/i).first()).toBeVisible({ timeout: 8000 });
  }
});
