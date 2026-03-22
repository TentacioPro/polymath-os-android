import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
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
import { m3Typography, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import { useStore } from '../store/useStore';
import M3Progress from '../components/ui/M3Progress';
import M3Button from '../components/ui/M3Button';
import M3BottomSheet from '../components/ui/M3BottomSheet';
import M3TextField from '../components/ui/M3TextField';
import M3Card from '../components/ui/M3Card';
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
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | null>(null);

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

    // ── Optimistic: close sheet instantly, prepend temp entry ──────────
    const tempId = `__temp__${Date.now()}`;
    const now = new Date().toISOString();
    const isNew = !editingId;
    if (isNew) {
      const tempEntry = {
        id: tempId,
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        linked_activities: [],
        timestamp: now,
      };
      const prevJournals = useStore.getState().journals;
      setJournals([tempEntry, ...prevJournals] as any[]);
      resetEditor(); // close sheet immediately
      // ──────────────────────────────────────────────────────────────

      try {
        const res = await axios.post(`${BACKEND_URL}/api/journals`, {
          title: tempEntry.title,
          content: tempEntry.content,
          tags: tempEntry.tags,
          linked_activities: [],
        });
        hapticSuccess();
        // Replace temp with real entry
        const current = useStore.getState().journals;
        setJournals(current.map((j: any) => (j.id === tempId ? res.data : j)) as any[]);
      } catch (e: any) {
        hapticWarning();
        // Rollback temp entry
        const current = useStore.getState().journals;
        setJournals(current.filter((j: any) => j.id !== tempId) as any[]);
        if (dialog) dialog.showAlert('Error', e?.response?.data?.detail || 'Failed to save journal');
      } finally {
        setSaving(false);
      }
      return;
    }

    // ── Edit existing entry (non-optimistic, keep sheet open) ──────────
    try {
      await axios.put(`${BACKEND_URL}/api/journals/${editingId}`, {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        linked_activities: [],
      });
      hapticSuccess();
      resetEditor();
      loadJournals();
    } catch (e: any) {
      hapticWarning();
      if (dialog) dialog.showAlert('Error', e?.response?.data?.detail || 'Failed to save journal');
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
          // ── Optimistic remove ───────────────────────────────────────
          const snapshot = useStore.getState().journals;
          setJournals(snapshot.filter((j: any) => j.id !== id));
          hapticSuccess();
          try {
            await axios.delete(`${BACKEND_URL}/api/journals/${id}`);
          } catch {
            // Rollback on API failure
            setJournals(snapshot);
            hapticWarning();
          }
        }
      );
    }
  }, [setJournals, dialog]);

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
    <Animated.View entering={FadeInDown.delay(index * 50).springify() as any}>
      <Pressable
        style={({ pressed }) => [
          styles.entryCard,
          styles.shadowLight,
          { backgroundColor: theme.surfaceContainer, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
        ] as any}
        onPress={() => { hapticSelection(); setPreviewEntry(item); }}
        onLongPress={() => handleDelete(item.id, item.title)}
      >
        <View style={styles.entryHeader as any}>
          <Text style={[styles.entryDate, { color: theme.primary, backgroundColor: theme.primaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' }] as any}>
            {formatDate(item.timestamp)}
          </Text>
          <MaterialIcons name="more-horiz" size={20} color={theme.onSurfaceVariant} />
        </View>
        <Text style={[styles.entryTitle, { color: theme.onSurface }] as any} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.entryContent, { color: theme.onSurfaceVariant }] as any} numberOfLines={3}>
          {item.content}
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow as any}>
            {item.tags.slice(0, 4).map((tag, i) => (
              <View key={i} style={[styles.tag, { backgroundColor: theme.surfaceContainerHigh }] as any}>
                <Text style={[styles.tagText, { color: theme.onSurfaceVariant }] as any}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 4 && (
              <Text style={[styles.moreTags, { color: theme.onSurfaceVariant }] as any}>
                +{item.tags.length - 4}
              </Text>
            )}
          </View>
        )}
      </Pressable>
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
        <Pressable
          onPress={() => { hapticLight(); router.back(); }}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Journal</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>
            {journals.length} entr{journals.length === 1 ? 'y' : 'ies'}
          </Text>
        </View>
        <Pressable
          onPress={() => { hapticPress(); setShowEditor(true); }}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="add" size={22} color={theme.onPrimary} />
        </Pressable>
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
            onCTA={() => { hapticPress(); setShowEditor(true); }}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Preview Bottom Sheet (50% snap) */}
      <M3BottomSheet
        visible={previewEntry !== null}
        onDismiss={() => setPreviewEntry(null)}
        snapPoints={[0.5]}
      >
        {previewEntry && (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewTitle, { color: theme.onSurface }]}>{previewEntry.title}</Text>
            <Text style={[styles.previewDate, { color: theme.onSurfaceVariant }]}>
              {formatFullDate(previewEntry.timestamp)}
            </Text>
            <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.previewContent, { color: theme.onSurface }]}>
                {previewEntry.content}
              </Text>
              {previewEntry.tags && previewEntry.tags.length > 0 && (
                <View style={[styles.tagsRow, { marginTop: spacing.md }]}>
                  {previewEntry.tags.map((tag, i) => (
                    <View key={i} style={[styles.tag, { backgroundColor: theme.primaryContainer }]}>
                      <Text style={[styles.tagText, { color: theme.onPrimaryContainer }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            <View style={styles.previewActions}>
              <M3Button
                label="Edit"
                variant="filled"
                onPress={() => {
                  const entry = previewEntry;
                  setPreviewEntry(null);
                  handleEdit(entry);
                }}
                icon="edit"
              />
              <M3Button
                label="Delete"
                variant="outlined"
                onPress={() => {
                  const entry = previewEntry;
                  setPreviewEntry(null);
                  handleDelete(entry.id, entry.title);
                }}
                icon="delete"
              />
            </View>
          </View>
        )}
      </M3BottomSheet>

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
            <View>
              <Text style={[styles.editorTitle, { color: theme.onSurface }]}>
                {editingId ? 'Edit Entry' : 'New Thought'}
              </Text>
              <Text style={[styles.editorSub, { color: theme.onSurfaceVariant }]}>
                {editingId ? 'Refining your existing reflection' : 'Capture a new cognitive spark'}
              </Text>
            </View>
            <Pressable 
              onPress={() => { hapticLight(); resetEditor(); }}
              style={({ pressed }) => [styles.closeBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="close" size={20} color={theme.onSurface} />
            </Pressable>
          </View>
          
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}>

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
            supportingText="Use commas to separate multiple tags"
          />

          <View style={{ height: spacing.xl * 1.5 }} />

          <View style={styles.editorActions}>
            <M3Button
              label={editingId ? 'Update Reflection' : 'Save Thought'}
              variant="filled"
              onPress={handleSave}
              disabled={!title.trim() || !content.trim() || saving}
              loading={saving}
              style={{ paddingVertical: 12, borderRadius: m3Radii.lg }}
              fullWidth
            />
            <Text style={[styles.hint, { color: theme.onSurfaceVariant }]}>
              Saved to your persistent cognitive vault
            </Text>
          </View>
          </ScrollView>
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
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
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
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: m3Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Timeline list */
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  /* Premium Neural Shadow */
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  /* Entry card */
  entryCard: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: m3Radii['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.05)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryDate: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  entryTitle: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  entryContent: {
    fontSize: m3Typography.bodyLarge.fontSize,
    lineHeight: m3Typography.bodyLarge.lineHeight,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.sm, // Harder corners for Neural look
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  editorTitle: {
    fontSize: m3Typography.headlineSmall.fontSize,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  editorSub: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorActions: {
    alignItems: 'center',
    gap: spacing.md,
  },
  hint: {
    fontSize: m3Typography.labelSmall.fontSize,
    textAlign: 'center',
    opacity: 0.7,
  },

  /* Preview drawer */
  previewContainer: {
    padding: spacing.lg,
    flex: 1,
  },
  previewTitle: {
    fontSize: m3Typography.headlineSmall.fontSize,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewDate: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginBottom: spacing.md,
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    fontSize: m3Typography.bodyLarge.fontSize,
    lineHeight: m3Typography.bodyLarge.lineHeight,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
});
