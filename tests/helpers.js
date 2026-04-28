import { expect } from '@playwright/test';

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function isoToday() {
  const d = new Date();
  return formatISO(d);
}

export function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatISO(d);
}

export function isoDaysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return formatISO(d);
}

export function formatISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function resetApp(page) {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Habits' })).toBeVisible();
}

export async function gotoTab(page, name) {
  await page.getByRole('tab', { name }).click();
}

const DEFAULT_WEEKLY_DAYS = [1, 2, 3, 4, 5];

export async function openHabitForm(page) {
  await gotoTab(page, 'Habits');
  const newButton = page.getByRole('button', { name: '+ New habit' });
  if (await newButton.isVisible().catch(() => false)) {
    await newButton.click();
  } else {
    await page.getByRole('button', { name: 'Create your first habit' }).click();
  }
  return page.getByRole('dialog');
}

export async function setWeeklyDays(dialog, days) {
  for (const d of DEFAULT_WEEKLY_DAYS) {
    if (!days.includes(d)) {
      await dialog.getByRole('button', { name: DAY_NAMES[d], exact: true }).click();
    }
  }
  for (const d of days) {
    if (!DEFAULT_WEEKLY_DAYS.includes(d)) {
      await dialog.getByRole('button', { name: DAY_NAMES[d], exact: true }).click();
    }
  }
}

export async function createHabit(
  page,
  {
    name,
    description,
    frequency = 'daily',
    weeklyDays,
    startDate,
    category,
  } = {},
) {
  const dialog = await openHabitForm(page);

  await dialog.getByLabel('Name').fill(name);

  if (description) {
    await dialog.getByLabel('Description (optional)').fill(description);
  }

  if (frequency === 'weekly') {
    await dialog.getByText('Weekly', { exact: true }).click();
    if (weeklyDays) await setWeeklyDays(dialog, weeklyDays);
  }

  if (startDate) {
    await dialog.getByLabel('Start date').fill(startDate);
  }

  if (category) {
    await dialog.getByLabel('Category').selectOption(category);
  }

  await dialog.getByRole('button', { name: 'Create habit' }).click();
  await expect(dialog).toBeHidden();
}

export function habitCard(page, name) {
  return page.locator('.habit-card').filter({ hasText: name });
}

export async function navigateCalendarTo(root, year, monthIndex) {
  const target = `${MONTH_NAMES[monthIndex]} ${year}`;
  for (let i = 0; i < 24; i++) {
    const titleText = (await root.locator('.calendar-title').first().textContent()) || '';
    const trimmed = titleText.trim();
    if (trimmed === target) return;
    const [curMonth, curYearStr] = trimmed.split(' ');
    const curYear = Number(curYearStr);
    const curMonthIdx = MONTH_NAMES.indexOf(curMonth);
    const curOrd = curYear * 12 + curMonthIdx;
    const targetOrd = year * 12 + monthIndex;
    if (curOrd < targetOrd) {
      await root.getByRole('button', { name: 'Next month' }).click();
    } else {
      await root.getByRole('button', { name: 'Previous month' }).click();
    }
  }
  throw new Error(`Could not navigate to ${target}`);
}

export async function clickCalendarDate(root, isoDate) {
  const [y, m] = isoDate.split('-').map(Number);
  await navigateCalendarTo(root, y, m - 1);
  await root.locator(`button[aria-label^="${isoDate}"]`).click();
}

export function getCalendarCell(root, isoDate) {
  return root.locator(`button[aria-label^="${isoDate}"]`);
}

export function getStat(card, label) {
  return card.locator('.stat', { hasText: label }).locator('.stat-value');
}
