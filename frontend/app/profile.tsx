import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import { useStore } from '../store/useStore';
import { hapticLight, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

export default function ProfileScreen() {
  const { theme, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const { activities, journals, connections } = useStore();
  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

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
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    desc: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingCard, { backgroundColor: theme.surfaceContainer }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: theme.primaryContainer }]}>
        <MaterialIcons name={icon} size={18} color={theme.onPrimaryContainer} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: theme.onSurface }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: theme.onSurfaceVariant }]}>{desc}</Text>
      </View>
      {onPress && <MaterialIcons name="chevron-right" size={20} color={theme.onSurfaceVariant} />}
    </TouchableOpacity>
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
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
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
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    width: 44,
    height: 44,
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
});
