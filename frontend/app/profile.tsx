import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { hapticLight, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';
import M3BottomSheet from '../components/ui/M3BottomSheet';
import M3Button from '../components/ui/M3Button';

export default function ProfileScreen() {
  const { theme, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const { activities, journals, connections } = useStore();
  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const fetchData = async () => {
      const BACKEND_URL = getBackendUrlSync();
      try {
        const [pRes, sRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/agent/persona`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/stats`).catch(() => ({ data: null })),
        ]);
        setPersona(pRes.data);
        setStats(sRes.data);
      } catch {}
    };
    fetchData();
  }, []);

  const SettingItem = ({
    icon,
    label,
    desc,
    onPress,
    isDestructive,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    desc: string;
    onPress?: () => void;
    isDestructive?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [styles.settingCard, { backgroundColor: isDestructive ? theme.errorContainer : theme.surfaceContainer, opacity: pressed && onPress ? 0.8 : 1 }] as any}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: isDestructive ? theme.error : theme.primaryContainer }]}>
        <MaterialIcons name={icon} size={18} color={isDestructive ? theme.onError : theme.onPrimaryContainer} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: isDestructive ? theme.onError : theme.onSurface }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: theme.onSurfaceVariant }]}>{desc}</Text>
      </View>
      {onPress && <MaterialIcons name="chevron-right" size={20} color={isDestructive ? theme.onError : theme.onSurfaceVariant} />}
    </Pressable>
  );

  const statItems = [
    { label: 'Activities', value: stats?.total_activities ?? activities.length },
    { label: 'Journals', value: stats?.total_journals ?? journals.length },
    { label: 'Connections', value: stats?.total_connections ?? connections.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => { hapticLight(); router.back(); }}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }] as any}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Profile</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Hero */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroSection}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryContainer }]}>
            <MaterialIcons name="person" size={36} color={theme.onPrimaryContainer} />
          </View>
          <Text style={[styles.userName, { color: theme.onSurface }]}>
            {persona?.name || 'Polymath User'}
          </Text>
          <Text style={[styles.userRole, { color: theme.onSurfaceVariant }]}>
            {persona?.role || 'Polymath Guide'}
          </Text>
        </Animated.View>

        {/* Stat Pills */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statRow}>
          {statItems.map((item, i) => (
            <View
              key={i}
              style={[styles.statPill, { backgroundColor: theme.surfaceContainer }]}
            >
              <Text style={[styles.statValue, { color: theme.onSurface }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Appearance</Text>
          <SettingItem
            icon="palette"
            label="Themes"
            desc={`${themeName.charAt(0).toUpperCase() + themeName.slice(1)} (7 themes)`}
            onPress={() => { hapticSelection(); router.push('/appearance' as any); }}
          />
          <SettingItem
            icon="tune"
            label="Customize"
            desc="Layouts, screens & visibility"
            onPress={() => { hapticSelection(); router.push('/customize' as any); }}
          />
        </Animated.View>

        {/* System */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>System</Text>
          <SettingItem
            icon="file-download"
            label="Export Data"
            desc="Export your knowledge"
            onPress={() => { hapticSelection(); router.push('/export' as any); }}
          />
          <SettingItem
            icon="analytics"
            label="Analytics"
            desc="System diagnostics"
            onPress={() => { hapticSelection(); router.push('/analytics' as any); }}
          />
          <SettingItem
            icon="extension"
            label="Integrations"
            desc="Backend & AI configuration"
            onPress={() => { hapticSelection(); router.push('/integrations' as any); }}
          />
          <SettingItem
            icon="info-outline"
            label="About"
            desc="Polymath OS v1.0"
          />
          <SettingItem
            icon="logout"
            label="Log Out"
            desc="Securely end your session"
            onPress={() => { hapticSelection(); setLogoutSheetVisible(true); }}
            isDestructive
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Logout Bottom Sheet (Hick's Law 90% Snap) */}
      <M3BottomSheet
        visible={logoutSheetVisible}
        onDismiss={() => setLogoutSheetVisible(false)}
        snapPoints={[0.9]}
      >
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeaderGroup}>
            <View style={[styles.sheetIconBox, { backgroundColor: theme.errorContainer }]}>
              <MaterialIcons name="logout" size={28} color={theme.onError} />
            </View>
            <Text style={[styles.sheetTitle, { color: theme.onSurface }]}>
              Confirm Logout
            </Text>
            <Text style={[styles.sheetDesc, { color: theme.onSurfaceVariant }]}>
              Are you sure you want to securely log out of your current session? You will need to re-authenticate to access Polymath OS.
            </Text>
          </View>
          
          <View style={styles.sheetActions}>
            <M3Button
              variant="filled"
              label="Log Out Securely"
              onPress={() => {
                setLogoutSheetVisible(false);
                logout();
              }}
              style={[styles.logoutBtn, { backgroundColor: theme.error }] as any}
            />
            <M3Button
              variant="tonal"
              label="Cancel"
              onPress={() => setLogoutSheetVisible(false)}
            />
          </View>
        </View>
      </M3BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  headerTitle: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },

  /* Hero */
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: m3Typography.headlineMedium.fontSize,
    fontWeight: '700',
  },
  userRole: {
    fontSize: m3Typography.bodyLarge.fontSize,
    marginTop: 4,
  },

  /* Stats */
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: m3Radii.xl,
  },
  statValue: {
    fontSize: m3Typography.headlineSmall.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 4,
  },

  /* Sections */
  sectionTitle: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Settings */
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingLabel: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: 2,
  },
  
  /* Sheet */
  sheetContent: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  sheetHeaderGroup: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheetIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: m3Typography.headlineMedium.fontSize,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sheetDesc: {
    fontSize: m3Typography.bodyLarge.fontSize,
    textAlign: 'center',
    lineHeight: 24,
  },
  sheetActions: {
    gap: spacing.md,
  },
  logoutBtn: {
    height: 56,
  },
});
