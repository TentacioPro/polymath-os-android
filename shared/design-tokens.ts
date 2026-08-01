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

  // Secondary (triadic: primary hue + 120deg)
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary (triadic: primary hue + 240deg)
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

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
  '2xl': 32,    // Large neural cards
  full: 9999,   // Pills, FABs, chips
} as const;

// ─── Elevation (Dark themes — M3 tonal) ─────────────────────────────────────
// Dark mode: elevation via RN shadow for cross-platform compat (iOS uses shadow,
// Android uses elevation). Dark themes should keep shadowOpacity very low since
// surface tinting already encodes Z-axis via HSL lightness (Kole Jain rule).

export const m3Elevation = {
  level0: { shadowOpacity: 0,    shadowRadius: 0,  shadowOffset: { width: 0, height: 0 },  elevation: 0 },
  level1: { shadowOpacity: 0.05, shadowRadius: 3,  shadowOffset: { width: 0, height: 1 },  elevation: 1 },
  level2: { shadowOpacity: 0.06, shadowRadius: 6,  shadowOffset: { width: 0, height: 2 },  elevation: 3 },
  level3: { shadowOpacity: 0.08, shadowRadius: 8,  shadowOffset: { width: 0, height: 4 },  elevation: 6 },
  level4: { shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },  elevation: 8 },
  level5: { shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },  elevation: 12 },
} as const;

// ─── Elevation — Light Mode / Nova Theme (Kole Jain Phase 3.3) ───────────────
// Nova (light theme): near-invisible shadows, opacity ≤8%, maximum blur radius.
// Reserve pronounced shadows for transient elements (dropdowns, popovers) only.
// Use isDarkTheme(name) to pick the correct elevation set per active theme.

export const m3ElevationLight = {
  level0: { shadowOpacity: 0,    shadowRadius: 0,  shadowOffset: { width: 0, height: 0 },  elevation: 0  },
  level1: { shadowOpacity: 0.03, shadowRadius: 8,  shadowOffset: { width: 0, height: 2 },  elevation: 1  },
  level2: { shadowOpacity: 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },  elevation: 3  },
  level3: { shadowOpacity: 0.05, shadowRadius: 24, shadowOffset: { width: 0, height: 6 },  elevation: 6  },
  level4: { shadowOpacity: 0.06, shadowRadius: 40, shadowOffset: { width: 0, height: 8 },  elevation: 8  },
  level5: { shadowOpacity: 0.07, shadowRadius: 56, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  // Transient elevated surfaces — popovers, dropdowns, tooltips (more pronounced)
  transient: { shadowOpacity: 0.10, shadowRadius: 48, shadowOffset: { width: 0, height: 16 }, elevation: 16 },
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

/** Active themes (T09b). Deprecated themes kept for user-pref backward compat. */
export type ActiveThemeName = 'ink' | 'paper' | 'dusk' | 'amber';
/** @deprecated These IDs are kept only for user-pref migration — do not add to new components. */
export type DeprecatedThemeName = 'void' | 'nova' | 'ocean' | 'forest' | 'sunset' | 'midnight';
export type ThemeName = ActiveThemeName | DeprecatedThemeName;

// ─── Theme Palettes ─────────────────────────────────────────────────────────

const voidPalette: M3Palette = {
  primary: '#C0C0C0', // Silver
  onPrimary: '#000000',
  primaryContainer: 'rgba(192,192,192,0.12)',
  onPrimaryContainer: '#FFFFFF',

  secondary: '#808080',
  onSecondary: '#000000',
  secondaryContainer: 'rgba(128,128,128,0.12)',
  onSecondaryContainer: '#CCCCCC',

  tertiary: '#404040',
  onTertiary: '#FFFFFF',
  tertiaryContainer: 'rgba(64,64,64,0.12)',
  onTertiaryContainer: '#A0A0A0',

  surface: '#000000', // True Obsidian
  surfaceDim: 'rgba(0,0,0,0.90)',
  surfaceContainer: '#0A0A0A',
  surfaceContainerHigh: '#121212',
  surfaceContainerHighest: '#1A1A1A',
  onSurface: '#E6E6E6',
  onSurfaceVariant: '#808080',

  outline: '#333333',
  outlineVariant: '#1A1A1A',

  inverseSurface: '#E6E6E6',
  inverseOnSurface: '#000000',

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
    AI: '#C0C0C0',
    News: '#808080',
    Tools: '#A0A0A0',
    Market: '#E6E6E6',
    Research: '#CCCCCC',
    Tutorial: '#666666',
    Other: '#404040',
  },
};

