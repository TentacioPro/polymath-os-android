import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
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
import { useTheme, spacing, fs, sw } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection } from '../../utils/haptics';

import { getBackendUrlSync } from '../../utils/backend';

const FILTERS = ['All', 'Article', 'PDF', 'Link', 'Audio', 'File'];

const TYPE_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  article: 'article',
  pdf: 'picture-as-pdf',
  link: 'link',
  audio: 'mic',
  video: 'videocam',
  file: 'folder',
  default: 'description',
};

export default function Knowledge() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { activities, setActivities } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

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
      setAddTitle('');
      setAddUrl('');
      setAddNotes('');
      setShowAddModal(false);
      loadData();
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback((id: string, title: string) => {
    const BACKEND_URL = getBackendUrlSync();
    hapticWarning();
    Alert.alert('Delete', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BACKEND_URL}/api/activities/${id}`);
            hapticSuccess();
            setActivities(activities.filter((a: any) => a.id !== id));
          } catch (e) {
            hapticWarning();
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  }, [activities, setActivities]);

  const filtered = filter === 'All'
    ? activities
    : activities.filter((a: any) =>
        (a.content_type || a.source || '').toLowerCase().includes(filter.toLowerCase()),
      );

  const getIcon = (item: any): keyof typeof MaterialIcons.glyphMap => {
    const type = (item.content_type || item.source || '').toLowerCase();
    for (const [key, icon] of Object.entries(TYPE_ICONS)) {
      if (type.includes(key)) return icon;
    }
    return TYPE_ICONS.default;
  };

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
          onPress={() => { hapticLight(); toggleDrawer(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="menu" size={22} color={text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>Knowledge</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>{activities.length} sources</Text>
        </View>
        <TouchableOpacity
          onPress={() => { hapticPress(); router.push('/search' as any); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="search" size={22} color={text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { hapticPress(); setShowAddModal(true); }}
          style={[styles.iconBtn, { backgroundColor: accent }]}
        >
          <MaterialIcons name="add" size={22} color={theme.accentContrast} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => { hapticSelection(); setFilter(f); }}
            style={[
              styles.filterChip,
              { backgroundColor: filter === f ? accent : surface, borderColor: border },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === f ? theme.accentContrast : text }]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="folder-open" size={48} color={border} />
            <Text style={[styles.emptyText, { color: textMuted }]}>No sources found</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: surface, borderColor: border }]}
            onPress={() => { hapticLight(); router.push(`/activity-detail?id=${item.id}` as any); }}
            onLongPress={() => handleDelete(item.id, item.title)}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIcon, { backgroundColor: bg }]}>
              <MaterialIcons name={getIcon(item)} size={20} color={accent} />
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, { color: text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.itemMeta, { color: textMuted }]} numberOfLines={1}>
                {item.source}{item.category ? ` · ${item.category}` : ''}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={textMuted} />
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>Add Knowledge</Text>
              <TouchableOpacity onPress={() => { hapticLight(); setShowAddModal(false); }}>
                <MaterialIcons name="close" size={24} color={text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: textMuted }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="What did you learn?"
              placeholderTextColor={textMuted}
              value={addTitle}
              onChangeText={setAddTitle}
            />

            <Text style={[styles.label, { color: textMuted }]}>URL (optional)</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="https://..."
              placeholderTextColor={textMuted}
              value={addUrl}
              onChangeText={setAddUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.label, { color: textMuted }]}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="Any notes..."
              placeholderTextColor={textMuted}
              value={addNotes}
              onChangeText={setAddNotes}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: accent, opacity: addTitle.trim() && !saving ? 1 : 0.5 }]}
              onPress={() => { hapticPress(); handleAdd(); }}
              disabled={!addTitle.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.accentContrast} />
              ) : (
                <Text style={[styles.submitText, { color: theme.accentContrast }]}>Add</Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.hint, { color: textMuted }]}>Long-press items to delete</Text>
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

  /* Filters */
  filterScroll: { maxHeight: 52 },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: { fontSize: fs(12), fontWeight: '600' },

  /* List */
  listContent: { paddingHorizontal: spacing.lg },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  itemIcon: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: fs(14), fontWeight: '600', marginBottom: 2 },
  itemMeta: { fontSize: fs(11) },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyText: { fontSize: fs(14), marginTop: spacing.md },

  /* Modal */
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: fs(18), fontWeight: '700' },
  label: { fontSize: fs(11), textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: fs(15) },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { paddingVertical: spacing.lg, borderRadius: 12, alignItems: 'center', marginTop: spacing.lg },
  submitText: { fontSize: fs(14), fontWeight: '700' },
  hint: { fontSize: fs(11), textAlign: 'center', marginTop: spacing.md },
});
