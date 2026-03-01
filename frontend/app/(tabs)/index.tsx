import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, fs, sw } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticRefresh, hapticLight } from '../../utils/haptics';

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
  const insets = useSafeAreaInsets();
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { activities, setActivities, setJournals } = useStore();
  const dashboardLayout = useStore((s) => s.preferences.dashboardLayout);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => { loadData(); }, []);

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

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={[styles.loadingText, { color: textMuted }]}>Loading...</Text>
      </View>
    );
  }

  const totalActivities = stats?.total_activities || 0;
  const totalJournals = stats?.total_journals || 0;
  const totalConnections = stats?.total_connections || 0;
  const categories = stats?.categories || {};
  const topCategories = Object.entries(categories).slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { hapticLight(); toggleDrawer(); }}
            style={[styles.menuBtn, { backgroundColor: surface }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="menu" size={22} color={text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: textMuted }]}>{getGreeting()}</Text>
            <Text style={[styles.title, { color: text }]}>Dashboard</Text>
          </View>
          <TouchableOpacity
            onPress={() => { hapticPress(); router.push('/profile' as any); }}
            style={[styles.avatarBtn, { backgroundColor: accent }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="person" size={20} color={theme.accentContrast} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'add', label: 'Add', route: '/chat', color: accent },
            { icon: 'chat-bubble-outline', label: 'Chat', route: '/chat', color: text },
            { icon: 'search', label: 'Search', route: '/search', color: text },
            { icon: 'edit-note', label: 'Journal', route: '/journal', color: text },
          ].map((action, i) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => { hapticPress(); router.push(action.route as any); }}
              style={[styles.quickActionBtn, { backgroundColor: i === 0 ? accent : surface }]}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={action.icon as any}
                size={22}
                color={i === 0 ? theme.accentContrast : text}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Row - Layout responsive */}
        <View style={[
          styles.statsRow,
          dashboardLayout === 'list' && styles.statsRowList,
          dashboardLayout === 'compact' && styles.statsRowCompact,
        ]}>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: surface, borderColor: border },
              dashboardLayout === 'list' && styles.statCardList,
              dashboardLayout === 'compact' && styles.statCardCompact,
            ]}
            onPress={() => { hapticLight(); router.push('/(tabs)/knowledge' as any); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="layers" size={dashboardLayout === 'compact' ? 16 : 20} color={accent} />
            <Text style={[styles.statValue, { color: text }, dashboardLayout === 'compact' && styles.statValueCompact]}>{totalActivities}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Activities</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: surface, borderColor: border },
              dashboardLayout === 'list' && styles.statCardList,
              dashboardLayout === 'compact' && styles.statCardCompact,
            ]}
            onPress={() => { hapticLight(); router.push('/journal' as any); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="menu-book" size={dashboardLayout === 'compact' ? 16 : 20} color={accent} />
            <Text style={[styles.statValue, { color: text }, dashboardLayout === 'compact' && styles.statValueCompact]}>{totalJournals}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Journals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: accent },
              dashboardLayout === 'list' && styles.statCardList,
              dashboardLayout === 'compact' && styles.statCardCompact,
            ]}
            onPress={() => { hapticLight(); router.push('/(tabs)/mesh' as any); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="hub" size={dashboardLayout === 'compact' ? 16 : 20} color={theme.accentContrast} />
            <Text style={[styles.statValue, { color: theme.accentContrast }, dashboardLayout === 'compact' && styles.statValueCompact]}>{totalConnections}</Text>
            <Text style={[styles.statLabel, { color: theme.accentContrast + 'CC' }]}>Mesh</Text>
          </TouchableOpacity>
        </View>

        {/* Neural Mesh Card */}
        <TouchableOpacity
          style={[styles.meshCard, { backgroundColor: surface, borderColor: border }]}
          onPress={() => { hapticPress(); router.push('/(tabs)/mesh' as any); }}
          activeOpacity={0.85}
        >
          <View style={styles.meshHeader}>
            <View style={styles.meshTitleRow}>
              <Text style={[styles.meshTitle, { color: text }]}>Neural Mesh</Text>
              <Animated.View style={[styles.liveDot, { backgroundColor: theme.status.success, opacity: pulseAnim }]} />
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={textMuted} />
          </View>
          <Text style={[styles.meshDesc, { color: textMuted }]}>
            {totalConnections > 0
              ? `${totalConnections} connections discovered across your knowledge base.`
              : 'Start adding content to discover patterns and connections.'}
          </Text>
          {/* Mini visualization */}
          <View style={styles.meshViz}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.meshDot,
                  {
                    backgroundColor: i % 4 === 0 ? accent : border,
                    opacity: i % 4 === 0 ? pulseAnim : 0.5,
                  },
                ]}
              />
            ))}
          </View>
        </TouchableOpacity>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <View style={[styles.section, { borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: text }]}>Top Domains</Text>
            {topCategories.map(([name, count]: any, i) => (
              <View key={name} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: i === 0 ? accent : border }]} />
                  <Text style={[styles.categoryName, { color: text }]}>{name}</Text>
                </View>
                <Text style={[styles.categoryCount, { color: i === 0 ? accent : textMuted }]}>
                  {count}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={[styles.section, { borderColor: border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Recent Activity</Text>
            <Animated.View style={[styles.liveBadge, { borderColor: theme.status.success + '44' }]}>
              <Animated.View style={[styles.liveDotSmall, { backgroundColor: theme.status.success, opacity: pulseAnim }]} />
              <Text style={[styles.liveText, { color: theme.status.success }]}>LIVE</Text>
            </Animated.View>
          </View>

          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={40} color={border} />
              <Text style={[styles.emptyText, { color: textMuted }]}>No activities yet</Text>
              <Text style={[styles.emptyHint, { color: textMuted }]}>Tap + to add your first entry</Text>
            </View>
          ) : (
            activities.slice(0, 5).map((activity: any, i: number) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  i < Math.min(activities.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: border },
                ]}
                onPress={() => { hapticLight(); router.push(`/activity-detail?id=${activity.id}` as any); }}
                activeOpacity={0.7}
              >
                <View style={[styles.activityDot, { backgroundColor: i === 0 ? accent : border }]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: text }]} numberOfLines={1}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityMeta, { color: textMuted }]}>
                    {activity.source}{activity.category ? ` · ${activity.category}` : ''}
                  </Text>
                </View>
                <Text style={[styles.activityTime, { color: textMuted }]}>
                  {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {activities.length > 5 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderTopColor: border }]}
              onPress={() => { hapticPress(); router.push('/(tabs)/knowledge' as any); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewAllText, { color: accent }]}>View all</Text>
              <MaterialIcons name="arrow-forward" size={16} color={accent} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, fontSize: fs(13) },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  menuBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.md },
  greeting: { fontSize: fs(11), textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 },
  title: { fontSize: fs(22), fontWeight: '700' },
  avatarBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Quick Actions */
  quickActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  quickActionBtn: {
    flex: 1,
    height: sw(52),
    borderRadius: sw(14),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: fs(24), fontWeight: '700' },
  statLabel: { fontSize: fs(10), textTransform: 'uppercase', letterSpacing: 1 },

  /* Mesh Card */
  meshCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  meshHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  meshTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meshTitle: { fontSize: fs(16), fontWeight: '700' },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  meshDesc: { fontSize: fs(13), lineHeight: 20, marginBottom: spacing.md },
  meshViz: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
  meshDot: { width: 6, height: 6, borderRadius: 3 },

  /* Sections */
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fs(14), fontWeight: '700', marginBottom: spacing.md },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  liveDotSmall: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: fs(9), fontWeight: '700', letterSpacing: 1 },

  /* Categories */
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: fs(13) },
  categoryCount: { fontSize: fs(13), fontWeight: '600' },

  /* Activity Items */
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: fs(14), fontWeight: '600', marginBottom: 2 },
  activityMeta: { fontSize: fs(11) },
  activityTime: { fontSize: fs(11) },

  /* Empty State */
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontSize: fs(14), marginTop: spacing.md },
  emptyHint: { fontSize: fs(12), marginTop: spacing.xs },

  /* View All */
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  viewAllText: { fontSize: fs(13), fontWeight: '700' },

  /* Layout Variants */
  statsRowList: { flexDirection: 'column', gap: spacing.sm },
  statsRowCompact: { gap: spacing.xs },
  statCardList: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  statCardCompact: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  statValueCompact: { fontSize: fs(18) },
});
