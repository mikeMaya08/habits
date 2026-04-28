import { useState } from 'react';
import { useHabits } from '../context/HabitContext.jsx';
import { CalendarGrid } from '../components/CalendarGrid.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function Calendar({ onCreateHabit }) {
  const { habits } = useHabits();
  const [selectedId, setSelectedId] = useState(habits[0]?.id || null);

  if (habits.length === 0) {
    return (
      <EmptyState
        title="No habits to display"
        description="Create a habit to see its calendar here."
        action={
          <button className="btn btn-primary" onClick={onCreateHabit}>
            Create habit
          </button>
        }
      />
    );
  }

  const selected = habits.find((h) => h.id === selectedId) || habits[0];

  return (
    <div className="calendar-page">
      <div className="page-head">
        <div>
          <h2>Calendar</h2>
          <p className="muted">Tap any day to mark or unmark.</p>
        </div>
        <select
          className="habit-select"
          value={selected.id}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      <div className="calendar-card" style={{ borderTopColor: selected.color }}>
        <CalendarGrid habit={selected} />
      </div>
    </div>
  );
}
