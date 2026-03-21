import React, { useState, useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { hapticPress } from '../../utils/haptics';
import { m3Typography, m3Radii, m3TouchTarget, m3Motion } from '../../../shared/design-tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

type M3ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

interface M3ButtonProps {
  label: string;
  onPress: () => void;
  variant?: M3ButtonVariant;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  /** Show spinner — hides label */
  loading?: boolean;
  disabled?: boolean;
  /** Error state — errorContainer bg + alert icon */
  error?: boolean;
  /** Success state — successContainer bg + check icon */
  success?: boolean;
  style?: ViewStyle;
  compact?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function M3Button({
  label,
  onPress,
  variant = 'filled',
  icon,
  fullWidth,
  loading,
  disabled,
  error,
  success,
  style,
  compact,
}: M3ButtonProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  // Pressed scale animation (0.97 on press-in, 1.0 on release)
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: m3Motion.duration.short2 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1.0, { duration: m3Motion.duration.short3 });
  }, [scale]);

  // ─── Color resolution ────────────────────────────────────────────────────

  let bg: string;
  let textColor: string;
  let borderColor: string = 'transparent';

  if (error) {
    bg = theme.errorContainer;
    textColor = theme.onError;
  } else if (success) {
    bg = theme.successContainer;
    textColor = theme.success;
  } else {
    const colorMap: Record<M3ButtonVariant, { bg: string; text: string; border: string }> = {
      filled:   { bg: theme.primary,           text: theme.onPrimary,          border: 'transparent' },
      tonal:    { bg: theme.primaryContainer,   text: theme.onPrimaryContainer, border: 'transparent' },
      outlined: { bg: 'transparent',            text: theme.primary,            border: theme.outline  },
      text:     { bg: 'transparent',            text: theme.primary,            border: 'transparent' },
    };
    const c = colorMap[variant];
    bg = c.bg; textColor = c.text; borderColor = c.border;
  }

  // Focus ring overrides border
  const effectiveBorderColor = focused ? theme.primary : borderColor;
  const effectiveBorderWidth = focused ? 2 : variant === 'outlined' ? 1 : 0;

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={() => { hapticPress(); onPress(); }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: bg,
            borderColor: effectiveBorderColor,
            borderWidth: effectiveBorderWidth,
            width: fullWidth ? '100%' : undefined,
            opacity: disabled ? 0.5 : 1,
            paddingVertical: compact ? 8 : 16,
            paddingHorizontal: compact ? 16 : 24,
            minHeight: compact ? undefined : m3TouchTarget.min,
          },
          style,
        ]}
      >
        {/* Loading */}
        {loading && <ActivityIndicator size="small" color={textColor} />}

        {/* Error */}
        {!loading && error && (
          <>
            <Ionicons name="alert-circle" size={16} color={textColor} style={styles.stateIcon} />
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          </>
        )}

        {/* Success */}
        {!loading && !error && success && (
          <>
            <Ionicons name="checkmark-circle" size={16} color={textColor} style={styles.stateIcon} />
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          </>
        )}

        {/* Default / normal */}
        {!loading && !error && !success && (
          <>
            {icon}
            <Text style={[styles.label, { color: textColor, marginLeft: icon ? 8 : 0 }]}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: m3Radii.full,
  },
  label: {
    fontSize: m3Typography.labelLarge.fontSize,
    lineHeight: m3Typography.labelLarge.lineHeight,
    fontWeight: '600',
  },
  stateIcon: {
    marginRight: 8,
  },
  fullWidth: {
    width: '100%',
  },
});
