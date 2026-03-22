'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ThemeContext } from '@/hooks/useTheme';
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES, THEME_CLASSES, type ThemeId } from '@/lib/theme';
import { FONT_COLLECTIONS, FontCollection } from '../../../shared/preferences';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    // Migrate legacy 'black' -> 'void'
    if (stored === 'black' as any) {
      setThemeState('void');
      localStorage.setItem(THEME_STORAGE_KEY, 'void');
    } else if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeState(stored);
    }

    // Apply saved font preferences
    try {
      const prefs = JSON.parse(localStorage.getItem('polymath-preferences') || '{}');
      const fontVarMap: Record<string, string> = {
        'dm-sans': 'var(--font-dm-sans)',
        'inter': 'var(--font-inter)',
        'outfit': 'var(--font-outfit)',
        'space-grotesk': 'var(--font-space-grotesk)',
      };
      const monoVarMap: Record<string, string> = {
        'jetbrains-mono': 'var(--font-jetbrains-mono)',
        'space-mono': 'var(--font-space-mono)',
      };
      const root = document.documentElement;

      const currentCollection = prefs.fontCollection as FontCollection || 'industrial';
      const config = FONT_COLLECTIONS[currentCollection];

      if (config) {
        if (fontVarMap[config.sans]) {
          root.style.setProperty('--active-font', fontVarMap[config.sans]);
        }
        if (monoVarMap[config.mono]) {
          root.style.setProperty('--active-mono', monoVarMap[config.mono]);
        }
      }

      if (prefs.fontScale && typeof prefs.fontScale === 'number') {
        root.style.setProperty('--font-scale', String(prefs.fontScale));
      }
    } catch { /* ignore parse errors */ }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    // Remove all theme classes
    THEME_CLASSES.forEach((c) => root.classList.remove(c));
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
