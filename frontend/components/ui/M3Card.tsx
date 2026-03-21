import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { m3Radii, m3Spacing } from '../../../shared/design-tokens';

type ElevationLevel = 0 | 1 | 2 | 3;

interface M3CardProps extends ViewProps {
  elevation?: ElevationLevel;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  tinted?: boolean;
}

export default function M3Card({
  elevation = 1,
  padding = 'md',
  tinted,
  style,
  children,
  ...rest
}: M3CardProps) {
  const { theme } = useTheme();

  const bgMap: Record<ElevationLevel, string> = {
    0: theme.surface,
    1: theme.surfaceContainer,
    2: theme.surfaceContainerHigh,
    3: theme.surfaceContainerHighest,
  };

  const paddingMap = {
    none: 0,
    sm: m3Spacing.sm,
    md: m3Spacing.lg,
    lg: m3Spacing.xl,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tinted ? theme.primaryContainer : bgMap[elevation],
          padding: paddingMap[padding],
        },
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
    borderRadius: m3Radii.xl,
    overflow: 'hidden',
  },
});
