import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import M3Button from '../components/ui/M3Button';
import M3Card from '../components/ui/M3Card';
import { EmptyState } from '../components/ui/EmptyState';
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
        <Pressable
          onPress={() => { hapticLight(); router.back(); }}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>
            {persona?.name || 'Agent'}
          </Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>
            {persona?.role || 'Cognitive Agent'}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.statusLabel, { color: theme.success }]}>Online</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        {stats && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <M3Card bentoSize="full" style={styles.cardSpacing}>
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
            </M3Card>
          </Animated.View>
        )}

        {/* Capabilities */}
        {/* Capabilities */}
        <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Capabilities</Text>
        <View style={styles.capabilitiesGrid}>
          {CAPABILITIES.map((cap, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(150 + i * 50).springify().damping(14)} style={{ width: '48%' }}>
              <Pressable
                style={({ pressed }) => [
                  styles.capCard,
                  styles.shadowLight,
                  { backgroundColor: theme.surfaceContainer, opacity: pressed || running === cap.action ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }
                ]}
                onPress={() => handleCapability(cap.action)}
                disabled={running === cap.action}
              >
                <View style={styles.capIconRow}>
                  <View style={[styles.capIcon, { backgroundColor: theme.primaryContainer }]}>
                    <MaterialIcons name={cap.icon} size={22} color={theme.onPrimaryContainer} />
                  </View>
                  {running === cap.action && <M3Progress size="small" />}
                </View>
                <View style={styles.capContent}>
                  <Text style={[styles.capLabel, { color: theme.onSurface }]} numberOfLines={1}>{cap.label}</Text>
                  <Text style={[styles.capDesc, { color: theme.onSurfaceVariant }]} numberOfLines={2}>{cap.desc}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Memories */}
        {memories.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Knowledge Vault</Text>
            {memories.slice(0, 5).map((mem: any, i: number) => (
              <Animated.View key={mem.id || i} entering={FadeInDown.delay(400 + i * 60)}>
                <M3Card bentoSize="full" style={styles.memCard}>
                  <MaterialIcons name="psychology" size={18} color={theme.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.memContent, { color: theme.onSurface }]} numberOfLines={2}>
                      {mem.content}
                    </Text>
                    <View style={styles.memFooter}>
                      <View style={[styles.memBadge, { backgroundColor: theme.surfaceContainerHigh }]}>
                        <Text style={[styles.memBadgeText, { color: theme.onSurfaceVariant }]}>
                          {mem.memory_type || 'Core Insight'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </M3Card>
              </Animated.View>
            ))}
          </>
        ) : (
          <EmptyState
            variant="empty-memories"
            onCTA={() => { hapticPress(); router.push('/chat' as any); }}
          />
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
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 200, 0, 0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  cardSpacing: {
    marginBottom: spacing.md,
  },

  /* Stats Card */
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
  /* Premium Shadow */
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },

  /* Capabilities Grid */
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  capCard: {
    borderRadius: m3Radii['2xl'],
    padding: spacing.lg,
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.05)',
  },
  capIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  capIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capContent: { width: '100%' },
  capLabel: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '700',
    marginBottom: 4,
  },
  capDesc: {
    fontSize: m3Typography.labelMedium.fontSize,
    lineHeight: 18,
  },

  /* Memories */
  memCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    paddingVertical: 2,
    borderRadius: m3Radii.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  memBadgeText: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
