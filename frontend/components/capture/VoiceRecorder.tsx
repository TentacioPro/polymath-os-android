import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { m3Typography, m3TouchTarget } from '../../../shared/design-tokens';

type RecordingState = 'idle' | 'recording' | 'paused' | 'review';

interface VoiceRecorderProps {
  onSend?: (uri: string, durationMs: number) => void;
  onDiscard?: () => void;
  onClose?: () => void;
}

export function VoiceRecorder({ onSend, onDiscard, onClose }: VoiceRecorderProps) {
  const { theme } = useTheme();
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0.1));
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pulseAnim = useSharedValue(1);
  const recordingUri = useRef<string | null>(null);

  useEffect(() => {
    if (state === 'recording') {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 100);
        setWaveformData((prev) => {
          const next = [...prev.slice(1)];
          next.push(0.15 + Math.random() * 0.85);
          return next;
        });
      }, 100);
    } else {
      pulseAnim.value = withTiming(1, { duration: 300 });
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value > 1 ? 0.7 : 1,
  }));

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const handleRecord = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState('recording');
    setElapsed(0);
    setWaveformData(new Array(32).fill(0.1));
  }, []);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('paused');
  }, []);

  const handleResume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('recording');
  }, []);

  const handleStop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('review');
  }, []);

  const handleSend = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSend?.(recordingUri.current || '', elapsed);
  }, [elapsed, onSend]);

  const handleDiscard = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('idle');
    setElapsed(0);
    setWaveformData(new Array(32).fill(0.1));
    onDiscard?.();
  }, [onDiscard]);

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceContainer, borderRadius: 28 }]}>
      {/* Waveform visualization */}
      <View style={styles.waveformContainer}>
        {waveformData.map((amp, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: Math.max(4, amp * 48),
                backgroundColor:
                  state === 'review' ? theme.onSurfaceVariant : theme.primary,
                opacity: state === 'idle' ? 0.2 : state === 'review' ? 0.5 : 1,
              },
            ]}
          />
        ))}
      </View>

      {/* Timer + Status */}
      <View style={styles.statusRow}>
        {state === 'recording' && (
          <Animated.View
            style={[
              styles.recordDot,
              { backgroundColor: theme.error },
              dotStyle,
            ]}
          />
        )}
        {state === 'paused' && (
          <View style={[styles.recordDot, { backgroundColor: theme.warning }]} />
        )}
        <Text style={[styles.timer, { color: theme.onSurface }]}>
          {formatTime(elapsed)}
        </Text>
        {state !== 'idle' && (
          <Text style={[styles.sizeLabel, { color: theme.onSurfaceVariant }]}>
            {state === 'recording' ? 'Recording...' : state === 'paused' ? 'Paused' : 'Review'}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {state === 'idle' && (
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primaryContainer, opacity: pressed ? 0.8 : 1 }]}
            onPress={handleRecord}
          >
            <Ionicons name="mic" size={28} color={theme.onPrimaryContainer} />
            <Text style={[styles.btnLabel, { color: theme.onPrimaryContainer }]}>
              Tap to record
            </Text>
          </Pressable>
        )}

        {state === 'recording' && (
          <>
            <Pressable
              style={({ pressed }) => [styles.circleBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
              onPress={handlePause}
            >
              <Ionicons name="pause" size={24} color={theme.onSurface} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.circleBtn, { backgroundColor: theme.errorContainer, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleStop}
            >
              <Ionicons name="stop" size={24} color={theme.error} />
            </Pressable>
          </>
        )}

        {state === 'paused' && (
          <>
            <Pressable
              style={({ pressed }) => [styles.circleBtn, { backgroundColor: theme.primaryContainer, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleResume}
            >
              <Ionicons name="play" size={24} color={theme.onPrimaryContainer} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.circleBtn, { backgroundColor: theme.errorContainer, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleStop}
            >
              <Ionicons name="stop" size={24} color={theme.error} />
            </Pressable>
          </>
        )}

        {state === 'review' && (
          <>
            <Pressable
              style={({ pressed }) => [styles.circleBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleDiscard}
            >
              <Ionicons name="trash-outline" size={22} color={theme.onSurfaceVariant} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.sendBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleSend}
            >
              <Text style={[styles.sendLabel, { color: theme.onPrimary }]}>Send</Text>
              <Ionicons name="send" size={18} color={theme.onPrimary} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timer: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  sizeLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  btnLabel: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  circleBtn: {
    width: m3TouchTarget.comfortable,
    height: m3TouchTarget.comfortable,
    borderRadius: m3TouchTarget.comfortable / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  sendLabel: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
});
