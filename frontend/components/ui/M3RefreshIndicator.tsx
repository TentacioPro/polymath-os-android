import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface M3RefreshIndicatorProps {
  refreshing: boolean;
  pullProgress?: number; // 0 to 1+ as user pulls
  size?: number;
}

export function M3RefreshIndicator({
  refreshing,
  pullProgress = 0,
  size = 40,
}: M3RefreshIndicatorProps) {
  const { theme } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (refreshing) {
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      scale.value = withSpring(0, { damping: 15, stiffness: 100 });
      rotation.value = 0;
    }
  }, [refreshing]);

  const containerStyle = useAnimatedStyle(() => {
    const s = refreshing ? scale.value : interpolate(pullProgress, [0, 0.5, 1], [0, 0.6, 1]);
    return {
      transform: [
        { scale: s },
        { rotate: refreshing ? `${rotation.value}deg` : `${pullProgress * 360}deg` },
      ],
      opacity: refreshing ? 1 : interpolate(pullProgress, [0, 0.3, 1], [0, 0.5, 1]),
    };
  });

  const dashOffset = refreshing
    ? circumference * 0.7
    : circumference * (1 - Math.min(pullProgress, 1) * 0.7);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.inner, containerStyle]}>
        <View
          style={[
            styles.bgCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.surfaceContainer,
            },
          ]}
        />
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.surfaceContainerHigh}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle: {
    position: 'absolute',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});
