import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import M3Button from '../components/ui/M3Button';
import { hapticLight, hapticPress, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

let useDialog: any;
try { useDialog = require('../components/ui/DialogProvider').useDialog; } catch {}

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

  let dialog: any = null;
  try { if (useDialog) dialog = useDialog(); } catch {}

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
      if (dialog) dialog.showAlert('Done', `${action} completed successfully.`);
    } catch (e: any) {
      hapticWarning();
      if (dialog) dialog.showAlert('Error', e?.response?.data?.detail || `${action} failed.`);
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface, paddingTop: insets.top }]}>
        <M3Progress size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>
            {persona?.name || 'Agent'}
          </Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>
            {persona?.role || 'Cognitive Agent'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        {stats && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={[styles.statsCard, { backgroundColor: theme.surfaceContainer }]}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.onSurface }]}>
                    {stats.total_memories ?? 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>Memories</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.outlineVariant }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.onSurface }]}>
                    {stats.total_queries ?? 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>Queries</Text>
                </View>
              </View>
              {persona?.focus_areas && persona.focus_areas.length > 0 && (
                <Text style={[styles.focusText, { color: theme.onSurfaceVariant }]}>
                  Focus: {persona.focus_areas.join(', ')}
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Capabilities */}
        <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Capabilities</Text>
        {CAPABILITIES.map((cap, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(150 + i * 60)}>
            <TouchableOpacity
              style={[styles.capCard, { backgroundColor: theme.surfaceContainer }]}
              onPress={() => handleCapability(cap.action)}
              disabled={running === cap.action}
              activeOpacity={0.7}
            >
              <View style={[styles.capIcon, { backgroundColor: theme.primaryContainer }]}>
                <MaterialIcons name={cap.icon} size={20} color={theme.onPrimaryContainer} />
              </View>
              <View style={styles.capContent}>
                <Text style={[styles.capLabel, { color: theme.onSurface }]}>{cap.label}</Text>
                <Text style={[styles.capDesc, { color: theme.onSurfaceVariant }]}>{cap.desc}</Text>
              </View>
              {running === cap.action ? (
                <M3Progress size="small" />
              ) : (
                <MaterialIcons name="chevron-right" size={20} color={theme.onSurfaceVariant} />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Memories */}
        {memories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Recent Memories</Text>
            {memories.slice(0, 5).map((mem: any, i: number) => (
              <Animated.View key={mem.id || i} entering={FadeInDown.delay(400 + i * 60)}>
                <View style={[styles.memCard, { backgroundColor: theme.surfaceContainer }]}>
                  <Text style={[styles.memContent, { color: theme.onSurface }]} numberOfLines={2}>
                    {mem.content}
                  </Text>
                  <View style={[styles.memBadge, { backgroundColor: theme.primaryContainer }]}>
                    <Text style={[styles.memBadgeText, { color: theme.onPrimaryContainer }]}>
                      {mem.memory_type || 'memory'}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </>
        )}

        {/* Chat Button */}
        <View style={{ marginTop: spacing.xl }}>
          <M3Button
            label="Start Conversation"
            variant="filled"
            icon="chat"
            onPress={() => { hapticPress(); router.push('/chat' as any); }}
            fullWidth
          />
        </View>

        <View style={{ height: 100 }} />
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  headerTitle: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: 2,
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
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  /* Stats Card */
  statsCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: m3Typography.headlineMedium.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 4,
  },
  statDivider: { width: 1, height: 40 },
  focusText: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  /* Capabilities */
  capCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  capIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capContent: { flex: 1 },
  capLabel: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  capDesc: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: 2,
  },

  /* Memories */
  memCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  memContent: {
    flex: 1,
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
  },
  memBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  memBadgeText: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
  },
});
