import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { m3Typography, m3Motion } from '../../../shared/design-tokens';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type?: string;
  icon?: string;
}

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelectResult: (result: SearchResult) => void;
  recentSearches?: string[];
  categories?: string[];
  placeholder?: string;
}

export function SearchOverlay({
  visible,
  onClose,
  onSearch,
  onSelectResult,
  recentSearches = [],
  categories = [],
  placeholder = 'Search activities, journals, connections...',
}: SearchOverlayProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSelectedCategory(null);
    }
  }, [visible]);

  const performSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await onSearch(q);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [onSearch],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => performSearch(text), 300);
    },
    [performSearch],
  );

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.overlay, { backgroundColor: theme.surface }]}
    >
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.surfaceContainerHigh }]}>
        <Ionicons name="search-outline" size={20} color={theme.onSurfaceVariant} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.onSurface }]}
          placeholder={placeholder}
          placeholderTextColor={theme.onSurfaceVariant}
          value={query}
          onChangeText={handleChangeText}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => { setQuery(''); setResults([]); }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="close-circle" size={20} color={theme.onSurfaceVariant} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
          </Pressable>
        )}
      </View>

      {/* Category chips */}
      {categories.length > 0 && (
        <View style={styles.chips}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat ? theme.primaryContainer : theme.surfaceContainerHigh,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              onPress={() => {
                setSelectedCategory(selectedCategory === cat ? null : cat);
                Haptics.selectionAsync();
              }}
            >
              {selectedCategory === cat && (
                <Ionicons name="checkmark" size={16} color={theme.onPrimaryContainer} />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedCategory === cat ? theme.onPrimaryContainer : theme.onSurfaceVariant,
                  },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Content */}
      {query.length < 2 && recentSearches.length > 0 && (
        <Animated.View entering={FadeIn.duration(200)}>
          <Text style={[styles.sectionLabel, { color: theme.onSurfaceVariant }]}>
            Recent Searches
          </Text>
          {recentSearches.map((s, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.recentItem, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleChangeText(s)}
            >
              <Ionicons name="time-outline" size={20} color={theme.onSurfaceVariant} />
              <Text style={[styles.recentText, { color: theme.onSurface }]}>{s}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <View style={[styles.spinner, { borderColor: theme.primary, borderTopColor: 'transparent' }]} />
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.resultItem, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectResult(item);
              }}
            >
              <View style={[styles.resultIcon, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons
                  name={(item.icon as any) || 'document-outline'}
                  size={20}
                  color={theme.onPrimaryContainer}
                />
              </View>
              <View style={styles.resultText}>
                <Text style={[styles.resultTitle, { color: theme.onSurface }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text style={[styles.resultSub, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
              {item.type && (
                <View style={[styles.typeBadge, { backgroundColor: theme.surfaceContainerHigh }]}>
                  <Text style={[styles.typeText, { color: theme.onSurfaceVariant }]}>
                    {item.type}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
          keyboardShouldPersistTaps="handled"
          style={styles.resultsList}
        />
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <View style={styles.emptySearch}>
          <Ionicons name="search-outline" size={40} color={theme.onSurfaceVariant} />
          <Text style={[styles.emptyText, { color: theme.onSurfaceVariant }]}>
            No results found
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 9999,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: m3Typography.bodyLarge.fontSize,
  },
  cancelText: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  recentText: {
    fontSize: m3Typography.bodyMedium.fontSize,
  },
  loadingRow: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
  resultsList: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '500',
  },
  resultSub: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeText: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: m3Typography.bodyLarge.fontSize,
  },
});
