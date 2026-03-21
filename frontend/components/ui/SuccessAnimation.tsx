import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { m3Typography } from '../../../shared/design-tokens';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface SuccessAnimationProps {
  visible: boolean;
  message?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
  showConfetti?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  isPrimary: boolean;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * SCREEN_W,
    y: Math.random() * SCREEN_H * 0.5,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 400,
    isPrimary: i % 2 === 0,
  }));
}

function ConfettiParticle({ particle, primary, primaryContainer }: {
  particle: Particle;
  primary: string;
  primaryContainer: string;
}) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(SCREEN_H * 0.6, { duration: 1500, easing: Easing.out(Easing.cubic) }),
    );
    opacity.value = withDelay(
      particle.delay + 800,
      withTiming(0, { duration: 700 }),
    );
    rotate.value = withDelay(
      particle.delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1500 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.isPrimary ? primary : primaryContainer,
        },
        style,
      ]}
    />
  );
}

export function SuccessAnimation({
  visible,
  message = 'Success!',
  onDismiss,
  autoDismissMs = 1500,
  showConfetti = true,
}: SuccessAnimationProps) {
  const { theme } = useTheme();
  const checkScale = useSharedValue(0);
  const bgOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const particles = React.useMemo(() => generateParticles(20), []);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bgOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withDelay(
        100,
        withSpring(1, { damping: 8, stiffness: 150 }),
      );
      textOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

      const timer = setTimeout(() => {
        bgOpacity.value = withTiming(0, { duration: 300 });
        checkScale.value = withTiming(0, { duration: 300 });
        textOpacity.value = withTiming(0, { duration: 200 });
        setTimeout(onDismiss, 300);
      }, autoDismissMs);

      return () => clearTimeout(timer);
    } else {
      checkScale.value = 0;
      bgOpacity.value = 0;
      textOpacity.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      {/* Confetti */}
      {showConfetti &&
        particles.map((p, i) => (
          <ConfettiParticle
            key={i}
            particle={p}
            primary={theme.primary}
            primaryContainer={theme.primaryContainer}
          />
        ))}

      {/* Check circle */}
      <Animated.View
        style={[
          styles.checkCircle,
          { backgroundColor: theme.primary },
          circleStyle,
        ]}
      >
        <Ionicons name="checkmark" size={48} color={theme.onPrimary} />
      </Animated.View>

      {/* Message */}
      <Animated.Text
        style={[
          styles.message,
          { color: theme.onSurface },
          textStyle,
        ]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  message: {
    marginTop: 20,
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
});
