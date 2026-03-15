import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticPress, hapticLight, hapticSelection, hapticWarning } from '../utils/haptics';

import { getBackendUrlSync } from '../utils/backend';

export default function SearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

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
    } catch {
      return '';
    }
  };

  const hasResults = results && results.total > 0;

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
        <View style={[styles.searchBar, { backgroundColor: surface, borderColor: border }]}>
          <MaterialIcons name="search" size={18} color={textMuted} />
          <TextInput
            style={[styles.searchInput, { color: text }]}
            placeholder="Search knowledge..."
            placeholderTextColor={textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { hapticLight(); setQuery(''); setResults(null); }}>
              <MaterialIcons name="close" size={18} color={textMuted} />
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
            <ActivityIndicator size="large" color={accent} />
          </View>
        )}

        {/* No results */}
        {!searching && results && !hasResults && (
          <View style={styles.center}>
            <MaterialIcons name="search-off" size={48} color={border} />
            <Text style={[styles.centerText, { color: textMuted }]}>No results for "{query}"</Text>
          </View>
        )}

        {/* Results */}
        {!searching && hasResults && (
          <>
            <Text style={[styles.resultCount, { color: textMuted }]}>
              {results.total} result{results.total !== 1 ? 's' : ''} found
            </Text>

            {/* Activities */}
            {results.activities?.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: textMuted }]}>
                  ACTIVITIES ({results.activities.length})
                </Text>
                {results.activities.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.resultCard, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => { hapticSelection(); router.push(`/activity-detail?id=${item.id}` as any); }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: bg }]}>
                      <MaterialIcons name="description" size={16} color={accent} />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={[styles.resultTitle, { color: text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.notes && (
                        <Text style={[styles.resultDesc, { color: textMuted }]} numberOfLines={2}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.badge, { backgroundColor: accent + '20' }]}>
                      <Text style={[styles.badgeText, { color: accent }]}>
                        {(item.content_type || item.category || 'FILE').toUpperCase().slice(0, 4)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Journals */}
            {results.journals?.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: textMuted }]}>
                  JOURNALS ({results.journals.length})
                </Text>
                {results.journals.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.resultCard, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => { hapticSelection(); router.push('/journal' as any); }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: bg }]}>
                      <MaterialIcons name="menu-book" size={16} color={accent} />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={[styles.resultTitle, { color: text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.resultDesc, { color: textMuted }]} numberOfLines={2}>
                        {item.content}
                      </Text>
                    </View>
                    <Text style={[styles.dateText, { color: textMuted }]}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Connections */}
            {results.connections?.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: textMuted }]}>
                  CONNECTIONS ({results.connections.length})
                </Text>
                {results.connections.map((item: any, i: number) => (
                  <View
                    key={item.id || i}
                    style={[styles.resultCard, { backgroundColor: surface, borderColor: border }]}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: bg }]}>
                      <MaterialIcons name="compare-arrows" size={16} color={accent} />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={[styles.resultTitle, { color: text }]} numberOfLines={1}>
                        {item.connection_type || 'Semantic Link'}
                      </Text>
                      <Text style={[styles.resultDesc, { color: textMuted }]} numberOfLines={2}>
                        {item.ai_reasoning || 'Related knowledge items'}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Initial state */}
        {!searching && !results && (
          <View style={styles.center}>
            <MaterialIcons name="manage-search" size={48} color={border} />
            <Text style={[styles.centerText, { color: textMuted }]}>
              Search all knowledge, journals & connections
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
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
  iconBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: sw(48),
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fs(15),
    padding: 0,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  center: { alignItems: 'center', paddingVertical: spacing.xxxl },
  centerText: { fontSize: fs(14), marginTop: spacing.md, textAlign: 'center' },
  resultCount: { fontSize: fs(12), marginBottom: spacing.md },
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Result cards */
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  resultIcon: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: { flex: 1 },
  resultTitle: { fontSize: fs(14), fontWeight: '600', marginBottom: 2 },
  resultDesc: { fontSize: fs(12), lineHeight: 17 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: fs(9), fontWeight: '600', letterSpacing: 0.5 },
  dateText: { fontSize: fs(10) },
});
