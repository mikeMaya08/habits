import { HabitCard } from './HabitCard.jsx';

export function HabitList({ habits, onEdit, onDelete, onOpenCalendar }) {
  return (
    <div className="habit-list">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenCalendar={onOpenCalendar}
        />
      ))}
    </div>
  );
}
