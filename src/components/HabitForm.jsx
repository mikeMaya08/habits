import { useState } from 'react';
import { todayISO, DAY_NAMES } from '../utils/dateUtils.js';

const COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
];

const CATEGORIES = ['general', 'health', 'study', 'work', 'mindfulness', 'fitness'];

export function HabitForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [frequency, setFrequency] = useState(initial?.frequency || 'daily');
  const [weeklyDays, setWeeklyDays] = useState(initial?.weeklyDays || [1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(initial?.startDate || todayISO());
  const [category, setCategory] = useState(initial?.category || 'general');
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [error, setError] = useState('');

  const toggleWeekDay = (day) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please give your habit a name.');
      return;
    }
    if (frequency === 'weekly' && weeklyDays.length === 0) {
      setError('Please select at least one day for weekly habits.');
      return;
    }
    setError('');
    onSubmit({
      name,
      description,
      frequency,
      weeklyDays,
      startDate,
      category,
      color,
    });
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read 20 minutes"
          autoFocus
          maxLength={80}
        />
      </label>

      <label className="field">
        <span>Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why is this habit important to you?"
          rows={2}
          maxLength={240}
        />
      </label>

      <div className="field">
        <span>Frequency</span>
        <div className="radio-group">
          <label className={`radio ${frequency === 'daily' ? 'radio-active' : ''}`}>
            <input
              type="radio"
              name="frequency"
              value="daily"
              checked={frequency === 'daily'}
              onChange={() => setFrequency('daily')}
            />
            Daily
          </label>
          <label className={`radio ${frequency === 'weekly' ? 'radio-active' : ''}`}>
            <input
              type="radio"
              name="frequency"
              value="weekly"
              checked={frequency === 'weekly'}
              onChange={() => setFrequency('weekly')}
            />
            Weekly
          </label>
        </div>
      </div>

      {frequency === 'weekly' && (
        <div className="field">
          <span>Days</span>
          <div className="day-picker">
            {DAY_NAMES.map((name, idx) => (
              <button
                key={idx}
                type="button"
                className={`day-chip ${weeklyDays.includes(idx) ? 'day-chip-active' : ''}`}
                onClick={() => toggleWeekDay(idx)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field-row">
        <label className="field">
          <span>Start date</span>
          <input
            type="date"
            value={startDate}
            max={todayISO()}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field">
        <span>Color</span>
        <div className="color-picker">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'color-swatch-active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save changes' : 'Create habit'}
        </button>
      </div>
    </form>
  );
}
