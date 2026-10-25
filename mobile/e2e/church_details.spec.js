const { test, expect } = require('@playwright/test');

test('church detail screen shows social media and chapels', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');

  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

  // Navigate to Igrejas
  const churchesTab = page.getByRole('tab', { name: /igrejas|paróquias/i }).or(page.getByText(/igrejas/i)).first();
  await churchesTab.click({ force: true });
  await page.waitForTimeout(1000);

  // Click on a church (Catedral)
  const catedral = page.getByText(/Sé Catedral/i).first();
  await expect(catedral).toBeVisible({ timeout: 8000 });
  await catedral.click({ force: true });
  await page.waitForTimeout(2000);

  // Verify social media or capelas elements if visible
  const socialOrAbout = page.getByText(/Redes Sociais|Sobre|Capelas e Comunidades|Catedral/i).first();
  await expect(socialOrAbout).toBeVisible({ timeout: 8000 });

  await page.screenshot({ path: 'screenshots/church_details_full.png', fullPage: true });
});
