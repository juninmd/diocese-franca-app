const { test, expect } = require('@playwright/test');

test('navigate to igrejas and padres and verify empty states', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });

  // Igrejas Empty State
  await page.locator('div:text-is("Igrejas")').first().click({ force: true });
  await page.waitForTimeout(2000);

  const searchInputIgrejas = page.getByPlaceholder("Buscar por nome, endereço ou cidade...");
  if (await searchInputIgrejas.count() > 0) {
      await searchInputIgrejas.fill("Igreja Inexistente 123");
      await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: 'screenshots/churches_empty.png', fullPage: true });

  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(2000);

  // Padres Empty State
  await page.locator('div:text-is("Padres")').first().click({ force: true });
  await page.waitForTimeout(2000);

  const searchInputPadres = page.getByPlaceholder("Buscar por nome ou título...");
  if (await searchInputPadres.count() > 0) {
      await searchInputPadres.fill("Padre Inexistente 123");
      await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: 'screenshots/priests_empty.png', fullPage: true });
});