const novaPalette: M3Palette = {
  primary: '#1A1A1A', // Slate-gray type
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(26,26,26,0.08)',
  onPrimaryContainer: '#000000',

  secondary: '#475569',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F1F5F9',
  onSecondaryContainer: '#334155',

  tertiary: '#94A3B8',
  onTertiary: '#000000',
  tertiaryContainer: '#F8FAFC',
  onTertiaryContainer: '#475569',

  surface: '#FFFFFF', // Pure White
  surfaceDim: 'rgba(255,255,255,0.80)',
  surfaceContainer: '#F8FAFC',
  surfaceContainerHigh: '#F1F5F9',
  surfaceContainerHighest: '#E2E8F0',
  onSurface: '#020617', // Near black for sharp contrast
  onSurfaceVariant: '#475569',

  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',

  inverseSurface: '#0F172A',
  inverseOnSurface: '#FFFFFF',

  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  success: '#16A34A',
  successContainer: '#DCFCE7',
  warning: '#D97706',
  warningContainer: '#FEF3C7',
  info: '#2563EB',
  infoContainer: '#DBEAFE',

  categories: {
    AI: '#0F172A',
    News: '#334155',
    Tools: '#475569',
    Market: '#020617',
    Research: '#64748B',
    Tutorial: '#1E293B',
    Other: '#94A3B8',
  },
};

const amberPalette: M3Palette = {
  primary: '#FFB800', // Glowing Amber
  onPrimary: '#1A1000',
  primaryContainer: 'rgba(255,184,0,0.15)',
  onPrimaryContainer: '#FFD060',

  secondary: '#FF8A00',
  onSecondary: '#1A0E00',
  secondaryContainer: 'rgba(255,138,0,0.15)',
  onSecondaryContainer: '#FFAD4D',

  tertiary: '#FFD700',
  onTertiary: '#1A1600',
  tertiaryContainer: 'rgba(255,215,0,0.15)',
  onTertiaryContainer: '#FFE44D',

  surface: '#0A0A0A', // Deep Charcoal
  surfaceDim: 'rgba(10,10,10,0.80)',
  surfaceContainer: '#121212',
  surfaceContainerHigh: '#1C1C1C',
  surfaceContainerHighest: '#262626',
  onSurface: '#F5F5F5',
  onSurfaceVariant: '#A3A3A3',

  outline: '#404040',
  outlineVariant: '#262626',

  inverseSurface: '#F5F5F5',
  inverseOnSurface: '#0A0A0A',

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
    News: '#FF8A00',
    Tools: '#FFD700',
    Market: '#FFB800',
    Research: '#FFB800',
    Tutorial: '#FF8A00',
    Other: '#FFE44D',
  },
};

