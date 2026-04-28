import { useState } from 'react';
import { Header } from './components/Header.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Habits } from './pages/Habits.jsx';
import { Calendar } from './pages/Calendar.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app">
      <Header page={page} onPageChange={setPage} />
      <main className="main">
        {page === 'dashboard' && (
          <Dashboard
            onCreateHabit={() => setPage('habits')}
            onGoToHabits={() => setPage('habits')}
          />
        )}
        {page === 'habits' && <Habits />}
        {page === 'calendar' && <Calendar onCreateHabit={() => setPage('habits')} />}
      </main>
      <footer className="footer">
        <span className="muted">Stored locally on your device · No account needed</span>
      </footer>
    </div>
  );
}
