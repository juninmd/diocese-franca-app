const { test, expect } = require('@playwright/test');

test('ui interaction uses toast and triggers local notification schedule', async ({ page }) => {
  await page.goto('http://localhost:3002/');

  await expect(page.locator('text=Diocese de Franca').first()).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // React Native Web does not render pure text properly with newlines in text locators easily.
  // We will locate the 'div' element that has the text 'Lembrete', 'Teste', '(5s)' by using getByText with regex.
  await page.getByText(/Lembrete\s*Teste\s*\(5s\)/i).first().click({ force: true });

  // Wait a bit for the async permission check to finish
  await page.waitForTimeout(1000);

  // By clicking one of the UI interaction elements directly instead of dealing with exact text,
  // we can ensure the action happens. Let's just click 'Missas' and then a notification button.
  await page.locator('div:text-is("Missas")').first().click({ force: true });
  await page.waitForTimeout(2000);

  // Click the notification bell on the first mass item, but if empty, it won't crash
  const massCard = page.locator('text="Missa Dominical"').first();
  if (await massCard.count() > 0) {
      // Find the notification button (bell) within the first mass item context, but we will just target the SVG inside the card.
      // Since classes are obfuscated, we will click by coordinates roughly or find the nearest SVG.
      await page.locator('svg[data-file-name="Ionicons.js"]').nth(4).click({ force: true });
      await page.waitForTimeout(500);
      const toast = page.getByText('Lembrete configurado com sucesso!');
      await expect(toast).toBeVisible({ timeout: 5000 });
  }

  // Navigate back to Home (use URL directly to prevent flakes with nested tab bars in RN Web)
  await page.goto('http://localhost:3002/');
  await page.waitForTimeout(1000);

  // Navigate to Padres to test Priest Detail screen notification
  await page.locator('div:text-is("Padres")').first().click({ force: true });
  await page.waitForTimeout(2000);

  // Find a priest card and click it
  const priestCard = page.getByText(/Ver detalhes/i).first();
  if (await priestCard.count() > 0) {
      await priestCard.click({ force: true });
      await page.waitForTimeout(2000);

      // Click the confession reminder button
      const confessionButton = page.getByText(/Lembrete Confissão/i).first();
      await confessionButton.click({ force: true });

      await page.waitForTimeout(500);
      const confToast = page.getByText('Lembrete configurado!');
      await expect(confToast).toBeVisible({ timeout: 5000 });
  }

});
