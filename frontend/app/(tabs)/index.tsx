import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticRefresh, hapticLight } from '../../utils/haptics';
import { getBackendUrlSync } from '../../utils/backend';
import { m3Typography, m3Radii } from '../../../shared/design-tokens';
import StatRing from '../../components/ui/StatRing';
import M3Progress from '../../components/ui/M3Progress';
import { EmptyState } from '../../components/ui/EmptyState';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Night owl mode';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Night owl mode';
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const { theme } = useTheme();
  const { activities, setActivities, setJournals } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseDotStyle = useAnimatedStyle(() => ({
    opacity: pulseAnim.value,
  }));

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = getBackendUrlSync();
      const [statsRes, activitiesRes, journalsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/stats`),
        axios.get(`${BACKEND_URL}/api/activities?limit=10`),
        axios.get(`${BACKEND_URL}/api/journals?limit=5`),
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
      setJournals(journalsRes.data);
    } catch (error: any) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    hapticRefresh();
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface }]}>
        <M3Progress variant="circular" size="large" />
      </View>
    );
  }

  const totalActivities = stats?.total_activities || 0;
  const totalJournals = stats?.total_journals || 0;
  const totalConnections = stats?.total_connections || 0;
  const categories = stats?.categories || {};
  const topCategories = Object.entries(categories).slice(0, 4);
  const maxCat = Math.max(...Object.values(categories).map((v: any) => Number(v) || 1), 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.hero}>
          <Text style={[styles.greeting, { color: theme.onSurface }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.dateText, { color: theme.onSurfaceVariant }]}>
            {getDateString()}
          </Text>

          {/* Insight pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.insightScroll}
            contentContainerStyle={styles.insightContent}
          >
            {totalActivities > 0 && (
              <View style={[styles.insightPill, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons name="layers-outline" size={14} color={theme.onPrimaryContainer} />
                <Text style={[styles.insightText, { color: theme.onPrimaryContainer }]}>
                  {totalActivities} activities
                </Text>
              </View>
            )}
            {totalConnections > 0 && (
              <View style={[styles.insightPill, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons name="git-network-outline" size={14} color={theme.onPrimaryContainer} />
                <Text style={[styles.insightText, { color: theme.onPrimaryContainer }]}>
                  {totalConnections} connections
                </Text>
              </View>
            )}
            {totalJournals > 0 && (
              <View style={[styles.insightPill, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons name="book-outline" size={14} color={theme.onPrimaryContainer} />
                <Text style={[styles.insightText, { color: theme.onPrimaryContainer }]}>
                  {totalJournals} journal entries
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Stat Rings */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.statsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatRing
              value={totalActivities}
              total={Math.max(totalActivities, 50)}
              label="Activities"
              onPress={() => { hapticLight(); router.push('/(tabs)/knowledge' as any); }}
            />
            <StatRing
              value={totalJournals}
              total={Math.max(totalJournals, 20)}
              label="Journals"
              onPress={() => { hapticLight(); router.push('/journal' as any); }}
            />
            <StatRing
              value={totalConnections}
              total={Math.max(totalConnections, 30)}
              label="Connections"
              onPress={() => { hapticLight(); router.push('/(tabs)/mesh' as any); }}
            />
          </ScrollView>
        </Animated.View>

        {/* Neural Mesh Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <TouchableOpacity
            style={[styles.meshCard, { backgroundColor: theme.surfaceContainer }]}
            onPress={() => { hapticPress(); router.push('/(tabs)/mesh' as any); }}
            activeOpacity={0.85}
          >
            <View style={styles.meshHeader}>
              <View style={styles.meshTitleRow}>
                <Text style={[styles.meshTitle, { color: theme.onSurface }]}>Neural Mesh</Text>
                <Animated.View style={[styles.liveDot, { backgroundColor: theme.success }, pulseDotStyle]} />
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.onSurfaceVariant} />
            </View>
            <Text style={[styles.meshDesc, { color: theme.onSurfaceVariant }]}>
              {totalConnections > 0
                ? `${totalConnections} connections discovered across your knowledge base.`
                : 'Start adding content to discover patterns and connections.'}
            </Text>
            <View style={styles.meshViz}>
              {Array.from({ length: 16 }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.meshDot,
                    {
                      backgroundColor: i % 3 === 0 ? theme.primary : theme.outlineVariant,
                      opacity: i % 3 === 0 ? 0.8 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <View style={[styles.sectionCard, { backgroundColor: theme.surfaceContainer }]}>
              <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Top Domains</Text>
              {topCategories.map(([name, count]: any, i) => (
                <View key={name} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: i === 0 ? theme.primary : theme.outlineVariant }]} />
                    <Text style={[styles.categoryName, { color: theme.onSurface }]}>{name}</Text>
                  </View>
                  <Text style={[styles.categoryCount, { color: i === 0 ? theme.primary : theme.onSurfaceVariant }]}>
                    {count}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.duration(400).delay(450)}>
          <View style={[styles.sectionCard, { backgroundColor: theme.surfaceContainer }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Recent Activity</Text>
              {activities.length > 5 && (
                <TouchableOpacity onPress={() => { hapticPress(); router.push('/(tabs)/knowledge' as any); }}>
                  <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
                </TouchableOpacity>
              )}
            </View>

            {activities.length === 0 ? (
              <EmptyState variant="empty-activities" onCTA={() => router.push('/chat' as any)} />
            ) : (
              activities.slice(0, 5).map((activity: any, i: number) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    { backgroundColor: theme.surface },
                  ]}
                  onPress={() => { hapticLight(); router.push(`/activity-detail?id=${activity.id}` as any); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryStrip, { backgroundColor: theme.primary }]} />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.onSurface }]} numberOfLines={1}>
                      {activity.title}
                    </Text>
                    <Text style={[styles.activityMeta, { color: theme.onSurfaceVariant }]}>
                      {activity.source}{activity.category ? ` · ${activity.category}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: theme.onSurfaceVariant }]}>
                    {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Hero */
  hero: { marginBottom: spacing.xl, paddingTop: spacing.sm },
  greeting: { fontSize: m3Typography.displaySmall.fontSize, fontWeight: '700' },
  dateText: { fontSize: m3Typography.bodyLarge.fontSize, marginTop: 4 },
  insightScroll: { marginTop: spacing.lg },
  insightContent: { gap: spacing.sm },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: m3Radii.full,
  },
  insightText: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '500',
  },

  /* Stats */
  statsSection: { marginBottom: spacing.xl },
  statsRow: { gap: spacing.xl, paddingHorizontal: spacing.sm },

  /* Mesh card */
  meshCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  meshHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  meshTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meshTitle: { fontSize: m3Typography.titleMedium.fontSize, fontWeight: '600' },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  meshDesc: { fontSize: m3Typography.bodyMedium.fontSize, lineHeight: 22, marginBottom: spacing.md },
  meshViz: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center', paddingTop: spacing.sm },
  meshDot: { width: 8, height: 8, borderRadius: 4 },

  /* Section card */
  sectionCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: m3Typography.titleMedium.fontSize, fontWeight: '600', marginBottom: spacing.sm },
  seeAllText: { fontSize: m3Typography.labelLarge.fontSize, fontWeight: '600' },

  /* Categories */
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: m3Typography.bodyMedium.fontSize },
  categoryCount: { fontSize: m3Typography.bodyMedium.fontSize, fontWeight: '600' },

  /* Activity cards */
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: m3Radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  categoryStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: m3Radii.xl,
    borderBottomLeftRadius: m3Radii.xl,
  },
  activityContent: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  activityTitle: { fontSize: m3Typography.titleSmall.fontSize, fontWeight: '600', marginBottom: 2 },
  activityMeta: { fontSize: m3Typography.labelMedium.fontSize },
  activityTime: { fontSize: m3Typography.labelSmall.fontSize, paddingRight: spacing.md },
});
