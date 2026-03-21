import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection } from '../../utils/haptics';
import { getBackendUrlSync } from '../../utils/backend';
import { m3Typography, m3Radii } from '../../../shared/design-tokens';
import M3Progress from '../../components/ui/M3Progress';
import M3Chip from '../../components/ui/M3Chip';
import M3BottomSheet from '../../components/ui/M3BottomSheet';
import M3TextField from '../../components/ui/M3TextField';
import { EmptyState } from '../../components/ui/EmptyState';
import M3Button from '../../components/ui/M3Button';
import { useDialog } from '../../components/ui/DialogProvider';

const FILTERS = ['All', 'Article', 'PDF', 'Link', 'Audio', 'File'];
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_W = (SCREEN_W - spacing.lg * 2 - CARD_GAP) / 2;

const TYPE_ICONS: Record<string, string> = {
  article: 'document-text-outline',
  pdf: 'document-outline',
  link: 'link-outline',
  audio: 'mic-outline',
  video: 'videocam-outline',
  file: 'folder-outline',
  default: 'document-outline',
};

function getIcon(item: any): string {
  const type = (item.content_type || item.source || '').toLowerCase();
  for (const [key, icon] of Object.entries(TYPE_ICONS)) {
    if (type.includes(key)) return icon;
  }
  return TYPE_ICONS.default;
}

export default function Knowledge() {
  const { theme } = useTheme();
  const { activities, setActivities } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [saving, setSaving] = useState(false);
  let dialog: any;
  try { dialog = useDialog(); } catch { dialog = null; }

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const BACKEND_URL = getBackendUrlSync();
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/activities?limit=100`);
      setActivities(res.data);
    } catch (error) {
      console.error('Knowledge load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    hapticLight();
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  const handleAdd = async () => {
    const BACKEND_URL = getBackendUrlSync();
    if (!addTitle.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/activities/manual`, {
        title: addTitle.trim(),
        source: 'manual',
        url: addUrl.trim() || undefined,
        notes: addNotes.trim() || undefined,
      });
      hapticSuccess();
      setAddTitle(''); setAddUrl(''); setAddNotes('');
      setShowAddSheet(false);
      loadData();
    } catch (e: any) {
      hapticWarning();
      if (dialog) dialog.showAlert('Error', e?.response?.data?.detail || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback((id: string, title: string) => {
    const BACKEND_URL = getBackendUrlSync();
    hapticWarning();
    if (dialog) {
      dialog.showDestructive(`Remove "${title}"?`, 'This action cannot be undone.', async () => {
        try {
          await axios.delete(`${BACKEND_URL}/api/activities/${id}`);
          hapticSuccess();
          setActivities(activities.filter((a: any) => a.id !== id));
        } catch {
          if (dialog) dialog.showAlert('Error', 'Failed to delete');
        }
      });
    }
  }, [activities, setActivities, dialog]);

  const filtered = filter === 'All'
    ? activities
    : activities.filter((a: any) =>
        (a.content_type || a.source || '').toLowerCase().includes(filter.toLowerCase()),
      );

  // 2-column masonry split
  const leftCol: any[] = [];
  const rightCol: any[] = [];
  filtered.forEach((item: any, i: number) => {
    if (i % 2 === 0) leftCol.push(item);
    else rightCol.push(item);
  });

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface }]}>
        <M3Progress variant="circular" size="large" />
      </View>
    );
  }

  const renderCard = (item: any, delay: number) => (
    <Animated.View key={item.id} entering={FadeInDown.duration(300).delay(delay)}>
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: theme.surfaceContainer }]}
        onPress={() => { hapticLight(); router.push(`/activity-detail?id=${item.id}` as any); }}
        onLongPress={() => handleDelete(item.id, item.title)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIcon, { backgroundColor: theme.primaryContainer }]}>
          <Ionicons name={getIcon(item) as any} size={24} color={theme.onPrimaryContainer} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.cardMeta, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
          {item.source}
        </Text>
        {item.category && (
          <Text style={[styles.cardTime, { color: theme.onSurfaceVariant }]}>
            {item.category}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Search bar */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: theme.surfaceContainerHigh }]}
        onPress={() => { hapticPress(); router.push('/search' as any); }}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={20} color={theme.onSurfaceVariant} />
        <Text style={[styles.searchPlaceholder, { color: theme.onSurfaceVariant }]}>
          Search {activities.length} sources...
        </Text>
      </TouchableOpacity>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <M3Chip
            key={f}
            label={f}
            selected={filter === f}
            onPress={() => { hapticSelection(); setFilter(f); }}
          />
        ))}
      </ScrollView>

      {/* Content - 2 column masonry */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            variant="empty-activities"
            onCTA={() => setShowAddSheet(true)}
          />
        ) : (
          <View style={styles.masonryRow}>
            <View style={styles.masonryCol}>
              {leftCol.map((item, i) => renderCard(item, i * 50))}
            </View>
            <View style={styles.masonryCol}>
              {rightCol.map((item, i) => renderCard(item, i * 50 + 25))}
            </View>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Bottom Sheet */}
      <M3BottomSheet
        visible={showAddSheet}
        onDismiss={() => setShowAddSheet(false)}
        snapPoints={[0.6]}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.onSurface }]}>Add Knowledge</Text>
          <M3TextField label="Title" value={addTitle} onChangeText={setAddTitle} placeholder="What did you learn?" />
          <M3TextField label="URL (optional)" value={addUrl} onChangeText={setAddUrl} placeholder="https://..." keyboardType="url" />
          <M3TextField label="Notes (optional)" value={addNotes} onChangeText={setAddNotes} placeholder="Any notes..." multiline />
          <M3Button
            label={saving ? 'Adding...' : 'Add'}
            onPress={handleAdd}
            loading={saving}
            disabled={!addTitle.trim() || saving}
            fullWidth
          />
        </View>
      </M3BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: m3Radii.full,
    paddingHorizontal: 16,
    marginHorizontal: spacing.lg,
    gap: 8,
  },
  searchPlaceholder: { fontSize: m3Typography.bodyLarge.fontSize },

  /* Filters */
  filterScroll: { maxHeight: 52, marginTop: spacing.md },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  /* Grid */
  gridScroll: { flex: 1 },
  gridContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  masonryRow: { flexDirection: 'row', gap: CARD_GAP },
  masonryCol: { flex: 1, gap: CARD_GAP },

  gridCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: m3Typography.titleSmall.fontSize, fontWeight: '600' },
  cardMeta: { fontSize: m3Typography.labelMedium.fontSize },
  cardTime: { fontSize: m3Typography.labelSmall.fontSize },

  /* Sheet */
  sheetContent: { padding: spacing.lg, gap: spacing.md },
  sheetTitle: { fontSize: m3Typography.headlineSmall.fontSize, fontWeight: '600', marginBottom: spacing.sm },
});
