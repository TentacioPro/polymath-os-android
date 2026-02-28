import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme, typography } from '../../theme';

interface ThemedTextProps extends TextProps {
  variant?: 'display' | 'heading' | 'body' | 'caption' | 'mono';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
}

/**
 * Themed text component with built-in typography variants.
 */
export default function ThemedText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();

  const colorMap: Record<string, string> = {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    muted: theme.textMuted,
    accent: theme.accent,
  };

  const fontFamilyMap: Record<string, string | undefined> = {
    display: theme.fontDisplay,
    heading: theme.fontDisplay,
    body: undefined,
    caption: undefined,
    mono: theme.fontMono,
  };

  const variantStyle: TextStyle = {
    ...typography[variant],
    color: colorMap[color],
    fontFamily: fontFamilyMap[variant],
  };

  return <Text style={[variantStyle, style]} {...rest} />;
}
