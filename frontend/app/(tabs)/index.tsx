import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Night owl mode';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Night owl mode';
}

export default function Dashboard() {
  const { theme } = useTheme();
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { activities, setActivities, setJournals } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const styles = useStyles();

  // Pulse animation for live dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

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

  const totalKnowledge = (stats?.total_activities || 0) + (stats?.total_journals || 0);
  const categoryCount = Object.keys(stats?.categories || {}).length || 0;

  return (
    <SafeView>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
            <View style={[styles.menuIcon, { borderColor: theme.textPrimary }]}>
              <MaterialIcons name="menu" size={20} color={theme.textPrimary} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Polymath<Text style={{ color: theme.accent }}>OS</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              }).toUpperCase()}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/profile' as any)}
              style={[styles.avatar, { backgroundColor: theme.accent }]}
            >
              <MaterialIcons name="person" size={16} color={theme.accentContrast} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.quickActionsRow}>
          {[
            { icon: 'chat' as const, label: 'Chat', route: '/chat' },
            { icon: 'edit-note' as const, label: 'Journal', route: '/journal' },
            { icon: 'search' as const, label: 'Search', route: '/search' },
            { icon: 'analytics' as const, label: 'Insights', route: '/analytics' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickActionBtn, { borderColor: theme.borderMuted }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.surfaceElevated }]}>
                <MaterialIcons name={action.icon} size={18} color={theme.accent} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.textSecondary }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Stat cards — 3-col bento grid ─── */}
        <View style={styles.statsGrid}>
          <StatCard
            value={stats?.total_activities || 0}
            label="Activities"
            icon={<MaterialIcons name="layers" size={16} color={theme.textPrimary} />}
          />
          <StatCard
            value={stats?.total_journals || 0}
            label="Journals"
            icon={<MaterialIcons name="menu-book" size={16} color={theme.textPrimary} />}
          />
          <StatCard
            value={stats?.total_connections || 0}
            label="Mesh"
            inverted
            icon={
              <MaterialIcons name="hub" size={16} color={theme.accentContrast} />
            }
          />
        </View>

        {/* ─── Neural Mesh Card ─── */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard shadow padding="none">
            {/* Decorative mesh visualization */}
            <View style={[styles.meshPreview, { borderBottomColor: theme.borderMuted }]}>
              {/* Decorative dots grid */}
              <View style={styles.meshDotsGrid}>
                {Array.from({ length: 15 }).map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.meshDot,
                      {
                        backgroundColor: i % 3 === 0 ? theme.accent : theme.borderMuted,
                        opacity: i % 3 === 0 ? pulseAnim : 0.4,
                      },
                    ]}
                  />
                ))}
              </View>
              {/* Floating label */}
              <View
                style={[
                  styles.meshTag,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.meshTagText, { color: theme.textPrimary }]}>
                  Neural Mesh
                </Text>
              </View>
            </View>

            <View style={{ padding: spacing.xl }}>
              <View style={styles.statusRow}>
                <Animated.View
                  style={[
                    styles.pulseDot,
                    {
                      backgroundColor: theme.status.success,
                      opacity: pulseAnim,
                    },
                  ]}
                />
                <Text style={[styles.statusText, { color: theme.textPrimary }]}>
                  {(stats?.total_connections || 0) > 0 ? 'Connections Active' : 'Ready'}
                </Text>
              </View>
              <ThemedText
                variant="heading"
                style={{ marginBottom: spacing.md, textTransform: 'none', fontSize: fs(17) }}
              >
                {totalKnowledge > 0
                  ? `${totalKnowledge} pieces of knowledge across ${categoryCount} domains.`
                  : 'Ready to build your knowledge mesh.'}
              </ThemedText>
              <View style={[styles.quoteBar, { borderLeftColor: theme.accent + '55' }]}>
                <ThemedText variant="body" color="secondary" style={{ fontSize: fs(13) }}>
                  {(stats?.total_connections || 0) > 0
                    ? `${stats.total_connections} connections discovered. Tap to explore the patterns.`
                    : 'Start adding activities to discover patterns.'}
                </ThemedText>
              </View>
              <ArchitectButton
                label="Explore Mesh"
                onPress={() => router.push('/(tabs)/mesh' as any)}
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

        {/* ─── Knowledge Pulse + Topics ─── */}
        <View style={styles.dualGrid}>
          {/* Mini insight card instead of redundant circle */}
          <BentoCard style={{ flex: 2 }} padding="md" elevated>
            <View style={styles.insightContainer}>
              <MaterialIcons name="auto-awesome" size={20} color={theme.accent} />
              <Text style={[styles.insightValue, { color: theme.textPrimary }]}>
                {totalKnowledge}
              </Text>
              <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>
                Total{'\n'}Knowledge
              </Text>
              <View style={[styles.insightBar, { backgroundColor: theme.borderMuted }]}>
                <View
                  style={[
                    styles.insightBarFill,
                    {
                      backgroundColor: theme.accent,
                      width: `${Math.min((totalKnowledge / Math.max(totalKnowledge + 10, 20)) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </BentoCard>

          <BentoCard style={{ flex: 3 }} padding="md">
            <SectionHeader label="Top Domains" />
            {(stats?.categories && Object.keys(stats.categories).length > 0
              ? Object.entries(stats.categories).slice(0, 3)
              : [
                  ['Start', 0],
                  ['Adding', 0],
                  ['Data', 0],
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
                        borderColor: theme.borderMuted,
                      },
                    ]}
                  />
                  <Text style={[styles.topicName, { color: theme.textPrimary }]}>{name}</Text>
                </View>
                <Text
                  style={[
                    styles.topicCount,
                    { color: i === 0 ? theme.accent : theme.textSecondary },
                  ]}
                >
                  {String(count).padStart(2, '0')}
                </Text>
              </View>
            ))}
          </BentoCard>
        </View>

        {/* ─── Ingestion Log ─── */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard padding="lg">
            <View style={styles.logHeader}>
              <ThemedText variant="heading" style={{ textTransform: 'none', fontSize: fs(16) }}>
                Recent Activity
              </ThemedText>
              <View style={styles.liveBadge}>
                <Animated.View
                  style={[
                    styles.liveDot,
                    { backgroundColor: theme.status.success, opacity: pulseAnim },
                  ]}
                />
                <Text style={[styles.liveText, { color: theme.status.success }]}>LIVE</Text>
              </View>
            </View>

            {activities.slice(0, 6).map((activity: any, i: number) => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => router.push(`/activity-detail?id=${activity.id}` as any)}
                activeOpacity={0.7}
                style={[
                  styles.logItem,
                  i < Math.min(activities.length, 6) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.borderMuted,
                  },
                ]}
              >
                <View style={styles.logTimeline}>
                  <View
                    style={[
                      styles.logDot,
                      {
                        backgroundColor: i === 0 ? theme.accent : theme.borderMuted,
                      },
                    ]}
                  />
                  {i < Math.min(activities.length, 6) - 1 && (
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
                    <Text style={[styles.logTime, { color: theme.textMuted }]}>
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
                <MaterialIcons
                  name="chevron-right"
                  size={16}
                  color={theme.textMuted}
                  style={{ alignSelf: 'center' }}
                />
              </TouchableOpacity>
            ))}

            {activities.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="inbox" size={32} color={theme.textMuted} />
                <ThemedText variant="body" color="muted" style={{ marginTop: 8 }}>
                  No activities yet
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  Tap + to add your first knowledge entry
                </ThemedText>
              </View>
            )}

            {activities.length > 6 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/knowledge' as any)}
                style={styles.viewAllBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: theme.accent }]}>
                  View all activity
                </Text>
                <MaterialIcons name="arrow-forward" size={14} color={theme.accent} />
              </TouchableOpacity>
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
    gap: sw(14),
    paddingBottom: sw(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(14),
  },
  menuBtn: {
    padding: 2,
  },
  menuIcon: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: sw(14),
  },
  greeting: {
    fontSize: fs(11),
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: '500',
  },
  title: {
    fontSize: fs(22),
    fontWeight: '700',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dateLabel: {
    fontSize: fs(10),
    fontWeight: '500',
    letterSpacing: 1,
  },
  avatar: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /* ─── Quick Actions ─── */
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: sw(20),
    gap: sw(10),
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  quickActionIcon: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* ─── Stats Grid ─── */
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: sw(20),
    gap: sw(10),
  },

  /* ─── Neural Mesh Card ─── */
  meshPreview: {
    height: 90,
    borderBottomWidth: 1,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  meshDotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: sw(18),
    paddingHorizontal: sw(20),
    paddingTop: sw(12),
  },
  meshDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  meshTag: {
    position: 'absolute',
    top: sw(10),
    left: sw(10),
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  meshTagText: {
    fontSize: fs(9),
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
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
    fontSize: fs(10),
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  quoteBar: {
    borderLeftWidth: 2,
    paddingLeft: sw(12),
    marginBottom: spacing.sm,
  },

  /* ─── Dual Grid (Insight + Topics) ─── */
  dualGrid: {
    flexDirection: 'row',
    paddingHorizontal: sw(20),
    gap: sw(10),
  },
  insightContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },
  insightValue: {
    fontSize: fs(28),
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 4,
  },
  insightLabel: {
    fontSize: fs(9),
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 14,
  },
  insightBar: {
    width: '80%',
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  insightBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* ─── Topics ─── */
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
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
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  /* ─── Activity Log ─── */
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.status.success + '44',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: fs(9),
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  logItem: {
    flexDirection: 'row',
    gap: spacing.md,
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
    marginBottom: 3,
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
    fontVariant: ['tabular-nums'],
  },
  logSource: {
    fontSize: fs(11),
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: 4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.borderMuted,
  },
  viewAllText: {
    fontSize: fs(12),
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
}));
