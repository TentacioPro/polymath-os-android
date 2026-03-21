import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme, typography } from '../../theme';
import { useStore } from '../../store/useStore';
import { resolveFonts, resolveMonoFont } from '../../../shared/design-tokens';
import type { FontFamilyPref, MonoFontPref } from '../../../shared/design-tokens';

interface ThemedTextProps extends TextProps {
  variant?: 'display' | 'heading' | 'body' | 'caption' | 'mono'
    | 'displayLarge' | 'displayMedium' | 'displaySmall'
    | 'headlineLarge' | 'headlineMedium' | 'headlineSmall'
    | 'titleLarge' | 'titleMedium' | 'titleSmall'
    | 'bodyLarge' | 'bodyMedium' | 'bodySmall'
    | 'labelLarge' | 'labelMedium' | 'labelSmall';
  color?: 'primary' | 'secondary' | 'muted' | 'accent'
    | 'onSurface' | 'onSurfaceVariant' | 'onPrimary' | 'onPrimaryContainer';
}

/**
 * Themed text component with M3 typography scale.
 * Supports both legacy variants (display, heading, body, caption, mono)
 * and full M3 type scale (displayLarge, headlineSmall, bodyMedium, etc.)
 */
export default function ThemedText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();
  const fontFamily = useStore((s) => s.preferences.fontFamily) as FontFamilyPref;
  const monoFont = useStore((s) => s.preferences.monoFont) as MonoFontPref;
  const fontScale = useStore((s) => s.preferences.fontScale);

  const resolved = resolveFonts(fontFamily);
  const resolvedMono = resolveMonoFont(monoFont);

  const colorMap: Record<string, string> = {
    primary: theme.onSurface,
    onSurface: theme.onSurface,
    secondary: theme.onSurfaceVariant,
    onSurfaceVariant: theme.onSurfaceVariant,
    muted: theme.onSurfaceVariant,
    accent: theme.primary,
    onPrimary: theme.onPrimary,
    onPrimaryContainer: theme.onPrimaryContainer,
  };

  const fontFamilyMap: Record<string, string | undefined> = {
    display: resolved.bold,
    displayLarge: resolved.bold,
    displayMedium: resolved.bold,
    displaySmall: resolved.bold,
    heading: resolved.medium,
    headlineLarge: resolved.medium,
    headlineMedium: resolved.medium,
    headlineSmall: resolved.medium,
    titleLarge: resolved.medium,
    titleMedium: resolved.medium,
    titleSmall: resolved.medium,
    body: resolved.regular,
    bodyLarge: resolved.regular,
    bodyMedium: resolved.regular,
    bodySmall: resolved.regular,
    caption: resolved.regular,
    labelLarge: resolved.medium,
    labelMedium: resolved.medium,
    labelSmall: resolved.medium,
    mono: resolvedMono.regular,
  };

  const baseStyle = typography[variant as keyof typeof typography] || typography.body;
  const scaledFontSize = (baseStyle.fontSize || 14) * (fontScale || 1);
  const scaledLineHeight = (baseStyle.lineHeight || 20) * (fontScale || 1);

  const variantStyle: TextStyle = {
    ...baseStyle,
    fontSize: scaledFontSize,
    lineHeight: scaledLineHeight,
    color: colorMap[color] || theme.onSurface,
    fontFamily: fontFamilyMap[variant],
  };

  return <Text style={[variantStyle, style]} {...rest} />;
}
