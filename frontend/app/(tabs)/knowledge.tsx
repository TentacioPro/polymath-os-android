import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { activities, setActivities } = useStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
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
        <TouchableOpacity style={styles.searchBtn}>
          <MaterialIcons name="search" size={22} color={theme.textPrimary} />
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={40} color={theme.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 12 }}>
              No sources found
            </ThemedText>
          </View>
        }
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.sourceCard} activeOpacity={0.8}>
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
}));