const oceanPalette: M3Palette = {
  primary: '#00F2FF', // Cyan
  onPrimary: '#001A1A',
  primaryContainer: 'rgba(0,242,255,0.15)',
  onPrimaryContainer: '#80F8FF',

  secondary: '#007AFF', // Electric Blue
  onSecondary: '#000A1A',
  secondaryContainer: 'rgba(0,122,255,0.15)',
  onSecondaryContainer: '#80BDFF',

  tertiary: '#0044FF',
  onTertiary: '#00051A',
  tertiaryContainer: 'rgba(0,68,255,0.15)',
  onTertiaryContainer: '#80A2FF',

  surface: '#050A15', // Deep Navy
  surfaceDim: 'rgba(5,10,21,0.80)',
  surfaceContainer: '#0A1224',
  surfaceContainerHigh: '#101C33',
  surfaceContainerHighest: '#162542',
  onSurface: '#E0EEFF',
  onSurfaceVariant: '#80A8CC',

  outline: '#203A66',
  outlineVariant: '#101C33',

  inverseSurface: '#E0EEFF',
  inverseOnSurface: '#050A15',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#00F2FF',
  infoContainer: '#007AFF',

  categories: {
    AI: '#00F2FF',
    News: '#007AFF',
    Tools: '#80F8FF',
    Market: '#80BDFF',
    Research: '#0044FF',
    Tutorial: '#00F2FF',
    Other: '#80A8CC',
  },
};

const forestPalette: M3Palette = {
  primary: '#00FF88', // Neon Green
  onPrimary: '#001A0E',
  primaryContainer: 'rgba(0,255,136,0.15)',
  onPrimaryContainer: '#80FFC3',

  secondary: '#00CC6A',
  onSecondary: '#00140A',
  secondaryContainer: 'rgba(0,204,106,0.15)',
  onSecondaryContainer: '#80E5B4',

  tertiary: '#00994F',
  onTertiary: '#000F08',
  tertiaryContainer: 'rgba(0,153,79,0.15)',
  onTertiaryContainer: '#80CCA7',

  surface: '#080C08', // Dark Obsidian
  surfaceDim: 'rgba(8,12,8,0.80)',
  surfaceContainer: '#0D140D',
  surfaceContainerHigh: '#141E14',
  surfaceContainerHighest: '#1B291B',
  onSurface: '#E3F2E3',
  onSurfaceVariant: '#8CB38C',

  outline: '#2E4D2E',
  outlineVariant: '#141E14',

  inverseSurface: '#E3F2E3',
  inverseOnSurface: '#080C08',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#00FF88',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#8AB4F8',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#00FF88',
    News: '#00CC6A',
    Tools: '#80FFC3',
    Market: '#80E5B4',
    Research: '#00994F',
    Tutorial: '#00FF88',
    Other: '#8CB38C',
  },
};

const sunsetPalette: M3Palette = {
  primary: '#FF4D4D', // Crimson
  onPrimary: '#1A0808',
  primaryContainer: 'rgba(255,77,77,0.15)',
  onPrimaryContainer: '#FFA6A6',

  secondary: '#FF7043',
  onSecondary: '#1A0B06',
  secondaryContainer: 'rgba(255,112,67,0.15)',
  onSecondaryContainer: '#FFB8A1',

  tertiary: '#FFCA28',
  onTertiary: '#1A1404',
  tertiaryContainer: 'rgba(255,202,40,0.15)',
  onTertiaryContainer: '#FFE494',

  surface: '#120505', // Deep Crimson Black
  surfaceDim: 'rgba(18,5,5,0.80)',
  surfaceContainer: '#1A0808',
  surfaceContainerHigh: '#260C0C',
  surfaceContainerHighest: '#331010',
  onSurface: '#FCECEC',
  onSurfaceVariant: '#C29393',

  outline: '#662E2E',
  outlineVariant: '#260C0C',

  inverseSurface: '#FCECEC',
  inverseOnSurface: '#120505',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#FFCA28',
  warningContainer: '#6B3520',
  info: '#8AB4F8',
  infoContainer: '#1A3A6B',

  categories: {
    AI: '#FF4D4D',
    News: '#FF7043',
    Tools: '#FFA6A6',
    Market: '#FFCA28',
    Research: '#FFB8A1',
    Tutorial: '#FF4D4D',
    Other: '#C29393',
  },
};

