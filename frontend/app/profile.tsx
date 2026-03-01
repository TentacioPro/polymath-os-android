import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';
import { useStore } from '../store/useStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function ProfileScreen() {
  const { theme, cycleTheme, themeName } = useTheme();
  const router = useRouter();
  const styles = useStyles();
  const { activities, journals, connections } = useStore();

  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

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

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              System Settings
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Profile
            </ThemedText>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard padding="lg" shadow>
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <MaterialIcons name="person" size={28} color={theme.accentContrast} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <ThemedText variant="heading">{persona?.name || 'Polymath User'}</ThemedText>
                <ThemedText variant="caption" color="secondary">
                  {persona?.role || 'Polymath Guide'}
                </ThemedText>
              </View>
            </View>
          </BentoCard>
        </View>

        {/* Data Summary */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Data" icon="storage" />
          <BentoCard padding="md">
            <View style={{ gap: 8 }}>
              <View style={styles.dataRow}>
                <ThemedText variant="body" color="secondary">Activities</ThemedText>
                <ThemedText variant="body">{stats?.total_activities ?? activities.length}</ThemedText>
              </View>
              <View style={styles.dataRow}>
                <ThemedText variant="body" color="secondary">Journals</ThemedText>
                <ThemedText variant="body">{stats?.total_journals ?? journals.length}</ThemedText>
              </View>
              <View style={styles.dataRow}>
                <ThemedText variant="body" color="secondary">Connections</ThemedText>
                <ThemedText variant="body">{stats?.total_connections ?? connections.length}</ThemedText>
              </View>
            </View>
          </BentoCard>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Appearance" icon="palette" />
          <TouchableOpacity onPress={cycleTheme}>
            <BentoCard padding="md">
              <View style={styles.settingRow}>
                <MaterialIcons name="dark-mode" size={20} color={theme.accent} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Theme</Text>
                  <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                    {themeName === 'void' ? 'Void (Dark)' : themeName === 'nova' ? 'Nova (Light)' : 'Amber Void'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
              </View>
            </BentoCard>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="System" icon="settings" />
          {[
            { icon: 'storage' as const, label: 'Export Data', desc: 'Export your knowledge', route: '/export' },
            { icon: 'analytics' as const, label: 'Analytics', desc: 'System diagnostics', route: '/analytics' },
            { icon: 'info-outline' as const, label: 'About', desc: 'Polymath OS v1.0', route: null },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => item.route ? router.push(item.route as any) : null}
              disabled={!item.route}
            >
              <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.settingRow}>
                  <MaterialIcons name={item.icon} size={20} color={theme.accent} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
                </View>
              </BentoCard>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  scrollContent: { gap: sw(16) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: sw(56),
    height: sw(56),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: fs(14),
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: fs(12),
    marginTop: 2,
  },
}));
