import { test, expect } from '@playwright/test';
import {
  resetApp,
  gotoTab,
  createHabit,
  habitCard,
  isoToday,
  isoDaysAgo,
  isoDaysFromNow,
  navigateCalendarTo,
  clickCalendarDate,
  getCalendarCell,
  MONTH_NAMES,
} from './helpers.js';

test.describe('Calendar view', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('shows the current month by default', async ({ page }) => {
    await createHabit(page, { name: 'Daily reading' });
    await gotoTab(page, 'Calendar');

    const now = new Date();
    const expected = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    await expect(page.locator('.calendar-title')).toHaveText(expected);
  });

  test('navigates between months with prev/next buttons', async ({ page }) => {
    await createHabit(page, { name: 'Reading' });
    await gotoTab(page, 'Calendar');

    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    await page.getByRole('button', { name: 'Next month' }).click();
    await expect(page.locator('.calendar-title')).toHaveText(
      `${MONTH_NAMES[next.getMonth()]} ${next.getFullYear()}`,
    );

    await page.getByRole('button', { name: 'Previous month' }).click();
    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(page.locator('.calendar-title')).toHaveText(
      `${MONTH_NAMES[prev.getMonth()]} ${prev.getFullYear()}`,
    );
  });

  test('today cell is marked and clickable', async ({ page }) => {
    await createHabit(page, { name: 'Coffee log' });
    await gotoTab(page, 'Calendar');

    const today = isoToday();
    const cell = getCalendarCell(page, today);
    await expect(cell).toHaveClass(/calendar-cell-today/);
    await cell.click();
    await expect(cell).toHaveClass(/calendar-cell-completed/);
  });

  test('future cells in the current month are disabled', async ({ page }) => {
    await createHabit(page, { name: 'Journaling' });
    await gotoTab(page, 'Calendar');

    const tomorrow = isoDaysFromNow(1);
    const cell = getCalendarCell(page, tomorrow);

    if (await cell.count() > 0) {
      await expect(cell).toBeDisabled();
      await expect(cell).toHaveClass(/calendar-cell-future/);
    } else {
      await page.getByRole('button', { name: 'Next month' }).click();
      const cellNext = getCalendarCell(page, tomorrow);
      await expect(cellNext).toBeDisabled();
      await expect(cellNext).toHaveClass(/calendar-cell-future/);
    }
  });

  test('cells before start date are disabled', async ({ page }) => {
    const startDate = isoDaysAgo(2);
    await createHabit(page, { name: 'Stretching', startDate });
    await gotoTab(page, 'Calendar');

    const before = isoDaysAgo(5);
    const [y, m] = before.split('-').map(Number);
    await navigateCalendarTo(page, y, m - 1);

    const cell = getCalendarCell(page, before);
    await expect(cell).toBeDisabled();
    await expect(cell).toHaveClass(/calendar-cell-before/);
  });

  test('clicking a past day toggles completion', async ({ page }) => {
    await createHabit(page, { name: 'Dishes', startDate: isoDaysAgo(7) });
    await gotoTab(page, 'Calendar');

    const target = isoDaysAgo(2);
    await clickCalendarDate(page, target);

    const cell = getCalendarCell(page, target);
    await expect(cell).toHaveClass(/calendar-cell-completed/);

    await cell.click();
    await expect(cell).not.toHaveClass(/calendar-cell-completed/);
  });

  test('weekly habit shows non-scheduled days as not interactive', async ({ page }) => {
    const dow = new Date().getDay();
    const onlyDay = (dow + 3) % 7;
    await createHabit(page, {
      name: 'Weekly only',
      frequency: 'weekly',
      weeklyDays: [onlyDay],
      startDate: isoDaysAgo(14),
    });
    await gotoTab(page, 'Calendar');

    const yesterdayIso = isoDaysAgo(1);
    const yesterdayDow = (dow + 6) % 7;

    if (yesterdayDow !== onlyDay) {
      const cell = getCalendarCell(page, yesterdayIso);
      await expect(cell).toBeDisabled();
    }
  });

  test('habit picker switches the displayed calendar', async ({ page }) => {
    await createHabit(page, { name: 'Habit A', startDate: isoDaysAgo(5) });
    await createHabit(page, { name: 'Habit B', startDate: isoDaysAgo(5) });

    await gotoTab(page, 'Calendar');

    await page.locator('.habit-select').selectOption({ label: 'Habit A' });
    await getCalendarCell(page, isoDaysAgo(1)).click();
    await expect(getCalendarCell(page, isoDaysAgo(1))).toHaveClass(/calendar-cell-completed/);

    await page.locator('.habit-select').selectOption({ label: 'Habit B' });
    await expect(getCalendarCell(page, isoDaysAgo(1))).not.toHaveClass(/calendar-cell-completed/);
  });

  test('opens calendar inside a modal from a habit card', async ({ page }) => {
    await createHabit(page, { name: 'Stretch', startDate: isoDaysAgo(3) });

    const card = habitCard(page, 'Stretch');
    await card.getByRole('button', { name: 'View calendar' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Stretch · Calendar/)).toBeVisible();
    await expect(dialog.locator('.calendar-grid')).toBeVisible();
  });
});
