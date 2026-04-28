import { test, expect } from '@playwright/test';
import {
  resetApp,
  gotoTab,
  createHabit,
  habitCard,
  isoToday,
} from './helpers.js';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('shows the current date in the hero', async ({ page }) => {
    await createHabit(page, { name: 'Hydrate' });
    await gotoTab(page, 'Dashboard');

    const todayLong = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    await expect(page.locator('.hero-eyebrow')).toHaveText(todayLong);
  });

  test('today progress updates as habits are completed', async ({ page }) => {
    await createHabit(page, { name: 'Alpha habit' });
    await createHabit(page, { name: 'Bravo habit' });
    await gotoTab(page, 'Dashboard');

    await expect(page.getByRole('heading', { name: '0 of 2 done today' })).toBeVisible();

    const rowAlpha = page.locator('.today-row').filter({ hasText: 'Alpha' });
    await rowAlpha.getByRole('button', { name: 'Mark complete' }).click();
    await expect(page.getByRole('heading', { name: '1 of 2 done today' })).toBeVisible();

    const rowBravo = page.locator('.today-row').filter({ hasText: 'Bravo' });
    await rowBravo.getByRole('button', { name: 'Mark complete' }).click();
    await expect(page.getByRole('heading', { name: /All done for today/ })).toBeVisible();
  });

  test('hero stats show active habits, total streak days, and longest streak', async ({ page }) => {
    await createHabit(page, { name: 'Run' });
    await createHabit(page, { name: 'Read' });

    await gotoTab(page, 'Habits');
    await habitCard(page, 'Run').getByRole('button', { name: 'Mark complete' }).click();
    await habitCard(page, 'Read').getByRole('button', { name: 'Mark complete' }).click();

    await gotoTab(page, 'Dashboard');
    const stats = page.locator('.hero-stat');
    await expect(stats.nth(0).locator('.hero-stat-value')).toHaveText('2');
    await expect(stats.nth(1).locator('.hero-stat-value')).toHaveText('2');
    await expect(stats.nth(2).locator('.hero-stat-value')).toHaveText('1');
  });

  test('shows resting message when no habits are scheduled today', async ({ page }) => {
    const today = new Date().getDay();
    const otherDay = (today + 1) % 7;

    await createHabit(page, {
      name: 'Sometimes',
      frequency: 'weekly',
      weeklyDays: [otherDay],
    });

    await gotoTab(page, 'Dashboard');
    await expect(page.getByRole('heading', { name: 'Nothing scheduled today' })).toBeVisible();
    await expect(page.getByText('No habits are scheduled for today. Enjoy your rest day!')).toBeVisible();
  });

  test('all-habits overview lists every habit', async ({ page }) => {
    await createHabit(page, { name: 'Habit one' });
    await createHabit(page, { name: 'Habit two' });
    await createHabit(page, { name: 'Habit three' });

    await gotoTab(page, 'Dashboard');
    const overview = page.locator('.overview-row');
    await expect(overview).toHaveCount(3);
    await expect(overview.filter({ hasText: 'Habit one' })).toBeVisible();
    await expect(overview.filter({ hasText: 'Habit two' })).toBeVisible();
    await expect(overview.filter({ hasText: 'Habit three' })).toBeVisible();
  });

  test('Manage habits link navigates to Habits page', async ({ page }) => {
    await createHabit(page, { name: 'Anything' });
    await gotoTab(page, 'Dashboard');
    await page.getByRole('button', { name: 'Manage habits' }).click();
    await expect(page.getByRole('heading', { name: 'Your habits' })).toBeVisible();
  });
});
