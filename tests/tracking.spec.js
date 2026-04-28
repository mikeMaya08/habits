import { test, expect } from '@playwright/test';
import {
  resetApp,
  gotoTab,
  createHabit,
  habitCard,
  isoToday,
  isoDaysAgo,
  DAY_NAMES,
} from './helpers.js';

test.describe('Habit tracking — marking complete', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('marks a habit complete for today and updates stats', async ({ page }) => {
    await createHabit(page, { name: 'Floss' });
    const card = habitCard(page, 'Floss');

    await expect(card.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value')).toHaveText('0');

    const checkBtn = card.getByRole('button', { name: 'Mark complete' });
    await checkBtn.click();

    await expect(card.getByRole('button', { name: 'Mark incomplete' })).toBeVisible();
    await expect(card.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value')).toHaveText('1');
    await expect(card.locator('.stat', { hasText: 'Longest' }).locator('.stat-value')).toHaveText('1');
    await expect(card.locator('.stat', { hasText: 'Completion' }).locator('.stat-value')).toHaveText('100%');
  });

  test('toggling completion off undoes the streak', async ({ page }) => {
    await createHabit(page, { name: 'Walk' });
    const card = habitCard(page, 'Walk');

    await card.getByRole('button', { name: 'Mark complete' }).click();
    await expect(card.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value')).toHaveText('1');

    await card.getByRole('button', { name: 'Mark incomplete' }).click();
    await expect(card.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value')).toHaveText('0');
    await expect(card.locator('.stat', { hasText: 'Completion' }).locator('.stat-value')).toHaveText('0%');
  });

  test('the same day cannot register two completions', async ({ page }) => {
    await createHabit(page, { name: 'Vitamin' });
    const card = habitCard(page, 'Vitamin');

    await card.getByRole('button', { name: 'Mark complete' }).click();
    await expect(card.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value')).toHaveText('1');

    const data = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem('habits.completions') || '{}');
    });
    const habitIds = Object.keys(data);
    expect(habitIds).toHaveLength(1);
    const days = Object.keys(data[habitIds[0]]);
    expect(days).toHaveLength(1);
    expect(days[0]).toBe(isoToday());
  });

  test('weekly habit is disabled on non-scheduled days', async ({ page }) => {
    const todayDow = new Date().getDay();
    const otherDay = (todayDow + 1) % 7;

    await createHabit(page, {
      name: 'Pilates',
      frequency: 'weekly',
      weeklyDays: [otherDay],
    });

    const card = habitCard(page, 'Pilates');
    const button = card.locator('.check-button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('title', /Not scheduled/);
  });

  test('weekly habit is enabled on a scheduled day', async ({ page }) => {
    const todayDow = new Date().getDay();
    await createHabit(page, {
      name: 'Workout',
      frequency: 'weekly',
      weeklyDays: [todayDow],
    });

    const card = habitCard(page, 'Workout');
    await expect(card.getByText(`Weekly · ${DAY_NAMES[todayDow]}`)).toBeVisible();

    await card.getByRole('button', { name: 'Mark complete' }).click();
    await expect(card.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value')).toHaveText('1');
  });

  test('marking from the Dashboard reflects across pages', async ({ page }) => {
    await createHabit(page, { name: 'Gratitude' });

    await gotoTab(page, 'Dashboard');
    const todayRow = page.locator('.today-row').filter({ hasText: 'Gratitude' });
    await todayRow.getByRole('button', { name: 'Mark complete' }).click();

    await expect(page.getByRole('heading', { name: /All done for today/ })).toBeVisible();

    await gotoTab(page, 'Habits');
    const card = habitCard(page, 'Gratitude');
    await expect(card.getByRole('button', { name: 'Mark incomplete' })).toBeVisible();
  });
});
