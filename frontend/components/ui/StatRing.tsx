import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';
import { m3Typography, m3Radii, m3Motion } from '../../../shared/design-tokens';

interface StatRingProps {
  value: number;
  total?: number;
  label: string;
  size?: number;
  onPress?: () => void;
}

export default function StatRing({
  value,
  total = 100,
  label,
  size = 80,
  onPress,
}: StatRingProps) {
  const { theme } = useTheme();
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(total, 1), 1);
  const dashOffset = circumference * (1 - progress);

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!onPress) {
    return (
      <View style={styles.container}>
        <View style={[styles.ringWrapper, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.surfaceContainerHigh} strokeWidth={strokeWidth} fill="none" />
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.primary} strokeWidth={strokeWidth} fill="none"
              strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round"
              rotation={-90} origin={`${size / 2}, ${size / 2}`} />
          </Svg>
          <View style={styles.centerLabel}>
            <Text style={[styles.value, { color: theme.onSurface }]}>{value}</Text>
          </View>
        </View>
        <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.95, { duration: m3Motion.duration.short2 }); }}
      onPressOut={() => { scale.value = withTiming(1.0, { duration: m3Motion.duration.short3 }); }}
    >
      <Animated.View style={[styles.container, animStyle]}>
        <View style={[styles.ringWrapper, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.surfaceContainerHigh} strokeWidth={strokeWidth} fill="none" />
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.primary} strokeWidth={strokeWidth} fill="none"
              strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round"
              rotation={-90} origin={`${size / 2}, ${size / 2}`} />
          </Svg>
          <View style={styles.centerLabel}>
            <Text style={[styles.value, { color: theme.onSurface }]}>{value}</Text>
          </View>
        </View>
        <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '700',
  },
  label: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
