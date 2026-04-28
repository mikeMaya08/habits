import { useState } from 'react';
import { useHabits } from '../context/HabitContext.jsx';
import { HabitList } from '../components/HabitList.jsx';
import { HabitForm } from '../components/HabitForm.jsx';
import { Modal } from '../components/Modal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { CalendarGrid } from '../components/CalendarGrid.jsx';

export function Habits() {
  const { habits, addHabit, updateHabit, deleteHabit, exportData, importData } = useHabits();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [calendarHabit, setCalendarHabit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (habit) => {
    setEditing(habit);
    setFormOpen(true);
  };

  const handleSubmit = (data) => {
    if (editing) {
      updateHabit(editing.id, data);
    } else {
      addHabit(data);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(String(reader.result));
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="habits-page">
      <div className="page-head">
        <div>
          <h2>Your habits</h2>
          <p className="muted">{habits.length} {habits.length === 1 ? 'habit' : 'habits'}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleExport} disabled={habits.length === 0}>
            Export
          </button>
          <label className="btn btn-ghost btn-sm">
            Import
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-primary" onClick={openCreate}>
            + New habit
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          description="Create one to begin building consistency."
          action={
            <button className="btn btn-primary" onClick={openCreate}>
              Create your first habit
            </button>
          }
        />
      ) : (
        <HabitList
          habits={habits}
          onEdit={openEdit}
          onDelete={(h) => setConfirmDelete(h)}
          onOpenCalendar={(h) => setCalendarHabit(h)}
        />
      )}

      <Modal
        open={formOpen}
        title={editing ? 'Edit habit' : 'New habit'}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      >
        <HabitForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        open={!!calendarHabit}
        title={calendarHabit ? `${calendarHabit.name} · Calendar` : ''}
        onClose={() => setCalendarHabit(null)}
      >
        {calendarHabit && <CalendarGrid habit={calendarHabit} />}
      </Modal>

      <Modal
        open={!!confirmDelete}
        title="Delete habit?"
        onClose={() => setConfirmDelete(null)}
      >
        {confirmDelete && (
          <div className="confirm-body">
            <p>
              This will permanently remove <strong>{confirmDelete.name}</strong> and all
              of its completion history. This cannot be undone.
            </p>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteHabit(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete habit
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
