# Habits — Daily Tracker

A fully client-side habit tracking app built with React. All data is stored in your browser's `localStorage` — no backend, no account, no tracking.

## Features

- **Habit management** — create, edit, and delete habits with name, description, frequency, start date, category, and color.
- **Frequency** — choose daily, or weekly with specific days of the week.
- **Tracking** — mark habits complete for any past or current day; future dates are read-only.
- **Streaks** — current streak (consecutive completed expected days) and longest historical streak.
- **Calendar view** — month-by-month grid per habit; click a day to toggle completion.
- **Dashboard** — daily progress, total streak days, longest streak, and per-habit completion bars.
- **Dark mode** — toggle in the header; preference persists.
- **Export / Import** — download a JSON snapshot of your data, restore it on any device.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown in your terminal (default `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## Tests

End-to-end tests are written with [Playwright](https://playwright.dev/). The first time you run them you also need to download the browser binaries:

```bash
npx playwright install chromium
```

Then:

```bash
npm test              # headless run
npm run test:headed   # watch the browser
npm run test:ui       # interactive UI mode
npm run test:report   # open the last HTML report
```

The Playwright config in [`playwright.config.js`](playwright.config.js) auto-starts the Vite dev server, so you don't need a separate terminal.

### What's covered

55 tests across 10 spec files in [`tests/`](tests):

| File | Focus |
|---|---|
| [`empty-state.spec.js`](tests/empty-state.spec.js) | First-load empty states on every page |
| [`navigation.spec.js`](tests/navigation.spec.js) | Tab switching, default page, `aria-selected` |
| [`habit-form.spec.js`](tests/habit-form.spec.js) | Create / edit / delete, validation, Escape, start-date `max` |
| [`tracking.spec.js`](tests/tracking.spec.js) | Mark today, undo, daily vs weekly enablement, cross-page sync |
| [`calendar.spec.js`](tests/calendar.spec.js) | Month nav, future / pre-start lockout, modal calendar, habit picker |
| [`streaks.spec.js`](tests/streaks.spec.js) | Current + longest streaks, missed-day reset, weekly schedule, % rate |
| [`dashboard.spec.js`](tests/dashboard.spec.js) | Today progress, hero stats, resting state, overview list |
| [`theme.spec.js`](tests/theme.spec.js) | Light/dark toggle and persistence |
| [`persistence.spec.js`](tests/persistence.spec.js) | localStorage shape, reload survives, delete cascades |
| [`import-export.spec.js`](tests/import-export.spec.js) | JSON download, file import replaces state, invalid file rejected |

Common helpers (date math, form filling, calendar navigation) live in [`tests/helpers.js`](tests/helpers.js).

## How streak calculation works

Streaks treat **expected days** specially — for daily habits every day is expected; for weekly habits only the selected weekdays count.

### Current streak

Walking backward from today through expected days:

1. Start at today. If today is expected and not yet completed, step back to the previous expected day (you don't lose your streak just because the day isn't over yet).
2. Count completed days, stepping back one expected day at a time.
3. Stop when you hit an uncompleted expected day or cross the habit's start date.

### Longest streak

Walking forward from the start date to today:

- Increment a running counter every time an expected day is completed.
- Reset the counter when an expected day is missed (except for today, which is still in progress).
- Track the maximum value the counter ever reached.

### Completion rate

`(completed expected days) / (total expected days since start)`, rounded to a whole percentage.

The implementation lives in [`src/utils/streakUtils.js`](src/utils/streakUtils.js).

## Project structure

```
habits app/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx                  # entry point — mounts <App /> inside <HabitProvider />
    ├── App.jsx                   # tab-based navigation between pages
    ├── index.css                 # all styles, including dark mode tokens
    ├── context/
    │   └── HabitContext.jsx      # habits + completions state, persisted to localStorage
    ├── hooks/
    │   ├── useLocalStorage.js    # generic JSON-serialised localStorage hook
    │   └── useTheme.js           # light/dark theme toggle
    ├── utils/
    │   ├── dateUtils.js          # ISO formatting, month grids, day-of-week helpers
    │   └── streakUtils.js        # current/longest streak + completion rate
    ├── components/
    │   ├── Header.jsx            # brand + page tabs + theme toggle
    │   ├── HabitCard.jsx         # habit summary tile with check button
    │   ├── HabitForm.jsx         # create / edit form
    │   ├── HabitList.jsx         # grid of HabitCards
    │   ├── ProgressBar.jsx       # bar with custom color
    │   ├── CalendarGrid.jsx      # month grid for a single habit
    │   ├── Modal.jsx             # accessible modal with Escape-to-close
    │   └── EmptyState.jsx        # zero-data placeholder
    └── pages/
        ├── Dashboard.jsx         # today's progress + per-habit overview
        ├── Habits.jsx            # CRUD + import/export
        └── Calendar.jsx          # full-page calendar with habit picker
```

## Data model

Two top-level keys are persisted in `localStorage`:

```js
// habits.habits
[
  {
    id: 'uuid',
    name: 'Read 20 minutes',
    description: '',
    frequency: 'daily' | 'weekly',
    weeklyDays: [1, 3, 5],         // 0 = Sunday … 6 = Saturday (only used for weekly)
    startDate: '2026-04-01',
    category: 'study',
    color: '#4f46e5',
    createdAt: '2026-04-01T08:23:00.000Z'
  }
]

// habits.completions
{
  '<habit-id>': {
    '2026-04-26': true,
    '2026-04-27': true
  }
}
```

Plus `habits.theme` (`'light'` or `'dark'`).

All dates are formatted as `YYYY-MM-DD` so they sort lexicographically and never wrestle with timezones.

## Edge cases handled

- **No habits** — every page renders an empty state with a clear CTA.
- **Future dates** — disabled in the calendar and on the form's start date input.
- **Pre-start dates** — dimmed in the calendar; never count as missed.
- **Today not yet done** — current streak doesn't break until the day is over.
- **Storage failures** — `useLocalStorage` swallows quota errors silently so the UI keeps working.
- **Corrupt imports** — JSON imports validate shape and surface an error.

## Dependencies

Runtime: `react`, `react-dom`. That's it.
Build-time only: `vite`, `@vitejs/plugin-react`.
