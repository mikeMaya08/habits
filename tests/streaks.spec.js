import { test, expect } from '@playwright/test';
import {
  resetApp,
  gotoTab,
  createHabit,
  habitCard,
  isoToday,
  isoDaysAgo,
  clickCalendarDate,
} from './helpers.js';

function streakValue(card, label) {
  return card.locator('.stat', { hasText: label }).locator('.stat-value');
}

test.describe('Streak calculations', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('current streak counts consecutive past completions including today', async ({ page }) => {
    await createHabit(page, { name: 'Workout', startDate: isoDaysAgo(10) });

    await gotoTab(page, 'Calendar');
    for (let n = 0; n <= 3; n++) {
      await clickCalendarDate(page, isoDaysAgo(n));
    }

    await gotoTab(page, 'Habits');
    const card = habitCard(page, 'Workout');
    await expect(streakValue(card, 'Current streak')).toHaveText('4');
    await expect(streakValue(card, 'Longest')).toHaveText('4');
  });

  test('a missed day breaks the current streak but longest is preserved', async ({ page }) => {
    await createHabit(page, { name: 'Reading', startDate: isoDaysAgo(10) });

    await gotoTab(page, 'Calendar');
    for (const offset of [5, 4, 3]) {
      await clickCalendarDate(page, isoDaysAgo(offset));
    }
    for (const offset of [1, 0]) {
      await clickCalendarDate(page, isoDaysAgo(offset));
    }

    await gotoTab(page, 'Habits');
    const card = habitCard(page, 'Reading');
    await expect(streakValue(card, 'Current streak')).toHaveText('2');
    await expect(streakValue(card, 'Longest')).toHaveText('3');
  });

  test('current streak does not break when today is not yet completed', async ({ page }) => {
    await createHabit(page, { name: 'Hydration', startDate: isoDaysAgo(7) });

    await gotoTab(page, 'Calendar');
    for (const offset of [3, 2, 1]) {
      await clickCalendarDate(page, isoDaysAgo(offset));
    }

    await gotoTab(page, 'Habits');
    const card = habitCard(page, 'Hydration');
    await expect(streakValue(card, 'Current streak')).toHaveText('3');
  });

  test('completion percentage reflects done vs expected days', async ({ page }) => {
    await createHabit(page, { name: 'Vitamins', startDate: isoDaysAgo(3) });

    await gotoTab(page, 'Calendar');
    await clickCalendarDate(page, isoDaysAgo(2));
    await clickCalendarDate(page, isoDaysAgo(1));

    await gotoTab(page, 'Habits');
    const card = habitCard(page, 'Vitamins');
    await expect(streakValue(card, 'Completion')).toHaveText('50%');
  });

  test('weekly habit only counts scheduled days for streaks', async ({ page }) => {
    const todayDow = new Date().getDay();
    const weeklyDays = [todayDow];

    await createHabit(page, {
      name: 'Weekly review',
      frequency: 'weekly',
      weeklyDays,
      startDate: isoDaysAgo(7),
    });

    await gotoTab(page, 'Calendar');
    await clickCalendarDate(page, isoToday());
    await clickCalendarDate(page, isoDaysAgo(7));

    await gotoTab(page, 'Habits');
    const card = habitCard(page, 'Weekly review');
    await expect(streakValue(card, 'Current streak')).toHaveText('2');
    await expect(streakValue(card, 'Longest')).toHaveText('2');
    await expect(streakValue(card, 'Completion')).toHaveText('100%');
  });

  test('marking only today gives current streak of 1', async ({ page }) => {
    await createHabit(page, { name: 'Check-in' });
    const card = habitCard(page, 'Check-in');
    await card.getByRole('button', { name: 'Mark complete' }).click();
    await expect(streakValue(card, 'Current streak')).toHaveText('1');
  });
});
