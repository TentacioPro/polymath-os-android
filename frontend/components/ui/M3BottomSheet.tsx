import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { m3Radii, m3Motion } from '../../../shared/design-tokens';

interface M3BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  /** Snap heights as fractions of screen height (0-1) */
  snapPoints?: number[];
  children: React.ReactNode;
}

export default function M3BottomSheet({
  visible,
  onDismiss,
  snapPoints = [0.5, 0.9],
  children,
}: M3BottomSheetProps) {
  const { theme } = useTheme();
  const { height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(screenH);
  const scrimOpacity = useSharedValue(0);
  const contextY = useSharedValue(0);

  const maxSheetH = screenH * Math.max(...snapPoints);
  const defaultSnap = snapPoints[0] ?? 0.5;

  useEffect(() => {
    if (visible) {
      const target = screenH - screenH * defaultSnap;
      translateY.value = withSpring(target, m3Motion.spring.snappy);
      scrimOpacity.value = withTiming(0.6, { duration: 200 });
    } else {
      translateY.value = withSpring(screenH, m3Motion.spring.gentle);
      scrimOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, screenH, translateY, scrimOpacity, defaultSnap]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newY = contextY.value + event.translationY;
      translateY.value = Math.max(newY, screenH - maxSheetH);
    })
    .onEnd((event) => {
      // If swiped down fast or past midpoint, dismiss
      if (event.velocityY > 500 || translateY.value > screenH * 0.7) {
        translateY.value = withSpring(screenH, m3Motion.spring.gentle);
        scrimOpacity.value = withTiming(0, { duration: 150 });
        runOnJS(onDismiss)();
      } else {
        // Snap to closest snap point
        const currentFrac = 1 - translateY.value / screenH;
        const closest = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - currentFrac) < Math.abs(prev - currentFrac) ? curr : prev,
        );
        translateY.value = withSpring(screenH - screenH * closest, m3Motion.spring.snappy);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[styles.scrim, { backgroundColor: theme.surfaceDim }, scrimStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: 'transparent',
              height: maxSheetH,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.outlineVariant,
            },
            sheetStyle,
          ]}
        >
          <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceContainerHighest, opacity: 0.9 }]} />
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: theme.onSurfaceVariant }]} />
          </View>
          <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) }]}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: m3Radii.xl,
    borderTopRightRadius: m3Radii.xl,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
