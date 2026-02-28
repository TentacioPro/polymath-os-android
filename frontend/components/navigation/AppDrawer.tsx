import React from 'react';
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
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import { router } from 'expo-router';

const DRAWER_WIDTH_RATIO = 0.85;
const MAX_DRAWER_WIDTH = 360;

interface DrawerLink {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  badge?: number;
}

const NAV_LINKS: DrawerLink[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/(tabs)' },
  { label: 'Knowledge', icon: 'hub', route: '/(tabs)/knowledge' },
  { label: 'Neural Mesh', icon: 'grain', route: '/(tabs)/mesh' },
  { label: 'Agent', icon: 'psychology', route: '/agent' },
  { label: 'Chat', icon: 'chat', route: '/chat' },
];

const SECONDARY_LINKS: DrawerLink[] = [
  { label: 'Analytics', icon: 'analytics', route: '/analytics' },
  { label: 'Integrations', icon: 'extension', route: '/integrations' },
  { label: 'Alerts', icon: 'notifications', route: '/alerts' },
  { label: 'Export', icon: 'download', route: '/export' },
];

/**
 * App drawer content. Always dark background, theme-aware accents.
 * Maps to Stitch prd_14 system navigation drawer.
 */
export default function AppDrawer() {
  const { theme, cycleTheme, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const drawerOpen = useStore((s) => s.drawerOpen);
  const setDrawerOpen = useStore((s) => s.setDrawerOpen);

  const drawerWidth = Math.min(
    Dimensions.get('window').width * DRAWER_WIDTH_RATIO,
    MAX_DRAWER_WIDTH,
  );

  if (!drawerOpen) return null;

  const close = () => setDrawerOpen(false);

  const navigate = (route: string) => {
    close();
    setTimeout(() => router.push(route as any), 100);
  };

  const d = theme.drawer;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { zIndex: 100 }]}>
      {/* Backdrop */}
      <Pressable
        style={[styles.backdrop, { backgroundColor: d.overlay }]}
        onPress={close}
      />

      {/* Drawer panel */}
      <View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: d.background,
            borderRightColor: d.border,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: d.border }]}>
          <View style={styles.headerRow}>
            <View style={[styles.logo, { backgroundColor: d.textPrimary }]}>
              <MaterialIcons name="grid-view" size={18} color={d.background} />
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={d.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: d.textSecondary }]}>System</Text>
              <Text style={[styles.statValue, { color: d.textPrimary }]}>Online</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: d.textSecondary }]}>Status</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.statusDot, { backgroundColor: theme.status.success }]} />
                <Text style={[styles.statValue, { color: d.textPrimary }]}>Stable</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { borderBottomColor: d.border }]}>
          <TouchableOpacity
            style={[styles.quickAction, { borderRightColor: d.border }]}
            onPress={() => navigate('/chat')}
          >
            <MaterialIcons name="add-circle" size={18} color={d.textPrimary} />
            <Text style={[styles.quickActionLabel, { color: d.textPrimary }]}>New Thread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <MaterialIcons name="search" size={18} color={d.textPrimary} />
            <Text style={[styles.quickActionLabel, { color: d.textPrimary }]}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Nav Links */}
        <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionLabel, { color: d.textSecondary }]}>NAVIGATE</Text>
          {NAV_LINKS.map((link) => (
            <TouchableOpacity
              key={link.route}
              style={[styles.navLink, { borderBottomColor: d.border + '33' }]}
              onPress={() => navigate(link.route)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialIcons name={link.icon} size={18} color={d.textSecondary} />
                <Text style={[styles.navLinkText, { color: d.textPrimary }]}>
                  {link.label}
                </Text>
              </View>
              {link.badge !== undefined && (
                <View style={[styles.navBadge, { backgroundColor: d.textPrimary }]}>
                  <Text style={[styles.navBadgeText, { color: d.background }]}>
                    {link.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionLabel, { color: d.textSecondary, marginTop: 20 }]}>
            MORE
          </Text>
          {SECONDARY_LINKS.map((link) => (
            <TouchableOpacity
              key={link.route}
              style={[styles.navLink, { borderBottomColor: d.border + '33' }]}
              onPress={() => navigate(link.route)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialIcons name={link.icon} size={18} color={d.textSecondary} />
                <Text style={[styles.navLinkText, { color: d.textPrimary }]}>
                  {link.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: d.border }]}>
          {/* Theme swap card */}
          <TouchableOpacity
            style={[styles.themeCard, { borderColor: d.border }]}
            onPress={cycleTheme}
          >
            <MaterialIcons name="contrast" size={18} color={d.textPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.themeLabel, { color: d.textPrimary }]}>Swap Theme</Text>
              <Text style={[styles.themeCurrent, { color: d.textSecondary }]}>
                CURRENT: {theme.label}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={d.textSecondary} />
          </TouchableOpacity>

          {/* Settings & logout */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={() => navigate('/profile')}
            >
              <MaterialIcons name="settings" size={18} color={d.textSecondary} />
              <Text style={[styles.footerBtnText, { color: d.textSecondary }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    borderRightWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
    }),
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statItem: {
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navScroll: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  navBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  navBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 10,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  themeCurrent: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBtnText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
