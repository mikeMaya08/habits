import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  resetApp,
  gotoTab,
  createHabit,
  habitCard,
  isoToday,
} from './helpers.js';

test.describe('Import / Export', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('exports current data as a JSON file', async ({ page }) => {
    await createHabit(page, { name: 'Exportable', description: 'For export' });
    await habitCard(page, 'Exportable').getByRole('button', { name: 'Mark complete' }).click();

    await gotoTab(page, 'Habits');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^habits-\d{4}-\d{2}-\d{2}\.json$/);

    const path = await download.path();
    const data = JSON.parse(readFileSync(path, 'utf8'));

    expect(data.habits).toHaveLength(1);
    expect(data.habits[0].name).toBe('Exportable');
    expect(data.habits[0].description).toBe('For export');

    const habitId = data.habits[0].id;
    expect(data.completions[habitId]).toEqual({ [isoToday()]: true });
    expect(typeof data.exportedAt).toBe('string');
  });

  test('imports a JSON file and replaces existing data', async ({ page }) => {
    await createHabit(page, { name: 'Will be replaced' });

    await gotoTab(page, 'Habits');

    const payload = {
      habits: [
        {
          id: 'imported-1',
          name: 'Imported habit',
          description: 'From file',
          frequency: 'daily',
          weeklyDays: [],
          startDate: isoToday(),
          category: 'health',
          color: '#10b981',
          createdAt: new Date().toISOString(),
        },
      ],
      completions: {
        'imported-1': { [isoToday()]: true },
      },
      exportedAt: new Date().toISOString(),
    };

    await page.locator('input[type="file"]').setInputFiles({
      name: 'habits.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(payload)),
    });

    await expect(habitCard(page, 'Will be replaced')).toHaveCount(0);
    const imported = habitCard(page, 'Imported habit');
    await expect(imported).toBeVisible();
    await expect(imported.getByText('From file')).toBeVisible();
    await expect(imported.getByRole('button', { name: 'Mark incomplete' })).toBeVisible();
  });

  test('rejects an invalid JSON import with an alert', async ({ page }) => {
    await gotoTab(page, 'Habits');
    await createHabit(page, { name: 'Stays put' });

    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.dismiss();
    });

    await page.locator('input[type="file"]').setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ "not": "valid" }'),
    });

    await expect.poll(() => alertMessage).toMatch(/Import failed/);
    await expect(habitCard(page, 'Stays put')).toBeVisible();
  });
});
