import { test, expect } from '@playwright/test';
import {
  resetApp,
  gotoTab,
  openHabitForm,
  createHabit,
  habitCard,
  isoToday,
  isoDaysAgo,
} from './helpers.js';

test.describe('Habit creation, editing, deletion', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('creates a daily habit and shows it in the list', async ({ page }) => {
    await createHabit(page, {
      name: 'Drink water',
      description: 'At least 8 glasses',
    });

    const card = habitCard(page, 'Drink water');
    await expect(card).toBeVisible();
    await expect(card.getByText('At least 8 glasses')).toBeVisible();
    await expect(card.getByText('Daily', { exact: true })).toBeVisible();
    await expect(page.getByText('1 habit', { exact: true })).toBeVisible();
  });

  test('creates a weekly habit with specific days', async ({ page }) => {
    await createHabit(page, {
      name: 'Yoga',
      frequency: 'weekly',
      weeklyDays: [1, 3, 5],
    });

    const card = habitCard(page, 'Yoga');
    await expect(card).toBeVisible();
    await expect(card.getByText('Weekly · Mon, Wed, Fri')).toBeVisible();
  });

  test('rejects empty name with inline error', async ({ page }) => {
    const dialog = await openHabitForm(page);
    await dialog.getByRole('button', { name: 'Create habit' }).click();
    await expect(dialog.getByText('Please give your habit a name.')).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test('weekly habit must have at least one day selected', async ({ page }) => {
    const dialog = await openHabitForm(page);
    await dialog.getByLabel('Name').fill('Run');
    await dialog.getByText('Weekly', { exact: true }).click();

    for (const d of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
      await dialog.getByRole('button', { name: d, exact: true }).click();
    }

    await dialog.getByRole('button', { name: 'Create habit' }).click();
    await expect(
      dialog.getByText('Please select at least one day for weekly habits.'),
    ).toBeVisible();
  });

  test('cancel button closes the form without creating a habit', async ({ page }) => {
    const dialog = await openHabitForm(page);
    await dialog.getByLabel('Name').fill('Should not save');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    await expect(habitCard(page, 'Should not save')).toHaveCount(0);
  });

  test('Escape key closes the form', async ({ page }) => {
    const dialog = await openHabitForm(page);
    await dialog.getByLabel('Name').fill('Cancelled');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('edits an existing habit name and description', async ({ page }) => {
    await createHabit(page, { name: 'Read', description: 'Books' });

    const card = habitCard(page, 'Read');
    await card.getByRole('button', { name: 'Edit' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Name')).toHaveValue('Read');

    await dialog.getByLabel('Name').fill('Read 30 minutes');
    await dialog.getByLabel('Description (optional)').fill('Fiction or non-fiction');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).toBeHidden();

    await expect(habitCard(page, 'Read 30 minutes')).toBeVisible();
    await expect(page.getByText('Fiction or non-fiction')).toBeVisible();
    await expect(habitCard(page, 'Read').filter({ hasNotText: '30' })).toHaveCount(0);
  });

  test('deletes a habit after confirmation', async ({ page }) => {
    await createHabit(page, { name: 'Meditate' });
    await createHabit(page, { name: 'Stretch' });

    const card = habitCard(page, 'Meditate');
    await card.getByRole('button', { name: 'Delete' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Delete habit?' })).toBeVisible();
    await expect(dialog.getByText('Meditate')).toBeVisible();

    await dialog.getByRole('button', { name: 'Delete habit' }).click();
    await expect(dialog).toBeHidden();

    await expect(habitCard(page, 'Meditate')).toHaveCount(0);
    await expect(habitCard(page, 'Stretch')).toBeVisible();
  });

  test('cancels deletion without removing the habit', async ({ page }) => {
    await createHabit(page, { name: 'Keep me' });

    const card = habitCard(page, 'Keep me');
    await card.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(habitCard(page, 'Keep me')).toBeVisible();
  });

  test('start date input cannot exceed today', async ({ page }) => {
    const dialog = await openHabitForm(page);
    const dateInput = dialog.getByLabel('Start date');
    await expect(dateInput).toHaveAttribute('max', isoToday());
  });

  test('persists start date and category from the form', async ({ page }) => {
    const start = isoDaysAgo(3);
    await createHabit(page, {
      name: 'Cycling',
      startDate: start,
      category: 'fitness',
    });

    const card = habitCard(page, 'Cycling');
    await card.getByRole('button', { name: 'Edit' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Start date')).toHaveValue(start);
    await expect(dialog.getByLabel('Category')).toHaveValue('fitness');
  });
});
