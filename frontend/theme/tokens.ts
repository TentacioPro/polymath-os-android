// Theme tokens for Polymath OS — M3 Material You tonal system
// Re-exports the M3Palette from shared/design-tokens and provides
// backward-compatible aliases + typography scale.

import type { M3Palette, ThemeName } from '../../shared/design-tokens';
import {
  m3Themes,
  themeNames,
  themeLabels,
  getNextTheme,
  isDarkTheme,
  m3Typography,
  m3Spacing,
  m3Radii,
  m3Elevation,
  m3Motion,
  m3ZIndex,
} from '../../shared/design-tokens';

// Re-export types and utilities
export type { M3Palette, ThemeName };
export type { ActiveThemeName } from '../../shared/design-tokens';
export { m3Themes as themes, themeNames, themeLabels, getNextTheme, isDarkTheme };
export { m3Typography, m3Spacing as spacing, m3Radii as radii, m3Elevation, m3Motion, m3ZIndex };

// ─── ThemeTokens interface (M3 complete) ────────────────────────────────────
// This is the token interface consumed by ALL mobile components via useTheme().

export interface ThemeTokens extends M3Palette {
  name: ThemeName;
  label: string;

  // Typography font family (resolved from user preference in Phase 9)
  fontDisplay: string;
  fontMono: string;
}

// ─── Build ThemeTokens from M3Palette ───────────────────────────────────────

function buildThemeTokens(name: ThemeName, palette: M3Palette): ThemeTokens {
  return {
    ...palette,
    name,
    label: themeLabels[name],
    fontDisplay: 'SpaceGrotesk',
    fontMono: 'JetBrainsMono',
  };
}

// ─── Pre-built theme objects ────────────────────────────────────────────────

// Active themes (T09b)
export const inkTheme   = buildThemeTokens('ink',   m3Themes.ink);
export const paperTheme = buildThemeTokens('paper', m3Themes.paper);
export const duskTheme  = buildThemeTokens('dusk',  m3Themes.dusk);
export const amberTheme = buildThemeTokens('amber', m3Themes.amber);

// Deprecated — kept for user-pref backward compat; do not use in new components
export const voidTheme     = buildThemeTokens('void',     m3Themes.void);
export const novaTheme     = buildThemeTokens('nova',     m3Themes.nova);
export const oceanTheme    = buildThemeTokens('ocean',    m3Themes.ocean);
export const forestTheme   = buildThemeTokens('forest',   m3Themes.forest);
export const sunsetTheme   = buildThemeTokens('sunset',   m3Themes.sunset);
export const midnightTheme = buildThemeTokens('midnight', m3Themes.midnight);

export const themeTokens: Record<ThemeName, ThemeTokens> = {
  ink:   inkTheme,
  paper: paperTheme,
  dusk:  duskTheme,
  amber: amberTheme,
  void:     voidTheme,
  nova:     novaTheme,
  ocean:    oceanTheme,
  forest:   forestTheme,
  sunset:   sunsetTheme,
  midnight: midnightTheme,
};

// ─── M3 Typography scale (mapped from design tokens) ───────────────────────
// Flattened for backward compat with ThemedText variants.

export const typography = {
  // M3 display
  displayLarge: m3Typography.displayLarge,
  displayMedium: m3Typography.displayMedium,
  displaySmall: m3Typography.displaySmall,
  // M3 headline
  headlineLarge: m3Typography.headlineLarge,
  headlineMedium: m3Typography.headlineMedium,
  headlineSmall: m3Typography.headlineSmall,
  // M3 title
  titleLarge: m3Typography.titleLarge,
  titleMedium: m3Typography.titleMedium,
  titleSmall: m3Typography.titleSmall,
  // M3 body
  bodyLarge: m3Typography.bodyLarge,
  bodyMedium: m3Typography.bodyMedium,
  bodySmall: m3Typography.bodySmall,
  // M3 label
  labelLarge: m3Typography.labelLarge,
  labelMedium: m3Typography.labelMedium,
  labelSmall: m3Typography.labelSmall,

  // Legacy aliases (backward compat during migration)
  display: m3Typography.displaySmall,
  heading: m3Typography.headlineMedium,
  body: m3Typography.bodyMedium,
  caption: m3Typography.labelMedium,
  mono: m3Typography.labelSmall,
} as const;
