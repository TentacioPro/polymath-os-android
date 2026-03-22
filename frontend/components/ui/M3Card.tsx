import React, { useCallback } from 'react';
import { Pressable, View, ViewProps, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { m3Radii, m3Spacing, m3Motion } from '../../../shared/design-tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

type ElevationLevel = 0 | 1 | 2 | 3;
type BentoSize = 'small' | 'medium' | 'large' | 'full';

interface M3CardProps extends ViewProps {
  elevation?: ElevationLevel;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  tinted?: boolean;
  bentoSize?: BentoSize;
  glass?: boolean;
  disabled?: boolean;
  /** When provided the card becomes a tappable Pressable with press animation */
  onPress?: () => void;
  /** Long press action */
  onLongPress?: () => void;
  /** Hover elevation — bg shifts up one step on hover (visual only via press state on mobile) */
  hoverElevation?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function M3Card({
  elevation = 1,
  padding = 'md',
  tinted,
  bentoSize,
  glass,
  onPress,
  onLongPress,
  disabled,
  hoverElevation = true,
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

  // Hover bg is one level higher (capped at 3)
  const hoverBgMap: Record<ElevationLevel, string> = {
    0: theme.surfaceContainer,
    1: theme.surfaceContainerHigh,
    2: theme.surfaceContainerHighest,
    3: theme.surfaceContainerHighest,
  };

  const paddingMap = {
    none: 0,
    sm: m3Spacing.sm,
    md: m3Spacing.lg,
    lg: m3Spacing.xl,
  };

  const bg = tinted ? theme.primaryContainer : bgMap[elevation];
  const pressedBg = tinted ? theme.primaryContainer : hoverBgMap[elevation];

  // Pressed scale animation
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: m3Motion.duration.short2 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1.0, { duration: m3Motion.duration.short3 });
  }, [scale]);

  const bentoFlexMap = {
    small: 1,    // 1 column equivalent
    medium: 2,   // 2 column equivalent
    large: 3,    // 3 column equivalent (full row on some screens)
    full: '100%', // Fixed full width
  };

  const cardStyle = [
    styles.card,
    { padding: paddingMap[padding] },
    bentoSize && { 
      flex: bentoSize === 'full' ? undefined : bentoFlexMap[bentoSize],
      width: bentoSize === 'full' ? ('100%' as any) : undefined
    },
    glass && styles.glassBase,
    style,
  ];

  // Static card (no onPress)
  if (!onPress) {
    return (
      <View
        style={[cardStyle, { backgroundColor: bg }]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  // Interactive / pressable card
  return (
    <Animated.View style={[animatedStyle, { opacity: disabled ? 0.6 : 1 }]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        style={({ pressed }) => [
          cardStyle,
          {
            backgroundColor: pressed && hoverElevation ? pressedBg : bg,
          },
        ]}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: m3Radii.xl,
    overflow: 'hidden',
  },
  glassBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Note: react-native doesn't support backdrop-filter out of the box. 
    // True glass requires expo-blur, but we simulate it here with semi-transparent bg and borders
    // as per Kole Jain Phase 3.4 performance optimizations.
  }
});
