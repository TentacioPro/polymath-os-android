import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Typography } from '../../../shared/design-tokens';

type AIState = 'processing' | 'result' | 'error';

interface AIProgressProps {
  state?: AIState;
  steps?: string[];
  currentStep?: number;
  resultCount?: number;
  resultSummary?: string;
  errorMessage?: string;
  onView?: () => void;
  onRetry?: () => void;
  elapsedMs?: number;
}

export function AIProgress({
  state = 'processing',
  steps = ['Analyzing content...', 'Finding patterns...', 'Building connections...'],
  currentStep = 0,
  resultCount,
  resultSummary,
  errorMessage,
  onView,
  onRetry,
  elapsedMs = 0,
}: AIProgressProps) {
  const { theme } = useTheme();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (state === 'processing') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      );
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      progressWidth.value = withTiming(
        ((currentStep + 1) / steps.length) * 100,
        { duration: 400 },
      );
    }
  }, [state, currentStep, steps.length]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: pulse.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const formatElapsed = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    return `${secs}s`;
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
      {state === 'processing' && (
        <>
          <View style={styles.headerRow}>
            <Animated.View style={iconStyle}>
              <Ionicons name="sparkles" size={28} color={theme.primary} />
            </Animated.View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.onSurface }]}>
                AI Processing
              </Text>
              <Text style={[styles.elapsed, { color: theme.onSurfaceVariant }]}>
                {formatElapsed(elapsedMs)}
              </Text>
            </View>
          </View>

          {/* Step text */}
          <Animated.Text
            key={currentStep}
            entering={FadeIn.duration(300)}
            style={[styles.stepText, { color: theme.onSurfaceVariant }]}
          >
            {steps[currentStep] || steps[0]}
          </Animated.Text>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceContainerHigh }]}>
            <Animated.View
              style={[styles.progressFill, { backgroundColor: theme.primary }, barStyle]}
            />
          </View>

          {/* Step dots */}
          <View style={styles.dots}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i <= currentStep ? theme.primary : theme.surfaceContainerHigh,
                  },
                ]}
              />
            ))}
          </View>
        </>
      )}

      {state === 'result' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.resultContent}>
          <View style={[styles.resultBadge, { backgroundColor: theme.primaryContainer }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
            <Text style={[styles.resultCount, { color: theme.onPrimaryContainer }]}>
              Generated {resultCount} connection{resultCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {resultSummary && (
            <Text style={[styles.resultSummary, { color: theme.onSurfaceVariant }]}>
              {resultSummary}
            </Text>
          )}
          {onView && (
            <Animated.View entering={FadeIn.delay(200).duration(200)}>
              <Text
                style={[styles.viewLink, { color: theme.primary }]}
                onPress={onView}
              >
                View
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {state === 'error' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.errorContent}>
          <Ionicons name="alert-circle" size={28} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {errorMessage || 'Something went wrong'}
          </Text>
          {onRetry && (
            <Text
              style={[styles.retryLink, { color: theme.primary }]}
              onPress={onRetry}
            >
              Retry
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  elapsed: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
  stepText: {
    fontSize: m3Typography.bodyMedium.fontSize,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  resultContent: {
    gap: 12,
    alignItems: 'center',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  resultCount: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  resultSummary: {
    fontSize: m3Typography.bodyMedium.fontSize,
    textAlign: 'center',
  },
  viewLink: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  errorContent: {
    gap: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  errorText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    textAlign: 'center',
  },
  retryLink: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
});
