import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';

interface M3SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const TRACK_W = 52;
const TRACK_H = 32;
const THUMB_OFF = 24;
const THUMB_ON = 28;
const TRAVEL = TRACK_W - THUMB_ON - 4;

export default function M3Switch({ value, onValueChange, disabled }: M3SwitchProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 18, stiffness: 300 });
  }, [value, progress]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.selectionAsync();
    onValueChange(!value);
  }, [value, onValueChange, disabled]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.surfaceContainerHigh, theme.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1], [THUMB_OFF, THUMB_ON]);
    const translateX = interpolate(progress.value, [0, 1], [2, TRAVEL + 2]);
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      transform: [{ translateX }],
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [theme.outline, theme.onPrimary],
      ),
    };
  });

  return (
    <Pressable onPress={handlePress} style={{ opacity: disabled ? 0.5 : 1 }}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          {value && (
            <Ionicons name="checkmark" size={16} color={theme.primary} />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
