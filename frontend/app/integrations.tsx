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

const INTEGRATIONS = [
  { icon: 'cloud' as const, label: 'Notion', status: 'connected', desc: 'Sync notes and databases' },
  { icon: 'article' as const, label: 'Readwise', status: 'available', desc: 'Import highlights and annotations' },
  { icon: 'code' as const, label: 'GitHub', status: 'available', desc: 'Connect repositories' },
  { icon: 'headphones' as const, label: 'Podcast', status: 'available', desc: 'Transcribe and ingest episodes' },
  { icon: 'bookmark' as const, label: 'Pocket', status: 'available', desc: 'Import saved articles' },
];

export default function IntegrationsScreen() {
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
              Data Sources
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Integrations
            </ThemedText>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Services" icon="extension" />
          {INTEGRATIONS.map((item, i) => (
            <TouchableOpacity key={i}>
              <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.integRow}>
                  <View style={[styles.integIcon, { borderColor: theme.border }]}>
                    <MaterialIcons name={item.icon} size={20} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.integLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.integDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                  </View>
                  <Badge
                    label={item.status === 'connected' ? 'LINKED' : 'CONNECT'}
                    variant={item.status === 'connected' ? 'status' : 'default'}
                    color={item.status === 'connected' ? '#00FF94' : undefined}
                  />
                </View>
              </BentoCard>
            </TouchableOpacity>
          ))}
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
  integRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  integIcon: {
    width: sw(40),
    height: sw(40),
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  integLabel: {
    fontSize: fs(14),
    fontWeight: '700',
  },
  integDesc: {
    fontSize: fs(12),
    marginTop: 2,
  },
}));
