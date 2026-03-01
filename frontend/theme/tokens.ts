// Theme tokens for Polymath OS — 7 themes
// Source of truth: Google Stitch designs

export type ThemeName = 'void' | 'nova' | 'amber' | 'ocean' | 'forest' | 'sunset' | 'midnight';

export interface ThemeTokens {
  name: ThemeName;
  label: string;

  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;

  // Borders
  border: string;
  borderMuted: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accents
  accent: string;
  accentContrast: string;

  // Shadows (brutalist architect offset)
  shadow: string;
  shadowMuted: string;
  shadowOffset: { width: number; height: number };

  // Typography
  fontDisplay: string;
  fontMono: string;

  // Drawer (always dark, accents change per theme)
  drawer: {
    background: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    activeIndicator: string;
    overlay: string;
  };

  // Floating pill nav (always black, accents change per theme)
  pill: {
    background: string;
    border: string;
    shadow: string;
    activeColor: string;
    inactiveColor: string;
    actionBackground: string;
    actionIcon: string;
  };

  // Status / semantic colors (consistent across themes)
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Category badge colors
  categories: Record<string, string>;
}

// ─── VOID (Black Theme) ─────────────────────────────────────────────────────

export const voidTheme: ThemeTokens = {
  name: 'void',
  label: 'VOID',

  background: '#000000',
  surface: '#111111',
  surfaceElevated: '#1A1A1A',

  border: '#FFFFFF',
  borderMuted: '#333333',

  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#666666',

  accent: '#FFFFFF',
  accentContrast: '#000000',

  shadow: 'rgba(255,255,255,0.2)',
  shadowMuted: 'rgba(255,255,255,0.05)',
  shadowOffset: { width: 4, height: 4 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#000000',
    border: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    activeIndicator: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.7)',
  },

  pill: {
    background: '#000000',
    border: '#FFFFFF',
    shadow: 'rgba(255,255,255,1)',
    activeColor: '#FFFFFF',
    inactiveColor: '#666666',
    actionBackground: '#FFFFFF',
    actionIcon: '#000000',
  },

  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  categories: {
    AI: '#FFFFFF',
    News: '#CCCCCC',
    Tools: '#FFFFFF',
    Market: '#999999',
    Research: '#FFFFFF',
    Tutorial: '#CCCCCC',
    Other: '#666666',
  },
};

// ─── NOVA (Light Theme) ─────────────────────────────────────────────────────

export const novaTheme: ThemeTokens = {
  name: 'nova',
  label: 'NOVA',

  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceElevated: '#F1F5F9',

  border: '#000000',
  borderMuted: '#E2E8F0',

  textPrimary: '#000000',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  accent: '#000000',
  accentContrast: '#FFFFFF',

  shadow: 'rgba(0,0,0,0.2)',
  shadowMuted: 'rgba(0,0,0,0.05)',
  shadowOffset: { width: 4, height: 4 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#000000',
    border: '#333333',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    activeIndicator: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.7)',
  },

  pill: {
    background: '#000000',
    border: '#000000',
    shadow: 'rgba(0,0,0,1)',
    activeColor: '#FFFFFF',
    inactiveColor: '#666666',
    actionBackground: '#FFFFFF',
    actionIcon: '#000000',
  },

  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  categories: {
    AI: '#000000',
    News: '#475569',
    Tools: '#000000',
    Market: '#64748B',
    Research: '#000000',
    Tutorial: '#475569',
    Other: '#94A3B8',
  },
};

// ─── AMBER VOID (Accent Theme) ──────────────────────────────────────────────

