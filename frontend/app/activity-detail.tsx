import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticLight, hapticSelection } from '../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function ActivityDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/activities/${id}`);
      setActivity(res.data);
    } catch (e) {
      console.error('Failed to load activity detail:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const onRefresh = () => {
    hapticLight();
    setRefreshing(true);
    fetchDetail();
  };

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => { hapticLight(); router.back(); }}
            style={[styles.iconBtn, { backgroundColor: surface }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: text, marginLeft: spacing.sm }]}>Not Found</Text>
        </View>
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color={border} />
          <Text style={[styles.centerText, { color: textMuted }]}>Activity not found</Text>
        </View>
      </View>
    );
  }

  const analysis = activity.ai_analysis;
  const connections = activity.related_connections || [];

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
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {formatDate(activity.timestamp)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Meta Card */}
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Text style={[styles.badgeText, { color: theme.accentContrast }]}>
                {(activity.content_type || activity.category || 'FILE').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.source, { color: textMuted }]}>
              {activity.source || 'manual'}
            </Text>
          </View>
          {activity.url && (
            <TouchableOpacity
              style={styles.urlRow}
              onPress={() => { hapticSelection(); Linking.openURL(activity.url); }}
            >
              <MaterialIcons name="link" size={16} color={accent} />
              <Text style={[styles.urlText, { color: accent }]} numberOfLines={1}>
                {activity.url}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes */}
        {activity.notes && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>NOTES</Text>
            <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <Text style={[styles.bodyText, { color: text }]}>{activity.notes}</Text>
            </View>
          </>
        )}

        {/* AI Analysis */}
        {analysis && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>AI ANALYSIS</Text>
            <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              {analysis.summary && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisLabel, { color: textMuted }]}>SUMMARY</Text>
                  <Text style={[styles.bodyText, { color: text }]}>{analysis.summary}</Text>
                </View>
              )}
              {analysis.key_concepts && analysis.key_concepts.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisLabel, { color: textMuted }]}>KEY CONCEPTS</Text>
                  <View style={styles.tagsRow}>
                    {analysis.key_concepts.map((concept: string, i: number) => (
                      <View key={i} style={[styles.tagBadge, { backgroundColor: accent + '20' }]}>
                        <Text style={[styles.tagText, { color: accent }]}>{concept}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {analysis.category && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisLabel, { color: textMuted }]}>CATEGORY</Text>
                  <View style={[styles.tagBadge, { backgroundColor: accent + '20' }]}>
                    <Text style={[styles.tagText, { color: accent }]}>{analysis.category}</Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {/* Connections */}
        {connections.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>
              {connections.length} CONNECTION{connections.length > 1 ? 'S' : ''}
            </Text>
            {connections.map((conn: any, i: number) => (
              <View
                key={conn.id || i}
                style={[styles.connCard, { backgroundColor: surface, borderColor: border }]}
              >
                <View style={[styles.connIcon, { backgroundColor: bg }]}>
                  <MaterialIcons name="compare-arrows" size={16} color={accent} />
                </View>
                <View style={styles.connContent}>
                  <Text style={[styles.connType, { color: text }]}>
                    {conn.connection_type || 'Related'}
                  </Text>
                  <Text style={[styles.connReasoning, { color: textMuted }]} numberOfLines={2}>
                    {conn.ai_reasoning || 'Semantic link'}
                  </Text>
                </View>
                <View style={[styles.strengthBadge, { backgroundColor: accent + '20' }]}>
                  <Text style={[styles.strengthText, { color: accent }]}>
                    {Math.round((conn.strength || 0.5) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
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
  title: { fontSize: fs(18), fontWeight: '700' },
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
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerText: { fontSize: fs(14), marginTop: spacing.md },
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Card */
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: fs(10), fontWeight: '600', letterSpacing: 0.5 },
  source: { fontSize: fs(12) },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  urlText: { flex: 1, fontSize: fs(13) },
  bodyText: { fontSize: fs(14), lineHeight: 21 },

  /* Analysis */
  analysisSection: { marginBottom: spacing.md },
  analysisLabel: { fontSize: fs(9), letterSpacing: 1, marginBottom: spacing.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tagBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: fs(11), fontWeight: '600' },

  /* Connections */
  connCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  connIcon: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  connContent: { flex: 1 },
  connType: { fontSize: fs(14), fontWeight: '600' },
  connReasoning: { fontSize: fs(12), marginTop: 2 },
  strengthBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  strengthText: { fontSize: fs(10), fontWeight: '600' },
});
