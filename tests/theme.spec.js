import { test, expect } from '@playwright/test';
import { resetApp } from './helpers.js';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('starts in light mode by default', async ({ page }) => {
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });

  test('toggles to dark mode and back', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /Switch to dark mode/ });
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /Switch to light mode/ })).toBeVisible();

    await page.getByRole('button', { name: /Switch to light mode/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('persists theme preference across reloads', async ({ page }) => {
    await page.getByRole('button', { name: /Switch to dark mode/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const stored = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('habits.theme')),
    );
    expect(stored).toBe('dark');
  });
});
