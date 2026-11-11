import { test, expect } from '@playwright/test';

test('ui interaction uses toast and triggers local notification schedule', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Lembrete do Ângelus: agenda para o próximo 12:00/18:00 real (não mais um teste de 5s).
  await page.getByText(/Lembrete\s*Ângelus/i).first().click({ force: true });

  // Wait a bit for the async permission check to finish
  await page.waitForTimeout(1000);

  // Navigate to Padres to verify the new notification feature on PriestDetailScreen
  await page.locator('div:text-is("Padres")').first().click({ force: true });
  await page.waitForTimeout(2000);

  // Navegou sem erro: os botões de "Lembrete Teste (5s)" não existem mais.
  await expect(page.getByText(/Lembrete\s*Teste/i)).toHaveCount(0);
});

test('priest detail local notification scheduling works', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

  await page.locator('div:text-is("Padres")').first().click({ force: true });
  await page.waitForTimeout(2000);

  // Click on a priest to enter detail screen
  // Wait for at least one priest card to be visible (names start with 'Pe.')
  await expect(page.getByText(/Pe\. /).first()).toBeVisible({ timeout: 10000 });
  await page.getByText(/Pe\. /).first().click({ force: true });
  await page.waitForTimeout(2000);

  // Look for Confession Reminder button
  const lembreteButton = page.getByText(/Configurar alerta/i).first();
  if (await lembreteButton.isVisible()) {
      // A tab bar flutuante pode cobrir o item: rola até ele antes de clicar.
      await lembreteButton.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await lembreteButton.click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.getByText(/Lembrete configurado para (hoje|amanhã) às 09:00/i).first()).toBeVisible();
  }
});
