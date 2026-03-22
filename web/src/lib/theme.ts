export type ThemeId = 'void' | 'nova' | 'amber' | 'ocean' | 'forest' | 'sunset' | 'midnight';

/**
 * Theme naming is unified across mobile and web — both use 'void'.
 * No mapping functions needed.
 */

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  group: 'dark' | 'light';
  swatch: string; // Preview color for theme cards
}

export const THEMES: ThemeConfig[] = [
  { id: 'void', label: 'VOID', description: 'Pure monochrome, white accent', group: 'dark', swatch: '#FFFFFF' },
  { id: 'nova', label: 'NOVA', description: 'Light architect, black accent', group: 'light', swatch: '#000000' },
  { id: 'amber', label: 'AMBER VOID', description: 'Dark void, warm amber accent', group: 'dark', swatch: '#FFB800' },
  { id: 'ocean', label: 'OCEAN DEPTH', description: 'Deep blue, calm focus', group: 'dark', swatch: '#3B82F6' },
  { id: 'forest', label: 'FOREST CANOPY', description: 'Emerald green, nature-inspired', group: 'dark', swatch: '#10B981' },
  { id: 'sunset', label: 'SUNSET BLAZE', description: 'Warm orange glow', group: 'dark', swatch: '#F97316' },
  { id: 'midnight', label: 'MIDNIGHT PURPLE', description: 'Deep purple night', group: 'dark', swatch: '#A855F7' },
];

export const THEME_CLASSES = THEMES.map((t) => `theme-${t.id}`);

export const DEFAULT_THEME: ThemeId = 'void';

export const THEME_STORAGE_KEY = 'polymath-theme';
