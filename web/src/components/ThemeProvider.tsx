'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ThemeContext } from '@/hooks/useTheme';
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES, type ThemeId } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('theme-black', 'theme-amber', 'theme-nova');
    // Add current
    root.classList.add(`theme-${theme}`);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      return THEMES[(idx + 1) % THEMES.length].id;
    });
  }, []);

  // Prevent flash — render with default class until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
