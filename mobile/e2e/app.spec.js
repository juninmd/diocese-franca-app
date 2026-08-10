const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Diocese App E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the local web server
    await page.goto('http://localhost:3001');
  });

  test('should display home screen and capture screenshot', async ({ page }) => {
    // Check if the main title is visible, use first() to resolve strict mode issue
    await expect(page.locator('text=Diocese de Franca').first()).toBeVisible();
    await expect(page.locator('text=Bem-vindo!').first()).toBeVisible();

    // Allow time for images/network calls
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(__dirname, '../screenshots/home_full.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('should display churches screen and capture screenshot', async ({ page }) => {
    // Wait for the app to load first
    await expect(page.locator('text=Diocese de Franca').first()).toBeVisible();

    // The Churches menu navigation button
    // It's the first menu card under "Navegue" with text 'Igrejas'
    const churchesButton = page.locator('text=Veja todas as paróquias e suas informações');
    await churchesButton.click();

    // Verify it navigated to Churches
    await expect(page.locator('text=Todas').last()).toBeVisible();

    // Wait for the API to load the churches (give it some time since it fetches from backend)
    await page.waitForTimeout(3000);

    const screenshotPath = path.join(__dirname, '../screenshots/churches_full.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });
});
