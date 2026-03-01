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
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { useStore } from '../store/useStore';
import { hapticLight, hapticPress, hapticSelection } from '../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function ProfileScreen() {
  const { theme, cycleTheme, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const { activities, journals, connections } = useStore();
  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/agent/persona`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/stats`).catch(() => ({ data: null })),
        ]);
        setPersona(pRes.data);
        setStats(sRes.data);
      } catch (e) {
        // silent
      }
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
      style={[styles.settingCard, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={18} color={accent} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: text }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: textMuted }]}>{desc}</Text>
      </View>
      {onPress && <MaterialIcons name="chevron-right" size={20} color={textMuted} />}
    </TouchableOpacity>
  );

  const DataRow = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.dataRow}>
      <Text style={[styles.dataLabel, { color: textMuted }]}>{label}</Text>
      <Text style={[styles.dataValue, { color: text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Settings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Card */}
        <View style={[styles.avatarCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={[styles.avatar, { backgroundColor: accent }]}>
            <MaterialIcons name="person" size={28} color={theme.accentContrast} />
          </View>
          <View style={styles.avatarText}>
            <Text style={[styles.avatarName, { color: text }]}>
              {persona?.name || 'Polymath User'}
            </Text>
            <Text style={[styles.avatarRole, { color: textMuted }]}>
              {persona?.role || 'Polymath Guide'}
            </Text>
          </View>
        </View>

        {/* Data Summary */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>DATA</Text>
        <View style={[styles.dataCard, { backgroundColor: surface, borderColor: border }]}>
          <DataRow label="Activities" value={stats?.total_activities ?? activities.length} />
          <DataRow label="Journals" value={stats?.total_journals ?? journals.length} />
          <DataRow label="Connections" value={stats?.total_connections ?? connections.length} />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>APPEARANCE</Text>
        <SettingItem
          icon="dark-mode"
          label="Theme"
          desc={themeName === 'void' ? 'Void (Dark)' : themeName === 'nova' ? 'Nova (Light)' : 'Amber Void'}
          onPress={() => { hapticPress(); cycleTheme(); }}
        />

        {/* System */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>SYSTEM</Text>
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
          icon="info-outline"
          label="About"
          desc="Polymath OS v1.0"
        />

        <View style={{ height: 80 }} />
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
  headerText: { flex: 1, marginLeft: spacing.sm },
  title: { fontSize: fs(20), fontWeight: '700' },
  subtitle: { fontSize: fs(12), marginTop: 2 },
  iconBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  /* Avatar */
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { flex: 1, marginLeft: spacing.md },
  avatarName: { fontSize: fs(18), fontWeight: '700' },
  avatarRole: { fontSize: fs(13), marginTop: 2 },

  /* Data */
  dataCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: { fontSize: fs(14) },
  dataValue: { fontSize: fs(14), fontWeight: '600' },

  /* Settings */
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  settingIcon: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: fs(14), fontWeight: '600' },
  settingDesc: { fontSize: fs(12), marginTop: 2 },
});
