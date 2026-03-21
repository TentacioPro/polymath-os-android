import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Typography } from '../../../shared/design-tokens';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ScanOverlayProps {
  instruction?: string;
  onCapture: () => void;
  onFlashToggle?: () => void;
  onGallery?: () => void;
  onClose?: () => void;
  flashOn?: boolean;
  processing?: boolean;
}

export function ScanOverlay({
  instruction = 'Point at document',
  onCapture,
  onFlashToggle,
  onGallery,
  onClose,
  flashOn = false,
  processing = false,
}: ScanOverlayProps) {
  const { theme } = useTheme();
  const scanLine = useSharedValue(0);

  React.useEffect(() => {
    scanLine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 100}%` as any,
  }));

  const FRAME_SIZE = Math.min(SCREEN_W * 0.8, 320);
  const CORNER_SIZE = 32;
  const CORNER_WIDTH = 4;

  const cornerStyle = { borderColor: theme.primary };

  return (
    <View style={styles.overlay}>
      {/* Dark scrim around viewfinder */}
      <View style={styles.scrimContainer}>
        {/* Top instruction bar */}
        <View style={[styles.instructionBar, { backgroundColor: theme.surfaceDim }]}>
          <Text style={[styles.instructionText, { color: theme.inverseSurface }]}>
            {processing ? 'Analyzing...' : instruction}
          </Text>
        </View>

        {/* Close button */}
        {onClose && (
          <Pressable
            style={({ pressed }) => [styles.closeBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={theme.onSurface} />
          </Pressable>
        )}

        {/* Viewfinder frame */}
        <View style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
          {/* Corners */}
          <View style={[styles.cornerTL, cornerStyle, { borderWidth: CORNER_WIDTH, width: CORNER_SIZE, height: CORNER_SIZE }]} />
          <View style={[styles.cornerTR, cornerStyle, { borderWidth: CORNER_WIDTH, width: CORNER_SIZE, height: CORNER_SIZE }]} />
          <View style={[styles.cornerBL, cornerStyle, { borderWidth: CORNER_WIDTH, width: CORNER_SIZE, height: CORNER_SIZE }]} />
          <View style={[styles.cornerBR, cornerStyle, { borderWidth: CORNER_WIDTH, width: CORNER_SIZE, height: CORNER_SIZE }]} />

          {/* Scanning line */}
          {!processing && (
            <Animated.View
              style={[
                styles.scanLine,
                { backgroundColor: theme.primary },
                scanLineStyle,
              ]}
            />
          )}
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surfaceDim }]}>
        {/* Flash */}
        {onFlashToggle && (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]}
            onPress={onFlashToggle}
          >
            <Ionicons
              name={flashOn ? 'flash' : 'flash-off'}
              size={22}
              color={flashOn ? theme.warning : theme.onSurfaceVariant}
            />
          </Pressable>
        )}

        {/* Capture */}
        <Pressable
          style={({ pressed }) => [styles.captureOuter, { borderColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
          onPress={onCapture}
          disabled={processing}
        >
          <View style={[styles.captureInner, { backgroundColor: processing ? theme.surfaceContainerHigh : theme.onPrimary }]}>
            {processing && (
              <View style={[styles.miniSpinner, { borderColor: theme.primary, borderTopColor: 'transparent' }]} />
            )}
          </View>
        </Pressable>

        {/* Gallery */}
        {onGallery && (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]}
            onPress={onGallery}
          >
            <Ionicons name="images-outline" size={22} color={theme.onSurfaceVariant} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  scrimContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionBar: {
    position: 'absolute',
    top: 60,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    zIndex: 10,
  },
  instructionText: {
    fontSize: m3Typography.bodyLarge.fontSize,
    fontWeight: '500',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  frame: {
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 24,
    paddingBottom: 48,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    padding: 4,
  },
  captureInner: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
});
