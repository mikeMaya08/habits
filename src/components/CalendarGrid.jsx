import { useState } from 'react';
import {
  buildMonthGrid,
  formatISO,
  todayISO,
  MONTH_NAMES,
  DAY_NAMES,
} from '../utils/dateUtils.js';
import { isExpectedDay } from '../utils/streakUtils.js';
import { useHabits } from '../context/HabitContext.jsx';

export function CalendarGrid({ habit }) {
  const { completions, toggleCompletion } = useHabits();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const cells = buildMonthGrid(year, month);
  const habitCompletions = completions[habit.id] || {};
  const todayStr = todayISO();

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="icon-button" onClick={goPrev} aria-label="Previous month">
          ‹
        </button>
        <div className="calendar-title">
          {MONTH_NAMES[month]} {year}
        </div>
        <button className="icon-button" onClick={goNext} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {DAY_NAMES.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="calendar-cell calendar-cell-empty" />;

          const iso = formatISO(date);
          const isFutureDay = iso > todayStr;
          const isToday = iso === todayStr;
          const beforeStart = iso < habit.startDate;
          const expected = isExpectedDay(habit, iso);
          const completed = !!habitCompletions[iso];

          let className = 'calendar-cell';
          if (isToday) className += ' calendar-cell-today';
          if (beforeStart) className += ' calendar-cell-before';
          if (isFutureDay) className += ' calendar-cell-future';
          if (completed) className += ' calendar-cell-completed';
          else if (expected && !beforeStart && !isFutureDay) className += ' calendar-cell-missed';

          const interactive = !beforeStart && expected;

          return (
            <button
              key={i}
              type="button"
              className={className}
              onClick={() => interactive && toggleCompletion(habit.id, iso)}
              disabled={!interactive}
              style={completed ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
              aria-label={`${iso}${completed ? ' completed' : ''}`}
              title={
                beforeStart
                  ? 'Before habit start date'
                  : isFutureDay
                    ? 'Future date'
                    : !expected
                      ? 'Not scheduled'
                      : completed
                        ? 'Completed — click to undo'
                        : 'Click to mark complete'
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot legend-dot-completed" style={{ backgroundColor: habit.color }} />
          Completed
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-dot-missed" /> Missed
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-dot-today" /> Today
        </span>
      </div>
    </div>
  );
}
