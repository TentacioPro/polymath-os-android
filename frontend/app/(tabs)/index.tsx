import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import axios from 'axios';
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticRefresh, hapticLight } from '../../utils/haptics';
import { getBackendUrlSync } from '../../utils/backend';
import { m3Typography, m3Radii } from '../../../shared/design-tokens';
import { HEADER_MAX } from '../../components/navigation/CollapsibleHeader';
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
  const insets = useSafeAreaInsets();
  const { activities, setActivities, setJournals, journals, connections, preferences } = useStore();
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

  // Compute consecutive day streak from loaded activities
  // Must be declared before any early returns to satisfy Rules of Hooks
  const streak = useMemo(() => {
    if (!activities.length) return 0;
    const uniqueDates = [...new Set(
      activities.map((a: any) => new Date(a.timestamp).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let count = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    for (const d of uniqueDates) {
      const actDate = new Date(d);
      actDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((checkDate.getTime() - actDate.getTime()) / 86400000);
      if (diffDays <= 1) { count++; checkDate = actDate; }
      else break;
    }
    return count;
  }, [activities]);

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

  const layoutMode = preferences?.dashboardLayout || 'grid';
  const compactStyle = layoutMode === 'compact' ? { minHeight: 80, padding: spacing.md } : {};
  const compactFont = layoutMode === 'compact' ? { fontSize: 28, letterSpacing: 0 } : {};

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
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
        </Animated.View>

        {/* Bento Row 1: Fibonacci 1:2 */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={[styles.bentoRow, layoutMode === 'list' && { flexDirection: 'column' }]}>
          {/* Streak */}
          <View style={[styles.bentoCard, styles.shadowLight, { flex: 1, backgroundColor: theme.primaryContainer }, compactStyle]}>
            <Ionicons name="flame" size={layoutMode === 'compact' ? 20 : 24} color={theme.onPrimaryContainer} style={{ marginBottom: layoutMode === 'compact' ? 4 : 8 }} />
            <Text style={[styles.bentoValue, { color: theme.onPrimaryContainer }, compactFont]}>{streak}</Text>
            <Text style={[styles.bentoLabel, { color: theme.onPrimaryContainer, opacity: 0.85 }]}>Day Streak</Text>
          </View>
          
          {/* Mesh Mini */}
          <Pressable 
            style={({ pressed }) => [styles.bentoCard, styles.shadowLight, { flex: 2, backgroundColor: theme.surfaceContainer, opacity: pressed ? 0.85 : 1 }, compactStyle]}
            onPress={() => { hapticPress(); router.push('/(tabs)/mesh' as any); }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 }}>
              <Ionicons name="git-network" size={24} color={theme.primary} />
              <Animated.View style={[styles.liveDot, { backgroundColor: theme.success }, pulseDotStyle]} />
            </View>
            <Text style={[styles.bentoValue, { color: theme.onSurface }]}>{totalConnections}</Text>
            <Text style={[styles.bentoLabel, { color: theme.onSurfaceVariant }]}>Active Neural Nodes</Text>
          </Pressable>
        </Animated.View>

        {/* Bento Row 2: 1:1 Stats */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)} style={[styles.bentoRow, layoutMode === 'list' && { flexDirection: 'column' }]}>
          <Pressable 
            style={({ pressed }) => [styles.bentoCard, styles.shadowLight, { flex: 1, backgroundColor: theme.surfaceContainer, opacity: pressed ? 0.85 : 1 }, compactStyle]}
            onPress={() => { hapticPress(); router.push('/(tabs)/knowledge' as any); }}
          >
            <Ionicons name="layers" size={layoutMode === 'compact' ? 20 : 24} color={theme.primary} style={{ marginBottom: layoutMode === 'compact' ? 4 : 8 }} />
            <Text style={[styles.bentoValue, { color: theme.onSurface }, compactFont]}>{totalActivities}</Text>
            <Text style={[styles.bentoLabel, { color: theme.onSurfaceVariant }]}>Activities</Text>
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [styles.bentoCard, styles.shadowLight, { flex: 1, backgroundColor: theme.surfaceContainer, opacity: pressed ? 0.85 : 1 }, compactStyle]}
            onPress={() => { hapticPress(); router.push('/journal' as any); }}
          >
            <Ionicons name="book" size={layoutMode === 'compact' ? 20 : 24} color={theme.primary} style={{ marginBottom: layoutMode === 'compact' ? 4 : 8 }} />
            <Text style={[styles.bentoValue, { color: theme.onSurface }, compactFont]}>{totalJournals}</Text>
            <Text style={[styles.bentoLabel, { color: theme.onSurfaceVariant }]}>Journals</Text>
          </Pressable>
        </Animated.View>

        {/* Recent Activity (F-pattern block) */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <View style={[styles.sectionCard, styles.shadowLight, { backgroundColor: theme.surfaceContainer }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Recent Knowledge</Text>
              {activities.length > 5 && (
                <Pressable onPress={() => { hapticPress(); router.push('/(tabs)/knowledge' as any); }}>
                  <Text style={[styles.seeAllText, { color: theme.primary }]}>Explore</Text>
                </Pressable>
              )}
            </View>

            {activities.length === 0 ? (
              <EmptyState variant="empty-activities" onCTA={() => router.push('/chat' as any)} />
            ) : (
              activities.slice(0, 5).map((activity: any, i: number) => (
                <Pressable
                  key={activity.id}
                  style={({ pressed }) => [
                    styles.activityCard,
                    { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() => { hapticLight(); router.push(`/activity-detail?id=${activity.id}` as any); }}
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
                </Pressable>
              ))
            )}
          </View>
        </Animated.View>

        {/* Top Domains */}
        {topCategories.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(450)}>
            <View style={[styles.sectionCard, styles.shadowLight, { backgroundColor: theme.surfaceContainer }]}>
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

        {/* Journal Preview */}
        {journals.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(650)}>
            <View style={[styles.sectionCard, { backgroundColor: theme.surfaceContainer }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Recent Journals</Text>
                <Pressable onPress={() => { hapticPress(); router.push('/journal' as any); }}>
                  <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
                </Pressable>
              </View>
              {journals.slice(0, 3).map((j: any) => (
                <Pressable
                  key={j.id}
                  style={({ pressed }) => [styles.journalPreview, { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => { hapticLight(); router.push('/journal' as any); }}
                >
                  <Ionicons name="book-outline" size={16} color={theme.onSurfaceVariant} />
                  <View style={styles.journalPreviewContent}>
                    <Text style={[styles.journalPreviewTitle, { color: theme.onSurface }]} numberOfLines={1}>
                      {j.title}
                    </Text>
                    <Text style={[styles.journalPreviewBody, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                      {j.content}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

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
  dateText: { fontSize: m3Typography.titleMedium.fontSize, marginTop: 4 },
  /* Premium Grid / Bento Classes */
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bentoCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    minHeight: 120,
  },
  bentoValue: {
    fontSize: m3Typography.displaySmall.fontSize,
    fontWeight: '700',
    letterSpacing: -1,
  },
  bentoLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '500',
    marginTop: 4,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },

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

  /* Journal preview */
  journalPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: m3Radii.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  journalPreviewContent: { flex: 1 },
  journalPreviewTitle: {
    fontSize: m3Typography.titleSmall.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  journalPreviewBody: {
    fontSize: m3Typography.bodySmall.fontSize,
  },

  /* Sections */
  sectionCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },

  /* Categories */
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: m3Typography.bodyMedium.fontSize },
  categoryCount: { fontSize: m3Typography.labelMedium.fontSize, fontWeight: '600' },
});
