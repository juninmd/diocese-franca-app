import { test, expect } from '@playwright/test';

test('navigate to missas and trigger lembrete de missa local notification', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');

  // Navigate to Masses using generic regex
  await page.getByText(/Missas/i).first().click({ force: true });
  await page.waitForTimeout(2000);

  // Take a screenshot of the masses screen
  await page.screenshot({ path: 'screenshots/masses_lembrete.png', fullPage: true });

  // Sino de uma missa real: avisa 30 min antes da próxima ocorrência dela
  const bell = page.getByRole('button', { name: /^Lembrar das/ }).first();
  await bell.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await bell.click({ force: true });
  await expect(page.getByText(/Vamos avisar (em instantes|(hoje|amanhã|\S+) às \d{2}:\d{2}) \(30 min antes da missa\)/i).first()).toBeVisible({ timeout: 10000 });
});
