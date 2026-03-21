import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { ThemeTokens, ThemeName, themeTokens, getNextTheme, isDarkTheme } from './tokens';

interface ThemeContextValue {
  theme: ThemeTokens;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  themeName: ThemeName;
  onThemeChange: (name: ThemeName) => void;
  children: React.ReactNode;
}

export function ThemeProvider({ themeName, onThemeChange, children }: ThemeProviderProps) {
  const theme = useMemo(() => themeTokens[themeName], [themeName]);

  const setTheme = useCallback(
    (name: ThemeName) => onThemeChange(name),
    [onThemeChange],
  );

  const cycleTheme = useCallback(
    () => onThemeChange(getNextTheme(themeName)),
    [themeName, onThemeChange],
  );

  const isDark = isDarkTheme(themeName);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themeName, setTheme, cycleTheme, isDark }),
    [theme, themeName, setTheme, cycleTheme, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
