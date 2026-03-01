import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import QuickCapture from './QuickCapture';
import { hapticPress } from '../../utils/haptics';

const PILL_MAX_WIDTH = 300;
const PILL_BOTTOM_OFFSET = 24;

interface FloatingPillProps {
  state: any;
  descriptors: any;
  navigation: any;
}

/**
 * Quick Capture floating pill bar.
 * Single centered capture button - tapping opens QuickCapture modal.
 * Always black bg, theme-aware border & shadow.
 * Visibility controlled by preferences.showQuickCaptureOnHome
 */
export default function FloatingPill({ state, descriptors, navigation }: FloatingPillProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const [captureVisible, setCaptureVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const showOnHome = useStore((s) => s.preferences.showQuickCaptureOnHome);
  const hasHydrated = useStore((s) => s._hasHydrated);
  
  // Fade-in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const pillWidth = Math.min(screenWidth * 0.85, PILL_MAX_WIDTH);
  const bottomOffset = PILL_BOTTOM_OFFSET + insets.bottom;

  // Delay appearance until app is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCapture = () => {
    hapticPress();
    setCaptureVisible(true);
  };

  // If disabled in preferences or not ready, don't render
  if (!showOnHome || !isReady) return null;

  return (
    <>
      <QuickCapture
        visible={captureVisible}
        onClose={() => setCaptureVisible(false)}
      />
      {!captureVisible && (
        <Animated.View
          style={[
            styles.wrapper,
            { bottom: bottomOffset, opacity: fadeAnim },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={handleCapture}
            activeOpacity={0.85}
            style={[
              styles.pill,
              {
                width: pillWidth,
                backgroundColor: theme.pill.background,
                borderColor: theme.pill.border,
                shadowColor: theme.pill.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 8,
              },
            ]}
          >
            <MaterialIcons
              name="add"
              size={20}
              color={theme.pill.activeColor}
            />
            <Text
              style={[
                styles.captureText,
                { color: theme.pill.activeColor },
              ]}
            >
              QUICK CAPTURE
            </Text>
            <MaterialIcons
              name="edit"
              size={18}
              color={theme.pill.inactiveColor}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    ...Platform.select({
      web: { pointerEvents: 'box-none' as any },
    }),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  captureText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'SpaceGrotesk',
  },
});
