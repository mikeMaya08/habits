export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatISO(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return formatISO(new Date());
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a, b) {
  return formatISO(a) === formatISO(b);
}

export function isFuture(dateISO) {
  return dateISO > todayISO();
}

export function isBefore(aISO, bISO) {
  return aISO < bISO;
}

export function getDayOfWeek(dateISO) {
  return parseISO(dateISO).getDay();
}

export function diffInDays(aISO, bISO) {
  const a = parseISO(aISO);
  const b = parseISO(bISO);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

export function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

export function endOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

export function buildMonthGrid(year, month) {
  const first = startOfMonth(year, month);
  const last = endOfMonth(year, month);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatHumanDate(dateISO) {
  const d = parseISO(dateISO);
  return `${DAY_NAMES_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
