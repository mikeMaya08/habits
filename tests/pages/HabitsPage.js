import { expect } from '@playwright/test';

/**
 * Page object for the "Habits" tab: empty state, create-habit dialog
 * and the habit cards with their stats and completion toggle.
 */
export class HabitsPage {
  constructor(page) {
    this.page = page;
    this.tab = page.getByRole('tab', { name: 'Habits' });
    this.heading = page.getByRole('heading', { name: 'Your habits' });
    this.createFirstHabitButton = page.getByRole('button', { name: 'Create your first habit' });
    this.newHabitButton = page.getByRole('button', { name: '+ New habit' });
    this.dialog = page.getByRole('dialog');
  }

  async open() {
    await this.tab.click();
    await expect(this.tab).toHaveAttribute('aria-selected', 'true');
  }

  /** Opens the create dialog from the empty state or the "+ New habit" button. */
  async openCreateDialog() {
    if (await this.newHabitButton.isVisible()) {
      await this.newHabitButton.click();
    } else {
      await this.createFirstHabitButton.click();
    }
    await expect(this.dialog).toBeVisible();
  }

  /** Creates a daily habit (the form's default frequency). */
  async createDailyHabit({ name, description }) {
    await this.openCreateDialog();
    await this.dialog.getByLabel('Name').fill(name);
    if (description) {
      await this.dialog.getByLabel('Description (optional)').fill(description);
    }
    await this.dialog.getByRole('button', { name: 'Create habit' }).click();
    await expect(this.dialog).toBeHidden();
  }

  card(name) {
    return this.page.locator('.habit-card').filter({ hasText: name });
  }

  stat(name, label) {
    return this.card(name).locator('.stat', { hasText: label }).locator('.stat-value');
  }

  async markComplete(name) {
    await this.card(name).getByRole('button', { name: 'Mark complete' }).click();
  }

  async expectCompleted(name) {
    await expect(this.card(name).getByRole('button', { name: 'Mark incomplete' })).toBeVisible();
  }

  async expectStats(name, { current, longest, completion }) {
    await expect(this.stat(name, 'Current streak')).toHaveText(current);
    await expect(this.stat(name, 'Longest')).toHaveText(longest);
    await expect(this.stat(name, 'Completion')).toHaveText(completion);
  }
}
