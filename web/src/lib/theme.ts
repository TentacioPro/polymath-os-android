export type ThemeId =
  | 'ink' | 'paper' | 'dusk' | 'amber'
  | 'void' | 'nova' | 'ocean' | 'forest' | 'sunset' | 'midnight';

export type ActiveThemeId = 'ink' | 'paper' | 'dusk' | 'amber';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  group: 'dark' | 'light';
  swatch: string;
  deprecated?: true;
}

export const THEMES: ThemeConfig[] = [
  { id: 'ink',   label: 'INK',   description: 'Dark ink on warm cream — editorial default', group: 'light', swatch: '#1C1917' },
  { id: 'paper', label: 'PAPER', description: 'Warm cream on dark ink — night-reading mode', group: 'dark',  swatch: '#FAF8F5' },
  { id: 'dusk',  label: 'DUSK',  description: 'Muted blue-grey — slate editorial',           group: 'dark',  swatch: '#94A3B8' },
  { id: 'amber', label: 'AMBER', description: 'Deep charcoal, warm amber accent',            group: 'dark',  swatch: '#FFB800' },
  // Deprecated — kept for user-pref backward compat
  { id: 'void',     label: 'VOID (deprecated)',     description: 'Replaced by INK',     group: 'dark',  swatch: '#C0C0C0', deprecated: true },
  { id: 'nova',     label: 'NOVA (deprecated)',     description: 'Replaced by PAPER',   group: 'light', swatch: '#1A1A1A', deprecated: true },
  { id: 'ocean',    label: 'OCEAN (deprecated)',    description: 'Retired theme',        group: 'dark',  swatch: '#3B82F6', deprecated: true },
  { id: 'forest',   label: 'FOREST (deprecated)',   description: 'Retired theme',        group: 'dark',  swatch: '#10B981', deprecated: true },
  { id: 'sunset',   label: 'SUNSET (deprecated)',   description: 'Retired theme',        group: 'dark',  swatch: '#F97316', deprecated: true },
  { id: 'midnight', label: 'MIDNIGHT (deprecated)', description: 'Retired theme',        group: 'dark',  swatch: '#A855F7', deprecated: true },
];

export const ACTIVE_THEMES = THEMES.filter((t) => !t.deprecated);

export const THEME_CLASSES = THEMES.map((t) => `theme-${t.id}`);

export const DEFAULT_THEME: ActiveThemeId = 'ink';

export const THEME_STORAGE_KEY = 'polymath-theme';
