// Material You (M3) Design Token System for Polymath OS
// Generates a complete tonal palette from each theme's accent color.
// Source of truth for BOTH mobile (React Native) and web (Next.js).

// ─── M3 Palette Interface ──────────────────────────────────────────────────

export interface M3Palette {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Surface (tonal elevation ladder)
  surface: string;
  surfaceDim: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;

  // Status
  error: string;
  onError: string;
  errorContainer: string;
  success: string;
  successContainer: string;
  warning: string;
  warningContainer: string;
  info: string;
  infoContainer: string;

  // Category colors (themed per-theme)
  categories: Record<string, string>;
}

// ─── Typography Scale (M3 + Kole Jain) ─────────────────────────────────────
// Line height rules (Kole Jain):
//   Body text: 1.5× fontSize | Small/label text: 1.4× fontSize
//   Headings (headline, title): 1.1–1.2× fontSize (tight, M3 was too generous)
// Letter spacing rules (Kole Jain):
//   Display only: -2% to -3% (tighten visual mass of large text)
//   Body and below: 0 to positive tracking for readability

export const m3Typography = {
  // Display — letterSpacing: -2% of fontSize (Kole Jain tightening rule)
  displayLarge:  { fontSize: 57, fontWeight: '400' as const, lineHeight: 64, letterSpacing: -1.00 },
  displayMedium: { fontSize: 45, fontWeight: '400' as const, lineHeight: 52, letterSpacing: -0.75 },
  displaySmall:  { fontSize: 36, fontWeight: '400' as const, lineHeight: 40, letterSpacing: -0.50 },
  // Headline — lineHeight: ~1.15× fontSize (was 1.33–1.43×, tightened)
  headlineLarge: { fontSize: 32, fontWeight: '400' as const, lineHeight: 36, letterSpacing: 0 },
  headlineMedium:{ fontSize: 28, fontWeight: '400' as const, lineHeight: 32, letterSpacing: 0 },
  headlineSmall: { fontSize: 24, fontWeight: '400' as const, lineHeight: 28, letterSpacing: 0 },
  // Title — lineHeight: ~1.2× fontSize
  titleLarge:    { fontSize: 22, fontWeight: '500' as const, lineHeight: 24, letterSpacing: 0 },
  titleMedium:   { fontSize: 16, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.15 },
  titleSmall:    { fontSize: 14, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.1 },
  // Body — lineHeight: 1.5× fontSize
  bodyLarge:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, letterSpacing: 0.5 },
  bodyMedium:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, letterSpacing: 0.25 },
  bodySmall:     { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, letterSpacing: 0.4 },
  // Label — lineHeight: 1.4× fontSize
  labelLarge:    { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium:   { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall:    { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
} as const;

// ─── Font Resolution ────────────────────────────────────────────────────────

export type FontFamilyPref = 'dm-sans' | 'inter' | 'outfit' | 'space-grotesk';
export type MonoFontPref = 'jetbrains-mono' | 'space-mono';

export interface ResolvedFonts {
  regular: string;
  medium: string;
  bold: string;
}

const FONT_MAP: Record<FontFamilyPref, ResolvedFonts> = {
  'dm-sans':       { regular: 'DMSans',       medium: 'DMSans-Medium',       bold: 'DMSans-Bold' },
  'inter':         { regular: 'Inter',         medium: 'Inter-Medium',        bold: 'Inter-Bold' },
  'outfit':        { regular: 'Outfit',        medium: 'Outfit-Medium',       bold: 'Outfit-Bold' },
  'space-grotesk': { regular: 'SpaceGrotesk',  medium: 'SpaceGrotesk',        bold: 'SpaceGrotesk-Bold' },
};

const MONO_MAP: Record<MonoFontPref, { regular: string; bold: string }> = {
  'jetbrains-mono': { regular: 'JetBrainsMono', bold: 'JetBrainsMono-Bold' },
  'space-mono':     { regular: 'SpaceMono',     bold: 'SpaceMono' },
};

export function resolveFonts(fontFamily: FontFamilyPref = 'dm-sans') {
  return FONT_MAP[fontFamily] || FONT_MAP['dm-sans'];
}

export function resolveMonoFont(monoFont: MonoFontPref = 'jetbrains-mono') {
  return MONO_MAP[monoFont] || MONO_MAP['jetbrains-mono'];
}

// ─── Spacing (8-Point Grid — Kole Jain Spatial Rhythm) ──────────────────────
// ONLY use these values. Never arbitrary primes (13, 17, 22px etc).
// xs/sm: tight/related gaps | md/lg: card padding | xl/xxl: section gaps | section/hero: page-level

export const m3Spacing = {
  xs: 4,        // icon gaps, dot separators, tight internal padding
  sm: 8,        // related element gaps, compact list item padding
  md: 16,       // card internal padding, unrelated element gaps
  lg: 24,       // section internal padding, comfortable list gaps
  xl: 32,       // section separation, modal padding
  xxl: 48,      // major section breaks, page-level vertical rhythm
  section: 64,  // large section separation (hero → content)
  hero: 96,     // page-level top/bottom breathing room
} as const;

// ─── Radii (M3 shape system) ────────────────────────────────────────────────

export const m3Radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,       // Cards, sheets, dialogs
  full: 9999,   // Pills, FABs, chips
} as const;

// ─── Elevation ──────────────────────────────────────────────────────────────

export const m3Elevation = {
  level0: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  level1: { shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  level2: { shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  level3: { shadowOpacity: 0.20, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  level4: { shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  level5: { shadowOpacity: 0.30, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
} as const;

// ─── Motion (M3 easing & duration) ─────────────────────────────────────────

export const m3Motion = {
  easing: {
    standard:       'cubic-bezier(0.2, 0, 0, 1)',
    standardDecel:  'cubic-bezier(0, 0, 0, 1)',
    standardAccel:  'cubic-bezier(0.3, 0, 1, 1)',
    emphasized:     'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedDecel:'cubic-bezier(0.05, 0.7, 0.1, 1)',
    emphasizedAccel:'cubic-bezier(0.3, 0, 0.8, 0.15)',
  },
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
  },
  spring: {
    gentle:   { damping: 20, stiffness: 150, mass: 1 },
    bouncy:   { damping: 12, stiffness: 200, mass: 0.8 },
    snappy:   { damping: 18, stiffness: 300, mass: 0.6 },
    stiff:    { damping: 30, stiffness: 400, mass: 1 },
  },
} as const;

// ─── Z-Index Scale ──────────────────────────────────────────────────────────

export const m3ZIndex = {
  base: 0,
  card: 1,
  stickyHeader: 10,
  fab: 20,
  navRail: 30,
  topBar: 40,
  overlay: 50,
  sheet: 60,
  dialog: 70,
  toast: 80,
  tooltip: 90,
} as const;

// ─── Text Opacity Cascade (Kole Jain 4-Layer Color) ─────────────────────────
// Layer 3: text/icons opacity cascade — apply via rgba(onSurface, opacity)
// Primary text (87%), secondary/muted text (60%), disabled/tertiary (38%)

export const m3TextOpacity = {
  primary: 0.87,    // main readable text — replaces flat onSurface usage
  secondary: 0.60,  // supporting text, timestamps, captions
  disabled: 0.38,   // disabled state labels, inactive indicators
} as const;

// ─── Icon Sizing — Iconometry Rule (Kole Jain) ───────────────────────────────
// Icon bounding box MUST equal the adjacent text's computed lineHeight in px.
// Example: bodyMedium (14px, lh 20px) → icon size = 20px (snap to m3IconSize.sm)
// Always pair with alignItems: 'center' to eliminate sub-pixel baseline drift.

export function iconSize(
  fontSize: number,
  lineHeightMultiplier = 1.5,
): number {
  const raw = fontSize * lineHeightMultiplier;
  return Math.round(raw / 4) * 4; // snap to nearest 4px
}

export const m3IconSize = {
  xs: 16,  // labelSmall / labelMedium lineHeight
  sm: 20,  // bodyMedium / labelLarge lineHeight
  md: 24,  // bodyLarge / titleMedium lineHeight
  lg: 32,  // headlineSmall area
  xl: 40,  // headlineMedium area (stat rings, hero icons)
} as const;

// ─── Touch Target (WCAG 2.1 + Kole Jain) ────────────────────────────────────
// Every interactive element must present at minimum a 44×44px tap area.
// Visual size may be smaller (e.g., chip = 32px tall) — use hitSlop to pad.

export const m3TouchTarget = {
  min: 44,          // WCAG 2.1 SC 2.5.5 — absolute minimum
  comfortable: 48,  // recommended for frequently-tapped targets
} as const;

// ─── Component Dimension Formula (Kole Jain) ─────────────────────────────────
// Target Width = Computed Height × 2 for pill-shaped interactive elements.
// Override only to meet m3TouchTarget.min × 2 as absolute floor.
// Usage: buttonMinWidth(buttonHeight) in M3Button / M3Chip dimension logic.

export function buttonMinWidth(computedHeight: number): number {
  const formula = computedHeight * 2;
  const floor = m3TouchTarget.min * 2;
  return Math.max(formula, floor);
}

// ─── Theme Name Type ────────────────────────────────────────────────────────

export type ThemeName = 'void' | 'nova' | 'amber' | 'ocean' | 'forest' | 'sunset' | 'midnight';

// ─── Theme Palettes ─────────────────────────────────────────────────────────

const voidPalette: M3Palette = {
  primary: '#FFFFFF',
  onPrimary: '#000000',
  primaryContainer: 'rgba(255,255,255,0.12)',
  onPrimaryContainer: '#FFFFFF',

  surface: '#0A0A0A',
  surfaceDim: 'rgba(0,0,0,0.80)',
  surfaceContainer: '#151515',
  surfaceContainerHigh: '#1E1E1E',
  surfaceContainerHighest: '#282828',
  onSurface: '#E6E6E6',
  onSurfaceVariant: '#A0A0A0',

  outline: '#404040',
  outlineVariant: '#2A2A2A',

  inverseSurface: '#E6E6E6',
  inverseOnSurface: '#1A1A1A',

  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#8AB4F8',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#C4B5FD',
    News: '#93C5FD',
    Tools: '#6EE7B7',
    Market: '#FCD34D',
    Research: '#F9A8D4',
    Tutorial: '#67E8F9',
    Other: '#9CA3AF',
  },
};

const novaPalette: M3Palette = {
  primary: '#1A1A1A',
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(0,0,0,0.08)',
  onPrimaryContainer: '#1A1A1A',

  surface: '#FAFAFA',
  surfaceDim: 'rgba(255,255,255,0.80)',
  surfaceContainer: '#F0F0F0',
  surfaceContainerHigh: '#E8E8E8',
  surfaceContainerHighest: '#E0E0E0',
  onSurface: '#1A1A1A',
  onSurfaceVariant: '#5C5C5C',

  outline: '#C0C0C0',
  outlineVariant: '#E0E0E0',

  inverseSurface: '#2A2A2A',
  inverseOnSurface: '#F0F0F0',

  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  success: '#1B6D34',
  successContainer: '#D4F5DC',
  warning: '#7D5800',
  warningContainer: '#FFEAB0',
  info: '#1A5FB4',
  infoContainer: '#D4E4FA',

  categories: {
    AI: '#7C3AED',
    News: '#2563EB',
    Tools: '#059669',
    Market: '#D97706',
    Research: '#DB2777',
    Tutorial: '#0891B2',
    Other: '#6B7280',
  },
};

const amberPalette: M3Palette = {
  primary: '#FFB800',
  onPrimary: '#1A1000',
  primaryContainer: 'rgba(255,184,0,0.15)',
  onPrimaryContainer: '#FFD060',

  surface: '#0C0800',
  surfaceDim: 'rgba(0,0,0,0.80)',
  surfaceContainer: '#1A1200',
  surfaceContainerHigh: '#261A00',
  surfaceContainerHighest: '#332200',
  onSurface: '#F0E0C0',
  onSurfaceVariant: '#B09060',

  outline: '#5C4000',
  outlineVariant: '#3D2A00',

  inverseSurface: '#F0E0C0',
  inverseOnSurface: '#1A1200',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#FFB800',
  warningContainer: '#5C4000',
  info: '#8AB4F8',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#FFD060',
    News: '#FFB800',
    Tools: '#FFA000',
    Market: '#FF8C00',
    Research: '#FFD060',
    Tutorial: '#FFB800',
    Other: '#8B6914',
  },
};

const oceanPalette: M3Palette = {
  primary: '#60A5FA',
  onPrimary: '#0A1628',
  primaryContainer: 'rgba(59,130,246,0.15)',
  onPrimaryContainer: '#93C5FD',

  surface: '#080E1A',
  surfaceDim: 'rgba(8,14,26,0.80)',
  surfaceContainer: '#0F1A2E',
  surfaceContainerHigh: '#162640',
  surfaceContainerHighest: '#1E3355',
  onSurface: '#D6E4F0',
  onSurfaceVariant: '#7DA0C4',

  outline: '#2E5080',
  outlineVariant: '#1A3355',

  inverseSurface: '#D6E4F0',
  inverseOnSurface: '#0F1A2E',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#60A5FA',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#93C5FD',
    News: '#60A5FA',
    Tools: '#34D399',
    Market: '#FCD34D',
    Research: '#F9A8D4',
    Tutorial: '#67E8F9',
    Other: '#7DA0C4',
  },
};

const forestPalette: M3Palette = {
  primary: '#34D399',
  onPrimary: '#0A1A0A',
  primaryContainer: 'rgba(16,185,129,0.15)',
  onPrimaryContainer: '#6EE7B7',

  surface: '#060E06',
  surfaceDim: 'rgba(6,14,6,0.80)',
  surfaceContainer: '#0F1E0F',
  surfaceContainerHigh: '#162A16',
  surfaceContainerHighest: '#1E381E',
  onSurface: '#D0E8D0',
  onSurfaceVariant: '#70A870',

  outline: '#2E6B2E',
  outlineVariant: '#1A401A',

  inverseSurface: '#D0E8D0',
  inverseOnSurface: '#0F1E0F',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#34D399',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#8AB4F8',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#6EE7B7',
    News: '#34D399',
    Tools: '#10B981',
    Market: '#FCD34D',
    Research: '#F9A8D4',
    Tutorial: '#67E8F9',
    Other: '#70A870',
  },
};

const sunsetPalette: M3Palette = {
  primary: '#FB923C',
  onPrimary: '#1A0A0A',
  primaryContainer: 'rgba(249,115,22,0.15)',
  onPrimaryContainer: '#FDBA74',

  surface: '#100606',
  surfaceDim: 'rgba(16,6,6,0.80)',
  surfaceContainer: '#1E0E0E',
  surfaceContainerHigh: '#2E1616',
  surfaceContainerHighest: '#3E1E1E',
  onSurface: '#F0D0C0',
  onSurfaceVariant: '#B07060',

  outline: '#6B3520',
  outlineVariant: '#401E12',

  inverseSurface: '#F0D0C0',
  inverseOnSurface: '#1E0E0E',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#FB923C',
  warningContainer: '#6B3520',
  info: '#8AB4F8',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#FDBA74',
    News: '#FB923C',
    Tools: '#F97316',
    Market: '#FCD34D',
    Research: '#F9A8D4',
    Tutorial: '#67E8F9',
    Other: '#B07060',
  },
};

