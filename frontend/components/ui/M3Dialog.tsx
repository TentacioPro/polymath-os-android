import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { m3Radii, m3Motion } from '../../../shared/design-tokens';

export interface M3DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'text' | 'filled' | 'destructive';
}

interface M3DialogProps {
  visible: boolean;
  onDismiss: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actions?: M3DialogAction[];
}

export default function M3Dialog({
  visible,
  onDismiss,
  icon,
  title,
  body,
  actions = [],
}: M3DialogProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, m3Motion.spring.snappy);
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.85, { duration: 150 });
    }
  }, [visible, opacity, scale]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dialogStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.scrim, { backgroundColor: theme.surfaceDim }, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>
      <Animated.View
        style={[
          styles.dialog,
          {
            backgroundColor: theme.surfaceContainerHighest,
          },
          dialogStyle,
        ]}
      >
        {icon && (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={24} color={theme.primary} />
          </View>
        )}
        <Text style={[styles.title, { color: theme.onSurface }]}>{title}</Text>
        {body && (
          <Text style={[styles.body, { color: theme.onSurfaceVariant }]}>{body}</Text>
        )}
        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action, idx) => {
              const isFilled = action.variant === 'filled';
              const isDestructive = action.variant === 'destructive';
              return (
                <Pressable
                  key={idx}
                  onPress={action.onPress}
                  style={[
                    styles.actionBtn,
                    isFilled && { backgroundColor: theme.primary },
                    isDestructive && { backgroundColor: theme.errorContainer },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: isFilled ? theme.onPrimary : isDestructive ? theme.error : theme.primary },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 70,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    width: '85%',
    maxWidth: 400,
    borderRadius: m3Radii.xl,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    width: '100%',
  },
  actionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: m3Radii.full,
    minWidth: 64,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
