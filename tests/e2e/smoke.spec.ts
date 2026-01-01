import { expect, test } from '@playwright/test';

test('dashboard loads', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Active Timeline')).toBeVisible();
  await expect(page.getByText('Activity Aura')).toBeVisible();
});
