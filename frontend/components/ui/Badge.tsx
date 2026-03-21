import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'filled' | 'status';
  color?: string;
}

/**
 * Status / type badge. Maps to Stitch's mono uppercase labels.
 * - default: border + themed text
 * - filled: solid bg (accent) + contrast text  
 * - status: uses provided color as bg
 */
export default function Badge({ label, variant = 'default', color }: BadgeProps) {
  const { theme } = useTheme();

  const isFilled = variant === 'filled';
  const isStatus = variant === 'status';

  const backgroundColor = isFilled
    ? theme.primary
    : isStatus
      ? (color || theme.primary)
      : 'transparent';

  const textColor = isFilled || isStatus
    ? theme.onPrimary
    : theme.onSurface;

  const borderColor = isFilled || isStatus
    ? 'transparent'
    : theme.outlineVariant;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor, borderColor, borderWidth: 1 },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color, fontFamily: theme.fontMono },
          (isFilled || isStatus) && { color: textColor },
          !isFilled && !isStatus && { color: theme.onSurface },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
