import { expect, test } from '@playwright/test';

test('dashboard loads', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Active Timeline' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Personas' }).first()).toBeVisible();
});
