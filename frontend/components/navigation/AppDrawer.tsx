import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, spacing, sw, fs } from '../../theme';
import { useStore } from '../../store/useStore';
import { router } from 'expo-router';
import { hapticDrawer, hapticPress, hapticSelection } from '../../utils/haptics';

const DRAWER_WIDTH_RATIO = 0.78;
const MAX_DRAWER_WIDTH = 300;

// Map routes to screen visibility keys
const ROUTE_TO_SCREEN: Record<string, string> = {
  '/(tabs)': 'dashboard',
  '/(tabs)/knowledge': 'knowledge',
  '/(tabs)/mesh': 'mesh',
  '/journal': 'journal',
  '/chat': 'chat',
  '/analytics': 'analytics',
  '/alerts': 'alerts',
};

interface DrawerLink {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

const NAV_LINKS: DrawerLink[] = [
  { label: 'Dashboard', icon: 'home', route: '/(tabs)' },
  { label: 'Knowledge', icon: 'folder-open', route: '/(tabs)/knowledge' },
  { label: 'Neural Mesh', icon: 'hub', route: '/(tabs)/mesh' },
  { label: 'Journal', icon: 'edit-note', route: '/journal' },
  { label: 'Chat', icon: 'chat-bubble-outline', route: '/chat' },
];

const TOOL_LINKS: DrawerLink[] = [
  { label: 'Search', icon: 'search', route: '/search' },
  { label: 'Analytics', icon: 'bar-chart', route: '/analytics' },
  { label: 'Export', icon: 'file-download', route: '/export' },
  { label: 'Settings', icon: 'settings', route: '/profile' },
];

/**
 * Full-screen slide-in drawer — mobile-first, clean, no harsh borders.
 */
export default function AppDrawer() {
  const { theme, cycleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const drawerOpen = useStore((s) => s.drawerOpen);
  const setDrawerOpen = useStore((s) => s.setDrawerOpen);
  const activities = useStore((s) => s.activities);
  const connections = useStore((s) => s.connections);
  const preferences = useStore((s) => s.preferences);

  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = Math.min(screenWidth * DRAWER_WIDTH_RATIO, MAX_DRAWER_WIDTH);

  // Filter nav links based on visibility preferences
  const filteredNavLinks = NAV_LINKS.filter((link) => {
    const screenKey = ROUTE_TO_SCREEN[link.route];
    if (!screenKey) return true;
    return preferences.visibleScreens[screenKey as keyof typeof preferences.visibleScreens];
  });

  const filteredToolLinks = TOOL_LINKS.filter((link) => {
    const screenKey = ROUTE_TO_SCREEN[link.route];
    if (!screenKey) return true;
    return preferences.visibleScreens[screenKey as keyof typeof preferences.visibleScreens];
  });

  // Sidebar position determines animation direction
  const isRightSide = preferences.sidebarPosition === 'right';

  // Animations
  const slideAnim = useRef(new Animated.Value(isRightSide ? drawerWidth : -drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hiddenValue = isRightSide ? drawerWidth : -drawerWidth;
    if (drawerOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 180,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: hiddenValue,
          useNativeDriver: true,
          damping: 22,
          stiffness: 180,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [drawerOpen, isRightSide]);

  // Hidden sidebar = no drawer at all
  if (preferences.sidebarPosition === 'hidden') return null;
  if (!drawerOpen) return null;

  const close = () => {
    hapticDrawer();
    setDrawerOpen(false);
  };

  const navigate = (route: string) => {
    hapticPress();
    close();
    setTimeout(() => router.push(route as any), 120);
  };

  const bg = '#0A0A0A';
  const textPrimary = '#FFFFFF';
  const textSecondary = '#888888';
  const accent = theme.accent;
  const surfaceMuted = '#161616';

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
          onPress={close}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          isRightSide ? styles.drawerRight : styles.drawerLeft,
          {
            width: drawerWidth,
            backgroundColor: bg,
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoBox, { backgroundColor: accent }]}>
              <MaterialIcons name="auto-awesome" size={18} color="#000" />
            </View>
            <View>
              <Text style={[styles.brandText, { color: textPrimary }]}>PolymathOS</Text>
              <Text style={[styles.brandSub, { color: textSecondary }]}>
                {activities.length} items · {connections.length} links
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={close}
            style={[styles.closeBtn, { backgroundColor: surfaceMuted }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={20} color={textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <ScrollView
          style={styles.navScroll}
          contentContainerStyle={styles.navContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Nav */}
          <View style={styles.navSection}>
            {filteredNavLinks.map((link, i) => (
              <TouchableOpacity
                key={link.route}
                style={[styles.navItem, { backgroundColor: surfaceMuted }]}
                onPress={() => navigate(link.route)}
                activeOpacity={0.7}
              >
                <MaterialIcons name={link.icon} size={20} color={textSecondary} />
                <Text style={[styles.navLabel, { color: textPrimary }]}>{link.label}</Text>
                <MaterialIcons name="chevron-right" size={18} color={textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Tools Section */}
          <Text style={[styles.sectionTitle, { color: textSecondary }]}>TOOLS</Text>
          <View style={styles.navSection}>
            {filteredToolLinks.map((link) => (
              <TouchableOpacity
                key={link.route}
                style={[styles.navItem, { backgroundColor: surfaceMuted }]}
                onPress={() => navigate(link.route)}
                activeOpacity={0.7}
              >
                <MaterialIcons name={link.icon} size={20} color={textSecondary} />
                <Text style={[styles.navLabel, { color: textPrimary }]}>{link.label}</Text>
                <MaterialIcons name="chevron-right" size={18} color={textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer — Theme Toggle */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: surfaceMuted }]}
            onPress={() => {
              hapticSelection();
              cycleTheme();
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="palette" size={20} color={accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.themeBtnLabel, { color: textPrimary }]}>Theme</Text>
              <Text style={[styles.themeBtnValue, { color: accent }]}>{theme.label}</Text>
            </View>
            <MaterialIcons name="sync" size={18} color={textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 24 },
    }),
  },
  drawerLeft: {
    left: 0,
  },
  drawerRight: {
    right: 0,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBox: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: fs(15),
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: fs(11),
    marginTop: 1,
  },
  closeBtn: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Navigation */
  navScroll: {
    flex: 1,
  },
  navContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  navSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  navLabel: {
    flex: 1,
    fontSize: fs(14),
    fontWeight: '500',
  },

  /* Footer */
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  themeBtnLabel: {
    fontSize: fs(13),
    fontWeight: '600',
  },
  themeBtnValue: {
    fontSize: fs(10),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
