const { test, expect } = require('@playwright/test');

test('app mounts successfully and schedules weekend reminder without crashing', async ({ page, context }) => {
  // Grant notification permissions first
  await context.grantPermissions(['notifications']);

  // Clear any previously set localStorage keys to simulate first run
  await page.addInitScript(() => {
    window.localStorage.removeItem('hasScheduledWeekendReminder');
    window.localStorage.removeItem('hasSeenWelcomeNotification');
    window.localStorage.removeItem('hasScheduledDailyReminder');
  });

  await page.goto('http://localhost:3001/');

  // Verify app mounts correctly
  await expect(page.getByText(/Diocese de Franca/i).first()).toBeVisible({ timeout: 15000 });
});
