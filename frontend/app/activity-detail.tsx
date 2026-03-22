import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { hapticLight, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

export default function ActivityDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    const BACKEND_URL = getBackendUrlSync();
    if (!id) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/activities/${id}`);
      setActivity(res.data);
    } catch (e) {
      console.error('Failed to load activity detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return ts; }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface, paddingTop: insets.top }]}>
        <M3Progress size="large" />
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => { hapticLight(); router.back(); }}
            style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
          </Pressable>
        </View>
        <EmptyState
          variant="empty-activities"
          title="Activity not found"
          description="This item may have been deleted"
        />
      </View>
    );
  }

  const analysis = activity.ai_analysis;
  const connections = activity.related_connections || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Hero Header */}
      <View style={[styles.hero, { paddingTop: insets.top + 8, backgroundColor: theme.primaryContainer }]}>
        <Pressable
          onPress={() => { hapticLight(); router.back(); }}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.surfaceContainerHighest + 'AA', opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </Pressable>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: theme.onPrimaryContainer }]} numberOfLines={2}>
            {activity.title}
          </Text>
          <Text style={[styles.heroDate, { color: theme.onPrimaryContainer }]}>
            {formatDate(activity.timestamp)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.badgeText, { color: theme.onPrimary }]}>
                  {(activity.content_type || activity.category || 'FILE').toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.source, { color: theme.onSurfaceVariant }]}>
                {activity.source || 'manual'}
              </Text>
            </View>
            {activity.url && (
              <Pressable
                style={({ pressed }) => [styles.urlRow, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { hapticSelection(); Linking.openURL(activity.url); }}
              >
                <MaterialIcons name="link" size={16} color={theme.primary} />
                <Text style={[styles.urlText, { color: theme.primary }]} numberOfLines={1}>
                  {activity.url}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Notes */}
        {activity.notes && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Notes</Text>
            <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
              <Text style={[styles.bodyText, { color: theme.onSurface }]}>{activity.notes}</Text>
            </View>
          </Animated.View>
        )}

        {/* AI Analysis */}
        {analysis && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>AI Analysis</Text>
            <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
              {analysis.summary && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisLabel, { color: theme.onSurfaceVariant }]}>SUMMARY</Text>
                  <Text style={[styles.bodyText, { color: theme.onSurface }]}>{analysis.summary}</Text>
                </View>
              )}
              {analysis.key_concepts && analysis.key_concepts.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisLabel, { color: theme.onSurfaceVariant }]}>KEY CONCEPTS</Text>
                  <View style={styles.tagsRow}>
                    {analysis.key_concepts.map((concept: string, i: number) => (
                      <View key={i} style={[styles.tagPill, { backgroundColor: theme.primaryContainer }]}>
                        <Text style={[styles.tagText, { color: theme.onPrimaryContainer }]}>{concept}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {analysis.category && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisLabel, { color: theme.onSurfaceVariant }]}>CATEGORY</Text>
                  <View style={[styles.tagPill, { backgroundColor: theme.primaryContainer }]}>
                    <Text style={[styles.tagText, { color: theme.onPrimaryContainer }]}>{analysis.category}</Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Connections */}
        {connections.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>
              {connections.length} Connection{connections.length > 1 ? 's' : ''}
            </Text>
            {connections.map((conn: any, i: number) => (
              <View
                key={conn.id || i}
                style={[styles.connCard, { backgroundColor: theme.surfaceContainer }]}
              >
                <View style={[styles.connIcon, { backgroundColor: theme.primaryContainer }]}>
                  <MaterialIcons name="compare-arrows" size={16} color={theme.onPrimaryContainer} />
                </View>
                <View style={styles.connContent}>
                  <Text style={[styles.connType, { color: theme.onSurface }]}>
                    {conn.connection_type || 'Related'}
                  </Text>
                  <Text style={[styles.connReasoning, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
                    {conn.ai_reasoning || 'Semantic link'}
                  </Text>
                </View>
                <View style={[styles.strengthBadge, { backgroundColor: theme.primaryContainer }]}>
                  <Text style={[styles.strengthText, { color: theme.onPrimaryContainer }]}>
                    {Math.round((conn.strength || 0.5) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
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

  /* Hero */
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: m3Radii.xl,
    borderBottomRightRadius: m3Radii.xl,
  },
  backBtn: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    marginTop: spacing.lg,
  },
  heroTitle: {
    fontSize: m3Typography.headlineMedium.fontSize,
    fontWeight: '700',
    lineHeight: m3Typography.headlineMedium.lineHeight,
  },
  heroDate: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: spacing.sm,
    opacity: 0.8,
  },

  /* Header (for not-found) */
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  /* Card */
  card: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  badgeText: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  source: { fontSize: m3Typography.labelMedium.fontSize },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  urlText: { flex: 1, fontSize: m3Typography.bodyMedium.fontSize },
  bodyText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
  },

  /* Analysis */
  analysisSection: { marginBottom: spacing.md },
  analysisLabel: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tagPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  tagText: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
  },

  /* Connections */
  connCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  connIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connContent: { flex: 1 },
  connType: {
    fontSize: m3Typography.titleSmall.fontSize,
    fontWeight: '600',
  },
  connReasoning: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: 2,
  },
  strengthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  strengthText: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    fontWeight: '600',
  },
});
