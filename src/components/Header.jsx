import { useTheme } from '../hooks/useTheme.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'habits', label: 'Habits' },
  { id: 'calendar', label: 'Calendar' },
];

export function Header({ page, onPageChange }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">✦</div>
          <h1>Habits</h1>
        </div>

        <nav className="tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={page === tab.id}
              className={`tab ${page === tab.id ? 'tab-active' : ''}`}
              onClick={() => onPageChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          className="icon-button"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