const midnightPalette: M3Palette = {
  primary: '#C084FC',
  onPrimary: '#0F0A1A',
  primaryContainer: 'rgba(168,85,247,0.15)',
  onPrimaryContainer: '#D8B4FE',

  surface: '#0A061A',
  surfaceDim: 'rgba(10,6,26,0.80)',
  surfaceContainer: '#150E28',
  surfaceContainerHigh: '#201638',
  surfaceContainerHighest: '#2C1E4A',
  onSurface: '#E0D0F0',
  onSurfaceVariant: '#9070B0',

  outline: '#553A80',
  outlineVariant: '#352255',

  inverseSurface: '#E0D0F0',
  inverseOnSurface: '#150E28',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#C084FC',
  infoContainer: '#352255',

  categories: {
    AI: '#D8B4FE',
    News: '#C084FC',
    Tools: '#A855F7',
    Market: '#FCD34D',
    Research: '#F9A8D4',
    Tutorial: '#67E8F9',
    Other: '#9070B0',
  },
};

// ─── Theme Registry ─────────────────────────────────────────────────────────

export const m3Themes: Record<ThemeName, M3Palette> = {
  void: voidPalette,
  nova: novaPalette,
  amber: amberPalette,
  ocean: oceanPalette,
  forest: forestPalette,
  sunset: sunsetPalette,
  midnight: midnightPalette,
};

export const themeNames: ThemeName[] = ['void', 'nova', 'amber', 'ocean', 'forest', 'sunset', 'midnight'];

export const themeLabels: Record<ThemeName, string> = {
  void: 'VOID',
  nova: 'NOVA',
  amber: 'AMBER VOID',
  ocean: 'OCEAN DEPTH',
  forest: 'FOREST CANOPY',
  sunset: 'SUNSET BLAZE',
  midnight: 'MIDNIGHT PURPLE',
};

export const getNextTheme = (current: ThemeName): ThemeName => {
  const idx = themeNames.indexOf(current);
  return themeNames[(idx + 1) % themeNames.length];
};

/** Check if a theme is "dark" (all except nova) */
export const isDarkTheme = (name: ThemeName): boolean => name !== 'nova';

/** Compute luminance to auto-detect status bar style */
export function hexLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
