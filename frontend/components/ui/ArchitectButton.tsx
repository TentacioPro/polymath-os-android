import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme, useArchitectShadow } from '../../theme';

interface ArchitectButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * CTA button with brutalist architect shadow.
 * Maps to Stitch buttons with uppercase mono labels + shadow offset.
 */
export default function ArchitectButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  fullWidth,
  loading,
  disabled,
  style,
}: ArchitectButtonProps) {
  const { theme } = useTheme();
  const shadow = useArchitectShadow(variant === 'primary');

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const backgroundColor = isPrimary
    ? theme.accent
    : 'transparent';
  const textColor = isPrimary
    ? theme.accentContrast
    : theme.textPrimary;
  const borderColor = isOutline
    ? theme.border
    : isPrimary
      ? 'transparent'
      : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: isOutline ? 1 : 0,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.4 : 1,
        },
        variant !== 'ghost' && shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontFamily: theme.fontMono,
                marginLeft: icon ? 8 : 0,
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
