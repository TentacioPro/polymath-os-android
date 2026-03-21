import React, { useEffect, useState, useCallback } from 'react';
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
import M3Progress from '../components/ui/M3Progress';
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
    <View style={[styles.statBox, {
      backgroundColor: isAccent ? theme.primaryContainer : theme.surfaceContainer,
    }]}>
      <Text style={[styles.statValue, { color: isAccent ? theme.onPrimaryContainer : theme.onSurface }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: isAccent ? theme.onPrimaryContainer : theme.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );

  const BarItem = ({ label, value, color }: { label: string; value: number; color?: string }) => (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: theme.onSurface }]} numberOfLines={1}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: theme.surfaceContainerHigh }]}>
        <View style={[styles.barFill, {
          backgroundColor: color || theme.primary,
          width: `${Math.min(value * 10, 100)}%`,
        }]} />
      </View>
      <Text style={[styles.barValue, { color: theme.onSurfaceVariant }]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface, paddingTop: insets.top }]}>
        <M3Progress size="large" />
      </View>
    );
  }

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
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Analytics</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>System diagnostics</Text>
        </View>
        <TouchableOpacity
          onPress={() => { hapticSelection(); onRefresh(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="refresh" size={20} color={theme.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Overview</Text>
          <View style={styles.statsRow}>
            <StatBox label="ACTIVITIES" value={stats?.total_activities?.toString() ?? '0'} />
            <StatBox label="CONNECTIONS" value={stats?.total_connections?.toString() ?? '0'} />
            <StatBox label="JOURNALS" value={stats?.total_journals?.toString() ?? '0'} accent />
          </View>
        </Animated.View>

        {/* Agent */}
        {agentStats && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Agent</Text>
            <View style={styles.statsRow}>
              <StatBox label="MEMORIES" value={agentStats.total_memories?.toString() ?? '0'} />
              <StatBox label="QUERIES" value={agentStats.total_queries?.toString() ?? '0'} />
              <StatBox label="PERSONA" value={agentStats.persona_name ?? '—'} accent />
            </View>
          </Animated.View>
        )}

        {/* Topic Distribution */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Topics</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
            {stats?.topic_distribution && stats.topic_distribution.length > 0 ? (
              stats.topic_distribution.map((topic: [string, number], i: number) => (
                <BarItem key={i} label={topic[0]} value={topic[1]} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <MaterialIcons name="insights" size={32} color={theme.outlineVariant} />
                <Text style={[styles.emptyText, { color: theme.onSurfaceVariant }]}>
                  Add content to see topics
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Source Distribution */}
        {stats?.source_distribution && stats.source_distribution.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Sources</Text>
            <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
              {stats.source_distribution.map((src: [string, number], i: number) => (
                <BarItem key={i} label={src[0] || 'unknown'} value={src[1]} color={theme.warning} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* System Health */}
        {health && (
          <Animated.View entering={FadeInDown.delay(500)}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>System</Text>
            <View style={styles.statsRow}>
              <StatBox
                label="STATUS"
                value={health.status === 'healthy' ? 'OK' : 'WARN'}
              />
              <StatBox
                label="DATABASE"
                value={health.database?.status === 'connected' ? 'UP' : 'DOWN'}
              />
              <StatBox
                label="AI"
                value={health.ai?.configured ? 'ON' : 'OFF'}
                accent
              />
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
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
  headerSub: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: 2,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    alignItems: 'center',
  },
  statValue: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    letterSpacing: 0.5,
    marginTop: 4,
  },

  /* Card */
  card: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    marginTop: spacing.sm,
  },

  /* Bars */
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: { flex: 1, fontSize: m3Typography.bodyMedium.fontSize },
  barTrack: { width: 80, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barValue: { width: 28, fontSize: m3Typography.labelSmall.fontSize, textAlign: 'right' },
});
