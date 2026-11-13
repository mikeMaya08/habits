import { expect } from '@playwright/test';

/**
 * Page object for the "Dashboard" tab: today's progress, hero stats
 * and the all-habits overview.
 */
export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.tab = page.getByRole('tab', { name: 'Dashboard' });
    this.heroStats = page.locator('.hero-stat');
    this.overviewRows = page.locator('.overview-row');
  }

  async open() {
    await this.tab.click();
    await expect(this.tab).toHaveAttribute('aria-selected', 'true');
  }

  todayProgressHeading(text) {
    return this.page.getByRole('heading', { name: text });
  }

  todayRow(name) {
    return this.page.locator('.today-row').filter({ hasText: name });
  }

  overviewRow(name) {
    return this.overviewRows.filter({ hasText: name });
  }

  heroStatValue(index) {
    return this.heroStats.nth(index).locator('.hero-stat-value');
  }

  /** Hero stats order: active habits, total streak days, longest streak. */
  async expectHeroStats({ activeHabits, totalStreakDays, longestStreak }) {
    await expect(this.heroStatValue(0)).toHaveText(activeHabits);
    await expect(this.heroStatValue(1)).toHaveText(totalStreakDays);
    await expect(this.heroStatValue(2)).toHaveText(longestStreak);
  }
}
