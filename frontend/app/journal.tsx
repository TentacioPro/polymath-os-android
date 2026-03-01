import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import ThemedText from '../components/shared/ThemedText';
import ArchitectButton from '../components/ui/ArchitectButton';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';
import { useStore } from '../store/useStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

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
  const router = useRouter();
  const styles = useStyles();
  const { journals, setJournals } = useStore();

  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
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
    setRefreshing(true);
    loadJournals().finally(() => setRefreshing(false));
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
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
      resetEditor();
      loadJournals();
    } catch (e: any) {
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
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setTags(entry.tags.join(', '));
    setShowEditor(true);
  };

  const handleDelete = useCallback((id: string, entryTitle: string) => {
    Alert.alert('Delete Journal', `Remove "${entryTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BACKEND_URL}/api/journals/${id}`);
            setJournals(journals.filter((j: any) => j.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  }, [journals, setJournals]);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

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
              Reflection Log
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Journal
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => setShowEditor(true)} style={styles.addBtn}>
            <MaterialIcons name="add" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : journals.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <BentoCard padding="lg">
              <View style={styles.emptyState}>
                <MaterialIcons name="menu-book" size={40} color={theme.textMuted} />
                <ThemedText variant="body" color="muted" style={{ marginTop: 12, textAlign: 'center' }}>
                  No journal entries yet. Tap + to write your first reflection.
                </ThemedText>
              </View>
            </BentoCard>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <SectionHeader label={`${journals.length} Entries`} icon="menu-book" />
            {journals.map((entry: any) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleEdit(entry)}
                onLongPress={() => handleDelete(entry.id, entry.title)}
              >
                <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <ThemedText variant="heading" style={{ flex: 1, fontSize: fs(15) }}>
                      {entry.title}
                    </ThemedText>
                    <Text style={[styles.dateLabel, { color: theme.textMuted }]}>
                      {formatDate(entry.timestamp)}
                    </Text>
                  </View>
                  <ThemedText variant="body" color="secondary" numberOfLines={3}>
                    {entry.content}
                  </ThemedText>
                  {entry.tags && entry.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {entry.tags.slice(0, 3).map((tag: string, i: number) => (
                        <Badge key={i} label={tag} />
                      ))}
                    </View>
                  )}
                </BentoCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Editor Modal */}
      <Modal visible={showEditor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="heading">
                {editingId ? 'Edit Entry' : 'New Entry'}
              </ThemedText>
              <TouchableOpacity onPress={resetEditor}>
                <MaterialIcons name="close" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TITLE *</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="Entry title"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CONTENT *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="Write your reflection..."
              placeholderTextColor={theme.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TAGS (comma-separated)</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="learning, ideas, insight"
              placeholderTextColor={theme.textMuted}
              value={tags}
              onChangeText={setTags}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent, opacity: title.trim() && content.trim() && !saving ? 1 : 0.4 }]}
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
          </View>
        </View>
      </Modal>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  scrollContent: { gap: sw(16) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  addBtn: { padding: 4 },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  dateLabel: {
    fontSize: fs(10),
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: sw(4),
    marginTop: sw(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: sw(20),
    gap: sw(8),
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sw(8),
  },
  inputLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: sw(4),
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: sw(12),
    paddingVertical: sw(10),
    fontSize: fs(14),
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: sw(8),
  },
  saveBtnText: {
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
