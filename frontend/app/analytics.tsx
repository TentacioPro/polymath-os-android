import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticLight, hapticSelection } from '../utils/haptics';

import { getBackendUrlSync } from '../utils/backend';

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  const fetchStats = async () => {
    const BACKEND_URL = getBackendUrlSync();
    try {
      const [sRes, aRes, hRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/stats`),
        axios.get(`${BACKEND_URL}/api/agent/stats`).catch(() => ({ data: null })),
        axios.get(`${BACKEND_URL}/api/health`).catch(() => ({ data: null })),
      ]);
      setStats(sRes.data);
      setAgentStats(aRes.data);
      setHealth(hRes.data);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = useCallback(() => {
    hapticLight();
    setRefreshing(true);
    fetchStats();
  }, []);

  const StatBox = ({ label, value, accent: isAccent }: { label: string; value: string; accent?: boolean }) => (
    <View style={[styles.statBox, { backgroundColor: isAccent ? accent : surface, borderColor: border }]}>
      <Text style={[styles.statValue, { color: isAccent ? theme.accentContrast : text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isAccent ? theme.accentContrast : textMuted }]}>{label}</Text>
    </View>
  );

  const BarItem = ({ label, value, color }: { label: string; value: number; color?: string }) => (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: text }]} numberOfLines={1}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: border }]}>
        <View style={[styles.barFill, { backgroundColor: color || accent, width: `${Math.min(value * 10, 100)}%` }]} />
      </View>
      <Text style={[styles.barValue, { color: textMuted }]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

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
          <Text style={[styles.title, { color: text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>System diagnostics</Text>
        </View>
        <TouchableOpacity
          onPress={() => { hapticSelection(); onRefresh(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="refresh" size={20} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>OVERVIEW</Text>
        <View style={styles.statsRow}>
          <StatBox label="ACTIVITIES" value={stats?.total_activities?.toString() ?? '0'} />
          <StatBox label="CONNECTIONS" value={stats?.total_connections?.toString() ?? '0'} />
          <StatBox label="JOURNALS" value={stats?.total_journals?.toString() ?? '0'} accent />
        </View>

        {/* Agent */}
        {agentStats && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>AGENT</Text>
            <View style={styles.statsRow}>
              <StatBox label="MEMORIES" value={agentStats.total_memories?.toString() ?? '0'} />
              <StatBox label="QUERIES" value={agentStats.total_queries?.toString() ?? '0'} />
              <StatBox label="PERSONA" value={agentStats.persona_name ?? '—'} accent />
            </View>
          </>
        )}

        {/* Topic Distribution */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>TOPICS</Text>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          {stats?.topic_distribution && stats.topic_distribution.length > 0 ? (
            stats.topic_distribution.map((topic: [string, number], i: number) => (
              <BarItem key={i} label={topic[0]} value={topic[1]} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="insights" size={32} color={border} />
              <Text style={[styles.emptyText, { color: textMuted }]}>
                Add content to see topics
              </Text>
            </View>
          )}
        </View>

        {/* Source Distribution */}
        {stats?.source_distribution && stats.source_distribution.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>SOURCES</Text>
            <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              {stats.source_distribution.map((src: [string, number], i: number) => (
                <BarItem key={i} label={src[0] || 'unknown'} value={src[1]} color="#FFB800" />
              ))}
            </View>
          </>
        )}

        {/* System Health */}
        {health && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>SYSTEM</Text>
            <View style={styles.statsRow}>
              <StatBox label="STATUS" value={health.status === 'healthy' ? 'OK' : 'WARN'} />
              <StatBox label="DATABASE" value={health.database?.status === 'connected' ? 'UP' : 'DOWN'} />
              <StatBox label="AI" value={health.ai?.configured ? 'ON' : 'OFF'} accent />
            </View>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: fs(18), fontWeight: '700' },
  statLabel: { fontSize: fs(9), letterSpacing: 0.5, marginTop: 4 },

  /* Card */
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { fontSize: fs(13), marginTop: spacing.sm },

  /* Bars */
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: { flex: 1, fontSize: fs(13) },
  barTrack: { width: 60, height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  barValue: { width: 24, fontSize: fs(11), textAlign: 'right' },
});
