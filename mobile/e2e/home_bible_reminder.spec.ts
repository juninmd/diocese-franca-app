import { test, expect } from '@playwright/test';

test.describe('Home Screen Bible Reminder', () => {
  test('clicks bible reminder and triggers toast', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('http://localhost:3001');

    // Wait for the app to load
    await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    // Scroll to the Quick Access section
    await page.getByText('Acesso Rápido').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find and click the Lembrete Bíblia button
    const bibleButton = page.locator('div').filter({ hasText: /Lembrete.*Bíblia/is }).first();
    await bibleButton.click({ force: true });

    // Agenda para o próximo 07:00 real (relógio de Franca)
    await expect(page.getByText(/Lembrete bíblico configurado para (hoje|amanhã) às 07:00/i).first()).toBeVisible({ timeout: 10000 });
  });
});
