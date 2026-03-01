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
  Pressable,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../../components/shared/SafeView';
import BentoCard from '../../components/ui/BentoCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Badge from '../../components/ui/Badge';
import ThemedText from '../../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../../theme';
import { useStore } from '../../store/useStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const TYPE_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  article: 'article',
  pdf: 'picture-as-pdf',
  image: 'image',
  link: 'link',
  audio: 'mic',
  video: 'videocam',
  file: 'folder-zip',
  default: 'description',
};

export default function Knowledge() {
  const { theme } = useTheme();
  const router = useRouter();
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { activities, setActivities } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const styles = useStyles();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/activities?limit=50`);
      setActivities(res.data);
    } catch (error) {
      console.error('Failed to load knowledge sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  const handleAdd = async () => {
    if (!addTitle.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/activities/manual`, {
        title: addTitle.trim(),
        source: 'manual',
        url: addUrl.trim() || undefined,
        notes: addNotes.trim() || undefined,
      });
      setAddTitle('');
      setAddUrl('');
      setAddNotes('');
      setShowAddModal(false);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to add activity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert('Delete Activity', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BACKEND_URL}/api/activities/${id}`);
            setActivities(activities.filter((a: any) => a.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  }, [activities, setActivities]);

  const filters = ['All', 'Article', 'PDF', 'Link', 'Audio', 'File'];
  const filtered = filter === 'All'
    ? activities
    : activities.filter((a: any) =>
        (a.content_type || a.source || '').toLowerCase().includes(filter.toLowerCase()),
      );

  const getTypeIcon = (activity: any): keyof typeof MaterialIcons.glyphMap => {
    const type = (activity.content_type || activity.source || '').toLowerCase();
    for (const [key, icon] of Object.entries(TYPE_ICONS)) {
      if (type.includes(key)) return icon;
    }
    return TYPE_ICONS.default;
  };

  if (loading) {
    return (
      <SafeView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <MaterialIcons name="menu" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
            Knowledge Sources
          </Text>
          <ThemedText variant="display" style={{ fontSize: 24 }}>
            Source Gallery
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/search')}>
          <MaterialIcons name="search" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={() => setShowAddModal(true)}>
          <MaterialIcons name="add" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { borderBottomColor: theme.border }]}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f ? theme.accent : 'transparent',
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: filter === f ? theme.accentContrast : theme.textPrimary },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Source cards — 3-col grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={40} color={theme.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 12 }}>
              No sources found
            </ThemedText>
          </View>
        }
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.sourceCard}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/activity-detail', params: { id: item.id } })}
            onLongPress={() => handleDelete(item.id, item.title)}
          >
            <BentoCard padding="sm" style={{ flex: 1 }}>
              <View style={styles.sourceIcon}>
                <MaterialIcons
                  name={getTypeIcon(item)}
                  size={24}
                  color={theme.textPrimary}
                />
              </View>
              <Text
                style={[styles.sourceTitle, { color: theme.textPrimary }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Badge
                label={(item.content_type || item.category || 'FILE').toUpperCase().slice(0, 4)}
                variant="filled"
              />
            </BentoCard>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* Add Activity Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="heading">Add Knowledge</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>TITLE *</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="What did you learn?"
              placeholderTextColor={theme.textMuted}
              value={addTitle}
              onChangeText={setAddTitle}
            />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>URL (optional)</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="https://..."
              placeholderTextColor={theme.textMuted}
              value={addUrl}
              onChangeText={setAddUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>NOTES (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="Any notes..."
              placeholderTextColor={theme.textMuted}
              value={addNotes}
              onChangeText={setAddNotes}
              multiline
            />

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: theme.accent, opacity: addTitle.trim() && !saving ? 1 : 0.4 }]}
              onPress={handleAdd}
              disabled={!addTitle.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.accentContrast} />
              ) : (
                <Text style={[styles.modalSubmitText, { color: theme.accentContrast }]}>Add Activity</Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.hintText, { color: theme.textMuted }]}>
              Long-press any card to delete
            </Text>
          </View>
        </View>
      </Modal>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
  },
  menuBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: sw(12),
  },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  searchBtn: {
    padding: 4,
  },
  filterBar: {
    borderBottomWidth: 1,
    maxHeight: 52,
  },
  filterContent: {
    paddingHorizontal: sw(20),
    paddingVertical: sw(10),
    gap: sw(8),
    flexDirection: 'row',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: sw(16),
    paddingVertical: 6,
  },
  filterLabel: {
    fontSize: fs(11),
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  grid: {
    padding: sw(20),
  },
  gridRow: {
    gap: sw(8),
    marginBottom: sw(8),
  },
  sourceCard: {
    flex: 1,
    maxWidth: '33.33%',
  },
  sourceIcon: {
    marginBottom: spacing.sm,
  },
  sourceTitle: {
    fontSize: fs(11),
    fontWeight: '600',
    marginBottom: spacing.sm,
    lineHeight: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sw(8),
  },
  modalLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: sw(4),
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: sw(12),
    paddingVertical: sw(10),
    fontSize: fs(14),
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: sw(8),
  },
  modalSubmitText: {
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hintText: {
    fontSize: fs(10),
    textAlign: 'center',
    marginTop: sw(4),
    marginBottom: sw(8),
  },
}));
