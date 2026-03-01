import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import Badge from '../components/ui/Badge';
import ThemedText from '../components/shared/ThemedText';
import SectionHeader from '../components/ui/SectionHeader';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function SearchScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/search`, { params: { q, limit: 30 } });
      setResults(res.data);
    } catch (e) {
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
    <SafeView>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { borderColor: theme.border }]}>
          <MaterialIcons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search knowledge..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults(null); }}>
              <MaterialIcons name="close" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {searching && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        )}

        {!searching && results && !hasResults && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <MaterialIcons name="search-off" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 12 }}>
              No results for "{query}"
            </ThemedText>
          </View>
        )}

        {!searching && hasResults && (
          <>
            <View style={{ paddingHorizontal: spacing.xl }}>
              <ThemedText variant="caption" color="muted" style={{ marginBottom: spacing.sm }}>
                {results.total} result{results.total !== 1 ? 's' : ''} found
              </ThemedText>
            </View>

            {/* Activities */}
            {results.activities?.length > 0 && (
              <View style={{ paddingHorizontal: spacing.xl }}>
                <SectionHeader label={`Activities (${results.activities.length})`} icon="folder" />
                {results.activities.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push({ pathname: '/activity-detail', params: { id: item.id } })}
                  >
                    <BentoCard padding="sm" style={{ marginBottom: spacing.sm }}>
                      <View style={styles.resultRow}>
                        <MaterialIcons name="description" size={16} color={theme.accent} />
                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                          <Text style={[styles.resultTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          {item.notes && (
                            <Text style={[styles.resultDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                              {item.notes}
                            </Text>
                          )}
                        </View>
                        <Badge label={(item.content_type || item.category || 'FILE').toUpperCase().slice(0, 4)} />
                      </View>
                    </BentoCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Journals */}
            {results.journals?.length > 0 && (
              <View style={{ paddingHorizontal: spacing.xl }}>
                <SectionHeader label={`Journals (${results.journals.length})`} icon="menu-book" />
                {results.journals.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push('/journal')}
                  >
                    <BentoCard padding="sm" style={{ marginBottom: spacing.sm }}>
                      <View style={styles.resultRow}>
                        <MaterialIcons name="menu-book" size={16} color={theme.accent} />
                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                          <Text style={[styles.resultTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.resultDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                            {item.content}
                          </Text>
                        </View>
                        <Text style={[styles.dateText, { color: theme.textMuted }]}>
                          {formatDate(item.timestamp)}
                        </Text>
                      </View>
                    </BentoCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Connections */}
            {results.connections?.length > 0 && (
              <View style={{ paddingHorizontal: spacing.xl }}>
                <SectionHeader label={`Connections (${results.connections.length})`} icon="device-hub" />
                {results.connections.map((item: any, i: number) => (
                  <BentoCard key={item.id || i} padding="sm" style={{ marginBottom: spacing.sm }}>
                    <View style={styles.resultRow}>
                      <MaterialIcons name="compare-arrows" size={16} color={theme.accent} />
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={[styles.resultTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                          {item.connection_type || 'Semantic Link'}
                        </Text>
                        <Text style={[styles.resultDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                          {item.ai_reasoning || 'Related knowledge items'}
                        </Text>
                      </View>
                    </View>
                  </BentoCard>
                ))}
              </View>
            )}
          </>
        )}

        {/* Initial state */}
        {!searching && !results && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <MaterialIcons name="manage-search" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 12, textAlign: 'center' }}>
              Search across all your knowledge sources, journals & connections.
            </ThemedText>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(12),
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: sw(12),
    paddingVertical: sw(8),
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fs(14),
    padding: 0,
  },
  scrollContent: { gap: sw(12), paddingTop: sw(8) },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultTitle: {
    fontSize: fs(13),
    fontWeight: '700',
    marginBottom: 2,
  },
  resultDesc: {
    fontSize: fs(11),
    lineHeight: 15,
  },
  dateText: {
    fontSize: fs(10),
  },
}));
