import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticLight, hapticPress, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';

import { getBackendUrlSync } from '../utils/backend';

const CAPABILITIES = [
  { icon: 'auto-awesome' as const, label: 'Synthesize', desc: 'Generate connections', action: 'learn' },
  { icon: 'psychology' as const, label: 'Deep Analysis', desc: 'Analyze patterns', action: 'consolidate' },
  { icon: 'hub' as const, label: 'Mesh Build', desc: 'Construct neural mesh', action: 'learn' },
  { icon: 'file-download' as const, label: 'Export', desc: 'Package knowledge', action: 'export' },
];

export default function AgentScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  useEffect(() => {
    const fetchAll = async () => {
      const BACKEND_URL = getBackendUrlSync();
      try {
        const [pRes, sRes, mRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/agent/persona`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/agent/stats`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/agent/memory`).catch(() => ({ data: [] })),
        ]);
        setPersona(pRes.data);
        setStats(sRes.data);
        setMemories(Array.isArray(mRes.data) ? mRes.data : []);
      } catch (e) {
        console.error('Failed to fetch agent data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCapability = async (action: string) => {
    const BACKEND_URL = getBackendUrlSync();
    if (action === 'export') {
      hapticSelection();
      router.push('/export' as any);
      return;
    }
    hapticPress();
    setRunning(action);
    try {
      await axios.post(`${BACKEND_URL}/api/agent/${action}`);
      hapticSuccess();
      Alert.alert('Done', `${action} completed successfully.`);
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Error', e?.response?.data?.detail || `${action} failed.`);
    } finally {
      setRunning(null);
    }
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
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>{persona?.name || 'Agent'}</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {persona?.role || 'Cognitive Agent'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: accent }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        {stats && (
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: text }]}>
                  {stats.total_memories ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: textMuted }]}>Memories</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: text }]}>
                  {stats.total_queries ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: textMuted }]}>Queries</Text>
              </View>
            </View>
            {persona?.focus_areas && persona.focus_areas.length > 0 && (
              <Text style={[styles.focusText, { color: textMuted }]}>
                Focus: {persona.focus_areas.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* Capabilities */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>CAPABILITIES</Text>
        {CAPABILITIES.map((cap, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.capCard, { backgroundColor: surface, borderColor: border }]}
            onPress={() => handleCapability(cap.action)}
            disabled={running === cap.action}
            activeOpacity={0.7}
          >
            <View style={[styles.capIcon, { backgroundColor: bg }]}>
              <MaterialIcons name={cap.icon} size={20} color={accent} />
            </View>
            <View style={styles.capContent}>
              <Text style={[styles.capLabel, { color: text }]}>{cap.label}</Text>
              <Text style={[styles.capDesc, { color: textMuted }]}>{cap.desc}</Text>
            </View>
            {running === cap.action ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <MaterialIcons name="chevron-right" size={20} color={textMuted} />
            )}
          </TouchableOpacity>
        ))}

        {/* Memories */}
        {memories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>RECENT MEMORIES</Text>
            {memories.slice(0, 5).map((mem: any, i: number) => (
              <View
                key={mem.id || i}
                style={[styles.memCard, { backgroundColor: surface, borderColor: border }]}
              >
                <Text style={[styles.memContent, { color: text }]} numberOfLines={2}>
                  {mem.content}
                </Text>
                <View style={[styles.memBadge, { backgroundColor: accent + '20' }]}>
                  <Text style={[styles.memBadgeText, { color: accent }]}>
                    {mem.memory_type || 'memory'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Chat Button */}
        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: accent }]}
          onPress={() => { hapticPress(); router.push('/chat' as any); }}
        >
          <MaterialIcons name="chat" size={20} color={theme.accentContrast} />
          <Text style={[styles.chatBtnText, { color: theme.accentContrast }]}>
            Start Conversation
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Card */
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fs(24), fontWeight: '700' },
  statLabel: { fontSize: fs(11), marginTop: 4 },
  statDivider: { width: 1, height: 40 },
  focusText: { fontSize: fs(12), marginTop: spacing.md, textAlign: 'center' },

  /* Capabilities */
  capCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  capIcon: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  capContent: { flex: 1 },
  capLabel: { fontSize: fs(14), fontWeight: '600' },
  capDesc: { fontSize: fs(12), marginTop: 2 },

  /* Memories */
  memCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  memContent: { flex: 1, fontSize: fs(13), lineHeight: 19 },
  memBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  memBadgeText: { fontSize: fs(9), fontWeight: '600' },

  /* Chat Button */
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    marginTop: spacing.lg,
  },
  chatBtnText: { fontSize: fs(14), fontWeight: '700' },
});
