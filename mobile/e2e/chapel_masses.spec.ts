import { test, expect } from '@playwright/test';

// A aba Missas lista também as missas das capelas/comunidades (dados reais de /api/masses).
test('aba Missas mostra missas de capelas com a paróquia', async ({ page, request }) => {
  // A tela abre no dia de hoje (relógio de Franca): pega a primeira missa de capela de hoje.
  const day = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date());
  const canonical = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'].find((d) => day.toLowerCase().startsWith(d.slice(0, 3)))!;
  const api = await request.get(`http://localhost:3000/api/masses/by-day/${encodeURIComponent(canonical)}`);
  const chapelMass = (await api.json()).data
    .filter((m: { chapel?: { name: string } }) => m.chapel)
    .sort((a: { time: string }, b: { time: string }) => a.time.localeCompare(b.time))[0];
  expect(chapelMass).toBeTruthy();

  await page.goto('http://localhost:3001');
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 15000 });
  await page.getByText(/Missas/i).first().click({ force: true });
  await page.waitForTimeout(2000);
  // Lista virtualizada: rola até a missa da capela aparecer.
  const row = page.getByText(chapelMass.chapel.name, { exact: true }).first();
  for (let i = 0; i < 60 && !(await row.isVisible()); i += 1) {
    await page.mouse.move(640, 500);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(150);
  }
  await expect(row).toBeVisible({ timeout: 5000 });
  await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'screenshots/masses_chapels.png' });
});
