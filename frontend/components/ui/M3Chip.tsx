import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Typography, m3Radii, m3TouchTarget, m3Motion } from '../../../shared/design-tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

interface M3ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  color?: string;
  variant?: 'filter' | 'suggestion' | 'input';
  /** Disabled — 0.5 opacity, no interaction */
  disabled?: boolean;
  /** Loading — shows spinner instead of icon */
  loading?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function M3Chip({
  label,
  selected = false,
  onPress,
  icon,
  color,
  variant = 'filter',
  disabled = false,
  loading = false,
  style,
}: M3ChipProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  // Pressed scale animation
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      scale.value = withTiming(0.95, { duration: m3Motion.duration.short1 });
    }
  }, [disabled, loading, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1.0, { duration: m3Motion.duration.short2 });
  }, [scale]);

  const bg = selected ? theme.primaryContainer : theme.surfaceContainerHigh;
  const textColor = selected ? theme.onPrimaryContainer : theme.onSurfaceVariant;
  const tintColor = color || textColor;

  // Focus ring border
  const borderWidth = focused ? 2 : 0;
  const borderColor = focused ? theme.primary : 'transparent';

  if (!onPress) {
    // Static chip (no interaction)
    return (
      <View style={[styles.chip, { backgroundColor: bg }, style]}>
        {icon && <Ionicons name={icon as any} size={16} color={tintColor} />}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled || loading}
        hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
        style={[
          styles.chip,
          {
            backgroundColor: bg,
            borderWidth,
            borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
      >
        {/* Loading spinner */}
        {loading && <ActivityIndicator size="small" color={tintColor} style={styles.icon} />}

        {/* Checkmark for selected filter chips */}
        {!loading && selected && variant === 'filter' && (
          <Ionicons name="checkmark" size={16} color={textColor} style={styles.icon} />
        )}

        {/* Icon for unselected chips */}
        {!loading && !selected && icon && (
          <Ionicons name={icon as any} size={16} color={tintColor} style={styles.icon} />
        )}

        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: m3Radii.full,
    minWidth: m3TouchTarget.min,
  },
  label: {
    fontSize: m3Typography.labelMedium.fontSize,
    lineHeight: m3Typography.labelMedium.lineHeight,
    fontWeight: '500',
  },
  icon: {
    marginRight: 4,
  },
});
