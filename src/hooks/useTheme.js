import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('habits.theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}