const midnightPalette: M3Palette = {
  primary: '#FF00FF', // Fuchsia
  onPrimary: '#1A001A',
  primaryContainer: 'rgba(255,0,255,0.15)',
  onPrimaryContainer: '#FF80FF',

  secondary: '#A855F7', // Vivid Violet
  onSecondary: '#110818',
  secondaryContainer: 'rgba(168,85,247,0.15)',
  onSecondaryContainer: '#D4AAFB',

  tertiary: '#00F2FF', // Cyber Cyan accent
  onTertiary: '#001A1A',
  tertiaryContainer: 'rgba(0,242,255,0.15)',
  onTertiaryContainer: '#80F8FF',

  surface: '#0A0515', // Deep Purple Void
  surfaceDim: 'rgba(10,5,21,0.80)',
  surfaceContainer: '#110822',
  surfaceContainerHigh: '#190C33',
  surfaceContainerHighest: '#221144',
  onSurface: '#EBE5F5',
  onSurfaceVariant: '#9E8CB3',

  outline: '#442288',
  outlineVariant: '#190C33',

  inverseSurface: '#EBE5F5',
  inverseOnSurface: '#0A0515',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  success: '#81C995',
  successContainer: '#0D5526',
  warning: '#E8C568',
  warningContainer: '#6B4E00',
  info: '#00F2FF',
  infoContainer: '#352255',

  categories: {
    AI: '#FF00FF',
    News: '#A855F7',
    Tools: '#FF80FF',
    Market: '#00F2FF',
    Research: '#D4AAFB',
    Tutorial: '#FF00FF',
    Other: '#9E8CB3',
  },
};

// ─── Active Palettes (T09b — ink / paper / dusk) ────────────────────────────

const inkPalette: M3Palette = {
  // ink = dark ink on cream (light theme — editorial newspaper aesthetic)
  primary: '#1C1917',
  onPrimary: '#FAF8F5',
  primaryContainer: 'rgba(28,25,23,0.08)',
  onPrimaryContainer: '#0A0907',

  secondary: '#44403C',
  onSecondary: '#FAF8F5',
  secondaryContainer: '#F5F0EB',
  onSecondaryContainer: '#292524',

  tertiary: '#78716C',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#EDE8E3',
  onTertiaryContainer: '#44403C',

  surface: '#FAF8F5',
  surfaceDim: 'rgba(250,248,245,0.80)',
  surfaceContainer: '#F2EDE8',
  surfaceContainerHigh: '#EDE8E3',
  surfaceContainerHighest: '#E7E2DD',
  onSurface: '#1C1917',
  onSurfaceVariant: '#78716C',

  outline: '#A8A29E',
  outlineVariant: '#D6D3D1',

  inverseSurface: '#1C1917',
  inverseOnSurface: '#FAF8F5',

  error: '#B91C1C',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  success: '#15803D',
  successContainer: '#DCFCE7',
  warning: '#B45309',
  warningContainer: '#FEF3C7',
  info: '#1D4ED8',
  infoContainer: '#DBEAFE',

  categories: {
    AI: '#1C1917',
    News: '#44403C',
    Tools: '#78716C',
    Market: '#292524',
    Research: '#57534E',
    Tutorial: '#0A0907',
    Other: '#A8A29E',
  },
};

