import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  const [stats, setStats] = useState<any>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/stats`),
          axios.get(`${BACKEND_URL}/api/agent/stats`).catch(() => ({ data: null })),
        ]);
        setStats(sRes.data);
        setAgentStats(aRes.data);
      } catch (e) {
        console.error('Failed to fetch analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
              System Diagnostics
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Analytics
            </ThemedText>
          </View>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: spacing.xl }}>
              <SectionHeader label="Overview" icon="bar-chart" />
              <View style={styles.statsGrid}>
                <StatCard label="ACTIVITIES" value={stats?.total_activities?.toString() ?? '0'} />
                <StatCard label="CONNECTIONS" value={stats?.total_connections?.toString() ?? '0'} />
                <StatCard label="JOURNALS" value={stats?.total_journals?.toString() ?? '0'} inverted />
              </View>
            </View>

            {agentStats && (
              <View style={{ paddingHorizontal: spacing.xl }}>
                <SectionHeader label="Agent" icon="memory" />
                <View style={styles.statsGrid}>
                  <StatCard label="MEMORIES" value={agentStats.total_memories?.toString() ?? '0'} />
                  <StatCard label="QUERIES" value={agentStats.total_queries?.toString() ?? '0'} />
                  <StatCard label="PERSONA" value={agentStats.persona_name ?? '—'} inverted />
                </View>
              </View>
            )}

            <View style={{ paddingHorizontal: spacing.xl }}>
              <SectionHeader label="Topic Distribution" icon="donut-large" />
              <BentoCard padding="lg">
                {stats?.topic_distribution && stats.topic_distribution.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {stats.topic_distribution.map((topic: [string, number], i: number) => (
                      <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ThemedText variant="body" style={{ flex: 1 }}>{topic[0]}</ThemedText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ width: 60, height: 4, backgroundColor: theme.border, overflow: 'hidden' }}>
                            <View style={{ height: '100%', backgroundColor: theme.accent, width: `${Math.min(topic[1] * 10, 100)}%` }} />
                          </View>
                          <ThemedText variant="caption" color="muted" style={{ width: 20, textAlign: 'right' }}>{topic[1]}</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.placeholder}>
                    <MaterialIcons name="insights" size={40} color={theme.textMuted} />
                    <ThemedText variant="body" color="muted" style={{ marginTop: spacing.md, textAlign: 'center' }}>
                      Add more content to see topic distribution.
                    </ThemedText>
                  </View>
                )}
              </BentoCard>
            </View>
          </>
        )}

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
  statsGrid: {
    flexDirection: 'row',
    gap: sw(8),
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
}));
