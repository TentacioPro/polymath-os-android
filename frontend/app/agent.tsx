import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import ThemedText from '../components/shared/ThemedText';
import Badge from '../components/ui/Badge';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const CAPABILITIES = [
  { icon: 'auto-awesome' as const, label: 'Synthesize', desc: 'Generate connections across your knowledge' },
  { icon: 'psychology' as const, label: 'Deep Analysis', desc: 'Analyze patterns in ingested content' },
  { icon: 'hub' as const, label: 'Mesh Build', desc: 'Construct neural mesh from activities' },
  { icon: 'import-export' as const, label: 'Export', desc: 'Package knowledge for external use' },
];

export default function AgentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

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
              Agent
            </ThemedText>
          </View>
          <Badge label="ACTIVE" variant="status" color="#00FF94" />
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard padding="lg" shadow>
            <View style={styles.statusRow}>
              <MaterialIcons name="circle" size={10} color="#00FF94" />
              <Text style={[styles.statusText, { color: theme.textPrimary }]}>
                Agent Online
              </Text>
            </View>
            <ThemedText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
              Your cognitive agent is ready for tasks. Use capabilities below or start a conversation.
            </ThemedText>
          </BentoCard>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Capabilities" icon="extension" />
          {CAPABILITIES.map((cap, i) => (
            <TouchableOpacity key={i}>
              <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.capRow}>
                  <View style={[styles.capIcon, { borderColor: theme.border }]}>
                    <MaterialIcons name={cap.icon} size={20} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.capLabel, { color: theme.textPrimary }]}>{cap.label}</Text>
                    <Text style={[styles.capDesc, { color: theme.textSecondary }]}>{cap.desc}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
                </View>
              </BentoCard>
            </TouchableOpacity>
          ))}
        </View>

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
