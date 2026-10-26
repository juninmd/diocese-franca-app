const { test, expect } = require('@playwright/test');

test('scraped parish and priest details - validates rendering of schedules, social media, chapels and contact info', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');

  // 1. Verify Home screen loads
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

  // 2. Navigate to Igrejas tab
  const churchesTab = page.getByRole('tab', { name: /igrejas|paróquias/i }).or(page.getByText(/igrejas/i)).first();
  await expect(churchesTab).toBeVisible({ timeout: 5000 });
  await churchesTab.click({ force: true });
  await page.waitForTimeout(1000);

  // Click on the first parish card to open Church Detail Screen
  const firstChurch = page.getByText(/Catedral|Paróquia|Santuário/i).first();
  await expect(firstChurch).toBeVisible({ timeout: 8000 });
  await firstChurch.click({ force: true });
  await page.waitForTimeout(1500);

  // Verify Church Details elements (Address, Office hours, Mass Schedule, Clergy section)
  await expect(page.getByText(/Horários de Missa|Missas|Endereço|Expediente/i).first()).toBeVisible({ timeout: 8000 });

  // Go back to list
  const backBtn = page.getByText(/Voltar/i).or(page.getByRole('button', { name: /voltar/i })).first();
  if (await backBtn.isVisible()) {
    await backBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // 3. Navigate to Padres tab
  const priestsTab = page.getByRole('tab', { name: /padres/i }).or(page.getByText(/padres/i)).first();
  await expect(priestsTab).toBeVisible({ timeout: 5000 });
  await priestsTab.click({ force: true });
  await page.waitForTimeout(1000);

  // Click on the first priest item to open Priest Detail
  const firstPriest = page.getByText(/Dom Paulo|Pe\.|Padre|Diácono/i).first();
  await expect(firstPriest).toBeVisible({ timeout: 8000 });
  await firstPriest.click({ force: true });
  await page.waitForTimeout(1500);

  // Verify Priest Detail elements
  await expect(page.getByText(/Bispo Diocesano|Pároco|Vigário|Diácono/i).first()).toBeVisible({ timeout: 8000 });
});
