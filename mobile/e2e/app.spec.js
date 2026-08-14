const { test, expect } = require('@playwright/test');

test.describe('Diocese App E2E Tests', () => {

  test('should load Home Screen and display stats', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    // Wait for the app title to load. Use exact match to avoid strict mode violations.
    await expect(page.getByText('Diocese de Franca', { exact: true })).toBeVisible({ timeout: 10000 });
    // Wait for some stat numbers to appear (e.g. Paróquias, Padres)
    await expect(page.getByText('Paróquias', { exact: true }).first()).toBeVisible();

    // Take a screenshot
    await page.screenshot({ path: 'screenshots/home_full.png', fullPage: true });
  });

  test('should navigate to Churches Screen and view list', async ({ page }) => {
    await page.goto('http://localhost:3001/');

    // Click on the Churches menu card
    await page.getByText('Veja todas as paróquias').click();

    // Wait for the list to render. The placeholder text might not be exactly "Buscar por nome" or it might not be matched by 'text='.
    // Check for the search input placeholder instead.
    await expect(page.getByPlaceholder('Buscar por nome, endereço ou cidade...')).toBeVisible({ timeout: 10000 });

    // Ensure list elements are loading
    await page.waitForTimeout(2000); // give time to load the API data

    // Take a screenshot
    await page.screenshot({ path: 'screenshots/churches_full.png', fullPage: true });
  });

  test('should navigate to Masses Screen and view schedule', async ({ page }) => {
    await page.goto('http://localhost:3001/');

    // Click on the Masses menu card
    await page.click('text=Horários de Missa');

    // Wait for the filters to appear
    await expect(page.locator('text=Dia da semana')).toBeVisible({ timeout: 10000 });

    // Wait to allow data loading
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: 'screenshots/masses_full.png', fullPage: true });
  });
});
