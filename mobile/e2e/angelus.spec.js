const { test, expect } = require('@playwright/test');

test('Home screen - Ângelus reminder', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');

  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

  const angelusButton = page.getByText(/Lembrete\s*Ângelus/i);
  await angelusButton.click();

  await expect(page.getByText(/Lembrete do Ângelus configurado/i)).toBeVisible({ timeout: 10000 });
});
