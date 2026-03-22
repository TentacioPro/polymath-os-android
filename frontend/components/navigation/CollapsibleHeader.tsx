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
import { m3Typography, m3TouchTarget } from '../../../shared/design-tokens';

const HEADER_MAX = 56;
const HEADER_MIN = 56;
const SCROLL_RANGE = 1;

interface CollapsibleHeaderProps {
  /** Shared scroll Y value from the tab content */
  scrollY: SharedValue<number>;
  /** Screen title shown in header */
  title?: string;
  /** Number for notification badge */
  notificationCount?: number;
  /** Callback when hamburger button is pressed */
  onHamburgerPress?: () => void;
}

export default function CollapsibleHeader({
  scrollY,
  title = 'Polymath',
  notificationCount = 0,
  onHamburgerPress,
}: CollapsibleHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [HEADER_MAX, HEADER_MIN],
      Extrapolation.CLAMP,
    );
    return { height: height + insets.top, paddingTop: insets.top };
  });

  const titleStyle = useAnimatedStyle(() => {
    return { opacity: 1 };
  });

  return (
    <Animated.View style={[styles.header, { backgroundColor: theme.surface }, headerStyle]}>
      <View style={styles.content}>
        {/* Left: Hamburger + Greeting/Title */}
        <View style={styles.leftRow}>
          {onHamburgerPress && (
            <Pressable
              onPress={onHamburgerPress}
              style={[styles.iconBtn, { backgroundColor: theme.surfaceContainer }]}
              accessibilityLabel="Open navigation menu"
              accessibilityRole="button"
            >
              <Ionicons name="menu" size={20} color={theme.onSurface} />
            </Pressable>
          )}
          <View style={styles.leftSection}>
            <Animated.View style={[styles.titleWrap, titleStyle]}>
              <Text style={[styles.title, { color: theme.onSurface }]}>
                {title}
              </Text>
            </Animated.View>
          </View>
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



export { HEADER_MAX, HEADER_MIN, SCROLL_RANGE };

const styles = StyleSheet.create({
  header: {
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
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  title: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '500',
    letterSpacing: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
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
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
  },
});