const paperPalette: M3Palette = {
  // paper = cream on dark ink (dark theme — night-reading mode of ink)
  primary: '#F5F0EB',
  onPrimary: '#1C1917',
  primaryContainer: 'rgba(245,240,235,0.12)',
  onPrimaryContainer: '#FFFFFF',

  secondary: '#D6D3D1',
  onSecondary: '#1C1917',
  secondaryContainer: 'rgba(214,211,209,0.12)',
  onSecondaryContainer: '#FAF8F5',

  tertiary: '#A8A29E',
  onTertiary: '#1C1917',
  tertiaryContainer: 'rgba(168,162,158,0.12)',
  onTertiaryContainer: '#D6D3D1',

  surface: '#1C1917',
  surfaceDim: 'rgba(28,25,23,0.90)',
  surfaceContainer: '#242120',
  surfaceContainerHigh: '#2C2928',
  surfaceContainerHighest: '#363130',
  onSurface: '#FAF8F5',
  onSurfaceVariant: '#A8A29E',

  outline: '#57534E',
  outlineVariant: '#2C2928',

  inverseSurface: '#FAF8F5',
  inverseOnSurface: '#1C1917',

  error: '#FCA5A5',
  onError: '#7F1D1D',
  errorContainer: '#991B1B',
  success: '#86EFAC',
  successContainer: '#14532D',
  warning: '#FCD34D',
  warningContainer: '#78350F',
  info: '#93C5FD',
  infoContainer: '#1E3A8A',

  categories: {
    AI: '#FAF8F5',
    News: '#D6D3D1',
    Tools: '#A8A29E',
    Market: '#FFFFFF',
    Research: '#E7E2DD',
    Tutorial: '#F5F0EB',
    Other: '#78716C',
  },
};

const duskPalette: M3Palette = {
  // dusk = muted blue-grey (dark theme — slate editorial)
  primary: '#94A3B8',
  onPrimary: '#0F172A',
  primaryContainer: 'rgba(148,163,184,0.15)',
  onPrimaryContainer: '#CBD5E1',

  secondary: '#64748B',
  onSecondary: '#F8FAFC',
  secondaryContainer: 'rgba(100,116,139,0.15)',
  onSecondaryContainer: '#94A3B8',

  tertiary: '#475569',
  onTertiary: '#F1F5F9',
  tertiaryContainer: 'rgba(71,85,105,0.15)',
  onTertiaryContainer: '#64748B',

  surface: '#0F172A',
  surfaceDim: 'rgba(15,23,42,0.90)',
  surfaceContainer: '#172033',
  surfaceContainerHigh: '#1E2A3F',
  surfaceContainerHighest: '#263349',
  onSurface: '#E2E8F0',
  onSurfaceVariant: '#94A3B8',

  outline: '#334155',
  outlineVariant: '#1E2A3F',

  inverseSurface: '#E2E8F0',
  inverseOnSurface: '#0F172A',

  error: '#FCA5A5',
  onError: '#7F1D1D',
  errorContainer: '#991B1B',
  success: '#86EFAC',
  successContainer: '#14532D',
  warning: '#FCD34D',
  warningContainer: '#78350F',
  info: '#93C5FD',
  infoContainer: '#1E3A8A',

  categories: {
    AI: '#94A3B8',
    News: '#64748B',
    Tools: '#CBD5E1',
    Market: '#E2E8F0',
    Research: '#475569',
    Tutorial: '#BAC8D8',
    Other: '#334155',
  },
};

// ─── Theme Registry ─────────────────────────────────────────────────────────

export const m3Themes: Record<ThemeName, M3Palette> = {
  // Active themes (T09b)
  ink: inkPalette,
  paper: paperPalette,
  dusk: duskPalette,
  amber: amberPalette,
  // Deprecated — kept for user-pref backward compat only
  void: voidPalette,
  nova: novaPalette,
  ocean: oceanPalette,
  forest: forestPalette,
  sunset: sunsetPalette,
  midnight: midnightPalette,
};

/** Active theme IDs — cycles through these only. Deprecated IDs → ink on first cycle. */
export const themeNames: ActiveThemeName[] = ['ink', 'paper', 'dusk', 'amber'];

export const themeLabels: Record<ThemeName, string> = {
  ink: 'INK',
  paper: 'PAPER',
  dusk: 'DUSK',
  amber: 'AMBER',
  // Deprecated labels preserved for pref display fallback
  void: 'VOID (deprecated)',
  nova: 'NOVA (deprecated)',
  ocean: 'OCEAN (deprecated)',
  forest: 'FOREST (deprecated)',
  sunset: 'SUNSET (deprecated)',
  midnight: 'MIDNIGHT (deprecated)',
};

