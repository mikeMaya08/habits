import { test, expect } from '@playwright/test';
import { resetApp, createHabit } from './helpers.js';

test.describe('Tab navigation', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('Dashboard is the default page', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('switches between all three tabs', async ({ page }) => {
    await createHabit(page, { name: 'Anything' });

    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('.dashboard-hero')).toBeVisible();

    await page.getByRole('tab', { name: 'Habits' }).click();
    await expect(page.getByRole('heading', { name: 'Your habits' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Habits' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: 'Calendar' }).click();
    await expect(page.locator('.calendar-grid')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Calendar' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
