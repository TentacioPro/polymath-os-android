import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { useStore } from '../store/useStore';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';

import { getBackendUrlSync } from '../utils/backend';

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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

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
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to save journal');
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
    Alert.alert('Delete Journal', `Remove "${entryTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BACKEND_URL}/api/journals/${id}`);
            hapticSuccess();
            setJournals(journals.filter((j: any) => j.id !== id));
          } catch (e) {
            hapticWarning();
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  }, [journals, setJournals]);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={[styles.entryCard, { backgroundColor: surface, borderColor: border }]}
      onPress={() => handleEdit(item)}
      onLongPress={() => handleDelete(item.id, item.title)}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryTitle, { color: text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.entryDate, { color: textMuted }]}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      <Text style={[styles.entryContent, { color: textMuted }]} numberOfLines={2}>
        {item.content}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={[styles.tag, { backgroundColor: accent + '20' }]}>
              <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: textMuted }]}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

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
          <Text style={[styles.title, { color: text }]}>Journal</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>{journals.length} entries</Text>
        </View>
        <TouchableOpacity
          onPress={() => { hapticPress(); setShowEditor(true); }}
          style={[styles.iconBtn, { backgroundColor: accent }]}
        >
          <MaterialIcons name="add" size={22} color={theme.accentContrast} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={journals}
        keyExtractor={(item: any) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="menu-book" size={48} color={border} />
            <Text style={[styles.emptyText, { color: textMuted }]}>
              No journal entries yet
            </Text>
            <Text style={[styles.emptyHint, { color: textMuted }]}>
              Tap + to write your first reflection
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {/* Editor Modal */}
      <Modal visible={showEditor} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>
                {editingId ? 'Edit Entry' : 'New Entry'}
              </Text>
              <TouchableOpacity onPress={() => { hapticLight(); resetEditor(); }}>
                <MaterialIcons name="close" size={24} color={text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: textMuted }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="Entry title"
              placeholderTextColor={textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: textMuted }]}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="Write your reflection..."
              placeholderTextColor={textMuted}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <Text style={[styles.label, { color: textMuted }]}>Tags (comma-separated)</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="learning, ideas, insight"
              placeholderTextColor={textMuted}
              value={tags}
              onChangeText={setTags}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accent, opacity: title.trim() && content.trim() && !saving ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!title.trim() || !content.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.accentContrast} />
              ) : (
                <Text style={[styles.saveBtnText, { color: theme.accentContrast }]}>
                  {editingId ? 'Update' : 'Save Entry'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.hint, { color: textMuted }]}>Long-press entries to delete</Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: { fontSize: fs(20), fontWeight: '700' },
  subtitle: { fontSize: fs(12), marginTop: 2 },
  iconBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* List */
  listContent: { paddingHorizontal: spacing.lg },
  entryCard: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  entryTitle: { fontSize: fs(15), fontWeight: '600', flex: 1, marginRight: spacing.sm },
  entryDate: { fontSize: fs(10), letterSpacing: 0.5 },
  entryContent: { fontSize: fs(13), lineHeight: 19 },
  tagsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, alignItems: 'center' },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: fs(10), fontWeight: '600' },
  moreTags: { fontSize: fs(10), marginLeft: 4 },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyText: { fontSize: fs(16), fontWeight: '600', marginTop: spacing.md },
  emptyHint: { fontSize: fs(13), marginTop: spacing.xs },

  /* Modal */
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: fs(18), fontWeight: '700' },
  label: { fontSize: fs(11), textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: fs(15) },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { paddingVertical: spacing.lg, borderRadius: 12, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontSize: fs(14), fontWeight: '700' },
  hint: { fontSize: fs(11), textAlign: 'center', marginTop: spacing.md },
});
