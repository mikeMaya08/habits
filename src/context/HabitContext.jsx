import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { todayISO, isFuture } from '../utils/dateUtils.js';

const HabitContext = createContext(null);

const STORAGE_HABITS = 'habits.habits';
const STORAGE_COMPLETIONS = 'habits.completions';

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function HabitProvider({ children }) {
  const [habits, setHabits] = useLocalStorage(STORAGE_HABITS, []);
  const [completions, setCompletions] = useLocalStorage(STORAGE_COMPLETIONS, {});

  const addHabit = useCallback(
    (data) => {
      const habit = {
        id: newId(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        frequency: data.frequency || 'daily',
        weeklyDays: data.frequency === 'weekly' ? data.weeklyDays || [] : [],
        startDate: data.startDate || todayISO(),
        category: data.category || 'general',
        color: data.color || '#4f46e5',
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => [habit, ...prev]);
      return habit;
    },
    [setHabits],
  );

  const updateHabit = useCallback(
    (id, patch) => {
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      );
    },
    [setHabits],
  );

  const deleteHabit = useCallback(
    (id) => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    },
    [setHabits],
  );

  const toggleCompletion = useCallback(
    (habitId, dateISO) => {
      if (isFuture(dateISO)) return;
      setCompletions((prev) => {
        const habitMap = { ...(prev[habitId] || {}) };
        if (habitMap[dateISO]) {
          delete habitMap[dateISO];
        } else {
          habitMap[dateISO] = true;
        }
        return { ...prev, [habitId]: habitMap };
      });
    },
    [setCompletions],
  );

  const exportData = useCallback(() => {
    const payload = { habits, completions, exportedAt: new Date().toISOString() };
    return JSON.stringify(payload, null, 2);
  }, [habits, completions]);

  const importData = useCallback(
    (json) => {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed.habits) || typeof parsed.completions !== 'object') {
        throw new Error('Invalid data format');
      }
      setHabits(parsed.habits);
      setCompletions(parsed.completions);
    },
    [setHabits, setCompletions],
  );

  const value = useMemo(
    () => ({
      habits,
      completions,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      exportData,
      importData,
    }),
    [
      habits,
      completions,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      exportData,
      importData,
    ],
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used inside HabitProvider');
  return ctx;
}
