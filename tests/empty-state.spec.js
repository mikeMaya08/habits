import { test, expect } from '@playwright/test';
import { resetApp, gotoTab } from './helpers.js';

test.describe('Empty state', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('Dashboard shows empty state on first load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'No habits yet' })).toBeVisible();
    await expect(
      page.getByText('Create your first habit to start tracking your progress.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create habit' })).toBeVisible();
  });

  test('Dashboard CTA navigates to Habits page', async ({ page }) => {
    await page.getByRole('button', { name: 'Create habit' }).click();
    await expect(page.getByRole('heading', { name: 'Your habits' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create your first habit' })).toBeVisible();
  });

  test('Habits page shows empty state', async ({ page }) => {
    await gotoTab(page, 'Habits');
    await expect(page.getByRole('heading', { name: 'No habits yet' })).toBeVisible();
    await expect(page.getByText('Create one to begin building consistency.')).toBeVisible();
  });

  test('Calendar page shows empty state when no habits exist', async ({ page }) => {
    await gotoTab(page, 'Calendar');
    await expect(page.getByRole('heading', { name: 'No habits to display' })).toBeVisible();
    await expect(page.getByText('Create a habit to see its calendar here.')).toBeVisible();
  });

  test('Habits page disables Export button when there are no habits', async ({ page }) => {
    await gotoTab(page, 'Habits');
    await expect(page.getByRole('button', { name: 'Export' })).toBeDisabled();
  });
});
