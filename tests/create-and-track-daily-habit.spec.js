import { test, expect } from '@playwright/test';
import { resetApp, isoToday } from './helpers.js';
import { HabitsPage } from './pages/HabitsPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

test.describe('Journey — create a habit and track it daily', () => {
  test('user creates a daily habit, completes it today and sees progress everywhere', async ({ page }) => {
    const habitName = 'Read 20 minutes';
    const habits = new HabitsPage(page);
    const dashboard = new DashboardPage(page);

    // Start from a clean app (empty localStorage) at the base URL.
    await resetApp(page);

    // 1. Empty state: the Habits page invites the user to create a first habit.
    await habits.open();
    await expect(habits.createFirstHabitButton).toBeVisible();

    // 2. Create a daily habit.
    await habits.createDailyHabit({
      name: habitName,
      description: 'Before going to bed',
    });
    await expect(habits.card(habitName)).toBeVisible();
    await habits.expectStats(habitName, { current: '0', longest: '0', completion: '0%' });

    // 3. Dashboard shows the habit pending for today.
    await dashboard.open();
    await expect(dashboard.todayProgressHeading('0 of 1 done today')).toBeVisible();
    await expect(dashboard.todayRow(habitName)).toBeVisible();
    await expect(dashboard.overviewRow(habitName)).toBeVisible();

    // 4. Back on Habits, mark it complete for today and check the stats.
    await habits.open();
    await habits.markComplete(habitName);
    await habits.expectCompleted(habitName);
    await habits.expectStats(habitName, { current: '1', longest: '1', completion: '100%' });

    // 5. Dashboard reflects the completion.
    await dashboard.open();
    await expect(dashboard.todayProgressHeading(/All done for today/)).toBeVisible();
    await dashboard.expectHeroStats({ activeHabits: '1', totalStreakDays: '1', longestStreak: '1' });

    // 6. Data is persisted: a reload keeps the habit and today's completion.
    await page.reload();
    await habits.open();
    await habits.expectCompleted(habitName);
    await habits.expectStats(habitName, { current: '1', longest: '1', completion: '100%' });

    const completions = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('habits.completions') || '{}'),
    );
    const habitIds = Object.keys(completions);
    expect(habitIds).toHaveLength(1);
    expect(Object.keys(completions[habitIds[0]])).toEqual([isoToday()]);
  });
});