export const amberTheme: ThemeTokens = {
  name: 'amber',
  label: 'AMBER VOID',

  background: '#000000',
  surface: '#1A1000',
  surfaceElevated: '#331A00',

  border: '#FF8C00',
  borderMuted: '#4D2600',

  textPrimary: '#FFFFFF',
  textSecondary: '#FFB800',
  textMuted: '#996600',

  accent: '#FFB800',
  accentContrast: '#000000',

  shadow: 'rgba(255,140,0,0.6)',
  shadowMuted: 'rgba(255,184,0,0.1)',
  shadowOffset: { width: 4, height: 4 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#000000',
    border: '#FF8C00',
    textPrimary: '#FFFFFF',
    textSecondary: '#FFB800',
    activeIndicator: '#FFB800',
    overlay: 'rgba(0,0,0,0.7)',
  },

  pill: {
    background: '#000000',
    border: '#FF8C00',
    shadow: 'rgba(255,140,0,0.6)',
    activeColor: '#FFB800',
    inactiveColor: '#996600',
    actionBackground: '#FFB800',
    actionIcon: '#000000',
  },

  status: {
    success: '#10B981',
    warning: '#FF8C00',
    error: '#FF4500',
    info: '#FFB800',
  },

  categories: {
    AI: '#FFB800',
    News: '#FF8C00',
    Tools: '#FFB800',
    Market: '#CC8800',
    Research: '#FFB800',
    Tutorial: '#FF8C00',
    Other: '#996600',
  },
};

// ─── Ocean Theme ────────────────────────────────────────────────────────────

export const oceanTheme: ThemeTokens = {
  name: 'ocean',
  label: 'OCEAN DEPTH',

  background: '#0A1628',
  surface: '#0F1F35',
  surfaceElevated: '#162A45',

  border: '#3B82F6',
  borderMuted: '#1E3A5F',

  textPrimary: '#FFFFFF',
  textSecondary: '#60A5FA',
  textMuted: '#3B82F6',

  accent: '#3B82F6',
  accentContrast: '#FFFFFF',

  shadow: 'rgba(59,130,246,0.4)',
  shadowMuted: 'rgba(59,130,246,0.1)',
  shadowOffset: { width: 0, height: 2 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#0A1628',
    border: '#3B82F6',
    textPrimary: '#FFFFFF',
    textSecondary: '#60A5FA',
    activeIndicator: '#3B82F6',
    overlay: 'rgba(10,22,40,0.8)',
  },

  pill: {
    background: '#0F1F35',
    border: '#3B82F6',
    shadow: 'rgba(59,130,246,0.3)',
    activeColor: '#60A5FA',
    inactiveColor: '#3B82F6',
    actionBackground: '#3B82F6',
    actionIcon: '#FFFFFF',
  },

  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  categories: {
    AI: '#3B82F6',
    News: '#60A5FA',
    Tools: '#2563EB',
    Market: '#1D4ED8',
    Research: '#3B82F6',
    Tutorial: '#60A5FA',
    Other: '#1E3A5F',
  },
};

// ─── Forest Theme ───────────────────────────────────────────────────────────

export const forestTheme: ThemeTokens = {
  name: 'forest',
  label: 'FOREST CANOPY',

  background: '#0A1A0A',
  surface: '#0F250F',
  surfaceElevated: '#153015',

  border: '#10B981',
  borderMuted: '#0D3D29',

  textPrimary: '#FFFFFF',
  textSecondary: '#34D399',
  textMuted: '#10B981',

  accent: '#10B981',
  accentContrast: '#000000',

  shadow: 'rgba(16,185,129,0.4)',
  shadowMuted: 'rgba(16,185,129,0.1)',
  shadowOffset: { width: 0, height: 2 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#0A1A0A',
    border: '#10B981',
    textPrimary: '#FFFFFF',
    textSecondary: '#34D399',
    activeIndicator: '#10B981',
    overlay: 'rgba(10,26,10,0.8)',
  },

  pill: {
    background: '#0F250F',
    border: '#10B981',
    shadow: 'rgba(16,185,129,0.3)',
    activeColor: '#34D399',
    inactiveColor: '#10B981',
    actionBackground: '#10B981',
    actionIcon: '#000000',
  },

  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#34D399',
  },

  categories: {
    AI: '#10B981',
    News: '#34D399',
    Tools: '#059669',
    Market: '#047857',
    Research: '#10B981',
    Tutorial: '#34D399',
    Other: '#0D3D29',
  },
};

// ─── Sunset Theme ───────────────────────────────────────────────────────────

