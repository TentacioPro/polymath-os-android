import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface M3ProgressProps {
  /** 0-100 for determinate, undefined for indeterminate */
  progress?: number;
  /** 'circular' or 'linear' */
  variant?: 'circular' | 'linear';
  /** Size: small=24, medium=40, large=56 */
  size?: 'small' | 'medium' | 'large';
  /** Custom color override */
  color?: string;
}

const SIZE_MAP = { small: 24, medium: 40, large: 56 } as const;
const STROKE_MAP = { small: 2.5, medium: 3.5, large: 4 } as const;

export default function M3Progress({
  progress,
  variant = 'circular',
  size = 'medium',
  color,
}: M3ProgressProps) {
  const { theme } = useTheme();
  const dim = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];
  const activeColor = color || theme.primary;
  const trackColor = theme.surfaceContainerHigh;

  if (variant === 'linear') {
    return <LinearProgress progress={progress} color={activeColor} trackColor={trackColor} />;
  }

  return (
    <CircularProgress
      dim={dim}
      stroke={stroke}
      progress={progress}
      color={activeColor}
      trackColor={trackColor}
    />
  );
}

// ─── Circular (indeterminate / determinate) ─────────────────────────────────

function CircularProgress({
  dim,
  stroke,
  progress,
  color,
  trackColor,
}: {
  dim: number;
  stroke: number;
  progress?: number;
  color: string;
  trackColor: string;
}) {
  const rotation = useSharedValue(0);
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isIndeterminate = progress === undefined;

  useEffect(() => {
    if (isIndeterminate) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1400, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [isIndeterminate, rotation]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dashOffset = isIndeterminate
    ? circumference * 0.75
    : circumference * (1 - (progress ?? 0) / 100);

  return (
    <Animated.View style={[{ width: dim, height: dim }, isIndeterminate ? containerStyle : undefined]}>
      <Svg width={dim} height={dim}>
        <Circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${dim / 2}, ${dim / 2}`}
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Linear (indeterminate / determinate) ───────────────────────────────────

function LinearProgress({
  progress,
  color,
  trackColor,
}: {
  progress?: number;
  color: string;
  trackColor: string;
}) {
  const translateX = useSharedValue(-1);
  const isIndeterminate = progress === undefined;

  useEffect(() => {
    if (isIndeterminate) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [isIndeterminate, translateX]);

  const barStyle = useAnimatedStyle(() => {
    if (!isIndeterminate) {
      return { width: `${progress ?? 0}%` as any };
    }
    const left = interpolate(translateX.value, [-1, 0, 1], [0, 0, 60]);
    const width = interpolate(translateX.value, [-1, 0, 1], [30, 60, 30]);
    return { left: `${left}%` as any, width: `${width}%` as any };
  });

  return (
    <View style={[styles.linearTrack, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.linearBar, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  linearTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  linearBar: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
  },
});
