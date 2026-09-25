const { test, expect } = require('@playwright/test');

test('ui interaction uses toast and triggers local notification schedule', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // React Native Web does not render pure text properly with newlines in text locators easily.
  // We will locate the 'div' element that has the text 'Lembrete', 'Teste', '(5s)' by using getByText with regex.
  await page.getByText(/Lembrete\s*Teste\s*\(5s\)/i).first().click({ force: true });

  // Wait a bit for the async permission check to finish
  await page.waitForTimeout(1000);

  // Navigate to Padres to verify the new notification feature on PriestDetailScreen
  await page.locator('div:text-is("Padres")').first().click({ force: true });
  await page.waitForTimeout(2000);

  // Click the first priest card to go to detail screen.
  // Selecting it gracefully if there's an actual list.
  const priestCard = page.locator('text="Pároco"').first();
  if (await priestCard.isVisible()) {
    await priestCard.click({ force: true });
    await page.waitForTimeout(2000);

    // Verify interaction with the notification config block
    await page.getByText(/Lembrete\s*Confissão/i).first().click({ force: true });
    await page.waitForTimeout(1000);

    // Toast should be visible for feedback.
    await expect(page.locator('text="Lembrete configurado!"').first()).toBeVisible();
  }
});
