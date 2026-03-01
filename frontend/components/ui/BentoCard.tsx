import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme, useArchitectShadow, spacing as sp } from '../../theme';

interface BentoCardProps extends ViewProps {
  /** Use elevated surface color instead of default */
  elevated?: boolean;
  /** Show architect shadow (brutalist offset) */
  shadow?: boolean;
  /** Invert colors (accent bg, contrast text) */
  inverted?: boolean;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Brutalist card with sharp borders and optional architect shadow.
 * Maps to Stitch `.bento-card` class.
 */
export default function BentoCard({
  elevated,
  shadow = false,
  inverted,
  padding = 'md',
  style,
  children,
  ...rest
}: BentoCardProps) {
  const { theme } = useTheme();
  const architectShadow = useArchitectShadow();

  const paddingMap = {
    none: 0,
    sm: sp.sm,
    md: sp.lg,
    lg: sp.xl,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: inverted
            ? theme.accent
            : elevated
              ? theme.surfaceElevated
              : theme.surface,
          borderColor: inverted ? 'transparent' : theme.borderMuted,
          padding: paddingMap[padding],
        },
        shadow && architectShadow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