export const sunsetTheme: ThemeTokens = {
  name: 'sunset',
  label: 'SUNSET BLAZE',

  background: '#1A0A0A',
  surface: '#2A0F0F',
  surfaceElevated: '#3A1515',

  border: '#F97316',
  borderMuted: '#7C2D12',

  textPrimary: '#FFFFFF',
  textSecondary: '#FB923C',
  textMuted: '#F97316',

  accent: '#F97316',
  accentContrast: '#000000',

  shadow: 'rgba(249,115,22,0.4)',
  shadowMuted: 'rgba(249,115,22,0.1)',
  shadowOffset: { width: 0, height: 2 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#1A0A0A',
    border: '#F97316',
    textPrimary: '#FFFFFF',
    textSecondary: '#FB923C',
    activeIndicator: '#F97316',
    overlay: 'rgba(26,10,10,0.8)',
  },

  pill: {
    background: '#2A0F0F',
    border: '#F97316',
    shadow: 'rgba(249,115,22,0.3)',
    activeColor: '#FB923C',
    inactiveColor: '#F97316',
    actionBackground: '#F97316',
    actionIcon: '#000000',
  },

  status: {
    success: '#10B981',
    warning: '#F97316',
    error: '#EF4444',
    info: '#FB923C',
  },

  categories: {
    AI: '#F97316',
    News: '#FB923C',
    Tools: '#EA580C',
    Market: '#C2410C',
    Research: '#F97316',
    Tutorial: '#FB923C',
    Other: '#7C2D12',
  },
};

// ─── Midnight Theme ─────────────────────────────────────────────────────────

export const midnightTheme: ThemeTokens = {
  name: 'midnight',
  label: 'MIDNIGHT PURPLE',

  background: '#0F0A1A',
  surface: '#1A1028',
  surfaceElevated: '#251538',

  border: '#A855F7',
  borderMuted: '#4C1D95',

  textPrimary: '#FFFFFF',
  textSecondary: '#C084FC',
  textMuted: '#A855F7',

  accent: '#A855F7',
  accentContrast: '#FFFFFF',

  shadow: 'rgba(168,85,247,0.4)',
  shadowMuted: 'rgba(168,85,247,0.1)',
  shadowOffset: { width: 0, height: 2 },

  fontDisplay: 'SpaceGrotesk',
  fontMono: 'JetBrainsMono',

  drawer: {
    background: '#0F0A1A',
    border: '#A855F7',
    textPrimary: '#FFFFFF',
    textSecondary: '#C084FC',
    activeIndicator: '#A855F7',
    overlay: 'rgba(15,10,26,0.8)',
  },

  pill: {
    background: '#1A1028',
    border: '#A855F7',
    shadow: 'rgba(168,85,247,0.3)',
    activeColor: '#C084FC',
    inactiveColor: '#A855F7',
    actionBackground: '#A855F7',
    actionIcon: '#FFFFFF',
  },

  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#A855F7',
  },

  categories: {
    AI: '#A855F7',
    News: '#C084FC',
    Tools: '#9333EA',
    Market: '#7C3AED',
    Research: '#A855F7',
    Tutorial: '#C084FC',
    Other: '#4C1D95',
  },
};

// ─── Theme registry ─────────────────────────────────────────────────────────

export const themes: Record<ThemeName, ThemeTokens> = {
  void: voidTheme,
  nova: novaTheme,
  amber: amberTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  midnight: midnightTheme,
};

export const themeNames: ThemeName[] = ['void', 'nova', 'amber', 'ocean', 'forest', 'sunset', 'midnight'];

export const getNextTheme = (current: ThemeName): ThemeName => {
  const idx = themeNames.indexOf(current);
  return themeNames[(idx + 1) % themeNames.length];
};

// ─── Spacing & Layout constants ─────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  none: 0,     // Brutalist default (Stitch uses border-radius: 0)
  sm: 4,
  md: 8,
  pill: 999,   // For floating pill nav
} as const;

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    textTransform: 'uppercase' as const,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  mono: {
    fontSize: 10,
    fontWeight: '400' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;
