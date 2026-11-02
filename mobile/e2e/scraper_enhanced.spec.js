const { test, expect } = require('@playwright/test');

test('homologação aprimorada do clero, paróquias e horários', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001');

  // 1. Aguarda renderização da Home com Diocese de Franca
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 15000 });

  // 2. Navega para a aba Padres e verifica clero enriquecido (com foto oficial e dados)
  const tabPadres = page.getByText(/Padres/i).first();
  await tabPadres.click({ force: true });
  await page.waitForTimeout(2000);

  // Valida presença de sacerdote na listagem
  await expect(page.getByText(/Dom Paulo Roberto Beloto/i).first()).toBeVisible({ timeout: 10000 });

  // Clica no card do Bispo ou de um padre para inspecionar os detalhes biográficos
  await page.getByText(/Dom Paulo Roberto Beloto/i).first().click({ force: true });
  await page.waitForTimeout(2000);

  // Confirma detalhes biográficos enriquecidos
  await expect(page.getByText(/Bispo Diocesano/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Nascimento|Ordenação/i).first()).toBeVisible({ timeout: 10000 });

  // 3. Navega para a aba Igrejas e inspeciona paróquia com forania e horário de atendimento
  const tabIgrejas = page.getByRole('tab', { name: /igrejas|paróquias/i }).or(page.getByText(/igrejas/i)).first();
  await tabIgrejas.click({ force: true });
  await page.waitForTimeout(2000);

  // Localiza e clica em uma paróquia
  const churchItem = page.getByText(/Sé Catedral/i).first();
  await expect(churchItem).toBeVisible({ timeout: 10000 });
  await churchItem.click({ force: true });
  await page.waitForTimeout(2000);

  // Verifica elementos ricos da paróquia (Forania, Missas, Redes Sociais ou Atendimento)
  await expect(page.getByText(/Missas/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Forania/i).first()).toBeVisible({ timeout: 10000 });

  // 4. Captura screenshot da homologação aprimorada
  await page.screenshot({ path: 'screenshots/scraper_enhanced_homologation.png', fullPage: true });
});
