import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, m3Elevation } from '../../theme';
import { m3Radii } from '../../../shared/design-tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional label for extended FAB */
  label?: string;
  /** Callback on press */
  onPress: () => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Position style override */
  style?: any;
}

const SIZE_MAP = {
  small: 40,
  medium: 56,
  large: 96,
} as const;

const ICON_SIZE_MAP = {
  small: 20,
  medium: 24,
  large: 36,
} as const;

export default function FAB({
  icon = 'add',
  label,
  onPress,
  size = 'medium',
  style,
}: FABProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dim = SIZE_MAP[size];
  const iconSize = ICON_SIZE_MAP[size];
  const isExtended = !!label;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {
          width: isExtended ? undefined : dim,
          height: dim,
          minWidth: isExtended ? dim + 40 : dim,
          borderRadius: isExtended ? m3Radii.lg : m3Radii.full,
          backgroundColor: theme.primary,
          ...m3Elevation.level3,
          shadowColor: theme.primary,
        },
        animatedStyle,
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={theme.onPrimary} />
      {isExtended && (
        <Text style={[styles.label, { color: theme.onPrimary }]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
