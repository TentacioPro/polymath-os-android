import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { hapticPress, hapticLight, hapticSelection, hapticWarning } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

export default function SearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    const BACKEND_URL = getBackendUrlSync();
    const q = query.trim();
    if (q.length < 2) return;
    hapticPress();
    setSearching(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/search`, { params: { q, limit: 30 } });
      setResults(res.data);
    } catch (e) {
      hapticWarning();
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const hasResults = results && results.total > 0;

  const ResultCard = ({ icon, title, subtitle, trailing, onPress }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle?: string;
    trailing?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.surfaceContainer }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.resultIcon, { backgroundColor: theme.primaryContainer }]}>
        <MaterialIcons name={icon} size={16} color={theme.onPrimaryContainer} />
      </View>
      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: theme.onSurface }]} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={[styles.resultDesc, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header + Search */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={[styles.searchPill, { backgroundColor: theme.surfaceContainerHigh }]}>
          <MaterialIcons name="search" size={20} color={theme.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: theme.onSurface }]}
            placeholder="Search knowledge..."
            placeholderTextColor={theme.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { hapticLight(); setQuery(''); setResults(null); }}>
              <MaterialIcons name="close" size={18} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Loading */}
        {searching && (
          <View style={styles.center}>
            <M3Progress size="large" />
          </View>
        )}

        {/* No results */}
        {!searching && results && !hasResults && (
          <EmptyState
            variant="empty-search"
            title={`No results for "${query}"`}
            description="Try different keywords or check spelling"
          />
        )}

        {/* Results */}
        {!searching && hasResults && (
          <>
            <Text style={[styles.resultCount, { color: theme.onSurfaceVariant }]}>
              {results.total} result{results.total !== 1 ? 's' : ''} found
            </Text>

            {/* Activities */}
            {results.activities?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(100)}>
                <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>
                  Activities ({results.activities.length})
                </Text>
                {results.activities.map((item: any) => (
                  <ResultCard
                    key={item.id}
                    icon="description"
                    title={item.title}
                    subtitle={item.notes}
                    trailing={
                      <View style={[styles.badge, { backgroundColor: theme.primaryContainer }]}>
                        <Text style={[styles.badgeText, { color: theme.onPrimaryContainer }]}>
                          {(item.content_type || item.category || 'FILE').toUpperCase().slice(0, 4)}
                        </Text>
                      </View>
                    }
                    onPress={() => { hapticSelection(); router.push(`/activity-detail?id=${item.id}` as any); }}
                  />
                ))}
              </Animated.View>
            )}

            {/* Journals */}
            {results.journals?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200)}>
                <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>
                  Journals ({results.journals.length})
                </Text>
                {results.journals.map((item: any) => (
                  <ResultCard
                    key={item.id}
                    icon="menu-book"
                    title={item.title}
                    subtitle={item.content}
                    trailing={
                      <Text style={[styles.dateText, { color: theme.onSurfaceVariant }]}>
                        {formatDate(item.timestamp)}
                      </Text>
                    }
                    onPress={() => { hapticSelection(); router.push('/journal' as any); }}
                  />
                ))}
              </Animated.View>
            )}

            {/* Connections */}
            {results.connections?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300)}>
                <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>
                  Connections ({results.connections.length})
                </Text>
                {results.connections.map((item: any, i: number) => (
                  <ResultCard
                    key={item.id || i}
                    icon="compare-arrows"
                    title={item.connection_type || 'Semantic Link'}
                    subtitle={item.ai_reasoning || 'Related knowledge items'}
                  />
                ))}
              </Animated.View>
            )}
          </>
        )}

        {/* Initial state */}
        {!searching && !results && (
          <EmptyState
            variant="empty-search"
            title="Search all knowledge"
            description="Find activities, journals & connections"
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: m3Radii.full,
    paddingHorizontal: spacing.lg,
    height: 52,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: m3Typography.bodyLarge.fontSize,
    padding: 0,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  center: { alignItems: 'center', paddingVertical: spacing.xxxl },
  resultCount: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Result cards */
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: { flex: 1 },
  resultTitle: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultDesc: {
    fontSize: m3Typography.bodySmall.fontSize,
    lineHeight: m3Typography.bodySmall.lineHeight,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  badgeText: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
});
