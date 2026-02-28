import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import SafeView from '../../components/shared/SafeView';
import StatCard from '../../components/ui/StatCard';
import BentoCard from '../../components/ui/BentoCard';
import SectionHeader from '../../components/ui/SectionHeader';
import ArchitectButton from '../../components/ui/ArchitectButton';
import Badge from '../../components/ui/Badge';
import ThemedText from '../../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../../theme';
import { useStore } from '../../store/useStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Dashboard() {
  const { theme } = useTheme();
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { activities, setActivities, setJournals } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, journalsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/stats`),
        axios.get(`${BACKEND_URL}/api/activities?limit=10`),
        axios.get(`${BACKEND_URL}/api/journals?limit=5`),
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
      setJournals(journalsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <ThemedText variant="caption" color="secondary" style={{ marginTop: 16 }}>
            Loading your polymath journey...
          </ThemedText>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
            <MaterialIcons name="menu" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              System: Online
            </Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Polymath<Text style={{ color: theme.textSecondary }}>OS</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.dateLabel, { color: theme.textPrimary }]}>
              {new Date()
                .toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                .toUpperCase()}
            </Text>
            <View style={[styles.avatar, { borderColor: theme.border }]}>
              <MaterialIcons name="person" size={18} color={theme.textSecondary} />
            </View>
          </View>
        </View>

        {/* Stat cards — 3-col bento grid */}
        <View style={styles.statsGrid}>
          <StatCard
            value={stats?.total_activities || 0}
            label="Items/Day"
            icon={<MaterialIcons name="speed" size={16} color={theme.textPrimary} />}
            badge="NEW"
          />
          <StatCard
            value={`${Math.min(stats?.total_journals || 0, 100)}%`}
            label="Recall"
          />
          <StatCard
            value={stats?.total_connections || 0}
            label="Day Streak"
            inverted
            icon={
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color={theme.accentContrast}
              />
            }
          />
        </View>

        {/* Neural Mesh synthesis card */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard shadow padding="none">
            <View style={[styles.meshPreview, { borderBottomColor: theme.border }]}>
              <View
                style={[
                  styles.meshTag,
                  { backgroundColor: theme.background, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.meshTagText, { color: theme.textPrimary }]}>
                  Neural Mesh v3.0
                </Text>
              </View>
            </View>
            <View style={{ padding: spacing.xl }}>
              <View style={styles.statusRow}>
                <View style={[styles.pulseDot, { backgroundColor: theme.accent }]} />
                <Text style={[styles.statusText, { color: theme.textPrimary }]}>
                  Synthesis Ready
                </Text>
              </View>
              <ThemedText
                variant="heading"
                style={{ marginBottom: spacing.md, textTransform: 'none' }}
              >
                {activities.length > 0
                  ? 'Correlation detected in recent ingestion.'
                  : 'Ready to build your knowledge mesh.'}
              </ThemedText>
              <View style={[styles.quoteBar, { borderLeftColor: theme.borderMuted }]}>
                <ThemedText variant="body" color="secondary">
                  {activities.length > 0
                    ? `You've ingested ${activities.length} items. Semantic overlap > 85%.`
                    : 'Start adding activities to discover patterns.'}
                </ThemedText>
              </View>
              <ArchitectButton
                label="Merge Concepts"
                onPress={() => {}}
                variant="outline"
                fullWidth
                icon={
                  <MaterialIcons name="arrow-forward" size={14} color={theme.textPrimary} />
                }
                style={{ marginTop: spacing.lg }}
              />
            </View>
          </BentoCard>
        </View>

        {/* Topics Distribution + Stats */}
        <View style={styles.dualGrid}>
          <BentoCard style={{ flex: 2 }} padding="md">
            <View style={styles.circleContainer}>
              <View style={[styles.circleOuter, { borderColor: theme.borderMuted }]}>
                <View style={[styles.circleInner, { borderColor: theme.accent }]}>
                  <ThemedText
                    variant="mono"
                    style={{ fontSize: 11, fontWeight: '700' }}
                  >
                    AI
                  </ThemedText>
                  <Text style={{ color: theme.textSecondary, fontSize: 8 }}>75%</Text>
                </View>
              </View>
            </View>
          </BentoCard>

          <BentoCard style={{ flex: 3 }} padding="md">
            <SectionHeader label="Topics Distribution" />
            {(stats?.categories
              ? Object.entries(stats.categories).slice(0, 3)
              : [
                  ['Artificial Intel.', 14],
                  ['Engineering', 8],
                  ['Philosophy', 3],
                ]
            ).map(([name, count]: any, i: number) => (
              <View key={name} style={styles.topicRow}>
                <View style={styles.topicLeft}>
                  <View
                    style={[
                      styles.topicDot,
                      {
                        backgroundColor: i === 0 ? theme.accent : 'transparent',
                        borderWidth: i === 0 ? 0 : 1,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                  <Text style={[styles.topicName, { color: theme.textPrimary }]}>{name}</Text>
                </View>
                <Text
                  style={[
                    styles.topicCount,
                    { color: i === 0 ? theme.textPrimary : theme.textSecondary },
                  ]}
                >
                  {String(count).padStart(2, '0')}
                </Text>
              </View>
            ))}
          </BentoCard>
        </View>

        {/* Ingestion Log */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard padding="lg">
            <View style={styles.logHeader}>
              <ThemedText variant="heading" style={{ textTransform: 'none' }}>
                Ingestion Log
              </ThemedText>
              <Badge label="LIVE" />
            </View>

            {activities.slice(0, 4).map((activity: any, i: number) => (
              <View
                key={activity.id}
                style={[
                  styles.logItem,
                  i < Math.min(activities.length, 4) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.borderMuted,
                  },
                ]}
              >
                <View style={styles.logTimeline}>
                  <View style={[styles.logDot, { backgroundColor: theme.accent }]} />
                  {i < Math.min(activities.length, 4) - 1 && (
                    <View style={[styles.logLine, { backgroundColor: theme.borderMuted }]} />
                  )}
                </View>
                <View style={styles.logContent}>
                  <View style={styles.logTitleRow}>
                    <Text
                      style={[styles.logTitle, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {activity.title}
                    </Text>
                    <Text style={[styles.logTime, { color: theme.textSecondary }]}>
                      {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.logSource, { color: theme.textSecondary }]}>
                    {activity.source}
                    {activity.category ? ` · ${activity.category}` : ''}
                  </Text>
                </View>
              </View>
            ))}

            {activities.length === 0 && (
              <ThemedText
                variant="body"
                color="muted"
                style={{ textAlign: 'center', paddingVertical: 20 }}
              >
                No activities yet. Add your first one!
              </ThemedText>
            )}
          </BentoCard>
        </View>

        {/* Bottom spacer for floating pill */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    gap: sw(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
  },
  menuBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: sw(12),
  },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: fs(22),
    fontWeight: '700',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dateLabel: {
    fontSize: fs(11),
    fontWeight: '500',
  },
  avatar: {
    width: sw(34),
    height: sw(34),
    borderRadius: sw(17),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: sw(20),
    gap: sw(10),
  },
  meshPreview: {
    height: 100,
    borderBottomWidth: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  meshTag: {
    position: 'absolute',
    top: sw(12),
    left: sw(12),
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  meshTagText: {
    fontSize: fs(10),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fs(11),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quoteBar: {
    borderLeftWidth: 2,
    paddingLeft: sw(12),
    marginBottom: spacing.sm,
  },
  dualGrid: {
    flexDirection: 'row',
    paddingHorizontal: sw(20),
    gap: sw(10),
  },
  circleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  circleOuter: {
    width: sw(72),
    height: sw(72),
    borderRadius: sw(36),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(28),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topicName: {
    fontSize: fs(12),
    fontWeight: '500',
  },
  topicCount: {
    fontSize: fs(12),
    fontWeight: '500',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logItem: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  logTimeline: {
    alignItems: 'center',
    width: 16,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  logLine: {
    width: 1,
    flex: 1,
    marginTop: 4,
  },
  logContent: {
    flex: 1,
  },
  logTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  logTitle: {
    fontSize: fs(13),
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  logTime: {
    fontSize: fs(10),
    letterSpacing: 0.5,
  },
  logSource: {
    fontSize: fs(11),
    letterSpacing: 0.5,
  },
}));
