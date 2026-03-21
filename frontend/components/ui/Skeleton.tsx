import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loading placeholder with a shimmer animation.
 * Use to indicate content is loading without a spinner.
 */
export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.outlineVariant,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Pre-composed skeleton for a card-like loading state */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[cardStyles.container, style]}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="100%" height={10} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={10} style={{ marginTop: 8 }} />
    </View>
  );
}

/** Pre-composed skeleton for a list row */
export function SkeletonRow({ style }: { style?: ViewStyle }) {
  return (
    <View style={[cardStyles.row, style]}>
      <Skeleton width={40} height={40} borderRadius={8} />
      <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
        <Skeleton width="60%" height={12} />
        <Skeleton width="90%" height={10} />
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
