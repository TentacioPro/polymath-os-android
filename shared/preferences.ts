import type { ThemeName } from './design-tokens';

export type FontCollection = 'industrial' | 'editorial' | 'geometric' | 'neo-brutalist';

export interface Preferences {
  // Theme Overrides (if any, default to 'void' if not set)
  themeName: ThemeName;

  // Typography
  fontCollection: FontCollection;
  fontScale: number; // 0.85 to 1.30

  // Layout Density / Grid
  dashboardLayout: 'grid' | 'list' | 'compact';
  profileLayout: 'full' | 'minimal';

  // Behavior
  showQuickCaptureOnHome: boolean;

  // Screen visibility (Which standard modules are shown/hidden)
  visibleScreens: {
    dashboard: boolean;
    knowledge: boolean;
    mesh: boolean;
    journal: boolean;
    chat: boolean;
    analytics: boolean;
    integrations: boolean;
    alerts: boolean;
  };
}

export const FONT_COLLECTIONS: Record<FontCollection, { sans: string; mono: string; label: string }> = {
  industrial: { sans: 'inter', mono: 'jetbrains-mono', label: 'Industrial (Web3 / Tech)' },
  editorial: { sans: 'dm-sans', mono: 'space-mono', label: 'Editorial (Reading / Classic)' },
  geometric: { sans: 'outfit', mono: 'jetbrains-mono', label: 'Geometric (Modern / Clean)' },
  'neo-brutalist': { sans: 'space-grotesk', mono: 'space-mono', label: 'Neo-Brutalist (Bold / Raw)' },
};

export const defaultPreferences: Preferences = {
  themeName: 'void',
  fontCollection: 'industrial',
  fontScale: 1.0,
  dashboardLayout: 'grid',
  profileLayout: 'full',
  showQuickCaptureOnHome: true,
  visibleScreens: {
    dashboard: true,
    knowledge: true,
    mesh: true,
    journal: true,
    chat: true,
    analytics: true,
    integrations: true,
    alerts: true,
  },
};
