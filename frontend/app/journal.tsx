import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import { useStore } from '../store/useStore';
import M3Progress from '../components/ui/M3Progress';
import M3Button from '../components/ui/M3Button';
import M3BottomSheet from '../components/ui/M3BottomSheet';
import M3TextField from '../components/ui/M3TextField';
import { EmptyState } from '../components/ui/EmptyState';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

// Try to use dialog if available
let useDialog: any;
try { useDialog = require('../components/ui/DialogProvider').useDialog; } catch {}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_activities: string[];
  timestamp: string;
}

export default function JournalScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { journals, setJournals } = useStore();

  let dialog: any = null;
  try { if (useDialog) dialog = useDialog(); } catch {}

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadJournals(); }, []);

  const loadJournals = async () => {
    const BACKEND_URL = getBackendUrlSync();
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/journals`);
      setJournals(res.data);
    } catch (e) {
      console.error('Failed to load journals:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    hapticLight();
    setRefreshing(true);
    loadJournals().finally(() => setRefreshing(false));
  }, []);

  const handleSave = async () => {
    const BACKEND_URL = getBackendUrlSync();
    if (!title.trim() || !content.trim()) return;
    hapticPress();
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        linked_activities: [],
      };
      if (editingId) {
        await axios.put(`${BACKEND_URL}/api/journals/${editingId}`, body);
      } else {
        await axios.post(`${BACKEND_URL}/api/journals`, body);
      }
      hapticSuccess();
      resetEditor();
      loadJournals();
    } catch (e: any) {
      hapticWarning();
      if (dialog) {
        dialog.showAlert('Error', e?.response?.data?.detail || 'Failed to save journal');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleEdit = (entry: JournalEntry) => {
    hapticSelection();
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setTags(entry.tags.join(', '));
    setShowEditor(true);
  };

  const handleDelete = useCallback((id: string, entryTitle: string) => {
    const BACKEND_URL = getBackendUrlSync();
    hapticWarning();
    if (dialog) {
      dialog.showDestructive(
        'Delete Journal',
        `Remove "${entryTitle}"?`,
        'Delete',
        async () => {
          try {
            await axios.delete(`${BACKEND_URL}/api/journals/${id}`);
            hapticSuccess();
            setJournals(journals.filter((j: any) => j.id !== id));
          } catch {
            hapticWarning();
          }
        }
      );
    }
  }, [journals, setJournals, dialog]);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const formatFullDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    } catch { return ''; }
  };

  // Group entries by date
  const groupedByDate = journals.reduce<Record<string, JournalEntry[]>>((acc, entry: any) => {
    const dateKey = new Date(entry.timestamp).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const renderEntry = ({ item, index }: { item: JournalEntry; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 60).springify()}>
      <View style={styles.timelineRow}>
        {/* Timeline line + dot */}
        <View style={styles.timelineTrack}>
          <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
          <View style={[styles.timelineLine, { backgroundColor: theme.outlineVariant }]} />
        </View>

        {/* Entry card */}
        <TouchableOpacity
          style={[styles.entryCard, { backgroundColor: theme.surfaceContainer }]}
          onPress={() => handleEdit(item)}
          onLongPress={() => handleDelete(item.id, item.title)}
          activeOpacity={0.7}
        >
          <View style={styles.entryHeader}>
            <Text style={[styles.entryTitle, { color: theme.onSurface }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.entryDate, { color: theme.onSurfaceVariant }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
          <Text style={[styles.entryContent, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
            {item.content}
          </Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: theme.primaryContainer }]}>
                  <Text style={[styles.tagText, { color: theme.onPrimaryContainer }]}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={[styles.moreTags, { color: theme.onSurfaceVariant }]}>
                  +{item.tags.length - 3}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface, paddingTop: insets.top }]}>
        <M3Progress size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Journal</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>
            {journals.length} entr{journals.length === 1 ? 'y' : 'ies'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { hapticPress(); setShowEditor(true); }}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <MaterialIcons name="add" size={22} color={theme.onPrimary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Timeline List */}
      <FlatList
        data={journals as JournalEntry[]}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            variant="empty-journals"
            title="No journal entries yet"
            description="Tap + to write your first reflection"
            ctaLabel="New Entry"
            onCtaPress={() => { hapticPress(); setShowEditor(true); }}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Editor Bottom Sheet */}
      <M3BottomSheet
        visible={showEditor}
        onDismiss={resetEditor}
        snapPoints={[0.9]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editorContainer}
        >
          <View style={styles.editorHeader}>
            <Text style={[styles.editorTitle, { color: theme.onSurface }]}>
              {editingId ? 'Edit Entry' : 'New Entry'}
            </Text>
            <TouchableOpacity onPress={() => { hapticLight(); resetEditor(); }}>
              <MaterialIcons name="close" size={24} color={theme.onSurface} />
            </TouchableOpacity>
          </View>

          <M3TextField
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Entry title"
          />

          <View style={{ height: spacing.md }} />

          <M3TextField
            label="Content"
            value={content}
            onChangeText={setContent}
            placeholder="Write your reflection..."
            multiline
            numberOfLines={6}
          />

          <View style={{ height: spacing.md }} />

          <M3TextField
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="learning, ideas, insight"
            supportingText="Comma-separated"
          />

          <View style={{ height: spacing.xl }} />

          <M3Button
            label={editingId ? 'Update' : 'Save Entry'}
            variant="filled"
            onPress={handleSave}
            disabled={!title.trim() || !content.trim() || saving}
            loading={saving}
            fullWidth
          />

          <Text style={[styles.hint, { color: theme.onSurfaceVariant }]}>
            Long-press entries to delete
          </Text>
        </KeyboardAvoidingView>
      </M3BottomSheet>
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  headerTitle: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: m3Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Timeline list */
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineTrack: {
    width: 24,
    alignItems: 'center',
    paddingTop: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },

  /* Entry card */
  entryCard: {
    flex: 1,
    marginLeft: spacing.sm,
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  entryDate: {
    fontSize: m3Typography.labelSmall.fontSize,
    letterSpacing: 0.5,
  },
  entryContent: {
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  tagText: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
  },
  moreTags: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginLeft: 4,
  },

  /* Editor */
  editorContainer: {
    padding: spacing.lg,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  editorTitle: {
    fontSize: m3Typography.headlineSmall.fontSize,
    fontWeight: '700',
  },
  hint: {
    fontSize: m3Typography.labelSmall.fontSize,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
