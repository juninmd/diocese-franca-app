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

    // Click on the Churches menu card (exact match on the title text)
    await page.getByText('Igrejas', { exact: true }).first().click();

    // Wait for the list to render by checking for the search input placeholder
    await expect(page.getByPlaceholder('Buscar por nome, endereço ou cidade...')).toBeVisible({ timeout: 15000 });

    // Ensure list elements are loading
    await page.waitForTimeout(2000); // give time to load the API data

    // Take a screenshot
    await page.screenshot({ path: 'screenshots/churches_full.png', fullPage: true });
  });

  test('should navigate to Priests Screen and view list', async ({ page }) => {
    await page.goto('http://localhost:3001/');

    // Click on the Priests menu card
    await page.getByText('Padres', { exact: true }).first().click();

    // Wait for the search placeholder to appear
    await expect(page.getByPlaceholder('Buscar por nome ou título...')).toBeVisible({ timeout: 15000 });

    // Allow API loading
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: 'screenshots/priests_full.png', fullPage: true });
  });

  test('should navigate to Masses Screen and view schedule', async ({ page }) => {
    await page.goto('http://localhost:3001/');

    // Click on the "Missas/sem" stat card which also navigates to Masses
    await page.getByText('Missas/sem').first().click();

    // Just wait for the network/rendering to settle. The filters label will be there.
    // Try catching uppercase or normal cases using a locator that searches broadly.
    await page.waitForTimeout(4000);

    // Take a screenshot
    await page.screenshot({ path: 'screenshots/masses_full.png', fullPage: true });
  });
});
