import {
  formatISO,
  parseISO,
  todayISO,
  addDays,
  getDayOfWeek,
} from './dateUtils.js';

function isExpectedDay(habit, dateISO) {
  if (dateISO < habit.startDate) return false;
  if (habit.frequency === 'daily') return true;
  const dow = getDayOfWeek(dateISO);
  return habit.weeklyDays?.includes(dow);
}

function previousExpectedDay(habit, fromISO) {
  let cursor = parseISO(fromISO);
  for (let i = 0; i < 366; i++) {
    cursor = addDays(cursor, -1);
    const iso = formatISO(cursor);
    if (iso < habit.startDate) return null;
    if (isExpectedDay(habit, iso)) return iso;
  }
  return null;
}

export function calculateCurrentStreak(habit, completions) {
  const habitCompletions = completions[habit.id] || {};
  const today = todayISO();

  let cursor;
  if (isExpectedDay(habit, today)) {
    cursor = previousExpectedDay(habit, today);
  } else {
    cursor = previousExpectedDay(habit, today);
  }

  if (!cursor) return 0;

  let streak = 0;
  for (let i = 0; i < 3650; i++) {
    if (!cursor || cursor < habit.startDate) break;
    if (habitCompletions[cursor]) {
      streak += 1;
      cursor = previousExpectedDay(habit, cursor);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(habit, completions) {
  const habitCompletions = completions[habit.id] || {};
  const today = todayISO();

  let cursor = parseISO(habit.startDate);
  const todayDate = parseISO(today);
  if (cursor > todayDate) return 0;

  let running = 0;
  let max = 0;

  while (formatISO(cursor) <= today) {
    const iso = formatISO(cursor);
    if (isExpectedDay(habit, iso)) {
      if (habitCompletions[iso]) {
        running += 1;
        if (running > max) max = running;
      } else if (iso !== today) {
        running = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }

  return max;
}

export function calculateCompletionRate(habit, completions) {
  const habitCompletions = completions[habit.id] || {};
  const today = todayISO();

  let cursor = parseISO(habit.startDate);
  const todayDate = parseISO(today);
  if (cursor > todayDate) return 0;

  let expected = 0;
  let done = 0;

  while (formatISO(cursor) <= today) {
    const iso = formatISO(cursor);
    if (isExpectedDay(habit, iso)) {
      expected += 1;
      if (habitCompletions[iso]) done += 1;
    }
    cursor = addDays(cursor, 1);
  }

  if (expected === 0) return 0;
  return Math.round((done / expected) * 100);
}

export function getHabitStats(habit, completions) {
  return {
    currentStreak: calculateCurrentStreak(habit, completions),
    longestStreak: calculateLongestStreak(habit, completions),
    completionRate: calculateCompletionRate(habit, completions),
    isExpectedToday: isExpectedDay(habit, todayISO()),
    isCompletedToday: !!completions[habit.id]?.[todayISO()],
  };
}

export { isExpectedDay };
