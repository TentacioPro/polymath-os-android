import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function ActivityDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles();

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
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
      <SafeView>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeView>
    );
  }

  if (!activity) {
    return (
      <SafeView>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="display" style={{ fontSize: 20, marginLeft: spacing.md }}>
            Not Found
          </ThemedText>
        </View>
        <View style={styles.loadingWrap}>
          <MaterialIcons name="error-outline" size={48} color={theme.textMuted} />
          <ThemedText variant="body" color="muted" style={{ marginTop: 12 }}>
            Activity not found.
          </ThemedText>
        </View>
      </SafeView>
    );
  }

  const analysis = activity.ai_analysis;
  const connections = activity.related_connections || [];

  return (
    <SafeView>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              Activity Detail
            </Text>
            <ThemedText variant="display" style={{ fontSize: 20 }} numberOfLines={2}>
              {activity.title}
            </ThemedText>
          </View>
        </View>

        {/* Meta info */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard padding="md">
            <View style={styles.metaRow}>
              <Badge label={(activity.content_type || activity.category || 'FILE').toUpperCase()} variant="filled" />
              <Text style={[styles.dateText, { color: theme.textMuted }]}>
                {formatDate(activity.timestamp)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="source" size={14} color={theme.textSecondary} />
              <Text style={[styles.metaValue, { color: theme.textSecondary }]}>
                Source: {activity.source || 'manual'}
              </Text>
            </View>
            {activity.url && (
              <TouchableOpacity
                style={styles.metaRow}
                onPress={() => Linking.openURL(activity.url)}
              >
                <MaterialIcons name="link" size={14} color={theme.accent} />
                <Text
                  style={[styles.metaValue, { color: theme.accent }]}
                  numberOfLines={1}
                >
                  {activity.url}
                </Text>
              </TouchableOpacity>
            )}
          </BentoCard>
        </View>

        {/* Notes */}
        {activity.notes && (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <SectionHeader label="Notes" icon="notes" />
            <BentoCard padding="md">
              <ThemedText variant="body">{activity.notes}</ThemedText>
            </BentoCard>
          </View>
        )}

        {/* AI Analysis */}
        {analysis && (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <SectionHeader label="AI Analysis" icon="psychology" />
            <BentoCard padding="md">
              {analysis.summary && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={[styles.analysisLabel, { color: theme.textSecondary }]}>
                    SUMMARY
                  </Text>
                  <ThemedText variant="body">{analysis.summary}</ThemedText>
                </View>
              )}
              {analysis.key_concepts && analysis.key_concepts.length > 0 && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={[styles.analysisLabel, { color: theme.textSecondary }]}>
                    KEY CONCEPTS
                  </Text>
                  <View style={styles.tagsRow}>
                    {analysis.key_concepts.map((concept: string, i: number) => (
                      <Badge key={i} label={concept} variant="filled" />
                    ))}
                  </View>
                </View>
              )}
              {analysis.category && (
                <View>
                  <Text style={[styles.analysisLabel, { color: theme.textSecondary }]}>
                    CATEGORY
                  </Text>
                  <Badge label={analysis.category} />
                </View>
              )}
            </BentoCard>
          </View>
        )}

        {/* Related Connections */}
        {connections.length > 0 && (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <SectionHeader label={`${connections.length} Connections`} icon="device-hub" />
            {connections.map((conn: any, i: number) => (
              <BentoCard key={conn.id || i} padding="sm" style={{ marginBottom: spacing.sm }}>
                <View style={styles.connRow}>
                  <MaterialIcons name="compare-arrows" size={16} color={theme.accent} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={[styles.connType, { color: theme.textPrimary }]}>
                      {conn.connection_type || 'Related'}
                    </Text>
                    <Text style={[styles.connReasoning, { color: theme.textSecondary }]} numberOfLines={2}>
                      {conn.ai_reasoning || 'Semantic link'}
                    </Text>
                  </View>
                  <Badge label={`${Math.round((conn.strength || 0.5) * 100)}%`} />
                </View>
              </BentoCard>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: fs(12),
    flex: 1,
  },
  dateText: {
    fontSize: fs(11),
  },
  analysisLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connType: {
    fontSize: fs(13),
    fontWeight: '700',
  },
  connReasoning: {
    fontSize: fs(11),
    marginTop: 2,
  },
}));
