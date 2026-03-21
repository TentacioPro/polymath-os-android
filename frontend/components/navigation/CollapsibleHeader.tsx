import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';

const HEADER_MAX = 96;
const HEADER_MIN = 56;
const SCROLL_RANGE = HEADER_MAX - HEADER_MIN;

interface CollapsibleHeaderProps {
  /** Shared scroll Y value from the tab content */
  scrollY: SharedValue<number>;
  /** Screen title shown when collapsed */
  title?: string;
  /** Greeting text shown when expanded */
  greeting?: string;
  /** Number for notification badge */
  notificationCount?: number;
}

export default function CollapsibleHeader({
  scrollY,
  title = 'Polymath',
  greeting,
  notificationCount = 0,
}: CollapsibleHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const greetingText = greeting || getGreeting();

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [HEADER_MAX, HEADER_MIN],
      Extrapolation.CLAMP,
    );
    return { height: height + insets.top, paddingTop: insets.top };
  });

  const greetingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [0, -10],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_RANGE * 0.5, SCROLL_RANGE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <Animated.View style={[styles.header, { backgroundColor: theme.surface }, headerStyle]}>
      <View style={styles.content}>
        {/* Left: Greeting (expanded) / Title (collapsed) */}
        <View style={styles.leftSection}>
          <Animated.View style={greetingStyle}>
            <Text style={[styles.greeting, { color: theme.onSurface }]}>
              {greetingText}
            </Text>
          </Animated.View>
          <Animated.View style={[styles.titleWrap, titleStyle]}>
            <Text style={[styles.title, { color: theme.onSurface }]}>
              {title}
            </Text>
          </Animated.View>
        </View>

        {/* Right: Actions */}
        <View style={styles.rightSection}>
          <Pressable
            onPress={() => router.push('/search')}
            style={[styles.iconBtn, { backgroundColor: theme.surfaceContainer }]}
          >
            <Ionicons name="search" size={20} color={theme.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/alerts')}
            style={[styles.iconBtn, { backgroundColor: theme.surfaceContainer }]}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.onSurfaceVariant} />
            {notificationCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.error }]}>
                <Text style={[styles.badgeText, { color: theme.onError }]}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile')}
            style={[styles.avatar, { backgroundColor: theme.primaryContainer }]}
          >
            <Ionicons name="person" size={18} color={theme.onPrimaryContainer} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export { HEADER_MAX, HEADER_MIN, SCROLL_RANGE };

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
  },
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
