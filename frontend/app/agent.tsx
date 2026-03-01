import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import ThemedText from '../components/shared/ThemedText';
import Badge from '../components/ui/Badge';
import ArchitectButton from '../components/ui/ArchitectButton';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const CAPABILITIES = [
  { icon: 'auto-awesome' as const, label: 'Synthesize', desc: 'Generate connections across your knowledge', action: 'learn' },
  { icon: 'psychology' as const, label: 'Deep Analysis', desc: 'Analyze patterns in ingested content', action: 'consolidate' },
  { icon: 'hub' as const, label: 'Mesh Build', desc: 'Construct neural mesh from activities', action: 'learn' },
  { icon: 'import-export' as const, label: 'Export', desc: 'Package knowledge for external use', action: 'export' },
];

export default function AgentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
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
    if (action === 'export') {
      router.push('/export');
      return;
    }
    setRunning(action);
    try {
      await axios.post(`${BACKEND_URL}/api/agent/${action}`);
      Alert.alert('Done', `${action} completed successfully.`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || `${action} failed.`);
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return (
      <SafeView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              Cognitive Agent
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              {persona?.name || 'Agent'}
            </ThemedText>
          </View>
          <Badge label={persona?.role || 'AGENT'} variant="status" color={theme.accent} />
        </View>

        {/* Stats */}
        {stats && (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <BentoCard padding="lg" shadow>
              <View style={styles.statusRow}>
                <MaterialIcons name="circle" size={10} color={theme.accent} />
                <Text style={[styles.statusText, { color: theme.textPrimary }]}>
                  {stats.total_memories ?? 0} Memories · {stats.total_queries ?? 0} Queries
                </Text>
              </View>
              {persona?.focus_areas && persona.focus_areas.length > 0 && (
                <ThemedText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
                  Focus: {persona.focus_areas.join(', ')}
                </ThemedText>
              )}
            </BentoCard>
          </View>
        )}

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Capabilities" icon="extension" />
          {CAPABILITIES.map((cap, i) => (
            <TouchableOpacity key={i} onPress={() => handleCapability(cap.action)}>
              <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.capRow}>
                  <View style={[styles.capIcon, { borderColor: theme.border }]}>
                    <MaterialIcons name={cap.icon} size={20} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.capLabel, { color: theme.textPrimary }]}>{cap.label}</Text>
                    <Text style={[styles.capDesc, { color: theme.textSecondary }]}>{cap.desc}</Text>
                  </View>
                  {running === cap.action ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
                  )}
                </View>
              </BentoCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Memories */}
        {memories.length > 0 && (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <SectionHeader label="Recent Memories" icon="psychology" />
            {memories.slice(0, 5).map((mem: any, i: number) => (
              <BentoCard key={mem.id || i} padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <ThemedText variant="body" style={{ flex: 1 }}>{mem.content}</ThemedText>
                  <Badge label={mem.memory_type || 'memory'} />
                </View>
              </BentoCard>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: spacing.xl }}>
          <TouchableOpacity
            style={[styles.chatBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/chat')}
          >
            <MaterialIcons name="chat" size={18} color={theme.accentContrast} />
            <Text style={[styles.chatBtnText, { color: theme.accentContrast }]}>
              Start Conversation
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  scrollContent: { gap: sw(16) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
  },
  statusText: {
    fontSize: fs(14),
    fontWeight: '700',
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capIcon: {
    width: sw(40),
    height: sw(40),
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capLabel: {
    fontSize: fs(14),
    fontWeight: '700',
  },
  capDesc: {
    fontSize: fs(12),
    marginTop: 2,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(8),
    paddingVertical: 14,
    borderRadius: 10,
  },
  chatBtnText: {
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
