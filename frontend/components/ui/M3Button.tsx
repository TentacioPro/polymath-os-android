import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme';
import { hapticPress } from '../../utils/haptics';
import { m3Typography, m3Radii } from '../../../shared/design-tokens';

type M3ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

interface M3ButtonProps {
  label: string;
  onPress: () => void;
  variant?: M3ButtonVariant;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  compact?: boolean;
}

export default function M3Button({
  label,
  onPress,
  variant = 'filled',
  icon,
  fullWidth,
  loading,
  disabled,
  style,
  compact,
}: M3ButtonProps) {
  const { theme } = useTheme();

  const colorMap = {
    filled: { bg: theme.primary, text: theme.onPrimary, border: 'transparent' },
    tonal: { bg: theme.primaryContainer, text: theme.onPrimaryContainer, border: 'transparent' },
    outlined: { bg: 'transparent', text: theme.primary, border: theme.outline },
    text: { bg: 'transparent', text: theme.primary, border: 'transparent' },
  };

  const colors = colorMap[variant];

  return (
    <TouchableOpacity
      onPress={() => { hapticPress(); onPress(); }}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'outlined' ? 1 : 0,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.4 : 1,
          paddingVertical: compact ? 8 : 12,
          paddingHorizontal: compact ? 16 : 24,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { color: colors.text, marginLeft: icon ? 8 : 0 },
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
    borderRadius: m3Radii.full,
  },
  label: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
});
