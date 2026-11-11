import { test, expect } from '@playwright/test';

test('homologação aprimorada do clero, paróquias e horários', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001');

  // 1. Aguarda renderização da Home com Diocese de Franca
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 15000 });

  // 2. Navega para a aba Padres e verifica clero enriquecido
  const tabPadres = page.getByText(/Padres/i).first();
  await tabPadres.click({ force: true });
  await page.waitForTimeout(2000);

  // Valida presença de sacerdote na listagem
  await expect(page.getByText(/Dom Paulo Roberto Beloto/i).first()).toBeVisible({ timeout: 10000 });

  // Busca e valida sacerdote enriquecido via matching fonético/resiliente (Pe. Juliano Gonçalves Delgado)
  const searchInput = page.getByPlaceholder(/Buscar/i).first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('Juliano');
    await page.waitForTimeout(1000);
    const julianoCard = page.getByText(/Pe\. Juliano Gonçalves Delgado/i).first();
    await expect(julianoCard).toBeVisible({ timeout: 10000 });
    await julianoCard.click({ force: true });
    await page.waitForTimeout(1500);

    // Valida que agora exibe datas e dados biográficos enriquecidos
    await expect(page.getByText(/01\/11\/1978|16\/03\/2012|Nascimento|Ordenação/i).first()).toBeVisible({ timeout: 10000 });
  }

  // 3. Navega para a aba Igrejas e inspeciona paróquia com expediente enriquecido
  const tabIgrejas = page.getByRole('tab', { name: /igrejas|paróquias/i }).or(page.getByText(/igrejas/i)).first();
  await tabIgrejas.click({ force: true });
  await page.waitForTimeout(2000);

  // Busca paróquia recém-enriquecida com expediente da secretaria (ex: Paróquia Sagrado Coração de Jesus)
  const searchChurch = page.getByPlaceholder(/Buscar/i).first();
  if (await searchChurch.isVisible()) {
    await searchChurch.fill('Sagrado Coração');
    await page.waitForTimeout(1000);
  }

  const churchItem = page.getByText(/Sagrado Coração de Jesus/i).first();
  await expect(churchItem).toBeVisible({ timeout: 10000 });
  await churchItem.click({ force: true });
  await page.waitForTimeout(2000);

  // Verifica elementos ricos da paróquia (Forania, Missas, Horário da Secretaria, Atendimento do Padre)
  await expect(page.getByText(/Secretaria/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Missas/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Forania/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Atendimento do Padre/i).first()).toBeVisible({ timeout: 10000 });

  // 4. Captura screenshot da homologação aprimorada
  await page.screenshot({ path: 'screenshots/scraper_enhanced_homologation.png', fullPage: true });
});
