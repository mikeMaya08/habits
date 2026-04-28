import { test, expect } from '@playwright/test';
import {
  resetApp,
  gotoTab,
  createHabit,
  habitCard,
  isoToday,
} from './helpers.js';

test.describe('localStorage persistence', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('habits persist across reloads', async ({ page }) => {
    await createHabit(page, { name: 'Persistent habit', description: 'Survives reload' });

    await page.reload();
    await gotoTab(page, 'Habits');

    const card = habitCard(page, 'Persistent habit');
    await expect(card).toBeVisible();
    await expect(card.getByText('Survives reload')).toBeVisible();
  });

  test('completions persist across reloads', async ({ page }) => {
    await createHabit(page, { name: 'Daily check' });
    const card = habitCard(page, 'Daily check');
    await card.getByRole('button', { name: 'Mark complete' }).click();

    await page.reload();
    await gotoTab(page, 'Habits');

    const reloaded = habitCard(page, 'Daily check');
    await expect(reloaded.getByRole('button', { name: 'Mark incomplete' })).toBeVisible();
    await expect(
      reloaded.locator('.stat', { hasText: 'Current streak' }).locator('.stat-value'),
    ).toHaveText('1');
  });

  test('localStorage contains the expected shape after creating data', async ({ page }) => {
    await createHabit(page, { name: 'Schema check' });
    const card = habitCard(page, 'Schema check');
    await card.getByRole('button', { name: 'Mark complete' }).click();

    const habits = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('habits.habits')),
    );
    const completions = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('habits.completions')),
    );

    expect(habits).toHaveLength(1);
    expect(habits[0]).toMatchObject({
      name: 'Schema check',
      frequency: 'daily',
      weeklyDays: [],
    });
    expect(typeof habits[0].id).toBe('string');
    expect(typeof habits[0].createdAt).toBe('string');

    const habitId = habits[0].id;
    expect(completions[habitId]).toEqual({ [isoToday()]: true });
  });

  test('deleting a habit also removes its completions', async ({ page }) => {
    await createHabit(page, { name: 'Goes away' });
    const card = habitCard(page, 'Goes away');
    await card.getByRole('button', { name: 'Mark complete' }).click();

    await card.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete habit' }).click();

    const completions = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('habits.completions') || '{}'),
    );
    expect(Object.keys(completions)).toHaveLength(0);
  });
});
