import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme, useArchitectShadow } from '../../theme';
import { hapticPress } from '../../utils/haptics';

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
    ? theme.primary
    : 'transparent';
  const textColor = isPrimary
    ? theme.onPrimary
    : theme.onSurface;
  const borderColor = isOutline
    ? theme.outlineVariant
    : isPrimary
      ? 'transparent'
      : 'transparent';

  const handlePress = () => {
    hapticPress();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: isOutline ? 1 : 0,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
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
