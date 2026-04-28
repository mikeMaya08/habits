import { useMemo } from 'react';
import { useHabits } from '../context/HabitContext.jsx';
import { getHabitStats } from '../utils/streakUtils.js';
import { todayISO, formatHumanDate, DAY_NAMES } from '../utils/dateUtils.js';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function Dashboard({ onCreateHabit, onGoToHabits }) {
  const { habits, completions, toggleCompletion } = useHabits();
  const today = todayISO();

  const cards = useMemo(
    () => habits.map((h) => ({ habit: h, stats: getHabitStats(h, completions) })),
    [habits, completions],
  );

  const todaysHabits = cards.filter((c) => c.stats.isExpectedToday);
  const completedToday = todaysHabits.filter((c) => c.stats.isCompletedToday).length;
  const totalCurrentStreak = cards.reduce((sum, c) => sum + c.stats.currentStreak, 0);
  const longestStreak = cards.reduce((max, c) => Math.max(max, c.stats.longestStreak), 0);
  const dayPct = todaysHabits.length === 0 ? 0 : Math.round((completedToday / todaysHabits.length) * 100);

  if (habits.length === 0) {
    return (
      <EmptyState
        title="No habits yet"
        description="Create your first habit to start tracking your progress."
        action={
          <button className="btn btn-primary" onClick={onCreateHabit}>
            Create habit
          </button>
        }
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <div className="hero-eyebrow">{formatHumanDate(today)}</div>
          <h2 className="hero-title">
            {completedToday === todaysHabits.length && todaysHabits.length > 0
              ? 'All done for today 🎉'
              : todaysHabits.length === 0
                ? 'Nothing scheduled today'
                : `${completedToday} of ${todaysHabits.length} done today`}
          </h2>
          <ProgressBar value={dayPct} label="Today's progress" />
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{habits.length}</div>
            <div className="hero-stat-label">Active habits</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{totalCurrentStreak}</div>
            <div className="hero-stat-label">Streak days</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{longestStreak}</div>
            <div className="hero-stat-label">Longest streak</div>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <h3>Today</h3>
          <button className="btn btn-ghost btn-sm" onClick={onGoToHabits}>
            Manage habits
          </button>
        </div>

        {todaysHabits.length === 0 ? (
          <p className="muted">No habits are scheduled for today. Enjoy your rest day!</p>
        ) : (
          <div className="today-list">
            {todaysHabits.map(({ habit, stats }) => (
              <div key={habit.id} className="today-row">
                <button
                  type="button"
                  className={`check-button ${stats.isCompletedToday ? 'check-button-done' : ''}`}
                  onClick={() => toggleCompletion(habit.id, today)}
                  style={stats.isCompletedToday ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
                  aria-label={stats.isCompletedToday ? 'Mark incomplete' : 'Mark complete'}
                >
                  {stats.isCompletedToday ? '✓' : ''}
                </button>
                <div className="today-row-main">
                  <div className="today-row-title">{habit.name}</div>
                  <div className="today-row-meta">
                    <span className="meta-text">
                      {habit.frequency === 'daily'
                        ? 'Daily'
                        : `Weekly · ${habit.weeklyDays.map((d) => DAY_NAMES[d]).join(', ')}`}
                    </span>
                    <span className="meta-text">🔥 {stats.currentStreak} day streak</span>
                  </div>
                </div>
                <div className="today-row-rate">{stats.completionRate}%</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <h3>All habits</h3>
        </div>
        <div className="overview-list">
          {cards.map(({ habit, stats }) => (
            <div key={habit.id} className="overview-row">
              <div className="overview-row-info">
                <div className="overview-row-title">
                  <span className="dot" style={{ backgroundColor: habit.color }} />
                  {habit.name}
                </div>
                <div className="overview-row-meta muted">
                  🔥 {stats.currentStreak} · best {stats.longestStreak} · {stats.completionRate}%
                </div>
              </div>
              <div className="overview-row-bar">
                <ProgressBar value={stats.completionRate} color={habit.color} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
