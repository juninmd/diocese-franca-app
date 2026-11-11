import { test, expect } from '@playwright/test';

test.describe('Foranias and enriched clergy details', () => {
  test('church details displays forania badge and priest attendance if available', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('http://localhost:3001/');

    await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

    // Navega para aba Igrejas
    const churchesTab = page.getByRole('tab', { name: /igrejas|paróquias/i }).or(page.getByText(/igrejas/i)).first();
    await churchesTab.click({ force: true });
    await page.waitForTimeout(1500);

    // Clica na paróquia Catedral
    const churchCard = page.getByText(/Sé Catedral/i).first();
    await expect(churchCard).toBeVisible({ timeout: 10000 });
    await churchCard.click({ force: true });
    await page.waitForTimeout(2000);

    // Valida que a tela de detalhes carregou e exibe a Forania
    await expect(page.getByText(/Forania/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('priest details displays enriched bio and ordination/birth date', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('http://localhost:3001/');

    await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

    // Navega para aba Padres
    const priestsTab = page.getByRole('tab', { name: /padres/i }).or(page.getByText(/padres/i)).first();
    await priestsTab.click({ force: true });
    await page.waitForTimeout(1500);

    // Seleciona Dom Paulo Roberto Beloto na lista de padres
    const priestCard = page.getByText(/Dom Paulo Roberto Beloto/i).first();
    await expect(priestCard).toBeVisible({ timeout: 10000 });
    await priestCard.click({ force: true });
    await page.waitForTimeout(2000);

    // Valida exibição dos dados de nascimento e/ou ordenação
    await expect(page.getByText(/Nascimento|Ordenação/i).first()).toBeVisible({ timeout: 10000 });
  });
});
