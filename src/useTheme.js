// useTheme.js
// Light/dark preference, persisted to localStorage and published on <html> so
// the CSS `[data-theme='…']` token blocks can switch the whole app.
// --------------------------------------------------

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vectorshift-theme';
const DEFAULT_THEME = 'dark';

const readStoredTheme = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : DEFAULT_THEME;
  } catch {
    // Private-browsing modes can throw on storage access.
    return DEFAULT_THEME;
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persistence is best-effort; the session still themes correctly.
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    []
  );

  return { theme, toggleTheme };
};
