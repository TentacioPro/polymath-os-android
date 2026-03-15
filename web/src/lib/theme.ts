export type ThemeId = 'black' | 'nova' | 'amber' | 'ocean' | 'forest' | 'sunset' | 'midnight';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  group: 'dark' | 'light';
  swatch: string; // Preview color for theme cards
}

export const THEMES: ThemeConfig[] = [
  { id: 'black', label: 'VOID', description: 'Black monochrome', group: 'dark', swatch: '#FFFFFF' },
  { id: 'nova', label: 'NOVA', description: 'Light architect', group: 'light', swatch: '#000000' },
  { id: 'amber', label: 'AMBER VOID', description: 'Amber void', group: 'dark', swatch: '#FFB800' },
  { id: 'ocean', label: 'OCEAN DEPTH', description: 'Deep blue ocean', group: 'dark', swatch: '#3B82F6' },
  { id: 'forest', label: 'FOREST CANOPY', description: 'Emerald green forest', group: 'dark', swatch: '#10B981' },
  { id: 'sunset', label: 'SUNSET BLAZE', description: 'Warm orange sunset', group: 'dark', swatch: '#F97316' },
  { id: 'midnight', label: 'MIDNIGHT PURPLE', description: 'Deep purple night', group: 'dark', swatch: '#A855F7' },
];

export const THEME_CLASSES = THEMES.map((t) => `theme-${t.id}`);

export const DEFAULT_THEME: ThemeId = 'black';

export const THEME_STORAGE_KEY = 'polymath-theme';
