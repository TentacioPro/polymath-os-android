export type ThemeId = 'black' | 'amber' | 'nova';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
}

export const THEMES: ThemeConfig[] = [
  { id: 'black', label: 'VOID', description: 'Black monochrome' },
  { id: 'amber', label: 'EMBER', description: 'Amber void' },
  { id: 'nova', label: 'NOVA', description: 'Light architect' },
];

export const DEFAULT_THEME: ThemeId = 'black';

export const THEME_STORAGE_KEY = 'polymath-theme';