export const getNextTheme = (current: ThemeName): ActiveThemeName => {
  const idx = themeNames.indexOf(current as ActiveThemeName);
  // deprecated names get idx=-1; (-1+1)%4=0 → wraps to 'ink'
  return themeNames[(idx + 1) % themeNames.length];
};

/** Returns true for all dark themes. ink is the only light theme in the active set. */
export const isDarkTheme = (name: ThemeName): boolean => name !== 'ink' && name !== 'nova';

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

// ─── Color Harmony — Triadic System (Kole Jain Phase 3 — Gap 10) ────────────
// Polymath OS uses a triadic color scheme for palette harmony.
// Secondary and tertiary accents derive from 120° hue rotations of primary.
//
//   Primary hue H → Secondary H+120° → Tertiary H+240°
//
// Dark mode accent desaturation rule (prevents retina halation):
//   Reduce accent saturation by 15-20% in dark contexts.
//   Example: Forest primary hsl(161, 70%, 52%) → dark-safe hsl(161, 55%, 52%)
//
// Text inside chips/containers: always invert vs container background.
// Minimum contrast: 4.5:1 for text (WCAG AA), 3:1 for component boundaries.
//
// Current theme hue anchors:
//   void:     achromatic (0°)    — desaturated monochrome
//   nova:     achromatic (0°)    — desaturated monochrome (light)
//   amber:    hue 42° (yellow-orange)
//   ocean:    hue 211° (cool blue)
//   forest:   hue 161° (green)
//   sunset:   hue 24° (orange)
//   midnight: hue 276° (purple)

// ─── Token → Component Traceability Matrix (Kole Jain Phase 6 — Gap 11) ─────
// Maps every M3Palette token to its consuming components.
// Update this when adding tokens to new components.
//
// PRIMARY GROUP
//   primary              → M3Button[filled], FAB bg, active NavRail indicator
//   onPrimary            → text/icons inside filled buttons, FAB, active states
//   primaryContainer     → M3Chip[active] bg, nav active bg, quick-action bg
//   onPrimaryContainer   → text on primaryContainer surfaces
//
// SURFACE GROUP (tonal elevation ladder — Z-axis encoded via HSL lightness)
//   surface              → page bg, sidebar bg, screen bg (Layer 1)
//   surfaceDim           → dialog/sheet scrim overlay tint
//   surfaceContainer     → list items at rest, card default bg (Layer 2a)
//   surfaceContainerHigh → card hover bg, input bg, collapsed-nav hover (Layer 2b)
//   surfaceContainerHighest → modal bg, dialog bg, tooltip bg, bottom sheet (Layer 2c)
//
// TEXT / ICON GROUP (Layer 3 — opacity cascade)
//   onSurface            → primary text 87%, filled icon tint
//   onSurfaceVariant     → secondary text 60%, inactive nav icons, placeholders
//
// BOUNDARY GROUP
//   outline              → input focus border, card border active/hover
//   outlineVariant       → card border at rest, dividers, separator lines
//
// STATUS GROUP
//   error / errorContainer    → M3TextField[error], Dialog[destructive], Toast[error]
//   success / successContainer → M3Button[success], SuccessAnimation, Toast[success]
//   warning / warningContainer → Toast[warning], alert badge
//   info / infoContainer       → Toast[info], StatRing[info variant]
//
// INVERSE GROUP
//   inverseSurface       → tooltip bg (always contrasts with surface)
//   inverseOnSurface     → tooltip text
//
// CATEGORY COLORS
//   categories.AI|News|Tools|Market|Research|Tutorial|Other
//                        → ActivityCard category badge, M3Chip[category]
