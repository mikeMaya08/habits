import { useHabits } from '../context/HabitContext.jsx';
import { getHabitStats } from '../utils/streakUtils.js';
import { todayISO, DAY_NAMES } from '../utils/dateUtils.js';
import { ProgressBar } from './ProgressBar.jsx';

export function HabitCard({ habit, onEdit, onDelete, onOpenCalendar }) {
  const { completions, toggleCompletion } = useHabits();
  const stats = getHabitStats(habit, completions);

  const frequencyLabel =
    habit.frequency === 'daily'
      ? 'Daily'
      : `Weekly · ${habit.weeklyDays.map((d) => DAY_NAMES[d]).join(', ')}`;

  return (
    <article className="habit-card" style={{ borderLeftColor: habit.color }}>
      <div className="habit-card-top">
        <div className="habit-info">
          <h3 className="habit-name">{habit.name}</h3>
          {habit.description && (
            <p className="habit-description">{habit.description}</p>
          )}
          <div className="habit-meta">
            <span className="badge" style={{ backgroundColor: `${habit.color}22`, color: habit.color }}>
              {habit.category}
            </span>
            <span className="meta-text">{frequencyLabel}</span>
          </div>
        </div>

        <button
          type="button"
          className={`check-button ${stats.isCompletedToday ? 'check-button-done' : ''}`}
          onClick={() => toggleCompletion(habit.id, todayISO())}
          disabled={!stats.isExpectedToday}
          title={
            !stats.isExpectedToday
              ? 'Not scheduled for today'
              : stats.isCompletedToday
                ? 'Completed — click to undo'
                : 'Mark as complete'
          }
          style={stats.isCompletedToday ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
          aria-label={stats.isCompletedToday ? 'Mark incomplete' : 'Mark complete'}
        >
          {stats.isCompletedToday ? '✓' : ''}
        </button>
      </div>

      <div className="habit-stats">
        <div className="stat">
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Current streak</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.longestStreak}</div>
          <div className="stat-label">Longest</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">Completion</div>
        </div>
      </div>

      <ProgressBar value={stats.completionRate} color={habit.color} label="Completion rate" />

      <div className="habit-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onOpenCalendar(habit)}>
          View calendar
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(habit)}>
          Edit
        </button>
        <button className="btn btn-danger-ghost btn-sm" onClick={() => onDelete(habit)}>
          Delete
        </button>
      </div>
    </article>
  );
}
