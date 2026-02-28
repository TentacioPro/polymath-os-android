'use client';

import { createContext, useContext } from 'react';
import type { ThemeId } from '@/lib/theme';

export interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'black',
  setTheme: () => {},
  cycleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
