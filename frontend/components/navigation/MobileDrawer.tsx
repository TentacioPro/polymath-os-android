import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  BackHandler,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../theme';
import { m3Radii, m3Motion, m3Themes, themeLabels, m3Typography, m3TouchTarget } from '../../../shared/design-tokens';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.82;
const ANIM_DURATION = 280;

interface NavItem {
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screenKey?: string; // maps to visibleScreens key
}

const NAV_LINKS: NavItem[] = [
  { href: '/(tabs)', icon: 'home-outline', label: 'Dashboard', screenKey: 'dashboard' },
  { href: '/(tabs)/knowledge', icon: 'library-outline', label: 'Knowledge', screenKey: 'knowledge' },
  { href: '/(tabs)/mesh', icon: 'git-network-outline', label: 'Neural Mesh', screenKey: 'mesh' },
  { href: '/journal', icon: 'book-outline', label: 'Journal', screenKey: 'journal' },
  { href: '/chat', icon: 'chatbubble-outline', label: 'Chat', screenKey: 'chat' },
];

const TOOL_LINKS: NavItem[] = [
  { href: '/search', icon: 'search-outline', label: 'Search' },
  { href: '/analytics', icon: 'bar-chart-outline', label: 'Analytics', screenKey: 'analytics' },
  { href: '/agent', icon: 'hardware-chip-outline', label: 'Agent Memory' },
  { href: '/integrations', icon: 'extension-puzzle-outline', label: 'Integrations', screenKey: 'integrations' },
  { href: '/export', icon: 'download-outline', label: 'Export' },
  { href: '/customize', icon: 'options-outline', label: 'Customize' },
  { href: '/profile', icon: 'settings-outline', label: 'Settings' },
  { href: '/alerts', icon: 'notifications-outline', label: 'Alerts', screenKey: 'alerts' },
];

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ visible, onClose }: MobileDrawerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { preferences } = useStore();
  const logout = useAuthStore((s) => s.logout);

  // Filter nav items based on visibleScreens preferences
  const isScreenVisible = (item: NavItem) => {
    if (!item.screenKey) return true; // items without screenKey are always visible
    return preferences.visibleScreens[item.screenKey as keyof typeof preferences.visibleScreens] !== false;
  };

  const filteredNavLinks = NAV_LINKS.filter(isScreenVisible);
  const filteredToolLinks = TOOL_LINKS.filter(isScreenVisible);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const scrimOpacity = useSharedValue(0);

  // Animate open/close
  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: ANIM_DURATION });
      scrimOpacity.value = withTiming(0.55, { duration: ANIM_DURATION });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: ANIM_DURATION });
      scrimOpacity.value = withTiming(0, { duration: ANIM_DURATION });
    }
  }, [visible]);

  // Back button closes drawer
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, onClose]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  const handleNav = useCallback(
    (href: string) => {
      onClose();
      // Small delay to let drawer animate out
      setTimeout(() => router.push(href as any), 150);
    },
    [router, onClose],
  );

  const isActive = (href: string) => {
    if (href === '/(tabs)') return pathname === '/' || pathname === '/(tabs)';
    return pathname.includes(href.replace('/(tabs)/', '/'));
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Scrim overlay */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View
          style={[styles.scrim, scrimStyle]}
        />
      </Pressable>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: 'transparent',
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            overflow: 'hidden',
            borderRightWidth: 1,
            borderColor: theme.outlineVariant,
          },
          drawerStyle,
        ]}
      >
        <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceContainer, opacity: 0.9 }]} />
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={20} color={theme.onPrimary} />
          </View>
          <View style={styles.brandText}>
            <Text style={[styles.brandName, { color: theme.onSurface }]}>Polymath OS</Text>
            <Text style={[styles.brandSub, { color: theme.onSurfaceVariant }]}>
              Knowledge base
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: theme.surfaceContainerHigh }]}
            accessibilityLabel="Close navigation drawer"
          >
            <Ionicons name="close" size={20} color={theme.onSurface} />
          </Pressable>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.outlineVariant }]} />

        {/* Navigation */}
        <ScrollView
          style={styles.navScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.navContent}
        >
          {filteredNavLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Pressable
                key={item.href}
                onPress={() => handleNav(item.href)}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: active
                      ? theme.primaryContainer
                      : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={active ? (item.icon.replace('-outline', '') as any) : item.icon}
                  size={20}
                  color={active ? theme.onPrimaryContainer : theme.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: active ? theme.onPrimaryContainer : theme.onSurface,
                      fontWeight: active ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.onSurfaceVariant}
                  style={styles.chevron}
                />
              </Pressable>
            );
          })}

          {/* Tools section */}
          <Text style={[styles.sectionLabel, { color: theme.onSurfaceVariant }]}>
            Tools
          </Text>
          {filteredToolLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Pressable
                key={item.href}
                onPress={() => handleNav(item.href)}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: active
                      ? theme.primaryContainer
                      : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={active ? (item.icon.replace('-outline', '') as any) : item.icon}
                  size={20}
                  color={active ? theme.onPrimaryContainer : theme.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: active ? theme.onPrimaryContainer : theme.onSurface,
                      fontWeight: active ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.onSurfaceVariant}
                  style={styles.chevron}
                />
              </Pressable>
            );
          })}

          {/* Logout button at the very bottom */}
          <View style={{ marginTop: 24, marginBottom: 48 }}>
            <Pressable
              onPress={() => {
                onClose();
                setTimeout(() => logout(), 150);
              }}
              style={[
                styles.navItem,
                { backgroundColor: theme.errorContainer }
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.onError} />
              <Text style={[styles.navLabel, { color: theme.onError, fontWeight: '600' }]}>
                Log Out
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  brandIcon: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
    marginLeft: 12,
  },
  brandName: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 2,
  },
  closeBtn: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
  },
  navScroll: {
    flex: 1,
  },
  navContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 2,
  },
  navLabel: {
    flex: 1,
    fontSize: m3Typography.bodyMedium.fontSize,
    marginLeft: 12,
  },
  chevron: {
    opacity: 0.5,
  },
  sectionLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
});
