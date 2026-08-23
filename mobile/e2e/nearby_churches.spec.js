const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3001/';

test('shows the nearest church when geolocation is granted', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'], { origin: BASE_URL });
  // Coordenadas bem próximas à Catedral (igreja 1) em Franca-SP
  await context.setGeolocation({ latitude: -20.5396, longitude: -47.4014 });

  await page.goto(BASE_URL);
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });

  await page.locator('text=Igrejas').first().click({ force: true });
  await page.waitForTimeout(2000);

  await page.locator('text=Perto de mim').first().click({ force: true });
  await page.waitForTimeout(3000);

  await expect(page.locator('text=Catedral Nossa Senhora da Conceição da Franca').first()).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'screenshots/churches_nearby.png', fullPage: true });
});

test('shows an empathetic message when geolocation permission is denied', async ({ page }) => {
  // Nenhuma permissão de geolocalização concedida neste contexto.
  await page.goto(BASE_URL);
  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });

  await page.locator('text=Igrejas').first().click({ force: true });
  await page.waitForTimeout(2000);

  await page.locator('text=Perto de mim').first().click({ force: true });

  // Sem permissão concedida no contexto, o navegador não resolve nem rejeita a
  // Geolocation API (nenhum prompt é exibido em modo headless) até o timeout de
  // segurança do LocationService (15s) expirar e cair no estado de erro.
  await expect(page.locator('text=Precisamos da sua localização').first()).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: 'screenshots/churches_nearby_denied.png', fullPage: true });
});
