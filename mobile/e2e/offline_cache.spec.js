const { test, expect } = require('@playwright/test');

// Dados reais da API são guardados em cache; sem rede o app continua mostrando a cópia salva e avisa o usuário.
test('sem rede mostra os dados em cache e avisa com acolhimento', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('http://localhost:3001/');
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Paróquias/).first()).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1500); // deixa as listas serem gravadas no cache

  // Derruba apenas as chamadas à API (a página estática continua servida) e recarrega o app.
  await page.route('**://localhost:3000/**', (route) => route.abort());
  await page.reload();
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 10000 });

  // Os números da Home vêm do cache (não ficam em 0) e o botão de atualizar revela a falta de rede.
  await expect(page.getByLabel(/^[1-9]\d* Paróquias$/)).toBeVisible({ timeout: 10000 });
  await page.getByLabel('Atualizar dados').click();
  await expect(page.getByText(/Sem conexão/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel(/^[1-9]\d* Paróquias$/)).toBeVisible();

  // A lista de igrejas também abre instantaneamente a partir do cache.
  await page.getByRole('tab', { name: /igrejas/i }).click();
  await expect(page.getByText(/Sé Catedral/i).first()).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'screenshots/offline_cache.png' });
});
